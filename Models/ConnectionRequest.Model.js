const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ConnectionRequestSchema = new Schema({
  from: Schema.Types.ObjectId,
  to: Schema.Types.ObjectId,
  createdon: Date,
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);
module.exports = ConnectionRequestModel;
