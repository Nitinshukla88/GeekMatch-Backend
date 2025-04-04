const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true,
    },
    toUserId : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status : {
        type : String,
        required : true,
        enum : {          // It has the same function as of the "validate" - validation of the incoming value for this field
            values : ["interested", "ignored", "accepted", "rejected"],
            message : "{VALUE} is not correct status type"
        }
    }
}, { timestamps : true })

connectionRequestSchema.index({ fromUserId : 1, toUserId : 1});   // This compound index make the query faster involving fromUserId and toUserId. You can give the index to single field too.

connectionRequestSchema.pre("save", function (next) {    // "pre" is a middleware attached with connectionModel. Whenever any instance of this Schema is made, pre will be attached with it. Now whenever you try to save any document having this Schema, pre wiil run before it.
    const connectionRequest = this;
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("You cannot send request to yourself !!");
    }
    next();
})


const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;