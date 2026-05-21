import { Schema, model, Document, Types } from 'mongoose';

export interface IIngredient extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  vendorName?: string;
  lastUpdated: Date;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: 'kg' },
    stock: { type: Number, default: 0, min: 0 },
    minStock: { type: Number, default: 0, min: 0 },
    costPerUnit: { type: Number, default: 0, min: 0 },
    vendorName: String,
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Ingredient = model<IIngredient>('Ingredient', IngredientSchema);
