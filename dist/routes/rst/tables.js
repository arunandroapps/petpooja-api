"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Table_1 = require("../../models/Table");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const rstId = (req) => new mongoose_1.Types.ObjectId(req.user.entityId);
router.get('/', async (req, res) => {
    res.json(await Table_1.Table.find({ restaurantId: rstId(req) }).populate('currentOrderId', 'number type status').sort({ area: 1, name: 1 }));
});
router.post('/', async (req, res) => {
    const table = await Table_1.Table.create({ ...req.body, restaurantId: rstId(req) });
    res.status(201).json(table);
});
router.patch('/:id', async (req, res) => {
    const t = await Table_1.Table.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
    if (!t) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(t);
});
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const t = await Table_1.Table.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, { status }, { new: true });
    res.json(t);
});
router.delete('/:id', async (req, res) => {
    await Table_1.Table.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
    res.json({ message: 'Deleted' });
});
exports.default = router;
