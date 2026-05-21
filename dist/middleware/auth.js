"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticate = async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        _res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = header.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User_1.User.findById(payload.userId).select('+refreshTokens');
        if (!user || !user.active) {
            _res.status(401).json({ error: 'User not found or inactive' });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        _res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        return;
    }
    next();
};
exports.authorize = authorize;
