import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { Distributor } from '../../models/Distributor';
import { Owner } from '../../models/Owner';
import { Restaurant } from '../../models/Restaurant';
import { User } from '../../models/User';
import { Plan } from '../../models/Plan';
import { AuthRequest } from '../../middleware/auth';
import { Order } from '../../models/Order';

const router = Router();
router.use(authenticate, authorize('distributor'));

// GET /api/dist/me — distributor profile
router.get('/me', async (req: AuthRequest, res) => {
  const dist = await Distributor.findById(req.user!.entityId);
  if (!dist) { res.status(404).json({ error: 'Distributor not found' }); return; }
  res.json(dist);
});

// GET /api/dist/owners — list my owners
router.get('/owners', async (req: AuthRequest, res) => {
  const owners = await Owner.find({ distributorId: req.user!.entityId }).populate('planId', 'name price color tier').sort({ createdAt: -1 });
  res.json(owners);
});

// POST /api/dist/owners — onboard new owner
router.post('/owners', async (req: AuthRequest, res) => {
  const { name, email, phone, businessName, gst, city, state, planId } = req.body;
  if (!name || !email || !planId) { res.status(400).json({ error: 'Missing fields' }); return; }
  const plan = await Plan.findById(planId);
  if (!plan) { res.status(400).json({ error: 'Plan not found' }); return; }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }
  const subscriptionEnd = new Date(); subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
  const owner = await Owner.create({ name, email, phone, businessName, gst, city, state, planId, distributorId: req.user!.entityId, userId: 'pending', status: 'pending', subscriptionEnd });
  const user = await User.create({ name, email, password: 'owner123', role: 'owner', entityId: owner._id.toString() });
  (owner as any).userId = user._id.toString(); await owner.save();
  res.status(201).json({ owner, credentials: { email, password: 'owner123' } });
});

// GET /api/dist/restaurants
router.get('/restaurants', async (req: AuthRequest, res) => {
  const owners = await Owner.find({ distributorId: req.user!.entityId }).select('_id');
  const ownerIds = owners.map(o => o._id);
  const rsts = await Restaurant.find({ ownerId: { $in: ownerIds } }).populate('ownerId', 'name businessName').sort({ createdAt: -1 });
  res.json(rsts);
});

// GET /api/dist/commission
router.get('/commission', async (req: AuthRequest, res) => {
  const dist = await Distributor.findById(req.user!.entityId);
  if (!dist) { res.status(404).json({ error: 'Not found' }); return; }
  const owners = await Owner.find({ distributorId: req.user!.entityId, status: 'active' }).populate('planId', 'price name');
  const subscriptionRevenue = owners.reduce((a: number, o: any) => a + (o.planId?.price || 0), 0);
  const commission = subscriptionRevenue * dist.commissionPct / 100;
  res.json({ distributorName: dist.name, commissionPct: dist.commissionPct, subscriptionRevenue, commission, owners: owners.map((o: any) => ({ name: o.businessName, plan: o.planId?.name, price: o.planId?.price, commission: (o.planId?.price || 0) * dist.commissionPct / 100 })) });
});

// GET /api/dist/analytics
router.get('/analytics', async (req: AuthRequest, res) => {
  const owners = await Owner.find({ distributorId: req.user!.entityId }).select('_id');
  const ownerIds = owners.map(o => o._id);
  const rsts = await Restaurant.find({ ownerId: { $in: ownerIds } }).select('_id');
  const rstIds = rsts.map(r => r._id);
  const revenue = await Order.aggregate([
    { $match: { restaurantId: { $in: rstIds }, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);
  res.json({ ownerCount: owners.length, restaurantCount: rsts.length, revenue: revenue[0]?.total || 0, orders: revenue[0]?.count || 0 });
});

export default router;
