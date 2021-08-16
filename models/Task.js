const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const taskSchema = new Schema({
  description: String,
  completed: Boolean,
});

taskSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Task = model('Task', taskSchema);

module.exports = Task;
