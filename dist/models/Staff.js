"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Staff = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const StaffSchema = new mongoose_1.Schema({
    restaurantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['manager', 'cashier', 'waiter', 'chef', 'delivery'], required: true },
    phone: { type: String, required: true },
    email: String,
    pin: { type: String, required: true },
    active: { type: Boolean, default: true },
}, { timestamps: true });
StaffSchema.pre('save', async function (next) {
    if (!this.isModified('pin'))
        return next();
    this.pin = await bcryptjs_1.default.hash(this.pin, 10);
    next();
});
StaffSchema.methods.comparePin = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.pin);
};
StaffSchema.set('toJSON', { transform: (_doc, ret) => { delete ret.pin; return ret; } });
exports.Staff = (0, mongoose_1.model)('Staff', StaffSchema);
