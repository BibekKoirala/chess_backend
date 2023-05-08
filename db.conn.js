const mongoose = require('mongoose');

async function MongoConnection() {
    try {
        await mongoose.connect(process.env.DBConnectionString);
        console.log("Mongo DB connection successful");
      } catch (error) {
        handleError(error);
      }    
}

module.exports = { MongoConnection: MongoConnection }