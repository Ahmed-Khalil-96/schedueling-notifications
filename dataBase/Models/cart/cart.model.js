import { model, Schema } from "mongoose";

const cartSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[{
        name:{
            type:String,
            required:true,
            trim:true
        },
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity:{
            type:Number,
            default:1,
        },
        discount:Number,
        price:{
            type:Number
        },
        sale_Price:Number
    }],
    totalPrice:{
        type:Number
    },
  
    totalPriceAfterDiscount:Number,

})



const cartModel = model("Cart",cartSchema)
export default cartModel