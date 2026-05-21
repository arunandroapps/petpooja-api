import { Schema, model, Document, Types } from 'mongoose';

export interface IRestaurant extends Document {
  ownerId: Types.ObjectId;
  name: string;
  type: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  gstin?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  settings: {
    currency: string;
    taxLabel: string;
    defaultTax: number;
    serviceCharge: number;
    loyaltyPercent: number;
    invoicePrefix: string;
    footerNote: string;
    printerWidth: number;
  };
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'Casual Dining' },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    city: { type: String, required: true },
    gstin: String,
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    settings: {
      currency: { type: String, default: '₹' },
      taxLabel: { type: String, default: 'GST' },
      defaultTax: { type: Number, default: 5 },
      serviceCharge: { type: Number, default: 0 },
      loyaltyPercent: { type: Number, default: 2 },
      invoicePrefix: { type: String, default: 'INV' },
      footerNote: { type: String, default: 'Thank you for dining with us!' },
      printerWidth: { type: Number, default: 80 },
    },
  },
  { timestamps: true }
);

export const Restaurant = model<IRestaurant>('Restaurant', RestaurantSchema);
