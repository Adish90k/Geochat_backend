const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");


const accessChat = asyncHandler(async(req,res)=>{
    const {userId} = req.body;
    
    if(!userId){
        console.log("User param not sent with request");
        return res.sendStatus(400);
    }
    // console.log(req.user);
    let isChat = await Chat.find({
      $and:[
       {users:{$elemMatch:{$eq:req.user._id}}},
        {users:{$elemMatch:{$eq:userId}}}
      ] 
    }).populate("users","-password").populate("latestMessage");
    
    isChat = await User.populate(isChat,{
        path:"latestMessage.sender",
        select:"name email",
    })
    console.log(isChat);
    if(isChat.length>0){
        res.send(isChat[0]);
    } 
    else{
        let chatData = {
            chatName:"sender",
            users:[req.user._id,userId],
        }
        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({
               _id:createdChat._id
            }).populate("users","-password");
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }

})

const fetchAllchats = asyncHandler(async(req,res)=>{
    try {
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(results)=>{
            results = await User.populate(results,{
                path:"latestMessage.sender",
                select:"name email",
            })
            res.status(200).send(results);
        });
    } catch (error) {
        console.log(error);
    }
})

module.exports = {
    accessChat,
    fetchAllchats
}