import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const SECRET = () => process.env.JWT_SECRET || 'dev_secret_change_this';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const EXPIRES = () => process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = () => process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const signAccessToken = (user: IUser): string =>
  jwt.sign({ userId: user._id, role: user.role, entityId: user.entityId }, SECRET(), { expiresIn: EXPIRES() } as any);

export const signRefreshToken = (user: IUser): string =>
  jwt.sign({ userId: user._id }, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES() } as any);

export const verifyRefreshToken = (token: string): { userId: string } =>
  jwt.verify(token, REFRESH_SECRET()) as { userId: string };
