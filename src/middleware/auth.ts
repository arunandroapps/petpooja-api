import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JWTPayload { userId: string; role: string; entityId: string; iat: number; exp: number }

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    _res.status(401).json({ error: 'No token provided' });
    return;
  }
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user || !user.active) { _res.status(401).json({ error: 'User not found or inactive' }); return; }
    req.user = user;
    next();
  } catch {
    _res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
