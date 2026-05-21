"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Staff_1 = require("../../models/Staff");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const rstId = (req) => new mongoose_1.Types.ObjectId(req.user.entityId);
router.get('/', async (req, res) => {
    res.json(await Staff_1.Staff.find({ restaurantId: rstId(req) }).sort({ name: 1 }));
});
router.post('/', async (req, res) => {
    const staff = await Staff_1.Staff.create({ ...req.body, restaurantId: rstId(req) });
    res.status(201).json(staff);
});
router.patch('/:id', async (req, res) => {
    const s = await Staff_1.Staff.findOne({ _id: req.params.id, restaurantId: rstId(req) });
    if (!s) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    Object.assign(s, req.body);
    await s.save(); // triggers pin hashing if pin changed
    res.json(s);
});
router.delete('/:id', async (req, res) => {
    await Staff_1.Staff.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
    res.json({ message: 'Deleted' });
});
// POST /api/rst/staff/verify-pin — for POS staff auth
router.post('/verify-pin', async (req, res) => {
    const { staffId, pin } = req.body;
    const staff = await Staff_1.Staff.findOne({ _id: staffId, restaurantId: rstId(req), active: true });
    if (!staff) {
        res.status(404).json({ error: 'Staff not found' });
        return;
    }
    const valid = await staff.comparePin(pin);
    res.json({ valid, staff: valid ? staff : null });
});
exports.default = router;
