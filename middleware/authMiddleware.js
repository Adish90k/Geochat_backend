const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && 
       req.headers.authorization.startsWith("Bearer") 
        )
        try
        {
            // console.log("this is from auth",token);
         token = req.headers.authorization.split(" ")[1];
         const decoded = jwt.verify(token,process.env.JWT_SECRET);
        //  console.log("decoded is:",decoded);
         let test = await User.findById(decoded.userid).select("-password");
        //  console.log("test is:",test);
         req.user = await User.findById(decoded.userid).select("-password");
        //  console.log(req.user);
         next(); 
        }catch(error){
            res.status(401);
            throw new Error("Not authorized,token failed");
        }
      
        if(!token){
            res.status(401);
            throw new Error("Not authorized, no token");
        }

})

module.exports = {protect};
