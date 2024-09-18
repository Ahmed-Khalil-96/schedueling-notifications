import Joi from "joi";


import { generalFiled } from "../../utils/generalFields.js";



export const signUp = {
    body:Joi.object({
        firstName:generalFiled.name.required(),
        lastName:generalFiled.name.required(),
        email:generalFiled.email.required(),
        password:generalFiled.password.required(),
        confirmPassword:generalFiled.rePassword.required(),
        gender:Joi.string().valid("male", "female").required(),
        age:Joi.number().integer().min(18).max(100).required(),
        phone:Joi.string().pattern(new RegExp("^[0-9]{11}$")).required().messages({
            "string.pattern.base":"Mobile number must be 10 digits long",
            "any.required":"Mobile number is required"
        }),
     
    })
}

export const login = {
        body: Joi.object({
            email:generalFiled.email.required(),
            password:generalFiled.password.required(),
      })}

