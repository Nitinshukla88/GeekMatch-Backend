const express = require("express");

const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");

const bcrypt = require("bcrypt");

const User = require("../models/user");

const validator = require("validator");


authRouter.post("/signup", async (req, res) => {

    try {
      validateSignUpData(req); // API level validation before Schema level validation
  
      const { firstName, lastName, emailId, password } = req.body;

      const isUserSignedUp = await User.findOne({ email : emailId});
  
      if(isUserSignedUp){
        throw new Error("User already exist !! Please Login");
      }
  
      const passwordHash = await bcrypt.hash(password, 10);
  
      const user = new User({
        firstName : firstName,
        lastName : lastName,
        email : emailId,
        password : passwordHash
        
      }); // Here Schema level validation is performed !
      const savedUser = await user.save();
      const token = await savedUser.getJWT();
      res.cookie("token", token, { expires : new Date(Date.now() + 8 * 3600000)}); // This cookie expires after 8 days
      res.json({message : "Used added successfully!!", data : savedUser});
    } catch (err) {
      res.status(401).send("Error- " + err.message);
    }
  });
  

authRouter.post("/login", async(req, res)=> {
    try {
      const {emailId, password} = req.body;
      if(!validator.isEmail(emailId)){
        throw new Error("Invalid Credentials!");
      }
  
      const user = await User.findOne({ email : emailId});
  
      if(!user){
        throw new Error("User does not exist! Please Sign Up");
      }
  
      const ispasswordValid = await user.validatePassword(password); 
  
      if(ispasswordValid){
  
        const token = await user.getJWT();
        res.cookie("token", token, { expires : new Date(Date.now() + 8 * 3600000)}); // This cookie expires after 8 days
        res.send(user);
      }else{
        throw new Error("Invalid Credentials!");
      }
    }catch(err){
      res.status(400).send("Login Error : "+err.message);
    }
  })


  authRouter.post("/logout", (req, res) => {
    // res.cookie("token", null, {expires : new Date(Date.now())});
    res.clearCookie("token");
    res.send("Logout Successfull!!");
  })


  module.exports = authRouter;