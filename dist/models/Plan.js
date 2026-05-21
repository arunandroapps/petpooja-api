"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const mongoose_1 = require("mongoose");
const PlanSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    tier: { type: String, enum: ['basic', 'pro', 'enterprise'], required: true },
    price: { type: Number, required: true, min: 0 },
    yearlyPrice: { type: Number, required: true, min: 0 },
    maxRestaurants: { type: Number, default: 1 },
    maxStaff: { type: Number, default: 5 },
    features: [String],
    color: { type: String, default: '#6b7280' },
    active: { type: Boolean, default: true },
}, { timestamps: true });
exports.Plan = (0, mongoose_1.model)('Plan', PlanSchema);
