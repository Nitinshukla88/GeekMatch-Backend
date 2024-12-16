const express = require("express");

const app = express();

const connectDB = require("./config/database");

const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
    console.log(req.body);
//   const userData = {
//     firstName: "raj",
//     lastName: "shrivastava",
//     password: 163535,
//     age: 13,
//   };

//   const user = new User(userData);

  const user = new User(req.body);

  try {
    await user.save();
    res.send("Data saved successfully!!");
  } catch (err) {
    res.send("Error in saving the user- " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database is successfully connected");
    app.listen(4000, () => {
      console.log("Server is listening on port 4000");
    });
  })
  .catch((err) => {
    console.error("Database is not connected !!");
  });
