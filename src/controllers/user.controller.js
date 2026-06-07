import { asynchandler } from "../utils/asynchandler.js";
import {apiError} from "../utils/apiError.js"

import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{
  try{
    const user = await User.findById(userId)
    const accessToken= user.generateAccessToken();
    const refreshToken= user.generateRefreshToken();
    user.refreshToken= refreshToken;
    await user.save({validateBeforeSave: false});

    return { accessToken,refreshToken};

  }
  catch(error){
  throw new apiError(500,"something went wrong while generating access and refresh token")
  }

}

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
  //console.log(req.files)


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
       throw new apiError(400,"avatar file is required avatar file is not uploaded on cloudinary ")
    }
   
     const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
      
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

const loginUser = asynchandler( async(req,res)=>{

 // req body -> data 
 // username or email 
 // find the user 
 // password check
 //access and refresh token
 //send cookies

 const {email,username,password}= req.body

 console.log(email);

 if(!username && !email){
  throw new apiError(400,"username or email is required");
 }
 const user = await User.findOne({
  $or: [{username},{email}]
})
if(!user){
  throw new apiError(404,"username or email does not exist")
}

const isPasswordValid = await user.ispasswordCorrect(password)
 
if(!isPasswordValid){
  throw new apiError(401,"invalid user credential")
}

const {accessToken,refreshToken}= await generateAccessAndRefreshTokens (user._id);


const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

const options = {
  httpOnly: true,
  secure: true,
}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
new ApiResponse(
  200,
  {
    user: loggedInUser, accessToken, refreshToken
  },
  "user logged in successfully"
)
)

})

const logoutUser = asynchandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,      }
    },
    {
      new: true
    }
  )
  const options = {
  httpOnly: true,
  secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out successfully"))
})


  const refreshAccessToken = asynchandler(async(req,res)=>{
    
    try{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
   
    if (!incomingRefreshToken){
      throw new apiError(401,"unauthorized request");
    }
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if(!user){
        throw new apiError(401,"Invalid refresh token")
      }
  
      if( incomingRefreshToken !== user?.refreshToken){
        throw new apiError(401,"refresh token is expired or used")
      }
  
      const options ={
        httpOnly: true,
        secure:true
      }
  
      const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user?.id);
  
      return res
      .status(200)
      .cookie("AccessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
        new ApiResponse(
          200,{accessToken, refreshToken: newRefreshToken},
          "access token refreshed"
        )
      )
  
    
  }
 catch (error) {
  
  throw new apiError(401,error?.message || "invalid refresh token")
}
})

const changeCurrentpassword = asynchandler(async(req,res)=>{
  const {oldPassword, newPassword, confirmPassword} = req.body;

  if(newPAssword !== confirmPassword){
    throw new apiError(400,"new password and confirm password do not match") 
  }

  const user = await User.findById(req.user._id);

  if(!user){
    throw new apiError(404,"user not found")
  }

  const isPasswordCorrect = await user.ispasswordCorrect(oldPAssword)

  if(!isPasswordCorrect){
    throw new apiError(401,"old password is incorrect")
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json( new ApiResponse(200,{},"passoword changed successfully"));

})

const getCurrentUser = asynchandler(async(Req,res)=>{

  res
  .status(200)
  .json(200, req.user, "current detail of user")
  
})

const updateAccountDetails = asynchandler(async(req,res)=>{

  const{fullname,email} = req.body;
   
  if(!fullname || !email ){
    throw new apiError(401, " all fields are required ")
  }
 const user = awaitUser.findByIDAndUpdate(req.user?._id,
  {
    $set: {
      fullname,
      email: email,
    }
  },
  {
    new: true
  }
 ).select("-password")

 return res
 .status(200)
 .json(new ApiResponse(200,user, "account details updated successfully"))
})

const updateUserAvatar = asynchandler(async(req,res)=>{

   const avatarLocalPath = req.file?.path;

   if(!avatarLocalPath){
    throw new apiError(400,"avatar file is ,missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);

   if(!avatar.url){
    throw new apiError(400,"somethinf went wrong while uploading avatar on cloudinary")
   }
 
   const user = await User.findByIDAndUpdate(req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      }
  },
 {
  new: true
 }
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"user avatar updated successfully"))


})

const updateUSerCoverImage = asynchandler(async(req,res)=>{

 const coverImageLocalPath = req.file?.path;

 if(!coverImageLocalPath){
  throw new apiError(400,"cover image file is missing")
 }
})

const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!coverImage.url){
  throw new apiError(400," something went wrong while uploading cover image on cloudinary ")

}

const user = await User.findByIdAndUpdate(req.user?._id,
  {
    $set:{
      coverImage: coverImage.url,
    }
  },
  {
    new: true,
  }
).select("-password")

return res
.status(200)
.json(
  new ApiResponse(200,user,"cover image updated successfully")
)





export {registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentpassword,
  getCurrentUser,
 updateAccountDetails,
}
