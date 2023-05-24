require('dotenv').config();

const mongoose = require('mongoose');

async function MongoConnection() {
    try {
        await mongoose.connect(process.env.DBConnectionString);
        console.log("Mongo DB connection successful");
      } catch (error) {
        console.log(error.message);
      }    
}

module.exports = { MongoConnection: MongoConnection }