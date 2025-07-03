import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  name: string;
  price: number;
  days: number;
  stripePriceId?: string;
}

const SubscriptionSchema = new Schema<ISubscription>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  days: { type: Number, required: true },
  stripePriceId: { type: String, required: false },
});

export default mongoose.model<ISubscription>('subscriptions', SubscriptionSchema);
