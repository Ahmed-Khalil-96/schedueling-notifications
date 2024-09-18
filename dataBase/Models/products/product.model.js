import { model, Schema } from "mongoose";

const productSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        minLength:3,
        maxLength:60,
        lowercase:true
    },
    slug:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
        minLength:3,
        maxLength:80
    },
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
        },
    price:{
        type:Number,
        required:true,
        default:1,
        min:1,
    },
    discount:{
        type:Number,
        default:0,
        min:0,
        max:100
    },
    sale_Price:{
        type:Number,
        default:0,
        min:1,
    },
    quantity:{
        type:Number,
        default:1,
        min:1,
        },
    customId:String,

    image:{
        secure_url:String,
        public_id:String
        },
    coverImages:[{
        secure_url:String,
        public_id:String
    }],

   
},{
    timestamps:true,
    versionKey:false
})

const productModel = model("Product",productSchema)

export default productModel