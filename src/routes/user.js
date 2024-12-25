const express = require("express");

const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionrequest");
const User = require("../models/user");

const USER_DATA_FIELDS = ["firstName", "lastName", "skills"];

userRouter.get("/user/requests/received", userAuth, async(req, res) => {
    try{

        const loggedInUser = req.user;
        const matchedRequests = await ConnectionRequest.find({ toUserId : loggedInUser?._id, status : "interested" }).populate("fromUserId", ["firstName", "lastName"]);
        res.json({ message : "Requests fetched successfully", matchedRequests });
        
    }catch(err){
        res.status(401).send("Error: " + err.message);
    }
})


userRouter.get("/user/connections", userAuth, async(req, res) => {
    try{
        const loggedInUser = req.user;

        const totalConnections = await ConnectionRequest.find({ $or : [{ fromUserId : loggedInUser._id, status : "accepted"}, { toUserId : loggedInUser._id, status : "accepted" }]}).populate("fromUserId", USER_DATA_FIELDS).populate("toUserId", USER_DATA_FIELDS);


        const data = totalConnections.map(connection => {
            if(connection?.fromUserId._id.toString() === loggedInUser?._id.toString()){
                return connection?.toUserId;
            }
            return connection?.fromUserId;
        })

        res.json({ message : "Connections fetched Successfully", data : data });

    }catch(err){
        res.status(401).send("Error: " + err.message);
    }
})

userRouter.get("/user/feed", userAuth , async(req, res) => {
    try{
        const loggedInUser = req.user;

        const totalConnections = await ConnectionRequest.find({ $or : [{fromUserId : loggedInUser._id}, {toUserId : loggedInUser._id}]}).select("fromUserId toUserId");

        const usersToHideFromFeed = new Set();

        totalConnections.forEach((req) => {
            usersToHideFromFeed.add(req?.fromUserId.toString());
            usersToHideFromFeed.add(req?.toUserId.toString());
        })

        const usersToShow = await User.find({ $and : [{_id : { $nin : Array.from(usersToHideFromFeed) }}, { _id : { $ne : loggedInUser._id }}] }).select(USER_DATA_FIELDS)  // Array.from(<Set>) converts the set into array

        res.json({ data : usersToShow });


    }catch(err){
        res.status(404).json({message : err.message});
    }
})

module.exports = userRouter;