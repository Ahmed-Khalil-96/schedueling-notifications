import Joi from "joi";
import { Types } from "mongoose";




const validationObjectId = (value, helper)=>{
    return Types.ObjectId.isValid(value)? true:helper.message("invalid object id")
    }



export const generalFiled = {
        name: Joi.string().min(3).max(50).trim(),
        email: Joi.string().email({ tlds: { allow: ["outlook", "com"] }, minDomainSegments: 2 }),
        password: Joi.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
        rePassword: Joi.string().valid(Joi.ref("password")),
        id: Joi.string().custom(validationObjectId),

        file: Joi.object({
         size: Joi.number().positive().required(),
            path: Joi.string().required(),
            filename: Joi.string().required(),
            destination: Joi.string().required(),
            mimetype: Joi.string().required(),
            encoding: Joi.string().required(),
            originalname: Joi.string().required(),
            fieldname: Joi.string().required()}),

            headers: Joi.object({
                'cache-control': Joi.string(),
                'postman-token': Joi.string(),
                'content-type': Joi.string(),
                'content-length': Joi.string(),
                host: Joi.string(),
                'user-agent': Joi.string(),
                accept: Joi.string(),
                'accept-encoding': Joi.string(),
                connection: Joi.string(),
                token: Joi.string().required()
            }),   
    };
        
    export const headers = {
       
    
    }
    