import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'distributor' | 'owner' | 'restaurant';
  entityId: string;
  active: boolean;
  refreshTokens: string[];
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['superadmin', 'distributor', 'owner', 'restaurant'], required: true },
    entityId: { type: String, required: true },
    active: { type: Boolean, default: true },
    refreshTokens: [String],
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.set('toJSON', { transform: (_doc, ret) => { delete (ret as any).password; delete (ret as any).refreshTokens; return ret; } });

export const User = model<IUser>('User', UserSchema);
