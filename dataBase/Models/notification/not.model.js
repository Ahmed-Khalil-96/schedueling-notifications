import { model, Schema } from "mongoose";

const notificationSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
    },
    body:{
        type:String

    },
    scheduledTime:{
        type:Date,
        required:true,
        index:true
    },
    fcmToken:{
        type:String,
        required:true
    },
    timeZone:{
        type:String,
        required:true,
        index:true
    },
    status:{
        type:String,
        enum:["pending","sent"],
        default:"pending",
        index:true
    },
    repeatType: {
        type: String,
        enum: ["none", "daily", "weekly", "monthly", "custom"], 
        default: "none",
        index: true
    },
    interval: { 
        type: Number,
        default: null,
        index: true
    },
    // daysOfWeek: { 
    //     type: [Number], 
    //     default: [] 
    // },
    endDate: { 
        type: Date 
    }

},
{
        timestamps:true,
        versionKey:false
        }
    );
    


const notificationModel = model("Notification",notificationSchema)
export default notificationModel