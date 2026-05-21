import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Table } from '../../models/Table';
import { Types } from 'mongoose';

const router = Router();
const rstId = (req: AuthRequest) => new Types.ObjectId(req.user!.entityId);

router.get('/', async (req: AuthRequest, res) => {
  res.json(await Table.find({ restaurantId: rstId(req) }).populate('currentOrderId', 'number type status').sort({ area: 1, name: 1 }));
});

router.post('/', async (req: AuthRequest, res) => {
  const table = await Table.create({ ...req.body, restaurantId: rstId(req) });
  res.status(201).json(table);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const t = await Table.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
  if (!t) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(t);
});

router.patch('/:id/status', async (req: AuthRequest, res) => {
  const { status } = req.body;
  const t = await Table.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, { status }, { new: true });
  res.json(t);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await Table.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
  res.json({ message: 'Deleted' });
});

export default router;
