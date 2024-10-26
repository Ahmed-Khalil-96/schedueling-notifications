import { model, Schema } from "mongoose";

const userSchema = new Schema({
    firstName:{
        type: String,
        required:[true,"First name is required"],
        trim:true,
        Lowercase:true,
        minLength:3,
        maxLength:20,
    },
    lastName:{
        type: String,
        required:[true,"last name is required"],
        trim:true,
        Lowercase:true,
        minLength:3,
        maxLength:20,
    },
    email:{
        type: String,
        required:[true,"Email is required"],
        trim:true,
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
    },
    phone:{
        type:[String],
        required:[true,"Phone number is required"],
        trim:true,
        unique:true
    },
   
    gender:{
        type:String,
        required:[true,"Gender is required"],
        enum:["male","female"],
        Lowercase:true
    },
   
    age:{
        type:Number,
        required:[true,"Age is required"],        
    },
    country:{
        type:String,
        required:[true,"Country is required"],
        
    },
    loggedIn:{
        type:Boolean,
        default:false
    }

},
{timestamps:true,
    versionKey:false
}
)


const userModel = model("User",userSchema)
export default userModel