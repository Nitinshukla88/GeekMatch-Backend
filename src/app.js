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

app.get("/user", async (req, res) => {
  const userEmailId = req.body.emailId;
  try {
    const user = await User.findOne({ email: userEmailId });
    if (user.length === 0) {
      res.status(401).send("User does not exist");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.send("Something went wrong");
  }
});

app.delete("/user", async(req, res) => {
  const userId = req.body.id;
  try{
    // const user = await User.findOneAndDelete({ _id : userId }); This and the below method is one and the same
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  }catch(err){
    res.status(401).send("Something went wrong!!");
  }
})

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.status(404).send("Something went wrong");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(401).send("Something went wrong");
  }
});

app.patch("/user", async(req, res) => {
  const userId = req.body.id;
  const data = req.body
  try{
    await User.findByIdAndUpdate(userId, data);
    res.send("User is updated successfully!");
  }catch(err){
    res.send("Something went Wrong- "+err.message);
  }
})

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
