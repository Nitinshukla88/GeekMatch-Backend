const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const { userAuth } = require("../middlewares/auth")

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  try {
    const io = socket(server, {
      cors: {
        origin: "http://localhost:5173",
      },
    });

    const roomUsers = new Map();

    io.on("connection", (socket) => {
      socket.on("joinChat", ({ firstName, _id, targetUserId }) => {
        const roomId = getSecretRoomId(_id, targetUserId);
        socket.join(roomId);
      });

      socket.on("join-room", ({firstName, _id, targetUserId})=>{
        const roomId = getSecretRoomId(_id, targetUserId);
        socket.join(roomId);
        if(!roomUsers.get(roomId)){
          roomUsers.set(roomId, []);
        }
        roomUsers.get(roomId).push({ socketId : socket.id, userId : _id});

        const usersInRoom = roomUsers.get(roomId);
        if(usersInRoom.length === 2){
          const existingUser = usersInRoom.find((user)=> user.userId !== _id);
          io.to(existingUser.socketId).emit("joined-room", { firstName, _id, targetUserId: existingUser.userId }); 
        }
      })

      socket.on("call-user", ({firstName, _id, targetUserId, offer})=>{
        const roomId = getSecretRoomId(_id, targetUserId);
        const usersInRoom = roomUsers.get(roomId) || [];
        const existingUser = usersInRoom.find((user)=> user.userId !== _id);
        if(existingUser){
          io.to(existingUser.socketId).emit("incoming-call", {firstName, offer, _id, targetUserId});
        }
      })

      socket.on("call-accepted", ({firstName, _id, targetUserId, answer})=>{
        const roomId = getSecretRoomId(_id, targetUserId);
        const usersInRoom = roomUsers.get(roomId) || [];
        const existingUser = usersInRoom.find((user)=> user.userId !== targetUserId);
        if(existingUser){
          io.to(existingUser.socketId).emit("call-accepted", {firstName, _id, targetUserId, answer});
        }
      })

      socket.on(
        "sendMessage",
        async ({ firstName, _id, targetUserId, chatMessage }) => {
          const roomId = getSecretRoomId(_id, targetUserId);
          let chat = await Chat.findOne({
            participants: { $all: [_id, targetUserId] },
          });
          if (!chat) {
            chat = new Chat({
              participants: [_id, targetUserId],
              messages: [{senderId : _id, text : chatMessage}],
            });
            await chat.save();
          } else {
            chat.messages.push({ senderId: _id, text: chatMessage });
            await chat.save();
          }
          io.to(roomId).emit("messageReceived", { firstName, chatMessage });
        }
      );

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        
        for (const [roomId, users] of roomUsers.entries()) {
          const updatedUsers = users.filter((user) => user.socketId !== socket.id);
          
          if (updatedUsers.length === 0) {
            roomUsers.delete(roomId);
          } else {
            const remainingUser = updatedUsers[0];
            io.to(remainingUser.socketId).emit("partner-disconnected", {
            message: "Your partner has disconnected.",
            roomId: roomId,
            });
            roomUsers.set(roomId, updatedUsers);
          }
        }
      });
    });
  } catch (err) {
    res.json({ message: err.message });
  }
};

module.exports = initializeSocket;
