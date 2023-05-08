const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const EmailTemplateSchema = new Schema({
  subject: String,
  template: String,
  for: String,
});

const EmailTemplateModel = mongoose.model('templates', EmailTemplateSchema);
module.exports = EmailTemplateModel;