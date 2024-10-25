import mongoose from "mongoose";

const connection = async()=>{
    return await mongoose.connect("mongodb://localhost:27017/scheduletask").then(()=>{
        console.log("Connected to MongoDB");
    }).catch((err)=>{
        console.log(err);
    })
}
export default connection