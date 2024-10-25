const admin = require("firebase-admin");
const serviceAccount = require("../../fir-83e97-firebase-adminsdk-g7e17-0eef041ef9.json");
// const { asyncHandler } = require("./errorHandling.js");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

 const sendNotification = async(title, body, fcmToken) => {
    const msg = {
        notification: {
            title, // Title of the notification
            body
        },
        topic: "test"
    };

    try {
        const response = await admin.messaging().send(msg);
    console.log("success",response)
    } catch (error) {
        console.log("error",error)
    }
};
module.exports= sendNotification