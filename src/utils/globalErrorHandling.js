export const globalErrorHandling = (err, req,res, next)=>{
    res.status(err.statusCode||500).json({msg:err.message,stack:err.stack})
    next()
}