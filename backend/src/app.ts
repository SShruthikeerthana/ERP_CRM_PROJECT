import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { sendError } from './utils/response';

const app: Application = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes Mount
app.use('/api/v1', apiRouter);
app.use('/health', (req, res, next) => apiRouter(req, res, next));

// 404 Route Handler
app.use((req: Request, res: Response) => {
  return sendError(res, `Route '${req.method} ${req.originalUrl}' not found`, 404);
});

// Global Error Middleware
app.use(errorHandler);

export default app;
