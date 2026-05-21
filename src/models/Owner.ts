import { Schema, model, Document, Types } from 'mongoose';

export interface IOwner extends Document {
  userId: string;
  distributorId: Types.ObjectId;
  planId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gst?: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  subscriptionStart: Date;
  subscriptionEnd: Date;
}

const OwnerSchema = new Schema<IOwner>(
  {
    userId: { type: String, required: true },
    distributorId: { type: Schema.Types.ObjectId, ref: 'Distributor', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true },
    gst: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'pending', 'suspended'], default: 'pending' },
    subscriptionStart: { type: Date, default: Date.now },
    subscriptionEnd: { type: Date, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

export const Owner = model<IOwner>('Owner', OwnerSchema);
