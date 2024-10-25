import connection from '../dataBase/DBConnection.js'
import { globalErrorHandling } from '../src/utils/globalErrorHandling.js'
import { AppError } from '../src/utils/errorClass.js'
import * as routers from './index.routes.js'
import { deleteFromDb } from './utils/deleteFromDb.js'
import job from './modules/notifications/notification.controller.js'

export const initApp = (app , express)=>{
connection()
// job
app.use(express.json())
app.get("/",(req,res)=>{
    res.status(200).json("Server is running")
})

app.use("/auth",routers.authRouter)
app.use("/notification",routers.notificationRouter)


app.use('*', (req, res,next)=>{
    return next(new AppError("Invalid URL",404))
} )



app.use(globalErrorHandling,deleteFromDb)
}