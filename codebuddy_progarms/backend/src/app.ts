import express from 'express';
import cors from 'cors';
import categoriesRouter from './routes/categories';
import tasksRouter from './routes/tasks';
import timeblocksRouter from './routes/timeblocks';
import pomodoroRouter from './routes/pomodoro';
import reportsRouter from './routes/reports';
import { notFound, errorHandler } from './middleware/error';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/timeblocks', timeblocksRouter);
app.use('/api/v1/pomodoro', pomodoroRouter);
app.use('/api/v1/reports', reportsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
