let dataMethods =["body","headers","params","query","file","files"] 

export const validation = (schema)=>{
    return (req,res,next)=>{
    let errArray = []
    dataMethods.forEach((key)=>{
        if(schema[key]){

            const {error} = schema[key].validate(req[key],{abortEarly:false})
            if(error){

                error.details.forEach((err)=>{
                    errArray.push(err.message)
                })
            }
        }
    })
    if(errArray.length){
        return res.status(400).json({error:errArray}) 
    }
    next()
}}