import { Router } from 'express';
import { Distributor } from '../../models/Distributor';
import { Owner } from '../../models/Owner';
import { Restaurant } from '../../models/Restaurant';
import { Order } from '../../models/Order';
import { Plan } from '../../models/Plan';

const router = Router();

router.get('/overview', async (_req, res) => {
  const [distributors, owners, restaurants, plans, orderStats] = await Promise.all([
    Distributor.countDocuments({ status: 'active' }),
    Owner.find({ status: 'active' }).populate('planId', 'price'),
    Restaurant.find().select('status totalRevenue totalOrders'),
    Plan.find(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
  ]);

  const mrr = owners.reduce((a: number, o: any) => a + (o.planId?.price || 0), 0);
  const totalRevenue = orderStats[0]?.total || 0;
  const totalOrders = orderStats[0]?.count || 0;
  const activeRestaurants = restaurants.filter((r: any) => r.status === 'active').length;

  res.json({ distributors, owners: owners.length, mrr, totalRevenue, totalOrders, activeRestaurants, totalRestaurants: restaurants.length });
});

router.get('/revenue-by-distributor', async (_req, res) => {
  const distributors = await Distributor.find().select('name region commissionPct commissionEarned');
  const owners = await Owner.find().populate('planId', 'price');
  const result = distributors.map(d => {
    const myOwners = owners.filter((o: any) => o.distributorId.toString() === d._id.toString());
    const subscriptionRevenue = myOwners.reduce((a: number, o: any) => a + (o.planId?.price || 0), 0);
    const commission = subscriptionRevenue * d.commissionPct / 100;
    return { ...d.toJSON(), subscriptionRevenue, commission, ownerCount: myOwners.length };
  });
  res.json(result);
});

router.get('/daily-revenue', async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const since = new Date(); since.setDate(since.getDate() - days);
  const data = await Order.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(data);
});

export default router;
