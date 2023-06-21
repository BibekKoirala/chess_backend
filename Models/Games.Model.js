const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GamesSchema = new Schema({
  format: String,
  time: String,
  history: [String],
  finalPosition: String,
  concludeby: String,
  createdon: Date
});

const GamesModel = mongoose.model("Games", GamesSchema);
module.exports = GamesModel;
