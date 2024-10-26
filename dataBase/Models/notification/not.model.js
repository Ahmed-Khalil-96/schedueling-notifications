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
        required:true
    },
    fcmToken:{
        type:String,
        required:true
    },
    timeZone:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","sent"],
        default:"pending"
    },
    repeatType: {
        type: String,
        enum: ["none", "daily", "weekly", "monthly", "custom"], 
        default: "none"
    },
    interval: { 
        type: Number,
        default: null
    },
    daysOfWeek: { 
        type: [Number], 
        default: [] 
    },
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