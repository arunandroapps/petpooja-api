"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Owner_1 = require("../../models/Owner");
const User_1 = require("../../models/User");
const Plan_1 = require("../../models/Plan");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const owners = await Owner_1.Owner.find().populate('distributorId', 'name region').populate('planId', 'name price color tier').sort({ createdAt: -1 });
    res.json(owners);
});
router.get('/:id', async (req, res) => {
    const o = await Owner_1.Owner.findById(req.params.id).populate('distributorId planId');
    if (!o) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(o);
});
router.post('/', async (req, res) => {
    const { name, email, phone, businessName, gst, city, state, distributorId, planId } = req.body;
    if (!name || !email || !phone || !businessName || !distributorId || !planId) {
        res.status(400).json({ error: 'Missing required fields' });
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
    const owner = await Owner_1.Owner.create({ name, email, phone, businessName, gst, city, state, distributorId, planId, userId: 'pending', status: 'pending', subscriptionEnd });
    const user = await User_1.User.create({ name, email, password: 'owner123', role: 'owner', entityId: owner._id.toString() });
    owner.userId = user._id.toString();
    await owner.save();
    res.status(201).json({ owner, credentials: { email, password: 'owner123' } });
});
router.patch('/:id', async (req, res) => {
    const o = await Owner_1.Owner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!o) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(o);
});
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const o = await Owner_1.Owner.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!o) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    await User_1.User.updateOne({ entityId: o._id.toString(), role: 'owner' }, { active: status === 'active' });
    res.json(o);
});
router.delete('/:id', async (req, res) => {
    await Owner_1.Owner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});
exports.default = router;
