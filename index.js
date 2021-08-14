const express = require('express');
const cors = require('cors');
const app = express();
const logger = require('./loggerMiddleware');

app.use(cors());
app.use(express.json());

app.use(logger);

let tasklists = [
  {
    id: 1,
    name: 'first list',
    date: '2021-08-13T19:00:00.000Z',
    description: '',
    tasks: [
      {
        id: 1,
        description: 'first task',
        completed: false,
      },
      {
        id: 2,
        description: 'second task',
        completed: true,
      },
    ],
  },
  {
    id: 2,
    name: 'second list',
    date: '2021-08-13T20:00:00.000Z',
    description: '',
    tasks: [
      {
        id: 3,
        description: 'first task',
        completed: true,
      },
      {
        id: 4,
        description: 'second task',
        completed: true,
      },
    ],
  },
];

app.get('/', (request, response) => {
  response.send('<h1>Hello world!</h1>');
});

app.get('/api/tasklists', (request, response) => {
  response.json(tasklists);
});

app.get('/api/tasklists/:id', (request, response) => {
  const id = Number(request.params.id);
  const tasktlist = tasklists.find((tasktlist) => tasktlist.id === id);

  if (tasktlist) response.json(tasktlist);
  else response.status(404).end();
});

app.delete('/api/tasklists/:id', (request, response) => {
  const id = Number(request.params.id);
  tasklists = tasklists.filter((tasktlist) => tasktlist.id !== id);
  response.status(204).end();
});

app.post('/api/tasklists', (request, response) => {
  const { name, description, tasks } = request.body;

  if (!request.body || !name || !tasks)
    return response.status(400).json({ error: 'Body with bad format' });

  const idsTasklists = tasklists.map((tasktlist) => tasktlist.id);
  const maxTasklistId = Math.max(...idsTasklists);
  let idsTasks = [];

  tasklists.forEach(({ tasks }) => {
    tasks.forEach(({ id }) => {
      idsTasks.push(id);
    });
  });
  const maxTaskId = Math.max(...idsTasks);

  const newtasktlist = {
    id: maxTasklistId + 1,
    name: name,
    description: description || '',
    date: new Date().toISOString(),
    tasks: tasks.map(({ name }, idx) => ({
      id: maxTaskId + (idx + 1),
      name: name,
      completed: false,
    })),
  };

  tasklists = tasklists.concat(newtasktlist);
  response.status(201).json(newtasktlist);
});

app.use((request, response) => {
  response.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
