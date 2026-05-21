import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStaff extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  role: 'manager' | 'cashier' | 'waiter' | 'chef' | 'delivery';
  phone: string;
  email?: string;
  pin: string;
  active: boolean;
  comparePin(candidate: string): Promise<boolean>;
}

const StaffSchema = new Schema<IStaff>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['manager', 'cashier', 'waiter', 'chef', 'delivery'], required: true },
    phone: { type: String, required: true },
    email: String,
    pin: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StaffSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  this.pin = await bcrypt.hash(this.pin, 10);
  next();
});

StaffSchema.methods.comparePin = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.pin);
};

StaffSchema.set('toJSON', { transform: (_doc, ret) => { delete (ret as any).pin; return ret; } });

export const Staff = model<IStaff>('Staff', StaffSchema);
