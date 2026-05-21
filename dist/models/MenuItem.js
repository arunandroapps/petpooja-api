"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItem = void 0;
const mongoose_1 = require("mongoose");
const MenuItemSchema = new mongoose_1.Schema({
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 5, min: 0, max: 100 },
    veg: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    image: String,
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
exports.MenuItem = (0, mongoose_1.model)('MenuItem', MenuItemSchema);
