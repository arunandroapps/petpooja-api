import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/error';

// Routes
import authRouter from './routes/auth';
import saRouter from './routes/sa/index';
import distRouter from './routes/distributor/index';
import ownerRouter from './routes/owner/index';
import rstRouter from './routes/rst/index';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '*').split(','),
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/sa', saRouter);
app.use('/api/dist', distRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/rst', rstRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
