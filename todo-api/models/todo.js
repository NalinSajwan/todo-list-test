const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  modifiedAt: {
    type: Date,
    required: true
  },
  parentId: {
    type: String,
    required: false
  },
  complete: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model("Todo", todoSchema);