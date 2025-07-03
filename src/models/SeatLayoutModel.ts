

import mongoose, { Document, Schema } from 'mongoose';

export interface ISeatLayout {
  layoutType: 'normal' | 'withbalcony' | 'reclanar' | 'centeredscreen';
  totalSeats: number;
  createdAt: Date;
  creatorId: string;
  isUsed: boolean;
  normalPrice?: number; 
  balconyPrices?: {
    normal: number;
    premium: number;
  };
  reclanarPrices?: {
    reclanar: number;
    reclanarPlus: number;
  };
  seats: Array<{
    seatNumber: string;
    type: 'normal' | 'premium' | 'reclanar' | 'reclanarPlus';
    isBooked: boolean;
  }>;
}

export interface SeatLayoutDocument extends ISeatLayout, Document {}

const SeatLayoutSchema = new Schema<SeatLayoutDocument>({
  layoutType: { type: String, enum: ['normal', 'withbalcony', 'reclanar', 'centeredscreen'], required: true },
  totalSeats: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  creatorId: { type: String, required: true },
  isUsed: { type: Boolean, default: false, required: true },

  normalPrice: { type: Number, required: function () {
    return this.layoutType === 'normal' || this.layoutType === 'centeredscreen';
  }},

  balconyPrices: {
    normal: { type: Number, required: function () { return this.layoutType === 'withbalcony'; }},
    premium: { type: Number, required: function () { return this.layoutType === 'withbalcony'; }},
  },

  reclanarPrices: {
    reclanar: { type: Number, required: function () { return this.layoutType === 'reclanar'; }},
    reclanarPlus: { type: Number, required: function () { return this.layoutType === 'reclanar'; }},
  },

  seats: [
    {
      seatNumber: { type: String, required: true },
      type: {
        type: String,
        enum: ['normal', 'premium', 'reclanar', 'reclanarPlus'],
        required: true,
      },
      isBooked: { type: Boolean, default: false }  
    }
  ]
});

SeatLayoutSchema.pre('save', function(next) {
  if (this.seats.length === 0 && this.totalSeats > 0) {
    for (let i = 1; i <= this.totalSeats; i++) {
      let seatType: 'normal' | 'premium' | 'reclanar' | 'reclanarPlus' = 'normal';
      
      if (this.layoutType === 'withbalcony') {
        seatType = i <= Math.floor(this.totalSeats / 2) ? 'normal' : 'premium';
      } else if (this.layoutType === 'reclanar') {
        seatType = i <= Math.floor(this.totalSeats / 2) ? 'reclanar' : 'reclanarPlus';
      }
      
     this.seats.push({
        seatNumber: i.toString(),
        type: seatType,
        isBooked: false
      });
    }
  }
  next();
});

const SeatLayoutModel = mongoose.model<SeatLayoutDocument>('SeatLayout', SeatLayoutSchema);

export default SeatLayoutModel;