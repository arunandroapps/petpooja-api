import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { Ingredient } from '../../models/Ingredient';
import { Types } from 'mongoose';

const router = Router();
const rstId = (req: AuthRequest) => new Types.ObjectId(req.user!.entityId);

router.get('/', async (req: AuthRequest, res) => {
  const ings = await Ingredient.find({ restaurantId: rstId(req) }).sort({ name: 1 });
  const lowStock = ings.filter(i => i.stock <= i.minStock);
  const totalValue = ings.reduce((a, b) => a + b.stock * b.costPerUnit, 0);
  res.json({ ingredients: ings, lowStock, totalValue });
});

router.post('/', async (req: AuthRequest, res) => {
  const ing = await Ingredient.create({ ...req.body, restaurantId: rstId(req), lastUpdated: new Date() });
  res.status(201).json(ing);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const ing = await Ingredient.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, { ...req.body, lastUpdated: new Date() }, { new: true });
  if (!ing) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(ing);
});

router.patch('/:id/adjust', async (req: AuthRequest, res) => {
  const { delta } = req.body;
  const ing = await Ingredient.findOne({ _id: req.params.id, restaurantId: rstId(req) });
  if (!ing) { res.status(404).json({ error: 'Not found' }); return; }
  ing.stock = Math.max(0, ing.stock + delta);
  ing.lastUpdated = new Date();
  await ing.save();
  res.json(ing);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await Ingredient.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
  res.json({ message: 'Deleted' });
});

export default router;
