const express = require("express");
const { MongoConnection } = require("../db.conn");
const mongoose = require("mongoose");
const SignupRouter = require("./Signup/SignupRouter");
const UserModel = require("../Models/User.Model");
const morgan = require("morgan");
const cors = require("cors");
const authMiddleware = require("./Signup/authMiddleware");
const GamesRouter = require("./Games/GamesRouter");
const SettingsRouter = require("./GameSettings/SettingsRouter");
// Creating an instance of the express server
const app = express();

app.use(express.json())

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.use(cors());
app.use(morgan('dev', { stream: { write: function(msg) { console.log(msg); } }}));
app.use(authMiddleware.authHandler);
/** For Database connection **/
MongoConnection();

// Defining a route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(SignupRouter);
app.use(GamesRouter);
app.use(SettingsRouter);

module.exports = app;