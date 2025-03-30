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
        origin: "http://localhost:5173",
      },
    });

    io.on("connection", (socket) => {
      // We've got a connection request with the socket as you can see one line just above and now we'll handle events listed below--
      socket.on("joinChat", ({ firstName, _id, targetUserId }) => {
        const roomId = getSecretRoomId(_id, targetUserId);
        console.log(firstName + " joined the room with room Id : " + roomId);
        socket.join(roomId);
      });

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

      socket.on("disconnect", () => {});
    });
  } catch (err) {
    res.json({ message: err.message });
  }
};

module.exports = initializeSocket;
