"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextOrderNumber = void 0;
const Order_1 = require("../models/Order");
const nextOrderNumber = async (restaurantId) => {
    const last = await Order_1.Order.findOne({ restaurantId }).sort({ number: -1 }).select('number');
    return (last?.number || 1000) + 1;
};
exports.nextOrderNumber = nextOrderNumber;
