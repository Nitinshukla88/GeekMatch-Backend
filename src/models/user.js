const mongoose = require("mongoose");

const validator = require("validator");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

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
    isPremium : {
        type : String,
        default : false
    },
    membershipType : {
        type : String
    },
    age : {
        type : Number,
        min : 18,
        default : 21
    }, 
    gender : {
        type : String,
        lowercase : true,
        default : "male",
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender data is not valid !");
            }
        }
    },
    photo : {
        type: String,
        default : "https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small/Basic_Ui__28186_29.jpg"
    },
    about : {
        type : String,
        maxLength : 200,
        default : "Hey my name is John Doe. I'm a software engineer"
    },
    skills : {
        type : [String],
        validate(value){
            if(value.length > 50){
                throw new Error("Too many skills to store!!");
            }
        }
    }
}, {timestamps : true})

userSchema.methods.getJWT = async function (){ // Always use Normal function while making schema methods
    const user = this;
    const token = await jwt.sign({_id : user._id}, "GeekMatch@123", {expiresIn : "1d"}); // This will expire after one day
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser){   // Schema methods make the code clean (Highly encouraged to use them)
    const user = this;

    const isUserValid = await bcrypt.compare(passwordInputByUser, user.password);

    return isUserValid;

}

const User = mongoose.model("User", userSchema);

module.exports = User;