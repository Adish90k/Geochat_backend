const asyncHandler = require("express-async-handler");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const geolib = require('geolib');
const bcrypt = require("bcryptjs");
dotenv.config();



const generateToken=(userid)=>{

return jwt.sign({userid},process.env.JWT_SECRET,{
    expiresIn:"30days"
})

}

async function matchPassword(enterpassword,actualpassword){
    return await bcrypt.compare(enterpassword,actualpassword);
}


const calculateDistance = (users)=>{
  const userDistances = [];
  for (let i = 0; i < users.length; i++) {
    const userA = users[i];
  
    for (let j = i + 1; j < users.length; j++) {
      const userB = users[j];
  
      let distance = geolib.getDistance(userA.location, userB.location);
      distance = distance/1000;
     
      const userDistance = {
        user1: {
          name: userA.name,
          email: userA.email,
          id:userA._id
        },
        user2: {
          name: userB.name,
          email: userB.email,
          id:userB._id
        },
        distance: distance
      };
  
  
      userDistances.push(userDistance);
    }
  }
  return userDistances;
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic, latitude, longitude } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the fields");
    }
     
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        pic,
        location: {
          longitude,
          latitude
        }
      });
  
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
        location: user.location 
      });
    } else {
      res.status(400);
      throw new Error("Failure to create user");
    }
  });
  
const authUser = asyncHandler(async(req,res,next)=>{

const {email,password,latitude, longitude } = req.body;

const user = await User.findOneAndUpdate(
    { email },
    { location: {
        longitude,
        latitude
      } }, 
    { new: true } 
  );
if(user && (await matchPassword(password,user.password))){
    // console.log(`inside main login`);
  
    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        token:generateToken(user._id),
        location: user.location
    })
 
}else{
    res.status(401);
    throw new Error("Invalid Email or password");
}
})


const getAllusers = async(req,res)=>{
  try {
  let users = [];
  let ans = [];
  
  users = await User.find();
  if(users){
    ans=calculateDistance(users);
   
  
   
    res.json(ans);
  }
  else{
    res.status(404).json({message:"no users present"});
  } 
  } catch (error) {
    console.log(error);
  }
 
}


module.exports = {
    registerUser,
    authUser,
    getAllusers
}