import { Router } from "express";
import * as AC from "./auth.controller.js";
import * as AV from "./auth.validation.js";
import { validation } from "../../middleWares/validation.js";



const authRouter = Router()


authRouter.post("/",validation(AV.signUp),AC.signUp)
authRouter.post("/login",AC.login,validation(AV.login))

export default authRouter