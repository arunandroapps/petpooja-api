"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = require("mongoose");
const TicketSchema = new mongoose_1.Schema({
    from: { type: String, enum: ['superadmin', 'distributor', 'owner', 'restaurant'], required: true },
    fromName: { type: String, required: true },
    fromId: String,
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    reply: String,
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
}, { timestamps: true });
exports.Ticket = (0, mongoose_1.model)('Ticket', TicketSchema);
