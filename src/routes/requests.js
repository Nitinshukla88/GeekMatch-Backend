const express = require("express");

const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionrequest");

const User = require("../models/user");
const { connection } = require("mongoose");

const sendEmail = require("../utils/sendEmail");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req, res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["interested", "ignored"];

        if(!allowedStatus.includes(status)){
            return res.status(400).send("Error : Invalid request status!!");
        }

        const toUser = await User.findById(toUserId);

        if(!toUser){
            return res.status(400).send("User is not present !");
        }


        const connectionRequest = await ConnectionRequest.findOne({
            $or : [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        })

        if(connectionRequest){
            return res.status(400).json({ message : "Request already exists !!"})
        }

        const connectionrequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const connectionSucceed = await connectionrequest.save();

        // if(status === "interested") {
            
        //     const emailResponse = await sendEmail.run("New Connection Request!!", "A new User"+ " " +req?.user?.firstName + " " + "is interested in you");
        // }


        res.json({ message : "Connection request is sent successfully", connectionSucceed })


    }catch(err){
        res.status(401).send("Error: " + err.message);
    }
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res) => {
    try{
        const allowedStatus = ["accepted", "rejected"];

        const { status, requestId } = req.params;

        if(!allowedStatus.includes(status)){
            return res.status(401).json({ message : "Invalid Status request !!"});
        }

        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.findOne({
            _id : requestId,
            toUserId : loggedInUser?._id,
            status : "interested"
        });

        if(!connectionRequest) {
            return res.status(400).json({ message : "Connection request not present" });
        }

        connectionRequest.status = status;

        const savedConnection = await connectionRequest.save();

        res.json({ message : "Connection request is " + status + " successfully", savedConnection });
    }catch(err){
        res.status(400).send("Error: " + err.message);
    }
})

module.exports = requestRouter;