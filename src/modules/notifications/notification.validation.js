import Joi from "joi";
import { generalFiled } from "../../utils/generalFields.js";

export const addNotification = {
    body: Joi.object({


        title: Joi.string().min(1).max(100).required().messages({
            "string.base": "Title must be a string",
            "string.empty": "Title cannot be empty",
            "string.max": "Title cannot exceed 100 characters"
          }),

          body: Joi.string().min(1).max(500).required().messages({
            "string.base": "Body must be a string",
            "string.empty": "Body cannot be empty",
            "string.max": "Body cannot exceed 500 characters"
          }),

      scheduledTime: Joi.date().iso().required().messages({
        "date.base": "Scheduled time must be a valid date",
        "any.required": "Scheduled time is required"
      }),

      timeZone: Joi.string().required().messages({
        "any.required": "Time zone is required"
      }),

      fcmToken: Joi.string().required().messages({
        "any.required": "FCM Token is required"
      }),
    
      repeatType: Joi.string().valid("none", "daily", "weekly", "monthly", "custom").default("none"),
      
      interval: Joi.number().integer().positive().optional().messages({
        "number.base": "Interval must be a number",
        "number.positive": "Interval must be a positive number"
      }),
      daysOfWeek: Joi.array().items(
        Joi.number().integer().min(0).max(6).required() // 0 = Sunday, 6 = Saturday
      ).optional(),
      endDate: Joi.date().greater(Joi.ref('scheduledTime')).optional().messages({
        "date.greater": "End date must be after the scheduled time"
      })
    }).messages({
      "object.base": "Invalid request format"
    }),

    headers:generalFiled.headers.required()
  };




  export const updateNotification = {
    body: Joi.object({
        title: Joi.string().min(1).max(100).optional().messages({
            "string.base": "Title must be a string",
            "string.empty": "Title cannot be empty",
            "string.max": "Title cannot exceed 100 characters"
          }),

          body: Joi.string().min(1).max(500).optional().messages({
            "string.base": "Body must be a string",
            "string.empty": "Body cannot be empty",
            "string.max": "Body cannot exceed 500 characters"
          }),

      scheduledTime: Joi.date().iso().optional().messages({
        "date.base": "Scheduled time must be a valid date"
      }),

      timeZone: Joi.string().optional(),
   

      repeatType: Joi.string().valid("none", "daily", "weekly", "monthly", "custom").optional(),
      interval: Joi.number().integer().positive().optional(),
      daysOfWeek: Joi.array().items(
        Joi.number().integer().min(0).max(6)
      ).optional(),
      endDate: Joi.date().iso().optional()
    }),
    headers:generalFiled.headers.required()

  };


  export const deleteNotification = {
    params: Joi.object({
      id: Joi.string().required().messages({
        "any.required": "Notification ID is required"
      })
    }),
    headers:generalFiled.headers.required()
  };
  