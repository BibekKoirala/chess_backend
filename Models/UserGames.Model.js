const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserGamesSchema = new Schema({
  player1: Schema.Types.ObjectId,
  player2: Schema.Types.ObjectId,
  format: String,
  time: String,
  history: [String],
  finalPosition: String,
  concludeby: String,
  winner: Schema.Types.ObjectId,
  createdon: Date,
});

const UserGamesModel = mongoose.model("UserGames", UserGamesSchema);
module.exports = UserGamesModel;
