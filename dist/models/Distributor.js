"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Distributor = void 0;
const mongoose_1 = require("mongoose");
const DistributorSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    region: { type: String, required: true },
    state: { type: String, required: true },
    commissionPct: { type: Number, default: 10, min: 0, max: 100 },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    totalRevenue: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } });
exports.Distributor = (0, mongoose_1.model)('Distributor', DistributorSchema);
