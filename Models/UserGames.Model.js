const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserGamesSchema = new Schema({
  player: Schema.Types.ObjectId,
  opponent: { type: Schema.Types.ObjectId, ref: 'User' },
  winner: Boolean,
  draw: Boolean,
  white: Boolean,
  game: { type: Schema.Types.ObjectId, ref: 'Games' },
  pointincrement: Number
});

const UserGamesModel = mongoose.model("UserGames", UserGamesSchema);
module.exports = UserGamesModel;
