const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async(req, res)=> {

    const { targetUserId } = req.params;

    const userId = req.user._id;

    if(req.user.isPremium) {

    try{
        let chat = await Chat.findOne({
            participants : {$all : [userId, targetUserId]}
        }).populate({
            path : "messages.senderId",
            select : "firstName lastName photo"
        });
        if(!chat){
            chat = new Chat({
                participants : [userId, targetUserId],
                messages : []
            })
            await chat.save()
        }
        res.json(chat);
    }catch(err){
        res.status(500).json({ success : false, message : err.message });
    } } else {
        return res.status(403).json({ isPremium: false, message: "You need to be a premium user to access this chat." });
    }
})

module.exports = chatRouter;