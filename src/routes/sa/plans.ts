import { Router } from 'express';
import { Plan } from '../../models/Plan';
import { Owner } from '../../models/Owner';

const router = Router();

router.get('/', async (_req, res) => {
  const plans = await Plan.find().sort({ price: 1 });
  const owners = await Owner.find({ status: 'active' }).select('planId');
  const withCounts = plans.map(p => ({
    ...p.toJSON(),
    subscriberCount: owners.filter(o => o.planId.toString() === p._id.toString()).length,
  }));
  res.json(withCounts);
});

router.post('/', async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json(plan);
});

router.patch('/:id', async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(plan);
});

router.delete('/:id', async (req, res) => {
  const inUse = await Owner.countDocuments({ planId: req.params.id });
  if (inUse > 0) { res.status(400).json({ error: `Plan in use by ${inUse} owner(s)` }); return; }
  await Plan.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
