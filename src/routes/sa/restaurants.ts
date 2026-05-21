import { Router } from 'express';
import { Restaurant } from '../../models/Restaurant';
import { User } from '../../models/User';

const router = Router();

router.get('/', async (_req, res) => {
  const rsts = await Restaurant.find().populate('ownerId', 'name businessName city').sort({ createdAt: -1 });
  res.json(rsts);
});

router.get('/:id', async (req, res) => {
  const r = await Restaurant.findById(req.params.id).populate('ownerId');
  if (!r) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(r);
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const r = await Restaurant.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!r) { res.status(404).json({ error: 'Not found' }); return; }
  await User.updateOne({ entityId: r._id.toString(), role: 'restaurant' }, { active: status === 'active' });
  res.json(r);
});

router.patch('/:id', async (req, res) => {
  const r = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!r) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(r);
});

export default router;
