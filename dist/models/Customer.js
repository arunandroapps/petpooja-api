"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const mongoose_1 = require("mongoose");
const CustomerSchema = new mongoose_1.Schema({
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    visits: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastVisit: Date,
}, { timestamps: true });
CustomerSchema.index({ restaurantId: 1, phone: 1 }, { unique: true });
exports.Customer = (0, mongoose_1.model)('Customer', CustomerSchema);
