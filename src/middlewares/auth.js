const jwt = require("jsonwebtoken");

const User = require("../models/user");
const cookie = require("cookie");

const userAuth = async(reqOrSocket, resOrNext, nextFn) => {       // Here we have used Middleware to first auth the request if it is hitting any route
    try{
        let token;
        if(reqOrSocket.headers && reqOrSocket.headers.cookies){
            token = reqOrSocket.headers.cookies.token;
            if(!token) return resOrNext.status(401).send("Unauthorized: No token provided");
        } else if(reqOrSocket.handshake) {
            const cookies = cookie.parse(reqOrSocket.handshake.headers.cookie || '');
            token = cookies.token;
            if(!token) return resOrNext(new Error("Unauthorized: No token provided"));
        } else {
            return resOrNext.status ? resOrNext.status(401).send("Unauthorized") : resOrNext(new Error("Unauthorized"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) {
            return resOrNext.status ? resOrNext.status(401).send("Unauthorized: User not found") : resOrNext(new Error("Unauthorized: User not found"));
        }
        if(reqOrSocket.headers) {
            reqOrSocket.user = user;
            nextFn();
        } else {
            reqOrSocket.user = user;
            resOrNext();
        }
    } catch(err) {
        const errorMessage = "Unauthorized: " + err.message;
        return resOrNext.status ? resOrNext.status(401).send(errorMessage) : resOrNext(new Error(errorMessage));
    }

}

module.exports = {
    userAuth,
}