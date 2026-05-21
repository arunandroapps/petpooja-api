"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Distributor_1 = require("../../models/Distributor");
const User_1 = require("../../models/User");
const router = (0, express_1.Router)();
// GET /api/sa/distributors
router.get('/', async (_req, res) => {
    const distributors = await Distributor_1.Distributor.find().sort({ createdAt: -1 });
    res.json(distributors);
});
// GET /api/sa/distributors/:id
router.get('/:id', async (req, res) => {
    const d = await Distributor_1.Distributor.findById(req.params.id);
    if (!d) {
        res.status(404).json({ error: 'Distributor not found' });
        return;
    }
    res.json(d);
});
// POST /api/sa/distributors
router.post('/', async (req, res) => {
    const { name, email, phone, region, state, commissionPct } = req.body;
    if (!name || !email || !phone || !region || !state) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
    }
    const distributor = await Distributor_1.Distributor.create({ name, email, phone, region, state, commissionPct: commissionPct || 10, userId: 'pending', status: 'pending' });
    const user = await User_1.User.create({ name, email, password: 'dist123', role: 'distributor', entityId: distributor._id.toString() });
    distributor.userId = user._id.toString();
    await distributor.save();
    res.status(201).json({ distributor, credentials: { email, password: 'dist123' } });
});
// PATCH /api/sa/distributors/:id
router.patch('/:id', async (req, res) => {
    const d = await Distributor_1.Distributor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!d) {
        res.status(404).json({ error: 'Distributor not found' });
        return;
    }
    res.json(d);
});
// PATCH /api/sa/distributors/:id/status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const d = await Distributor_1.Distributor.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!d) {
        res.status(404).json({ error: 'Distributor not found' });
        return;
    }
    await User_1.User.updateOne({ entityId: d._id.toString(), role: 'distributor' }, { active: status === 'active' });
    res.json(d);
});
// DELETE /api/sa/distributors/:id
router.delete('/:id', async (req, res) => {
    await Distributor_1.Distributor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});
exports.default = router;
