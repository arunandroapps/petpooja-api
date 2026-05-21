import { Schema, model, Document, Types } from 'mongoose';

export interface ITable extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  area: string;
  seats: number;
  status: 'free' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: Types.ObjectId;
}

const TableSchema = new Schema<ITable>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true },
    area: { type: String, default: 'Indoor' },
    seats: { type: Number, default: 4, min: 1 },
    status: { type: String, enum: ['free', 'occupied', 'reserved', 'cleaning'], default: 'free' },
    currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

export const Table = model<ITable>('Table', TableSchema);
