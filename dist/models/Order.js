"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const OrderItemSchema = new mongoose_1.Schema({
    menuItemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    notes: String,
    status: { type: String, enum: ['new', 'preparing', 'ready', 'served'], default: 'new' },
}, { _id: true });
const OrderSchema = new mongoose_1.Schema({
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['dine-in', 'takeaway', 'delivery', 'online'], default: 'dine-in' },
    tableId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Table' },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer' },
    servedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Staff' },
    items: [OrderItemSchema],
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'], default: 'pending' },
    payment: { type: String, enum: ['cash', 'card', 'upi', 'wallet', 'unpaid'], default: 'unpaid' },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: String,
}, { timestamps: true });
OrderSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });
exports.Order = (0, mongoose_1.model)('Order', OrderSchema);
