"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Owner = void 0;
const mongoose_1 = require("mongoose");
const OwnerSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    distributorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Distributor', required: true },
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Plan', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true },
    gst: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    subscriptionStart: { type: Date, default: Date.now },
    subscriptionEnd: { type: Date, required: true },
}, { timestamps: true, toJSON: { virtuals: true } });
exports.Owner = (0, mongoose_1.model)('Owner', OwnerSchema);
