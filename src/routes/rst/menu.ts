import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Category } from '../../models/Category';
import { MenuItem } from '../../models/MenuItem';

const router = Router();
const rstId = (req: AuthRequest) => req.user!.entityId;

// Categories
router.get('/categories', async (req: AuthRequest, res) => {
  res.json(await Category.find({ restaurantId: rstId(req) }).sort({ sortOrder: 1, createdAt: 1 }));
});

router.post('/categories', async (req: AuthRequest, res) => {
  const cat = await Category.create({ ...req.body, restaurantId: rstId(req) });
  res.status(201).json(cat);
});

router.patch('/categories/:id', async (req: AuthRequest, res) => {
  const cat = await Category.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
  if (!cat) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(cat);
});

router.delete('/categories/:id', async (req: AuthRequest, res) => {
  await Category.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
  await MenuItem.deleteMany({ categoryId: req.params.id, restaurantId: rstId(req) });
  res.json({ message: 'Deleted' });
});

// Items
router.get('/items', async (req: AuthRequest, res) => {
  const items = await MenuItem.find({ restaurantId: rstId(req) }).populate('categoryId', 'name color').sort({ sortOrder: 1, name: 1 });
  res.json(items);
});

router.post('/items', async (req: AuthRequest, res) => {
  const item = await MenuItem.create({ ...req.body, restaurantId: rstId(req) });
  res.status(201).json(item);
});

router.patch('/items/:id', async (req: AuthRequest, res) => {
  const item = await MenuItem.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

router.patch('/items/:id/toggle', async (req: AuthRequest, res) => {
  const item = await MenuItem.findOne({ _id: req.params.id, restaurantId: rstId(req) });
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  item.available = !item.available;
  await item.save();
  res.json(item);
});

router.delete('/items/:id', async (req: AuthRequest, res) => {
  await MenuItem.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
  res.json({ message: 'Deleted' });
});

export default router;
