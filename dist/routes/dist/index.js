"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const Distributor_1 = require("../../models/Distributor");
const Owner_1 = require("../../models/Owner");
const Restaurant_1 = require("../../models/Restaurant");
const User_1 = require("../../models/User");
const Plan_1 = require("../../models/Plan");
const Order_1 = require("../../models/Order");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('distributor'));
// GET /api/dist/me — distributor profile
router.get('/me', async (req, res) => {
    const dist = await Distributor_1.Distributor.findById(req.user.entityId);
    if (!dist) {
        res.status(404).json({ error: 'Distributor not found' });
        return;
    }
    res.json(dist);
});
// GET /api/dist/owners — list my owners
router.get('/owners', async (req, res) => {
    const owners = await Owner_1.Owner.find({ distributorId: req.user.entityId }).populate('planId', 'name price color tier').sort({ createdAt: -1 });
    res.json(owners);
});
// POST /api/dist/owners — onboard new owner
router.post('/owners', async (req, res) => {
    const { name, email, phone, businessName, gst, city, state, planId } = req.body;
    if (!name || !email || !planId) {
        res.status(400).json({ error: 'Missing fields' });
        return;
    }
    const plan = await Plan_1.Plan.findById(planId);
    if (!plan) {
        res.status(400).json({ error: 'Plan not found' });
        return;
    }
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
    }
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    const owner = await Owner_1.Owner.create({ name, email, phone, businessName, gst, city, state, planId, distributorId: req.user.entityId, userId: 'pending', status: 'pending', subscriptionEnd });
    const user = await User_1.User.create({ name, email, password: 'owner123', role: 'owner', entityId: owner._id.toString() });
    owner.userId = user._id.toString();
    await owner.save();
    res.status(201).json({ owner, credentials: { email, password: 'owner123' } });
});
// GET /api/dist/restaurants
router.get('/restaurants', async (req, res) => {
    const owners = await Owner_1.Owner.find({ distributorId: req.user.entityId }).select('_id');
    const ownerIds = owners.map(o => o._id);
    const rsts = await Restaurant_1.Restaurant.find({ ownerId: { $in: ownerIds } }).populate('ownerId', 'name businessName').sort({ createdAt: -1 });
    res.json(rsts);
});
// GET /api/dist/commission
router.get('/commission', async (req, res) => {
    const dist = await Distributor_1.Distributor.findById(req.user.entityId);
    if (!dist) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    const owners = await Owner_1.Owner.find({ distributorId: req.user.entityId, status: 'active' }).populate('planId', 'price name');
    const subscriptionRevenue = owners.reduce((a, o) => a + (o.planId?.price || 0), 0);
    const commission = subscriptionRevenue * dist.commissionPct / 100;
    res.json({ distributorName: dist.name, commissionPct: dist.commissionPct, subscriptionRevenue, commission, owners: owners.map((o) => ({ name: o.businessName, plan: o.planId?.name, price: o.planId?.price, commission: (o.planId?.price || 0) * dist.commissionPct / 100 })) });
});
// GET /api/dist/analytics
router.get('/analytics', async (req, res) => {
    const owners = await Owner_1.Owner.find({ distributorId: req.user.entityId }).select('_id');
    const ownerIds = owners.map(o => o._id);
    const rsts = await Restaurant_1.Restaurant.find({ ownerId: { $in: ownerIds } }).select('_id');
    const rstIds = rsts.map(r => r._id);
    const revenue = await Order_1.Order.aggregate([
        { $match: { restaurantId: { $in: rstIds }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    res.json({ ownerCount: owners.length, restaurantCount: rsts.length, revenue: revenue[0]?.total || 0, orders: revenue[0]?.count || 0 });
});
exports.default = router;
