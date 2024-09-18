import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorClass.js";
import { asyncHandler } from "../utils/errorHandling.js";
import userModel from "../../dataBase/Models/user/user.model.js";

const auth = (roles = []) => {
    return asyncHandler(async (req, res, next) => {
        // Extract token from headers
        const { token } = req.headers;
        
        // Check if token is provided
        if (!token) {
            return next(new AppError('Please login first', 400));
        }
        
        // Validate token prefix
        if (!token.startsWith('ahmed__')) {
            return next(new AppError('Invalid token', 400));
        }
        
        // Extract token and verify it
        const newToken = token.split('ahmed__')[1];
        let decoded;
        try {
            decoded = jwt.verify(newToken, 'topSecret');
        } catch (err) {
            return next(new AppError('Invalid token', 400));
        }

        // Ensure the token contains an email
        if (!decoded?.email) {
            return next(new AppError('Invalid token', 400));
        }
        
        // Find user based on the email in the token
        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return next(new AppError('Invalid token', 400));
        }

        // Check if the user's role is authorized
        if (roles.length && !roles.includes(user.role)) {
            return next(new AppError('You are not authorized to perform this action', 403));
        }
        
        // Attach user to the request object
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    });
};

export default auth