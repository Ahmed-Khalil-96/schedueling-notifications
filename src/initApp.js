import connection from '../dataBase/DBConnection.js'
import { globalErrorHandling } from '../src/utils/globalErrorHandling.js'
import { AppError } from '../src/utils/errorClass.js'
import { deleteFromCloudinary } from '../src/utils/deleteFromCloudinary.js'
import { deleteFromDb } from '../src/utils/deleteFromDb.js'
import * as routers from './index.routes.js'


export const initApp = (app , express)=>{
connection()
app.use(express.json())
app.get("/",(req,res)=>{
    res.status(200).json("Server is running")
})

app.use("/auth",routers.authRouter)
app.use("/product",routers.productRouter)
app.use("/cart",routers.cartRouter)

app.use('*', (req, res,next)=>{
    return next(new AppError("Invalid URL",404))
} )



app.use(globalErrorHandling,deleteFromCloudinary,deleteFromDb)
}