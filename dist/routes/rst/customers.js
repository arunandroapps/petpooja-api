"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Customer_1 = require("../../models/Customer");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const rstId = (req) => new mongoose_1.Types.ObjectId(req.user.entityId);
router.get('/', async (req, res) => {
    const q = req.query.q;
    const filter = { restaurantId: rstId(req) };
    if (q)
        filter.$or = [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const [customers, total] = await Promise.all([
        Customer_1.Customer.find(filter).sort({ totalSpent: -1 }).skip((page - 1) * limit).limit(limit),
        Customer_1.Customer.countDocuments(filter),
    ]);
    res.json({ customers, total });
});
router.get('/search', async (req, res) => {
    const { phone } = req.query;
    if (!phone) {
        res.json([]);
        return;
    }
    const customers = await Customer_1.Customer.find({ restaurantId: rstId(req), phone: new RegExp(phone, 'i') }).limit(5);
    res.json(customers);
});
router.post('/', async (req, res) => {
    const c = await Customer_1.Customer.create({ ...req.body, restaurantId: rstId(req) });
    res.status(201).json(c);
});
router.patch('/:id', async (req, res) => {
    const c = await Customer_1.Customer.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
    if (!c) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(c);
});
router.delete('/:id', async (req, res) => {
    await Customer_1.Customer.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
    res.json({ message: 'Deleted' });
});
exports.default = router;
