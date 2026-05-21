import { Schema, model, Document, Types } from 'mongoose';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'online';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'unpaid';

export interface IOrderItem {
  _id?: Types.ObjectId;
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  status: 'new' | 'preparing' | 'ready' | 'served';
}

export interface IOrder extends Document {
  restaurantId: Types.ObjectId;
  number: number;
  type: OrderType;
  tableId?: Types.ObjectId;
  customerId?: Types.ObjectId;
  servedBy?: Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  payment: PaymentMethod;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    notes: String,
    status: { type: String, enum: ['new', 'preparing', 'ready', 'served'], default: 'new' },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['dine-in', 'takeaway', 'delivery', 'online'], default: 'dine-in' },
    tableId: { type: Schema.Types.ObjectId, ref: 'Table' },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    servedBy: { type: Schema.Types.ObjectId, ref: 'Staff' },
    items: [OrderItemSchema],
    status: { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'], default: 'pending' },
    payment: { type: String, enum: ['cash', 'card', 'upi', 'wallet', 'unpaid'], default: 'unpaid' },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: String,
  },
  { timestamps: true }
);

OrderSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });

export const Order = model<IOrder>('Order', OrderSchema);
