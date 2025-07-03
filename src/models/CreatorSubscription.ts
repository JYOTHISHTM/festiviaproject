import mongoose, { Schema, Document } from 'mongoose';

export interface ICreatorSubscription extends Document {
  creatorId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  days: number;
  startDate: Date;
  endDate: Date;
  subscribedAt: Date;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled';
  stripeCustomerId?: string;
  transactionId?: string;
}

const CreatorSubscriptionSchema: Schema = new Schema({
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
  name: String,
  price: Number,
  days: Number,
  startDate: Date,
  endDate: Date,
  subscribedAt: { type: Date, default: Date.now },
  paymentMethod: String,
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  stripeCustomerId: String,
  transactionId: String,
});

export default mongoose.model<ICreatorSubscription>('CreatorSubscription', CreatorSubscriptionSchema);
