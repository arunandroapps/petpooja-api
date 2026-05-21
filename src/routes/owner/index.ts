import { Router } from 'express';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { Owner } from '../../models/Owner';
import { Restaurant } from '../../models/Restaurant';
import { User } from '../../models/User';
import { Plan } from '../../models/Plan';
import { Order } from '../../models/Order';
import { Staff } from '../../models/Staff';
import { MenuItem } from '../../models/MenuItem';
import { Category } from '../../models/Category';

const router = Router();
router.use(authenticate, authorize('owner'));

router.get('/me', async (req: AuthRequest, res) => {
  const owner = await Owner.findById(req.user!.entityId).populate('planId').populate('distributorId', 'name');
  res.json(owner);
});

router.get('/restaurants', async (req: AuthRequest, res) => {
  const rsts = await Restaurant.find({ ownerId: req.user!.entityId }).sort({ createdAt: -1 });
  res.json(rsts);
});

router.post('/restaurants', async (req: AuthRequest, res) => {
  const owner = await Owner.findById(req.user!.entityId).populate('planId');
  if (!owner) { res.status(404).json({ error: 'Owner not found' }); return; }
  const plan = owner.planId as any;
  const existingCount = await Restaurant.countDocuments({ ownerId: owner._id });
  if (plan?.maxRestaurants !== 999 && existingCount >= plan?.maxRestaurants) {
    res.status(400).json({ error: `Plan limit reached. Upgrade to add more restaurants.` }); return;
  }
  const { name, type, phone, email, address, city, gstin, totalTables } = req.body;
  const rst = await Restaurant.create({ ownerId: req.user!.entityId, name, type, phone, email, address, city, gstin, status: 'pending' });
  const user = await User.create({ name: `${name} Manager`, email: email || `manager@${rst._id}.petpooja.local`, password: 'rest123', role: 'restaurant', entityId: rst._id.toString() });
  res.status(201).json({ restaurant: rst, credentials: { email: user.email, password: 'rest123' } });
});

router.patch('/restaurants/:id', async (req: AuthRequest, res) => {
  const rst = await Restaurant.findOne({ _id: req.params.id, ownerId: req.user!.entityId });
  if (!rst) { res.status(404).json({ error: 'Not found or not yours' }); return; }
  Object.assign(rst, req.body);
  await rst.save();
  res.json(rst);
});

router.get('/analytics', async (req: AuthRequest, res) => {
  const rsts = await Restaurant.find({ ownerId: req.user!.entityId }).select('_id name');
  const rstIds = rsts.map(r => r._id);
  const days = parseInt(req.query.days as string) || 7;
  const since = new Date(); since.setDate(since.getDate() - days);
  const orders = await Order.aggregate([
    { $match: { restaurantId: { $in: rstIds }, status: 'completed', createdAt: { $gte: since } } },
    { $group: { _id: '$restaurantId', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
  ]);
  const daily = await Order.aggregate([
    { $match: { restaurantId: { $in: rstIds }, status: 'completed', createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ restaurants: rsts, byBranch: orders, daily });
});

router.get('/staff', async (req: AuthRequest, res) => {
  const rsts = await Restaurant.find({ ownerId: req.user!.entityId }).select('_id name');
  const rstIds = rsts.map(r => r._id);
  const staff = await Staff.find({ restaurantId: { $in: rstIds } }).populate('restaurantId', 'name');
  res.json(staff);
});

router.get('/menu', async (req: AuthRequest, res) => {
  const rsts = await Restaurant.find({ ownerId: req.user!.entityId }).select('_id name');
  const rstIds = rsts.map(r => r._id);
  const [menu, cats] = await Promise.all([
    MenuItem.find({ restaurantId: { $in: rstIds } }).populate('restaurantId', 'name').populate('categoryId', 'name'),
    Category.find({ restaurantId: { $in: rstIds } }),
  ]);
  res.json({ menu, categories: cats });
});

router.get('/billing', async (req: AuthRequest, res) => {
  const owner = await Owner.findById(req.user!.entityId).populate('planId');
  const plans = await Plan.find({ active: true }).sort({ price: 1 });
  res.json({ owner, plans });
});

export default router;
