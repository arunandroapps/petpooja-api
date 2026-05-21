"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Ingredient_1 = require("../../models/Ingredient");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
const rstId = (req) => new mongoose_1.Types.ObjectId(req.user.entityId);
router.get('/', async (req, res) => {
    const ings = await Ingredient_1.Ingredient.find({ restaurantId: rstId(req) }).sort({ name: 1 });
    const lowStock = ings.filter(i => i.stock <= i.minStock);
    const totalValue = ings.reduce((a, b) => a + b.stock * b.costPerUnit, 0);
    res.json({ ingredients: ings, lowStock, totalValue });
});
router.post('/', async (req, res) => {
    const ing = await Ingredient_1.Ingredient.create({ ...req.body, restaurantId: rstId(req), lastUpdated: new Date() });
    res.status(201).json(ing);
});
router.patch('/:id', async (req, res) => {
    const ing = await Ingredient_1.Ingredient.findOneAndUpdate({ _id: req.params.id, restaurantId: rstId(req) }, { ...req.body, lastUpdated: new Date() }, { new: true });
    if (!ing) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(ing);
});
router.patch('/:id/adjust', async (req, res) => {
    const { delta } = req.body;
    const ing = await Ingredient_1.Ingredient.findOne({ _id: req.params.id, restaurantId: rstId(req) });
    if (!ing) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    ing.stock = Math.max(0, ing.stock + delta);
    ing.lastUpdated = new Date();
    await ing.save();
    res.json(ing);
});
router.delete('/:id', async (req, res) => {
    await Ingredient_1.Ingredient.findOneAndDelete({ _id: req.params.id, restaurantId: rstId(req) });
    res.json({ message: 'Deleted' });
});
exports.default = router;
