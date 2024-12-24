const express = require("express");

const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionrequest");

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

module.exports = userRouter;