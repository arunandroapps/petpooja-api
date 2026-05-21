import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  color: string;
  sortOrder: number;
  active: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#f97316' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', CategorySchema);
