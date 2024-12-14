const express = require("express");

const app = express();

const connectDB = require("./config/database");

connectDB().then(()=> {
    console.log("Database is successfully connected");
    app.listen(4000, ()=> {
        console.log("Server is listening on port 4000");
    })
}).catch((err)=> {
    console.error("Database is not connected !!");
})