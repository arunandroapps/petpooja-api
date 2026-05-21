import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Customer } from '../../models/Customer';
import { Types } from 'mongoose';

const router = Router();
const rstId = (req: AuthRequest) => new Types.ObjectId(req.user!.entityId);

router.get('/', async (req: AuthRequest, res) => {
  const q = req.query.q as string;
  const filter: any = { restaurantId: rstId(req) };
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }];
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ totalSpent: -1 }).skip((page - 1) * limit).limit(limit),
    Customer.countDocuments(filter),
  ]);
  res.json({ customers, total });
});

router.get('/search', async (req: AuthRequest, res) => {
  const { phone } = req.query;
  if (!phone) { res.json([]); return; }
  const customers = await Customer.find({ restaurantId: rstId(req), phone: new RegExp(phone as string, 'i') }).limit(5);
  res.json(customers);
});

router.post('/', async (req: AuthRequest, res) => {
  const c = await Customer.create({ ...req.body, restaurantId: rstId(req) });
  res.status(201).json(c);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const c = await Customer.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
  if (!c) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(c);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await Customer.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
  res.json({ message: 'Deleted' });
});

export default router;
