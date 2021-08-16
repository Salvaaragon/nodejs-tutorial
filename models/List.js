const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const Task = require('./Task');

const listSchema = new Schema({
  name: String,
  date: Date,
  description: String,
  tasks: [
    {
      type: Schema.ObjectId,
      ref: Task,
    },
  ],
});

listSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const List = model('List', listSchema);

module.exports = List;
