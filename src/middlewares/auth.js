const userAuth = (req, res, next) => {       // Here we have used Middleware to first auth the request if it is hitting to user route
    console.log("Middleware is hitted !!");
    const token = "xyz";
    const authorised = token == "xyz";
    if(!authorised){
        res.status(401).send("Unauthorised person. Access is denied !");
    }else{
        next();
    }
}

module.exports = {
    userAuth,
}