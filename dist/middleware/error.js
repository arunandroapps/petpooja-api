"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler = (err, _req, res, _next) => {
    logger_1.default.error(err.message || err, err.stack);
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal server error';
    if (err.name === 'ValidationError') {
        res.status(400).json({ error: 'Validation error', details: Object.values(err.errors).map((e) => e.message) });
        return;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        res.status(409).json({ error: `Duplicate value for ${field}` });
        return;
    }
    res.status(status).json({ error: message });
};
exports.errorHandler = errorHandler;
const notFound = (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
};
exports.notFound = notFound;
