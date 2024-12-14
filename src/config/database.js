const mongoose = require("mongoose");

const connectDB = async()=> {
    await mongoose.connect("mongodb+srv://nitinshukla12004:QnHTjbVGORRrlJVC@nodejslearning.ldcg1.mongodb.net/");
}

module.exports = connectDB;