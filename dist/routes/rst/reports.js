"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = require("../../models/Order");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const rstId = (req) => new mongoose_1.Types.ObjectId(req.user.entityId);
// GET /api/rst/reports/summary?days=7
router.get('/summary', async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const [overall, daily, byType, byPayment, topItems] = await Promise.all([
        Order_1.Order.aggregate([
            { $match: { restaurantId: rstId(req), status: 'completed', createdAt: { $gte: since } } },
            { $group: { _id: null, revenue: { $sum: '$total' }, tax: { $sum: '$taxAmount' }, orders: { $sum: 1 } } },
        ]),
        Order_1.Order.aggregate([
            { $match: { restaurantId: rstId(req), status: 'completed', createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Order_1.Order.aggregate([
            { $match: { restaurantId: rstId(req), status: 'completed', createdAt: { $gte: since } } },
            { $group: { _id: '$type', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ]),
        Order_1.Order.aggregate([
            { $match: { restaurantId: rstId(req), status: 'completed', createdAt: { $gte: since } } },
            { $group: { _id: '$payment', revenue: { $sum: '$total' } } },
        ]),
        Order_1.Order.aggregate([
            { $match: { restaurantId: rstId(req), status: 'completed', createdAt: { $gte: since } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.menuItemId', name: { $first: '$items.name' }, qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
        ]),
    ]);
    const { revenue = 0, tax = 0, orders = 0 } = overall[0] || {};
    res.json({ revenue, tax, orders, aov: orders ? revenue / orders : 0, daily, byType, byPayment, topItems });
});
// GET /api/rst/reports/today
router.get('/today', async (req, res) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const stats = await Order_1.Order.aggregate([
        { $match: { restaurantId: rstId(req), status: 'completed', createdAt: { $gte: start } } },
        { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ]);
    res.json(stats[0] || { revenue: 0, orders: 0 });
});
exports.default = router;
