import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.appOrigin === '*' ? true : env.appOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.use('/static', express.static(path.join(process.cwd(), 'public')));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'blink-box-api', time: new Date().toISOString() });
  });

  app.use('/api/v1', apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
