import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  visits: number;
  totalSpent: number;
  lastVisit?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: String,
    address: String,
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    visits: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    lastVisit: Date,
  },
  { timestamps: true }
);

CustomerSchema.index({ restaurantId: 1, phone: 1 }, { unique: true });

export const Customer = model<ICustomer>('Customer', CustomerSchema);
