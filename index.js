const express = require("express");
const bodyParser = require("body-parser");
const { MongoConnection } = require("./db.conn");
const mongoose = require("mongoose");
const SignupRouter = require("./Modules/Signup/SignupRouter");
const UserModel = require("./Models/User.Model");
const morgan = require("morgan");
const cors = require("cors");
const authMiddleware = require("./Modules/Signup/authMiddleware");
require('dotenv').config();

// Creating an instance of the express server
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cors());
app.use(morgan('tiny'));
app.use(authMiddleware.authHandler);
/** For Database connection **/
MongoConnection();

// Defining a route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(SignupRouter);

// Starting the server
app.listen(8080, () => {
  console.log("Server started on port 3000");
});
