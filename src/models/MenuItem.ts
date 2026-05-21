import { Schema, model, Document, Types } from 'mongoose';

export interface IMenuItem extends Document {
  restaurantId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  tax: number;
  veg: boolean;
  available: boolean;
  image?: string;
  sortOrder: number;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    price: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 5, min: 0, max: 100 },
    veg: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    image: String,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const MenuItem = model<IMenuItem>('MenuItem', MenuItemSchema);
