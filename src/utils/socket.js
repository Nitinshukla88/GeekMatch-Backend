const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

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
        origin: "https://geek-match-frontend.vercel.app",
      },
    });

    const roomUsers = new Map();

    io.on("connection", (socket) => {
      // We've got a connection request with the socket as you can see one line just above and now we'll handle events listed below--
      socket.on("joinChat", ({ firstName, _id, targetUserId }) => {
        const roomId = getSecretRoomId(_id, targetUserId);
        console.log(firstName + " joined the room with room Id : " + roomId);
        socket.join(roomId);
      });

      socket.on("join-room", ({firstName, _id, targetUserId})=>{
        const roomId = getSecretRoomId(_id, targetUserId);
        console.log(`${firstName} has joined the video-chat with id ${_id} and targetUserId is ${targetUserId}`)
        socket.join(roomId);
        if(!roomUsers.get(roomId)){
          roomUsers.set(roomId, []);
        }
        roomUsers.get(roomId).push({ socketId : socket.id, userId : _id});

        const usersInRoom = roomUsers.get(roomId);
        if(usersInRoom.length === 2){
          const existingUser = usersInRoom.find((user)=> user.userId !== _id);
          io.to(existingUser.socketId).emit("joined-room", { firstName, _id, targetUserId: existingUser.userId }); 
          console.log(`The joined-room handler is going to sended to ${targetUserId} from ${firstName}`)
        }
      })

      socket.on("call-user", ({firstName, _id, targetUserId, offer})=>{
        console.log(`${firstName} wants to send the offer to targetuserId ${targetUserId} and id of ${firstName} is ${_id}`);
        const roomId = getSecretRoomId(_id, targetUserId);
        const usersInRoom = roomUsers.get(roomId) || [];
        const existingUser = usersInRoom.find((user)=> user.userId !== _id);
        if(existingUser){
          io.to(existingUser.socketId).emit("incoming-call", {firstName, offer, _id, targetUserId});
        }
      })

      socket.on("call-accepted", ({firstName, _id, targetUserId, answer})=>{
        console.log(`The call got accepted which was sent by ${firstName} with id ${_id}`);
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
          console.log(
            firstName +
              " sended the message to targetUserId " +
              targetUserId +
              " and the message is " +
              chatMessage
          );
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
