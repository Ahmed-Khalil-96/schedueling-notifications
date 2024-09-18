import Joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";


export const addProduct = {
    body:Joi.object({
        name:Joi.string().min(3).max(50).required(), 
        price:Joi.number().min(1).integer().required(), 
        discount:Joi.number().min(1).max(100), 
        quantity:Joi.number().integer().required(),
       
    }),
    files:Joi.object({
        image:Joi.array().items(generalFiled.file.required()).required().messages({
            "any.required": "Image is required",
            }),
        
        coverImages:Joi.array().items(generalFiled.file.required()).required().messages({
            "any.required": "Cover Images is required",
        }) 
    }),
    headers:generalFiled.headers.required()
}

export const updateProduct = {
    body:Joi.object({
        name:Joi.string().min(3).max(50), 
        price:Joi.number().min(1).integer(), 
        discount:Joi.number().min(1).max(100), 
        quantity:Joi.number().integer(),
        
    }),
    files:Joi.object({
        image:Joi.array().items(generalFiled.file),
        coverImages:Joi.array().items(generalFiled.file)
    }),
    headers:generalFiled.headers.required(),
    params:Joi.object({
        id:generalFiled.id.required()
        })
}


export const deleteProduct = { body:Joi.object({
    category:generalFiled.id, 
    subCategory:generalFiled.id,
    brand:generalFiled.id,
   
}),
headers:generalFiled.headers.required(),
params:Joi.object({
    id:generalFiled.id.required()
    })
}

