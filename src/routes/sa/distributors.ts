import { Router, Request, Response } from 'express';
import { Distributor } from '../../models/Distributor';
import { User } from '../../models/User';

const router = Router();

// GET /api/sa/distributors
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const distributors = await Distributor.find().sort({ createdAt: -1 });
  res.json(distributors);
});

// GET /api/sa/distributors/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const d = await Distributor.findById(req.params.id);
  if (!d) { res.status(404).json({ error: 'Distributor not found' }); return; }
  res.json(d);
});

// POST /api/sa/distributors
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, region, state, commissionPct } = req.body;
  if (!name || !email || !phone || !region || !state) { res.status(400).json({ error: 'Missing required fields' }); return; }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }

  const distributor = await Distributor.create({ name, email, phone, region, state, commissionPct: commissionPct || 10, userId: 'pending', status: 'pending' });
  const user = await User.create({ name, email, password: 'dist123', role: 'distributor', entityId: distributor._id.toString() });
  (distributor as any).userId = user._id.toString();
  await distributor.save();
  res.status(201).json({ distributor, credentials: { email, password: 'dist123' } });
});

// PATCH /api/sa/distributors/:id
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const d = await Distributor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!d) { res.status(404).json({ error: 'Distributor not found' }); return; }
  res.json(d);
});

// PATCH /api/sa/distributors/:id/status
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  const d = await Distributor.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!d) { res.status(404).json({ error: 'Distributor not found' }); return; }
  await User.updateOne({ entityId: d._id.toString(), role: 'distributor' }, { active: status === 'active' });
  res.json(d);
});

// DELETE /api/sa/distributors/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  await Distributor.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
