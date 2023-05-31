const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserConnectionSchema = new Schema({
  user: Schema.Types.ObjectId,
  connection: Schema.Types.ObjectId,
  createdon: Date,
});

const UserConnectionModel = mongoose.model(
  "UserConnection",
  UserConnectionSchema
);
module.exports = UserConnectionModel;
