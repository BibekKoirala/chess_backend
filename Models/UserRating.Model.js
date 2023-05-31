const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserRatingSchema = new Schema({
  user: Schema.Types.ObjectId,
  bullet: Number,
  blitz: Number,
  Rapid: Number,
});

const UserRatingModel = mongoose.model("UserRating", UserRatingSchema);
module.exports = UserRatingModel;
