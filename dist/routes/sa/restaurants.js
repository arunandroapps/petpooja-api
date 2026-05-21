"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Restaurant_1 = require("../../models/Restaurant");
const User_1 = require("../../models/User");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const rsts = await Restaurant_1.Restaurant.find().populate('ownerId', 'name businessName city').sort({ createdAt: -1 });
    res.json(rsts);
});
router.get('/:id', async (req, res) => {
    const r = await Restaurant_1.Restaurant.findById(req.params.id).populate('ownerId');
    if (!r) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(r);
});
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const r = await Restaurant_1.Restaurant.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!r) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    await User_1.User.updateOne({ entityId: r._id.toString(), role: 'restaurant' }, { active: status === 'active' });
    res.json(r);
});
router.patch('/:id', async (req, res) => {
    const r = await Restaurant_1.Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(r);
});
exports.default = router;
