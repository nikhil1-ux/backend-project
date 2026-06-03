import { apiError } from "../utils/apiError.js";
import {asynchandler} from "../utils/asynchandler.js";
import jwt from "jsonWebToken"
import {User} from "../models/user.model.js"

export const verifyJWT = asynchandler(async(req,_,next)=>{

 try {
   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
 
 
 if (!token){
   throw new apiError(401,"unauthorized request")
 }
 const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
 const user = await User.findById(decodeToken?._id).
 select("-password,refreshToken")
 
 if(!user){
   throw new apiError(401,"invalid access token")
 };
 
 req.user= user;
 next();
 } 
 catch (error) {
  throw new ApiError(401,error?.message || "inavalid access token")
 }
})