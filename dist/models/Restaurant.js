"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Restaurant = void 0;
const mongoose_1 = require("mongoose");
const RestaurantSchema = new mongoose_1.Schema({
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Owner', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'Casual Dining' },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    gstin: String,
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    settings: {
        currency: { type: String, default: '₹' },
        taxLabel: { type: String, default: 'GST' },
        defaultTax: { type: Number, default: 5 },
        serviceCharge: { type: Number, default: 0 },
        loyaltyPercent: { type: Number, default: 2 },
        invoicePrefix: { type: String, default: 'INV' },
        footerNote: { type: String, default: 'Thank you for dining with us!' },
        printerWidth: { type: Number, default: 80 },
    },
}, { timestamps: true });
exports.Restaurant = (0, mongoose_1.model)('Restaurant', RestaurantSchema);
