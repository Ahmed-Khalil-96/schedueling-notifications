# Scheduled Notifications Service

This Scheduled Notifications Service is designed to automate notifications based on user-defined schedules. Built with Node.js, Express.js, and MongoDB, it allows for flexible scheduling with options for daily, weekly, monthly, and custom intervals. It uses Moment.js for precise scheduling and time zone support, and Firebase Cloud Messaging (FCM) to send notifications.

## 🚀 Features

- **One-Time and Recurring Notifications**: Supports one-time notifications or recurring schedules (daily, weekly, monthly, or custom intervals).
- **Flexible Time Zone Support**: Users can specify time zones, allowing notifications to be scheduled and sent accurately across different regions.
- **Dynamic Scheduling**: Notifications can be set to repeat based on user preferences, with custom intervals available.
- **End Date Tracking**: Notifications will automatically stop sending after the specified end date.
- **Error Handling**: Robust error handling ensures that any failed notifications are logged and can be retried if necessary.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB for storing notification schedules and status
- **Scheduling**: Node-Cron and Moment.js to handle time-based scheduling and conversions
- **Notifications**: Firebase Cloud Messaging (FCM) for sending push notifications to clients

## 📋 API Endpoints

### 1. **Create Notification**
   - **Endpoint**: `/api/notifications`
   - **Method**: POST
   - **Body Parameters**:
     - `title`: Title of the notification
     - `body`: Content of the notification
     - `fcmToken`: Device token for Firebase Cloud Messaging
     - `scheduledTime`: Date and time to send the notification
     - `repeatType`: Recurrence type (`none`, `daily`, `weekly`, `monthly`, `custom`)
     - `interval`: (Optional) Number of days for custom recurrence
     - `daysOfWeek`: (Optional) Days of the week for weekly recurrence
     - `endDate`: (Optional) Date after which the notification should stop
     - `timeZone`: User’s time zone for accurate scheduling

### 2. **Update Notification**
   - **Endpoint**: `/api/notifications/:id`
   - **Method**: PUT
   - **Body Parameters**: Same as **Create Notification**

### 3. **Delete Notification**
   - **Endpoint**: `/api/notifications/:id`
   - **Method**: DELETE

### 4. **Get All Notifications**
   - **Endpoint**: `/api/notifications`
   - **Method**: GET
   - Retrieves all notifications with their status and scheduling details.

## 🔄 Notification Scheduling Logic

The Cron job runs every second to check for notifications that are due to be sent:

1. **Fetch Notifications**: Retrieves all pending notifications from the database.
2. **Check Schedule**: For each notification, it checks if the scheduled time matches the current UTC time.
3. **Send Notification**: If due, it sends the notification using FCM.
4. **Repeat Logic**: If the notification has a repeat type, it calculates the next scheduled time using the `nextRepeat` function and updates the schedule in the database.
5. **End Date**: If an end date is provided and reached, the notification status is marked as "sent" and stops further recurrence.

### `nextRepeat` Function

The `nextRepeat` function calculates the next occurrence based on the repeat type:
- **Daily**: Adds 1 day
- **Weekly**: Adds 1 week
- **Monthly**: Adds 1 month
- **Custom**: Adds a specified interval in days


