const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// схема для создания задач
const taskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
  priority: { type: Boolean, default: false },
  user: { type: Schema.ObjectId, ref: 'User' }},
  { versionKey: false }
);

module.exports = mongoose.model('Task', taskSchema, 'tasks');