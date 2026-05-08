import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config(
  
);

const uploadOnCloudinary= async (localFilePath)=>{

  try{
    if(!localFilePath){
      return null;
    }

    const response= await cloudinary.uploader.upload(
      localFilePath,
      {
        resource_type: "auto",
      }

    )
    console.log("files uploaded on cloudinary successfully",
      response.url
    );
    return response
  }

  catch(error){
   if(fs.existsSync(localFilePath)){
    fs.unlinkSync(localFilePath)
   }
  }
   console.log("error")
}

export {uploadOnCloudinary}