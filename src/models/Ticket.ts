

import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Types.ObjectId, ref: 'Event', required: true },
  price: { type: Number, required: true },
  seats: [{ type: Number, required: true }], 
  paymentStatus: {
    type: String,
    enum: ['success', 'pending', 'cancelled'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

export const Ticket = mongoose.model('Ticket', ticketSchema);
