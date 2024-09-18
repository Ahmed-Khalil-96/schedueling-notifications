import Joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const addToCart = {
    body:Joi.object({
        product:generalFiled.id.required(),
        quantity:Joi.number().required()
    }),
    headers:generalFiled.headers.required()
}

export const updateQuantity = {
    body:Joi.object({
        quantity:Joi.number().required()
    }),
    params:Joi.object({
        id:generalFiled.id.required()
    }),
    headers:generalFiled.headers.required()
}


export const removeFromCart = {
    params:Joi.object({
        id:generalFiled.id.required()
        }),
    headers:generalFiled.headers.required()

}

export const getLoggedUserCart = {
    headers:generalFiled.headers.required()

}


export const clearCart = {
    headers:generalFiled.headers.required()
}

