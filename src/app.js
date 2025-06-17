require("dotenv").config();

const express = require("express");

const app = express();

const http = require("http");

const connectDB = require("./config/database");

const cookieParser = require("cookie-parser");


const authRouter = require("./routes/auth");

const profileRouter = require("./routes/profile");

const requestRouter = require("./routes/requests");

const userRouter = require("./routes/user");

const paymentRouter = require("./routes/payment");

const cors = require("cors");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use(cors({
  origin: "https://geek-match-frontend.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

const server = http.createServer(app);

initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database is successfully connected");
    server.listen(4000, () => {
      console.log("Server is listening on port 4000");
    });
  })
  .catch((err) => {
    console.error("Database is not connected !!");
  });



// ----------------------------------Code for learning------------------------------------------------------



// app.post("/signup", async (req, res) => {

//   try {
//     validateSignUpData(req); // API level validation before Schema level validation

//     const { firstName, lastName, emailId, password } = req.body;

//     const passwordHash = await bcrypt.hash(password, 10);

//     const user = new User({
//       firstName : firstName,
//       lastName : lastName,
//       email : emailId,
//       password : passwordHash
      
//     }); // Here Schema level validation is performed !
//     await user.save();
//     res.send("Data saved successfully!!");
//   } catch (err) {
//     res.status(401).send("Error in saving the user- " + err.message);
//   }
// });

// app.post("/login", async(req, res)=> {
//   try {
//     const {emailId, password} = req.body;
//     if(!validator.isEmail(emailId)){
//       throw new Error("Invalid Credentials!");
//     }

//     const user = await User.findOne({ email : emailId});

//     if(!user){
//       throw new Error("Invalid Credentials!");
//     }

//     const ispasswordValid = await user.validatePassword(password); 

//     if(ispasswordValid){

//       const token = await user.getJWT();
//       res.cookie("token", token, { expires : new Date(Date.now() + 8 * 3600000)}); // This cookie expires after 8 days
//       res.send("Login Successfull!!");
//     }else{
//       throw new Error("Invalid Credentials!");
//     }
//   }catch(err){
//     res.status(400).send("Login Error : "+err.message);
//   }
// })

// app.get("/profile", userAuth, async (req, res) => {   // Now here userAuth only let the request handler run, once the user is authenticated - power of middleware
//   try{
//     const user = req.user;
//     res.send(user);
//   }catch(err){
//     res.status(401).send("Error: "+err.message);
//   }

// })



// app.get("/user", async (req, res) => {
//   const userEmailId = req.body.emailId;
//   try {
//     const user = await User.findOne({ email: userEmailId });
//     if (user.length === 0) {
//       res.status(401).send("User does not exist");
//     } else {
//       res.send(user);
//     }
//   } catch (err) {
//     res.send("Something went wrong");
//   }
// });

// app.delete("/user", async(req, res) => {
//   const userId = req.body.id;
//   try{
//     // const user = await User.findOneAndDelete({ _id : userId }); This and the below method is one and the same
//     await User.findByIdAndDelete(userId);
//     res.send("User deleted successfully");
//   }catch(err){
//     res.status(401).send("Something went wrong!!");
//   }
// })

// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     if (users.length === 0) {
//       res.status(404).send("Something went wrong");
//     } else {
//       res.send(users);
//     }
//   } catch (err) {
//     res.status(401).send("Something went wrong");
//   }
// });

// app.patch("/user", async(req, res) => {
//   const userId = req.body.id;
//   const data = req.body;
  
//   try{
//     const ALLOWED_FIELDS = ["firstName", "lastName", "email", "password","id"];
//     const check_validation = Object.keys(data).every((key)=> ALLOWED_FIELDS.includes(key)) // API Level Validation (very very Imp)
    
//     if(!check_validation){
//       throw new Error("Provided information is invalid!");
//     }
//     if(data?.firstName.length > 20){
//       throw new Error("Name is too large !");
//     }
//     await User.findByIdAndUpdate(userId, data, {runValidators : true});
//     res.send("User is updated successfully!");
//   }catch(err){
//     res.status(400).send("Something went Wrong- "+err.message);
//   }
// })

