
const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex")
}

const initializeSocket = (server) => {
    const io = socket(server, {
        cors : {
          origin : ["https://geek-match-frontend.vercel.app","http://localhost:5173"]
        }
      })
      
      io.on("connection", (socket) => {

        // We've got a connection request with the socket as you can see one line just above and now we'll handle events listed below-- 
        socket.on("joinChat", ({ firstName, _id, targetUserId })=> {
            const roomId = getSecretRoomId(_id, targetUserId);
            console.log(firstName + " joined the room with room Id : " + roomId);
            socket.join(roomId);

        });

        socket.on("sendMessage", ({firstName,_id,targetUserId, chatMessage})=> {
            const roomId = getSecretRoomId(_id, targetUserId);
            console.log(firstName + " sended the message to targetUserId " + targetUserId + " and the message is "+ chatMessage);
            io.to(roomId).emit("messageReceived", {firstName, chatMessage});
        });

        socket.on("disconnect", ()=> {

        });
      })
}

module.exports = initializeSocket;