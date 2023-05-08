const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
  username: String,
  email: String,
  password: String,
  birthdate: Date,
  activated: Boolean,
  createdon: Date
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;