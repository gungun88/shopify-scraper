import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import {
  createBatchTask,
  createSingleTask,
  getProducts,
  getTask,
  getTasks,
} from './scraper.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.post('/api/tasks/single', (req: Request, res: Response) => {
  const { urls, platform } = req.body as { urls?: string[]; platform?: string };

  if (!Array.isArray(urls) || urls.length === 0) {
    res.status(400).json({ error: '`urls` must be a non-empty array' });
    return;
  }

  if (!platform || typeof platform !== 'string') {
    res.status(400).json({ error: '`platform` is required' });
    return;
  }

  res.status(201).json(createSingleTask(urls, platform));
});

app.post('/api/tasks/batch', (req: Request, res: Response) => {
  const { url, platform, limit } = req.body as {
    url?: string;
    platform?: string;
    limit?: number;
  };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: '`url` is required' });
    return;
  }

  if (!platform || typeof platform !== 'string') {
    res.status(400).json({ error: '`platform` is required' });
    return;
  }

  if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
    res.status(400).json({ error: '`limit` must be a positive integer' });
    return;
  }

  res.status(201).json(createBatchTask(url, platform, limit));
});

app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(getTasks());
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = getTask(req.params.id);

  if (!task) {
    res.status(404).json({ error: `Task not found: ${req.params.id}` });
    return;
  }

  res.json(task);
});

app.get('/api/products', (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  res.json(getProducts(page, pageSize));
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[server]', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
