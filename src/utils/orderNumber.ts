import { Order } from '../models/Order';
import { Types } from 'mongoose';

export const nextOrderNumber = async (restaurantId: Types.ObjectId): Promise<number> => {
  const last = await Order.findOne({ restaurantId }).sort({ number: -1 }).select('number');
  return (last?.number || 1000) + 1;
};
