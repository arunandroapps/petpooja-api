"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Plan_1 = require("../../models/Plan");
const Owner_1 = require("../../models/Owner");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const plans = await Plan_1.Plan.find().sort({ price: 1 });
    const owners = await Owner_1.Owner.find({ status: 'active' }).select('planId');
    const withCounts = plans.map(p => ({
        ...p.toJSON(),
        subscriberCount: owners.filter(o => o.planId.toString() === p._id.toString()).length,
    }));
    res.json(withCounts);
});
router.post('/', async (req, res) => {
    const plan = await Plan_1.Plan.create(req.body);
    res.status(201).json(plan);
});
router.patch('/:id', async (req, res) => {
    const plan = await Plan_1.Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(plan);
});
router.delete('/:id', async (req, res) => {
    const inUse = await Owner_1.Owner.countDocuments({ planId: req.params.id });
    if (inUse > 0) {
        res.status(400).json({ error: `Plan in use by ${inUse} owner(s)` });
        return;
    }
    await Plan_1.Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});
exports.default = router;
