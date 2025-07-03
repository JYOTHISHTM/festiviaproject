import mongoose from 'mongoose';
const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true 
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    unique: true,
    sparse: true
  },
  balance: {
    type: Number,
    default: 0  
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['add', 'refund','deduct']
      },
      amount: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});


export const Wallet = mongoose.model('Wallet', walletSchema);
