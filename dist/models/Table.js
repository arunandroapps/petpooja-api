"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const mongoose_1 = require("mongoose");
const TableSchema = new mongoose_1.Schema({
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true },
    area: { type: String, default: 'Indoor' },
    seats: { type: Number, default: 4, min: 1 },
    status: { type: String, enum: ['free', 'occupied', 'reserved', 'cleaning'], default: 'free' },
    currentOrderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });
exports.Table = (0, mongoose_1.model)('Table', TableSchema);
