const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessages = asyncHandler(async(req,res) =>{
   const {content,chatId} = req.body;
  //  console.log("this is content",content);
   if(!content || !chatId){

    console.log(`Invalid data passed into the request`);
    return res.sendStatus(400);
   }
   
   let newMessage = {
    sender:req.user._id,
    content:content,
    chat:chatId,
   };
   
   try {
      let message = await Message.create(newMessage);

      message = await message.populate("sender","name");
      message = await message.populate("chat");
      message = await User.populate(message,{
        path:"chat.users",
        select:"name email"
      })
      await Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage:message,
      })
     res.json(message);
   } catch (error) {
     res.status(400);
     throw new Error(error.message);
   }
})

const getMessages = asyncHandler(async(req,res) =>{
    
    try {
      let messages = await Message.find({chat:req.params.chatId}).populate("sender","name email").populate("chat")
      messages = await Chat.populate(messages,{
        path:"chat.latestMessage",
        select:"content"
      })
      // console.log(messages,req.params.chatId); 
      res.json(messages);
    } catch (error) {
        throw new Error(error.message);
    }

})


module.exports = {
    sendMessages,
    getMessages
}