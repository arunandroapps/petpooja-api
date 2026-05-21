"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ingredient = void 0;
const mongoose_1 = require("mongoose");
const IngredientSchema = new mongoose_1.Schema({
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: 'kg' },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    costPerUnit: { type: Number, default: 0, min: 0 },
    vendorName: String,
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Ingredient = (0, mongoose_1.model)('Ingredient', IngredientSchema);
