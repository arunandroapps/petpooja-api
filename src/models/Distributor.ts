import { Schema, model, Document } from 'mongoose';

export interface IDistributor extends Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  state: string;
  commissionPct: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  totalRevenue: number;
  commissionEarned: number;
}

const DistributorSchema = new Schema<IDistributor>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    region: { type: String, required: true },
    state: { type: String, required: true },
    commissionPct: { type: Number, default: 10, min: 0, max: 100 },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    totalRevenue: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const Distributor = model<IDistributor>('Distributor', DistributorSchema);
