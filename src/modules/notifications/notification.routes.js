import { Router } from "express";



import auth from "../../middleWares/auth.js";
import { validation } from "../../middleWares/validation.js";
import * as NV from "./notification.validation.js";
import * as NC from "./notification.controller.js";

const notificationRouter = Router()


notificationRouter.post("/add",auth(),validation(NV.addNotification),NC.addNotification)
notificationRouter.get("/all",auth(),NC.getAllUserNotification)
notificationRouter.patch("/update/:id",auth(),validation(NV.updateNotification),NC.updateNotification)
notificationRouter.delete("/delete/:id",auth(),validation(NV.deleteNotification),NC.deleteNotification)




export default notificationRouter