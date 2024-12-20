const express = require("express");

const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionrequest");

userRouter.get("/user/requests/received", userAuth, async(req, res) => {
    try{

        const loggedInUser = req.user;
        const matchedRequests = await ConnectionRequest.find({ toUserId : loggedInUser?._id, status : "interested" });
        res.json({ message : "Requests fetched successfully", matchedRequests });
        
    }catch(err){
        res.status(401).send("Error: " + err.message);
    }
})

module.exports = userRouter;