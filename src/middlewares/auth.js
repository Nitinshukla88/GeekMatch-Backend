const jwt = require("jsonwebtoken");

const User = require("../models/user");

const userAuth = async(req, res, next) => {       // Here we have used Middleware to first auth the request if it is hitting any route
    try{
        const { token } = req.cookies;

        if(!token){
            throw new Error("Token is not valid !!!");
        }

        const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

        const { _id } = decodedData;

        const verifiedUser = await User.findById(_id);
        if(!verifiedUser){
            throw new Error("User is not found !");
        }
        req.user = verifiedUser;
        next();
    }catch(err){
        res.status(401).send("Error : " + err.message);
    }
}

module.exports = {
    userAuth,
}