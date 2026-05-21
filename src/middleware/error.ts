import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error(err.message || err, err.stack);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation error', details: Object.values(err.errors).map((e: any) => e.message) });
    return;
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    res.status(409).json({ error: `Duplicate value for ${field}` });
    return;
  }
  res.status(status).json({ error: message });
};

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
};
