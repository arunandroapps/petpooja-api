import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Staff } from '../../models/Staff';
import { Types } from 'mongoose';

const router = Router();
const rstId = (req: AuthRequest) => new Types.ObjectId(req.user!.entityId);

router.get('/', async (req: AuthRequest, res) => {
  res.json(await Staff.find({ restaurantId: rstId(req) }).sort({ name: 1 }));
});

router.post('/', async (req: AuthRequest, res) => {
  const staff = await Staff.create({ ...req.body, restaurantId: rstId(req) });
  res.status(201).json(staff);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const s = await Staff.findOne({ _id: req.params.id, restaurantId: rstId(req) });
  if (!s) { res.status(404).json({ error: 'Not found' }); return; }
  Object.assign(s, req.body);
  await s.save(); // triggers pin hashing if pin changed
  res.json(s);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await Staff.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
  res.json({ message: 'Deleted' });
});

// POST /api/rst/staff/verify-pin — for POS staff auth
router.post('/verify-pin', async (req: AuthRequest, res) => {
  const { staffId, pin } = req.body;
  const staff = await Staff.findOne({ _id: staffId, restaurantId: rstId(req), active: true });
  if (!staff) { res.status(404).json({ error: 'Staff not found' }); return; }
  const valid = await staff.comparePin(pin);
  res.json({ valid, staff: valid ? staff : null });
});

export default router;
