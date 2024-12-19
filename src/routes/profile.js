const express = require("express");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

const { validateProfileUpdateData, validateUserCurrentPassword } = require("../utils/validation");

const validator = require("validator");

const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {   // Now here userAuth only let the request handler run, once the user is authenticated - power of middleware
    try{
      const user = req.user;
      res.send(user);
    }catch(err){
      res.status(401).send("Error: "+err.message);
    }
  
  })


profileRouter.patch("/profile/edit", userAuth, async(req, res)=> {

  try{
    const isValidUpdateRequest = validateProfileUpdateData(req);

    if(!isValidUpdateRequest){
      throw new Error("Invalid update request!!");
    }

    const loggedInUser = req.user;
 
    Object.keys(req?.body).every(key => loggedInUser[key] = req?.body[key])

    await loggedInUser.save();

    res.json({ message : "Profile updated successfully", data : loggedInUser});
  }catch(err){
    res.status(401).send("Error: " + err.message);
  }

})


profileRouter.patch("/profile/change-password", userAuth, async(req, res) => {
  try{
    const isUserValid = validateUserCurrentPassword(req);

    if(!isUserValid){
      throw new Error("Invalid User !!");
    }

    const { newpassword } = req.body;

    const isPasswordStrong = validator.isStrongPassword(newpassword);

    if(!isPasswordStrong){
      throw new Error("Your Password is weak ! Try again with a strong password !");
    }

    const passwordHash = await bcrypt.hash(newpassword, 10);

    const user = req.user;

    user.password = passwordHash;

    await user.save();

    res.send("password Updated successfully");
  }catch(err){
    res.status(400).send("Error: " + err.message);
  }
});


module.exports = profileRouter;