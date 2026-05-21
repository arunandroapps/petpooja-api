"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const Owner_1 = require("../../models/Owner");
const Restaurant_1 = require("../../models/Restaurant");
const User_1 = require("../../models/User");
const Plan_1 = require("../../models/Plan");
const Order_1 = require("../../models/Order");
const Staff_1 = require("../../models/Staff");
const MenuItem_1 = require("../../models/MenuItem");
const Category_1 = require("../../models/Category");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('owner'));
router.get('/me', async (req, res) => {
    const owner = await Owner_1.Owner.findById(req.user.entityId).populate('planId').populate('distributorId', 'name');
    res.json(owner);
});
router.get('/restaurants', async (req, res) => {
    const rsts = await Restaurant_1.Restaurant.find({ ownerId: req.user.entityId }).sort({ createdAt: -1 });
    res.json(rsts);
});
router.post('/restaurants', async (req, res) => {
    const owner = await Owner_1.Owner.findById(req.user.entityId).populate('planId');
    if (!owner) {
        res.status(404).json({ error: 'Owner not found' });
        return;
    }
    const plan = owner.planId;
    const existingCount = await Restaurant_1.Restaurant.countDocuments({ ownerId: owner._id });
    if (plan?.maxRestaurants !== 999 && existingCount >= plan?.maxRestaurants) {
        res.status(400).json({ error: `Plan limit reached. Upgrade to add more restaurants.` });
        return;
    }
    const { name, type, phone, email, address, city, gstin, totalTables } = req.body;
    const rst = await Restaurant_1.Restaurant.create({ ownerId: req.user.entityId, name, type, phone, email, address, city, gstin, status: 'pending' });
    const user = await User_1.User.create({ name: `${name} Manager`, email: email || `manager@${rst._id}.petpooja.local`, password: 'rest123', role: 'restaurant', entityId: rst._id.toString() });
    res.status(201).json({ restaurant: rst, credentials: { email: user.email, password: 'rest123' } });
});
router.patch('/restaurants/:id', async (req, res) => {
    const rst = await Restaurant_1.Restaurant.findOne({ _id: req.params.id, ownerId: req.user.entityId });
    if (!rst) {
        res.status(404).json({ error: 'Not found or not yours' });
        return;
    }
    Object.assign(rst, req.body);
    await rst.save();
    res.json(rst);
});
router.get('/analytics', async (req, res) => {
    const rsts = await Restaurant_1.Restaurant.find({ ownerId: req.user.entityId }).select('_id name');
    const rstIds = rsts.map(r => r._id);
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const orders = await Order_1.Order.aggregate([
        { $match: { restaurantId: { $in: rstIds }, status: 'completed', createdAt: { $gte: since } } },
        { $group: { _id: '$restaurantId', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]);
    const daily = await Order_1.Order.aggregate([
        { $match: { restaurantId: { $in: rstIds }, status: 'completed', createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
    ]);
    res.json({ restaurants: rsts, byBranch: orders, daily });
});
router.get('/staff', async (req, res) => {
    const rsts = await Restaurant_1.Restaurant.find({ ownerId: req.user.entityId }).select('_id name');
    const rstIds = rsts.map(r => r._id);
    const staff = await Staff_1.Staff.find({ restaurantId: { $in: rstIds } }).populate('restaurantId', 'name');
    res.json(staff);
});
router.get('/menu', async (req, res) => {
    const rsts = await Restaurant_1.Restaurant.find({ ownerId: req.user.entityId }).select('_id name');
    const rstIds = rsts.map(r => r._id);
    const [menu, cats] = await Promise.all([
        MenuItem_1.MenuItem.find({ restaurantId: { $in: rstIds } }).populate('restaurantId', 'name').populate('categoryId', 'name'),
        Category_1.Category.find({ restaurantId: { $in: rstIds } }),
    ]);
    res.json({ menu, categories: cats });
});
router.get('/billing', async (req, res) => {
    const owner = await Owner_1.Owner.findById(req.user.entityId).populate('planId');
    const plans = await Plan_1.Plan.find({ active: true }).sort({ price: 1 });
    res.json({ owner, plans });
});
exports.default = router;
