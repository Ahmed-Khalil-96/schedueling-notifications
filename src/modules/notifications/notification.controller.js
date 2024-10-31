import { CronJob } from 'cron';
import notificationModel from '../../../dataBase/Models/notification/not.model.js';
import sendNotification from '../../utils/fireBase.cjs';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/errorClass.js';
import moment from 'moment-timezone';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import Redlock from 'redlock';
import { v4 as uuidv4 } from 'uuid'

const redisConnection = new Redis({ maxRetriesPerRequest: null });
redisConnection.on("connect", () => console.log("Connected to Redis"))
    .on("error", (error) => console.error("Error in Redis connection:", error));

// Initialize Redlock
const redlock = new Redlock([redisConnection], { retryCount: 3, retryDelay: 1000 });

const notificationQueue = new Queue('notificationQueue', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
        backoff: { type: 'exponential', delay: 5000 },
        limiter: { max: 1 }
    }
});

// Add notifications to the queue
const addNotificationsToQueue = async (notifications) => {
  const batch = notifications.map(async (notification) => {
      try {
          const jobId = `${notification._id}-${uuidv4()}`; // Unique job ID with UUID

          // Check if the job already exists
          const existingJobs = await notificationQueue.getJobs(['waiting', 'active']);
          const isDuplicate = existingJobs.some(job => job.id.startsWith(notification._id));
          if (isDuplicate) {
              // console.log(`Duplicate notification for ID: ${notification._id} - Skipping.`);
              return; // Skip adding this notification
          }

          await notificationQueue.add("sendNotification", notification, { jobId });
          // console.log(`Notification ${jobId} added to queue.`);
      } catch (err) {
          console.error(`Error adding notification ${notification._id}:`, err);
      }
  });

  await Promise.all(batch);
};

const processedIds = new Set();

new Worker('notificationQueue', async (job) => {
  const { title, body, fcmToken, _id } = job.data;

  // Skip duplicate notifications - this can be improved
  if (processedIds.has(_id)) {
      // console.log(`Duplicate notification for ID: ${_id} - Skipping.`);
      return;
  }

  processedIds.add(_id);
  await sendNotification(title, body, fcmToken);
}, { concurrency: 1, connection: redisConnection })


// Add Notification
export const addNotification = asyncHandler(async (req, res, next) => {
    const { title, body, scheduledTime, timeZone, fcmToken, message, repeatType, interval, daysOfWeek, endDate } = req.body;
    const utcScheduledTime = moment.tz(scheduledTime, timeZone);
    
    const notification = await notificationModel.create({
        scheduledTime: moment.utc(utcScheduledTime),
        timeZone,
        body,
        title,
        user: req.user.id,
        message,
        fcmToken,
        repeatType,
        interval,
        daysOfWeek,
        endDate
    });
    
    return res.status(201).json({ message: "Notification created successfully", notification });
});

// Get All User Notifications
export const getAllUserNotification = asyncHandler(async (req, res, next) => {
    const notifications = await notificationModel.find({ user: req.user.id });

    if (notifications.length === 0) {
        return next(new AppError("No notification found", 404));
    }
    return res.status(200).json({ message: "All user notifications fetched successfully", notifications });
});

// Update Notification
export const updateNotification = asyncHandler(async (req, res, next) => {
    const { scheduledTime, timeZone, message } = req.body;
    const { id } = req.params;

    const notification = await notificationModel.findOneAndUpdate(
        { _id: id, user: req.user.id },
        { scheduledTime, timeZone, message }
    );

    if (!notification) {
        return next(new AppError("No notification found", 404));
    }
    return res.status(200).json({ message: "Notification updated successfully", notification });
});

// Delete Notification
export const deleteNotification = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const notification = await notificationModel.findOneAndDelete({ _id: id, user: req.user.id });

    if (!notification) {
        return next(new AppError("No notification found", 404));
    }
    return res.status(200).json({ message: "Notification deleted successfully" });
});

// Cron job to add notifications to Redis cache
export const job = new CronJob(
  '*/10 * * * * *',
  async function () {
      try {
          const currentTime = moment.utc().toDate();
          const endTime = moment.utc(currentTime).add(10, 'minutes').toDate();

          const notifications = await notificationModel.find({
              scheduledTime: { $gte: currentTime, $lte: endTime },
              status: 'pending'
          });

          for (const notification of notifications) {
              const serialized = JSON.stringify(notification);
              await redisConnection.set(`bull:notificationQueue:${notification._id.toString()}`, serialized, "EX", 600);
          }
      } catch (error) {
          console.error(`Error in notification job: ${error.message}`);
      }
  },
  null,
  true
);

// Redis cron job to process notifications in batches
export const redisJob = new CronJob(
  '*/1 * * * *',
  async function () {
      const notificationsToSend = [];

      try {
          const lock = await redlock.acquire(["locks:notificationProcess"], 60000);
          console.log("Acquired lock");

          try {
              const keys = await redisConnection.keys('bull:notificationQueue:*');
              const dataKeys = keys.filter(key => /^bull:notificationQueue:[a-f0-9]+$/.test(key));

              for (const key of dataKeys) {
                  const notificationData = await redisConnection.get(key);
                  if (!notificationData) continue;

                  const notification = JSON.parse(notificationData);
                  const { _id, repeatType, interval, scheduledTime, endDate, timeZone } = notification;

                  const currentTime = moment.utc();
                  const scheduledTimeMoment = moment.utc(scheduledTime);

                  if (scheduledTimeMoment <= currentTime) {
                      notificationsToSend.push(notification);
                  }

                  if (notificationsToSend.length > 0) {
                      await addNotificationsToQueue(notificationsToSend);
                      for (const notification of notificationsToSend) {
                          if (notification.repeatType === 'none') {
                              await notificationModel.findByIdAndUpdate(notification._id, { status: 'sent' });
                          } else {
                              const nextTime = nextRepeat(repeatType, interval, scheduledTime, timeZone);
                              if (endDate && moment.tz(nextTime, timeZone).utc().isAfter(endDate)) {
                                  await notificationModel.findByIdAndUpdate(notification._id, { status: 'sent' });
                                  await redisConnection.del(key);
                              } else {
                                  await notificationModel.findByIdAndUpdate(notification._id, { scheduledTime: nextTime });
                              }
                          }
                          await redisConnection.del(key);
                      }
                  }
              }
          } finally {
              await lock.release();
              console.log("Released lock");
          }
      } catch (error) {
          console.error(`Error in redis job: ${error.message}`);
          if (error instanceof Redlock.LockError) {
              console.error("Lock acquisition failed.");
          }
      }
  },
  null,
  true
);

// Function to calculate the next repeat time
function nextRepeat(repeatType, interval, scheduledTime, timeZone) {
    let nextTime = moment.tz(scheduledTime, timeZone);
    switch (repeatType) {
        case "daily":
            nextTime.add(1, 'day');
            break;
        case "weekly":
            nextTime.add(1, 'week');
            break;
        case "monthly":
            nextTime.add(1, 'month');
            break;
        case "custom":
            nextTime.add(interval, 'days');
            break;
        default:
            throw new AppError("Invalid repeat type", 400);
    }
    return nextTime.utc().toDate();
}




  // if (repeatType === "weekly" && daysOfWeek.length > 0) {
  //   let nextDay = daysOfWeek[0]; 
    
  //   for (let i = 0; i < daysOfWeek.length; i++) {
  //     const day = daysOfWeek[i];
  
  //     if (day > nextTime.day()) {
  //       nextDay = day;
  //       break;
  //     }
  //   }
  
  //   if (nextDay <= nextTime.day()) {
  //     nextTime.add(1, 'week'); 
  //   }
  
  //   nextTime.day(nextDay); 
  // }
  


// const not = asyncHandler(async (req, res) => {
//     const currentTime = new Date();
//     const notifications = await notificationModel.find({
//         scheduledTime: { $lte: currentTime }
//         });
//         for (const element of notifications) {
//             const { fcmToken, message, user } = element;
//             await sendNotification(message, fcmToken);
//             await notificationModel.findByIdAndDelete(element._id)
//             }
//             res.json({ message: 'Notifications sent successfully' });
//      });
