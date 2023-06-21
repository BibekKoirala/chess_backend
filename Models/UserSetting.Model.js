const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSettingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  against: Number,
  format: Number,
  difficulty: Number,
  playas: String,
});

const UserSettingModel = mongoose.model("UserSetting", UserSettingSchema);
module.exports = UserSettingModel;
