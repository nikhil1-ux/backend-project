

const asynchandler= (requesthandler)=>{
  (req,res,next)=>{  
 promise.resolve(requesthandler(req,res,next)).catch((error)=>next(error))
}}


/* 
const asynchandler =(func)=>async (req,res,next)=>{
  try {
    await func(req,res,next);
 } catch (error) {
    res.status(error.code|| 500).json({
      success: false,
      message: error.message,
    })
  }
} */


export {asynchandler}