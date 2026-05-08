import { asynchandler } from "../utils/asynchandler.js";
import {apiError} from "../utils/apiError.js"

import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asynchandler( async(req,res)=>{
  // get user details from frontend
  //validation : not empty
  //check if already exists: username, email id
  //check for images and check for avataar
  //upload avtaar
  //upload them to cloudinary
  //create user object - create entry in db
  //remove password and refresh token field from reponse
  //check for user creation
  //return res

  const {fullname,email,username,password} = req.body
  console.log("email",email);
  console.log("password",password);
  console.log("username",username);
  console.log("fullname",fullname);
  console.log(req.files)


if([fullname,email,username,password,].some((field)=>
  field?.trim()==="")){
    throw new apiError(400,"all field are required")
  }

   const existedUser= await User.findOne({
      $or: [{username},{email}]
    })
    if(existedUser){
      throw new apiError(409,"username and email already exists")
    };

    const avatarLocalPath =req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
      throw new apiError(400,"avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
       throw new apiError(400,"avatar file is required")
    }
   
     const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.tolowercase,
     })
     const createdUser = await User.findById(user._id).select(
      " -password -refreshToken"
     )
     if(!createdUser){
      throw new apiError(500,"something went wrong while registering the user")
     }

     return res.status(200).json(
      new ApiResponse(201,createdUser,"user registered succesfully")
     )

   }
)


export {registerUser}