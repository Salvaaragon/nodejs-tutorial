require('dotenv').config();
require('./mongo');

const express = require('express');
const app = express();
const cors = require('cors');

const Task = require('./models/Task');
const List = require('./models/List');
const notFound = require('./middlewares/notFound');
const handleErrors = require('./middlewares/handleErrors');

app.use(cors());
app.use(express.json());

app.get('/', (request, response) => {
  response.send('<h1>Hello world!</h1>');
});

app.get('/api/tasklists', (request, response) => {
  List.find({}, function (err, lists) {
    Task.populate(lists, { path: 'tasks' }, function (err, lists) {
      response.json(lists);
    });
  });
});

app.get('/api/tasks/:id', (request, response, next) => {
  const id = request.params.id;

  List.findById(id)
    .then((lists) => {
      if (lists) {
        Task.populate(lists, { path: 'tasks' }, function (err, lists) {
          response.json(lists.tasks);
        });
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    })
    .catch((err) => next(err));
});

app.get('/api/tasklist/:id', (request, response, next) => {
  const id = request.params.id;
  List.findById(id)
    .then((list) => {
      if (list) {
        Task.populate(list, { path: 'tasks' }, function (err, list) {
          response.json(list);
        });
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    })
    .catch((err) => next(err));
});

app.put('/api/tasklist/:id', (request, response, next) => {
  const { id } = request.params;
  const { name, description } = request.body;

  const newListInfo = {
    name: name || undefined,
    description: description || undefined,
  };

  List.findByIdAndUpdate(id, newListInfo, { new: true })
    .then((result) => {
      response.json(result);
    })
    .catch((err) => next(err));
});

app.delete('/api/tasklist/:id', (request, response, next) => {
  const { id } = request.params;
  List.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        const { tasks } = result;
        Task.deleteMany({ _id: tasks }, (err) => {
          if (err) {
            response.status(400).end();
          } else {
            response.status(204).end();
          }
        });
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.delete('/api/task/:id', (request, response, next) => {
  const { id } = request.params;
  Task.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        response.status(204).end();
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.delete('/api/tasks/:id', (request, response, next) => {
  const { id } = request.params;
  List.findById(id)
    .then((result) => {
      if (result) {
        const { tasks } = result;
        Task.deleteMany({ _id: tasks }, (err) => {
          if (err) {
            response.status(400).end();
          } else {
            response.status(204).end();
          }
        });
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.post('/api/tasklist', (request, response, next) => {
  const { name, description } = request.body;

  if (!request.body) {
    return response.status(400).json({ error: 'Body with bad format' });
  }

  const newList = new List({
    name: name,
    description: description || '',
    date: new Date().toISOString(),
    tasks: [],
  });

  newList
    .save()
    .then((savedList) => {
      response.status(201).json(savedList);
    })
    .catch((err) => next(err));
});

app.post('/api/task', (request, response, next) => {
  const { description, idList } = request.body;

  if (!request.body || !idList || !description) {
    return response.status(400).json({ error: 'Body with bad format' });
  }

  List.findById(idList)
    .then((list) => {
      if (list) {
        const newTask = new Task({
          description: description,
          completed: false,
        });

        newTask
          .save()
          .then((savedTask) => {
            List.updateOne(
              { _id: list._id },
              { $push: { tasks: savedTask._id } },
              function (error) {
                if (error) {
                  response.status(408).end();
                } else {
                  response.status(204).json(savedTask);
                }
              },
            );
          })
          .catch((err) => next(err));
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    })
    .catch((err) => next(err));
});

app.use(handleErrors);
app.use(notFound);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
