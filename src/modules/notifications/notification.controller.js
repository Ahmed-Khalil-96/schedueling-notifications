import { CronJob } from 'cron';
import notificationModel from '../../../dataBase/Models/notification/not.model.js';
import sendNotification from '../../utils/fireBase.cjs';
import { asyncHandler } from '../../utils/errorHandling.js';
import { AppError } from '../../utils/errorClass.js';
import moment from 'moment-timezone'

// ===========================add notification =================================================
export const addNotification=asyncHandler(async(req,res,next)=>{
    const {scheduledTime,timeZone,fcmToken,message,repeatType,interval,daysOfWeek,endDate}=req.body
    const utcScheduledTime = moment.tz(scheduledTime, timeZone);
       const notification = await notificationModel.create(
        {scheduledTime:moment.utc(utcScheduledTime),
          timeZone,
          user:req.user.id,
          message,
          fcmToken,
          repeatType,
          interval,
          daysOfWeek,
          endDate}
        )
       return res.status(201).json({message:"notification is created successfully",notification})
})



// =======================get all user notification===============================================
export const getAllUserNotification=asyncHandler(async(req,res,next)=>{
  const notifications= await notificationModel.find({user:req.user.id})

  if(notifications.length==0){
    return next(new AppError("no notification found",404))
  }

  return res.status(200).json({message:"all user notification is fetched successfully",notifications})
  })



  // ==========================update notification======================
  export const updateNotification=asyncHandler(async(req,res,next)=>{
    const {scheduledTime,timeZone,message}=req.body
    const {id}=req.params
    const notification=await notificationModel.findOneAndUpdate({_id:id,user:req.user.id},{scheduledTime,timeZone,message})
      if(!notification){
        return next(new AppError("no notification found",404))
        }
        return res.status(200).json({message:"notification is updated successfully",notification})
        })

  // ================================delete notification ========================================
  export const deleteNotification=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    const notification=await notificationModel.findOneAndDelete({_id:id,user:req.user.id})
    if(!notification){
      return next(new AppError("no notification found",404))
      }
      return res.status(200).json({message:"notification is deleted successfully"})
      })

//================================== the cron job==========================================


const job = new CronJob(
  '* * * * * *', 
  async function () {
    const currentTime = moment.utc().toDate();

    const batchSize = 100;
    let notifications
    
    do {
      notifications = await notificationModel.find({ status: 'pending' })
        .limit(batchSize);

      for (const element of notifications) {
        const { fcmToken, title, body, scheduledTime, repeatType, interval, endDate, timeZone } = element;

        // Validate the timeZone
        if (!moment.tz.names().includes(timeZone)) {
          console.error(`Invalid time zone: ${timeZone}`);
          continue; // Skip
        }

        // Convert scheduled time to UTC
        const nextScheduledTime = moment.tz(scheduledTime, timeZone).utc().toDate();

        // Cehck the end Date
        if (endDate && nextScheduledTime > endDate) {
          await notificationModel.findByIdAndUpdate(element._id, { status: 'sent' });
          continue;
        }

        // Check if the notification should be sent
        if (nextScheduledTime <= currentTime) {
          try {
            // Sending  notification with the firebase
            await sendNotification(title, body, fcmToken);
            
            // Update notification status
            if (repeatType === 'none') {
              await notificationModel.findByIdAndUpdate(element._id, { status: 'sent' });
            } else {
              // Calculate next occurrence
              const nextTime = nextRepeat(repeatType, interval, scheduledTime, timeZone);
              await notificationModel.findByIdAndUpdate(element._id, { scheduledTime: nextTime });
            }
          } catch (error) {
            console.error(`Error sending notification: ${error.message}`);
          }
        }
      }
    } while (notifications.length === batchSize);
  },
  null,
  true
);

export default job;

// Calculate the next repeat time
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
      throw new AppError("Invalid repeat type", 400); // Handle unexpected repeat types
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
