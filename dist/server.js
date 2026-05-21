"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("./config/db");
const logger_1 = __importDefault(require("./config/logger"));
const app_1 = __importDefault(require("./app"));
const PORT = parseInt(process.env.PORT || '4001');
const start = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(PORT, '0.0.0.0', () => {
        logger_1.default.info(`🚀 Pet Pooja API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
};
process.on('unhandledRejection', (err) => { logger_1.default.error('Unhandled rejection', err); process.exit(1); });
process.on('uncaughtException', (err) => { logger_1.default.error('Uncaught exception', err); process.exit(1); });
start();
