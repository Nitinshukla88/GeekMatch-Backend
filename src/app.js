const express = require("express");

const app = express();

app.use("/test", (req, res) => {
    res.send("This is the test page!");
})

app.use("/", (req, res) => {
    res.send("Hello World !!");
})

app.listen(4000, ()=> {
    console.log("Server is successfully running on port 4000");
})