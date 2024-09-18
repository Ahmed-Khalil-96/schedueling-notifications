import multer from "multer";
import { AppError } from "../utils/errorClass.js";


// all valid files i allow
export const validFiles = {
    image: ["image/png" ,"image/jpg", "image/jpeg"],
    video: ["video/mp4", "video/avi"],
    audio: ["audio/mpeg", "audio/wav"],
    document: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    zip: ["application/zip", "application/x-zip-compressed"],
};


export const multerHost = (customValidation)=>{

    const storage = multer.diskStorage({})
    const fileFilter = (req, file,cb)=>{
        if(!customValidation.includes(file.mimetype)){
            return cb(new AppError("file is not supported"),false)
        }
        return cb(null , true)
    }

    return multer({storage,fileFilter})
}

