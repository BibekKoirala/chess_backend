const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserRatingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true
  },
  bullet: {
    type: Number,
    min: [0, 'Bullet rating cannot be negative'],
    required: true
  },
  blitz: {
    type: Number,
    min: [0, 'Blitz rating cannot be negative'],
    required: true
  },
  rapid: {
    type: Number,
    min: [0, 'Rapid rating cannot be negative'],
    required: true
  },
  classical: {
    type: Number,
    min: [0, 'Classical rating cannot be negative'],
    required: true
  }
});

const UserRatingModel = mongoose.model("UserRating", UserRatingSchema);
module.exports = UserRatingModel;
