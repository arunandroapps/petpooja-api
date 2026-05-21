import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.active) { res.status(401).json({ error: 'Invalid credentials' }); return; }
  const valid = await user.comparePassword(password);
  if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save();

  res.json({ accessToken, refreshToken, user });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) { res.status(400).json({ error: 'Refresh token required' }); return; }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      res.status(401).json({ error: 'Invalid refresh token' }); return;
    }
    const accessToken = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();
    res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (req.user && refreshToken) {
    req.user.refreshTokens = (req.user.refreshTokens || []).filter(t => t !== refreshToken);
    await req.user.save();
  }
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user });
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) { res.status(400).json({ error: 'Both passwords required' }); return; }
  const user = await User.findById(req.user!._id);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  const valid = await user.comparePassword(currentPassword);
  if (!valid) { res.status(400).json({ error: 'Current password incorrect' }); return; }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

export default router;
