import { Schema, model, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  tier: 'basic' | 'pro' | 'enterprise';
  price: number;
  yearlyPrice: number;
  maxRestaurants: number;
  maxStaff: number;
  features: string[];
  color: string;
  active: boolean;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: ['basic', 'pro', 'enterprise'], required: true },
    price: { type: Number, required: true, min: 0 },
    yearlyPrice: { type: Number, required: true, min: 0 },
    maxRestaurants: { type: Number, default: 1 },
    maxStaff: { type: Number, default: 5 },
    features: [String],
    color: { type: String, default: '#6b7280' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Plan = model<IPlan>('Plan', PlanSchema);
