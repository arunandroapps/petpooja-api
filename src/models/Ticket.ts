import { Schema, model, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  from: 'superadmin' | 'distributor' | 'owner' | 'restaurant';
  fromName: string;
  fromId?: string;
  restaurantId?: Types.ObjectId;
  subject: string;
  message: string;
  reply?: string;
  status: 'open' | 'in-progress' | 'resolved';
}

const TicketSchema = new Schema<ITicket>(
  {
    from: { type: String, enum: ['superadmin', 'distributor', 'owner', 'restaurant'], required: true },
    fromName: { type: String, required: true },
    fromId: String,
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    reply: String,
    status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

export const Ticket = model<ITicket>('Ticket', TicketSchema);
