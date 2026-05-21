"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['superadmin', 'distributor', 'owner', 'restaurant'], required: true },
    entityId: { type: String, required: true },
    active: { type: Boolean, default: true },
    refreshTokens: [String],
}, { timestamps: true });
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    this.password = await bcryptjs_1.default.hash(this.password, 12);
    next();
});
UserSchema.methods.comparePassword = async function (candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
UserSchema.set('toJSON', { transform: (_doc, ret) => { delete ret.password; delete ret.refreshTokens; return ret; } });
exports.User = (0, mongoose_1.model)('User', UserSchema);
