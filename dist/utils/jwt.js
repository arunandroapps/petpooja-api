"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = () => process.env.JWT_SECRET || 'dev_secret_change_this';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const EXPIRES = () => process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = () => process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const signAccessToken = (user) => jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, entityId: user.entityId }, SECRET(), { expiresIn: EXPIRES() });
exports.signAccessToken = signAccessToken;
const signRefreshToken = (user) => jsonwebtoken_1.default.sign({ userId: user._id }, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES() });
exports.signRefreshToken = signRefreshToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, REFRESH_SECRET());
exports.verifyRefreshToken = verifyRefreshToken;
