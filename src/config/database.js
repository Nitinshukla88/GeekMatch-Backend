const mongoose = require("mongoose");

const connectDB = async()=> {
    await mongoose.connect("mongodb+srv://nitinshukla12004:QnHTjbVGORRrlJVC@nodejslearning.ldcg1.mongodb.net/GeekMatch");
}

module.exports = connectDB;