const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  priority : { type: Number, default: 0}
});

module.exports = mongoose.model('Task', taskSchema, 'tasks');