import userModel from "../../../dataBase/Models/user/user.Model.js";
import { AppError } from "../../utils/errorClass.js"
import { asyncHandler } from "../../utils/errorHandling.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";



// ==============================signUp====================================
export const signUp = asyncHandler(async(req,res, next)=>{
    const {firstName, lastName , email, password, gender, phone, age ,scheduledTime}=req.body

    const userExist = await userModel.findOne({email:email.toLowerCase()})
    if(userExist){
        return next(new AppError("User already exist", 409))
    }

    const hash = bcrypt.hashSync(password,10)
    
    const user = new userModel({firstName, lastName , email, password:hash, gender, phone, age})
    await user.save()

    // delete from database if there were any errors
    // req.data={
    //     model:userModel,
    //     id:user._id
    // }
    res.status(201).json({message: "User created successfully", user})
})




// ==================================================login====================================================================

export const login = asyncHandler(async(req,res,next)=>{
    const {email,password}=req.body
   
    const user = await userModel.findOne({email})
    if(!user){
        return next(new AppError("Invalid email or password", 401))
        }
        const hash = bcrypt.compareSync(password,user.password)
        if(!hash){
            return next(new AppError("Invalid email or password", 401))
            }

        if(user.loggedIn){
            return next(new AppError("You are already logged in", 401))
        }
        const token = jwt.sign({email,id:user._id},"topSecret")
        user.loggedIn= true
        await user.save()
        res.status(200).json({token})
})