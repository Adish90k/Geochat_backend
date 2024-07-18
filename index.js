const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
const messageRoutes = require("./routes/messageRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
dotenv.config();


mongoose.connect(process.env.Mongo_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected successfully to the MongoDB server');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
app.use(express.json());
app.use(cors());
app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/messages",messageRoutes);


const server = app.listen(5000,()=>{
    console.log(`server is running at port 5000`);
})







const io = require("socket.io")(server,{
  pingTimeout:60000,
  cors:{
    origin:"http://localhost:3000"
  }
});

io.on("connection",(socket)=>{

console.log(`connected to socket.io`);

socket.on('setup',(userData)=>{
  console.log("this is setup"+userData);
  socket.join(userData);
  // console.log(userData._id);
  socket.emit("connected");
})

socket.on("join chat",(room)=>{

  socket.join(room);
  console.log(`User joined room: ${room}`);

})
   
socket.on("new message",(newMessageReceived)=>{
  var chat = newMessageReceived.chat;
  //  console.log("this is new message from socket",newMessageReceived);
  if(!chat.users) return console.log("chat.users is not defined");
  
  chat.users.forEach(user=>{
   
    if(user._id==newMessageReceived.sender._id) return;
    console.log("this is from new message",user._id,newMessageReceived);
    socket.in(user._id).emit("message recieved",newMessageReceived)

  })


})

 

})
