import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(express.json());

import usersRouter from './routers/usersRouter.js';
app.use(usersRouter);

import schoolsRouter from './routers/schoolsRouter.js';
app.use(schoolsRouter);

import locationsRouter from './routers/locationsRouter.js';
app.use(locationsRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, error => {
  if (error) {
    console.log('Server failed to start', error);
    return;
  }
  console.log('Server is running on port', PORT);
});
