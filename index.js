import express from 'express'
import connection from './dataBase/DBConnection.js'
import { globalErrorHandling } from './src/utils/globalErrorHandling.js'
import { AppError } from './src/utils/errorClass.js'
import { deleteFromCloudinary } from './src/utils/deleteFromCloudinary.js'
import { deleteFromDb } from './src/utils/deleteFromDb.js'
import productRouter from './src/modules/products/product.routes.js'
import cartRouter from './src/modules/cart/cart.routes.js'
import authRouter from './src/modules/Authentication/auth.routes.js'
const app = express()
const port = 3000


connection()
app.use(express.json())
app.get("/",(req,res)=>{
    res.status(200).json("Server is running")
})

app.use("/auth",authRouter)
app.use("/product",productRouter)
app.use("/cart",cartRouter)

app.use('*', (req, res,next)=>{
    return next(new AppError("Invalid URL",404))
} )



app.use(globalErrorHandling,deleteFromCloudinary,deleteFromDb)
app.listen(port, () => console.log(`Example app listening on port ${port}!`))