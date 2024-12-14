const express = require("express");

const app = express();

app.get("/user/:userId/:city", (req, res)=> { // Here in user route, userId, city are dynamic parameters
    console.log(req.params); // To get parameters from route, you can use params method
    res.send({firstname : "Nitin", lastname : "Shukla"});
})

app.post("/user", (req, res)=> {
    res.send("Data is successfully stored to DB");
})

app.use("/test", (req, res) => {
    res.send("This is the test page!");
})

app.use("/", (req, res) => {
    res.send("Hello World !!");
})

app.listen(4000, ()=> {
    console.log("Server is successfully running on port 4000");
})