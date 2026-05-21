"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("./logger"));
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petpooja_platform';
    try {
        await mongoose_1.default.connect(uri);
        logger_1.default.info(`MongoDB connected: ${mongoose_1.default.connection.host}`);
    }
    catch (err) {
        logger_1.default.error('MongoDB connection failed', err);
        process.exit(1);
    }
    mongoose_1.default.connection.on('disconnected', () => logger_1.default.warn('MongoDB disconnected'));
};
exports.connectDB = connectDB;
