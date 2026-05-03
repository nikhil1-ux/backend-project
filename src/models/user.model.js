import mongoose, {schema} from "mongoose";
import jwt from "jasonwebtoken";
import bcrypt from "bcrypt";
import { TokenExpiredError } from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
       
      email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
       },
       fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
       },

       avatar: {
        type: String,
        required: true,

       },

       coverImage: {
        type: String,
       },

       watchHistory: [
        {
          type: Schema.Types.ObjectId,
          ref: "video",
        }
       ],

       password:{
        type: String,
        required: [true,"password is required"]
       },
       refresToken:{
        type: Strings
       }
      },
      {
        timestamps: true
      }

)

userSchema.pre("save",async function(next){
  if(this.isModified("password")){
    this.password= bcrypt.hash(this.password,10);
  }
next();
})

userSchema.methods.ispasswordCorrect= async function(password){

  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function(){
 return jwt.sign(
  {
    _id: this._id,
    email: this.email,
    username:this.username,
    fullname: this.fullname,
  },
  process.env.ACCESS_TOKEN_SECRET,{
    expireIn: process.env,ACCESS_TOKEN_EXPIRY,
  }
 )
}
userSchema.methods.generateRefreshToken= function(){
  return jwt.sign(
    {
      _id: this._id, 
    },
    process.enc.REFRESH_TOKEN_SECRET,{
      expireIn: process.env.REFRESH_TOKEN_EXPIRE,
    }
  )
}

export const User= mongoose.model("User",userSchema)