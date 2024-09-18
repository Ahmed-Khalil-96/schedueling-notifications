import { Router } from "express";
import * as PC from "./product.controller.js";
import * as PV from "./product.validation.js";
import auth from "../../middleWares/auth.js";
import { multerHost, validFiles } from "../../middleWares/multer.js";
import { validation } from "../../middleWares/validation.js";
import { systemRoles } from "../../utils/systemRoles.js";

const productRouter = Router()


productRouter.post("/",multerHost(validFiles.image).fields([{name:"image",maxCount:1},{name:"coverImages", maxCount:3}]),validation(PV.addProduct),auth([systemRoles.admin]),PC.addProduct)
productRouter.get("/", PC.getProducts)
productRouter.put("/:id",multerHost(validFiles.image).fields([{name:"image",maxCount:1},{name:"coverImages",maxCount:3}]),validation(PV.updateProduct),auth([systemRoles.admin]),PC.updateProduct)
productRouter.delete("/:id",validation(PV.deleteProduct),auth([systemRoles.admin]),PC.deleteProduct)

export default productRouter