const mongoose = require("mongoose");

const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        maxLength : 50,
    }, 
    lastName : {
        type : String,
        required : true,
        maxLength : 50,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        validate(value){
            if(!value.includes("@")){
                throw new Error("Email is invalid !!");
            }
        }
    }, 
    password : {
        type : String,
        required : true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Password is weak !")
            }
        }
    }, 
    age : {
        type : Number,
        min : 18
    }, 
    gender : {
        type : String,
        lowercase : true,
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender data is not valid !");
            }
        }
    }
}, {timestamps : true})

const User = mongoose.model("User", userSchema);

module.exports = User;