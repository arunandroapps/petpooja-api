"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const error_1 = require("./middleware/error");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const index_1 = __importDefault(require("./routes/sa/index"));
const index_2 = __importDefault(require("./routes/dist/index"));
const index_3 = __importDefault(require("./routes/owner/index"));
const index_4 = __importDefault(require("./routes/rst/index"));
const app = (0, express_1.default)();
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (process.env.CORS_ORIGIN || '*').split(','),
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
if (process.env.NODE_ENV !== 'test')
    app.use((0, morgan_1.default)('dev'));
// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/sa', index_1.default);
app.use('/api/dist', index_2.default);
app.use('/api/owner', index_3.default);
app.use('/api/rst', index_4.default);
// Error handling
app.use(error_1.notFound);
app.use(error_1.errorHandler);
exports.default = app;
