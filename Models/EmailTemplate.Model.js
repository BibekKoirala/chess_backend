const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const EmailTemplateSchema = new Schema({
  type: String,
  template_name: String,
  subject: String,
  body: String
});

const EmailTemplateModel = mongoose.model('templates', EmailTemplateSchema);
module.exports = EmailTemplateModel;