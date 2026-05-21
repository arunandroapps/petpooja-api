"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Distributor_1 = require("../../models/Distributor");
const Owner_1 = require("../../models/Owner");
const Restaurant_1 = require("../../models/Restaurant");
const Order_1 = require("../../models/Order");
const Plan_1 = require("../../models/Plan");
const router = (0, express_1.Router)();
router.get('/overview', async (_req, res) => {
    const [distributors, owners, restaurants, plans, orderStats] = await Promise.all([
        Distributor_1.Distributor.countDocuments({ status: 'active' }),
        Owner_1.Owner.find({ status: 'active' }).populate('planId', 'price'),
        Restaurant_1.Restaurant.find().select('status totalRevenue totalOrders'),
        Plan_1.Plan.find(),
        Order_1.Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
    ]);
    const mrr = owners.reduce((a, o) => a + (o.planId?.price || 0), 0);
    const totalRevenue = orderStats[0]?.total || 0;
    const totalOrders = orderStats[0]?.count || 0;
    const activeRestaurants = restaurants.filter((r) => r.status === 'active').length;
    res.json({ distributors, owners: owners.length, mrr, totalRevenue, totalOrders, activeRestaurants, totalRestaurants: restaurants.length });
});
router.get('/revenue-by-distributor', async (_req, res) => {
    const distributors = await Distributor_1.Distributor.find().select('name region commissionPct commissionEarned');
    const owners = await Owner_1.Owner.find().populate('planId', 'price');
    const result = distributors.map(d => {
        const myOwners = owners.filter((o) => o.distributorId.toString() === d._id.toString());
        const subscriptionRevenue = myOwners.reduce((a, o) => a + (o.planId?.price || 0), 0);
        const commission = subscriptionRevenue * d.commissionPct / 100;
        return { ...d.toJSON(), subscriptionRevenue, commission, ownerCount: myOwners.length };
    });
    res.json(result);
});
router.get('/daily-revenue', async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const data = await Order_1.Order.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);
    res.json(data);
});
exports.default = router;
