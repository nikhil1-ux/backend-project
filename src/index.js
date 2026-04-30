import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js"


dotenv.config({
  path:"./.env"
})

connectDB()
.then(()=>{
  app.on("error",(error)=>{
    console.log("error occured ",error);
    throw error;
  })
  app.listen(process.env.PORT||3000,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
  })
})

.catch((error)=>{
 console.log("MONGODB CONNECTION FAILED !!")
})









/*
(async ()=>{
  try {
   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

   app.on("error",(error)=>{
    console.log("error",error);
    throw error;
   })

  } catch (error) {
    console.log("error :", error)
  }
})() */