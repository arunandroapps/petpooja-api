"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_1 = require("../../models/Category");
const MenuItem_1 = require("../../models/MenuItem");
const router = (0, express_1.Router)();
const rstId = (req) => req.user.entityId;
// Categories
router.get('/categories', async (req, res) => {
    res.json(await Category_1.Category.find({ restaurantId: rstId(req) }).sort({ sortOrder: 1, createdAt: 1 }));
});
router.post('/categories', async (req, res) => {
    const cat = await Category_1.Category.create({ ...req.body, restaurantId: rstId(req) });
    res.status(201).json(cat);
});
router.patch('/categories/:id', async (req, res) => {
    const cat = await Category_1.Category.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
    if (!cat) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(cat);
});
router.delete('/categories/:id', async (req, res) => {
    await Category_1.Category.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
    await MenuItem_1.MenuItem.deleteMany({ categoryId: req.params.id, restaurantId: rstId(req) });
    res.json({ message: 'Deleted' });
});
// Items
router.get('/items', async (req, res) => {
    const items = await MenuItem_1.MenuItem.find({ restaurantId: rstId(req) }).populate('categoryId', 'name color').sort({ sortOrder: 1, name: 1 });
    res.json(items);
});
router.post('/items', async (req, res) => {
    const item = await MenuItem_1.MenuItem.create({ ...req.body, restaurantId: rstId(req) });
    res.status(201).json(item);
});
router.patch('/items/:id', async (req, res) => {
    const item = await MenuItem_1.MenuItem.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, req.body, { new: true });
    if (!item) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(item);
});
router.patch('/items/:id/toggle', async (req, res) => {
    const item = await MenuItem_1.MenuItem.findOne({ _id: req.params.id, restaurantId: rstId(req) });
    if (!item) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    item.available = !item.available;
    await item.save();
    res.json(item);
});
router.delete('/items/:id', async (req, res) => {
    await MenuItem_1.MenuItem.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
    res.json({ message: 'Deleted' });
});
exports.default = router;
