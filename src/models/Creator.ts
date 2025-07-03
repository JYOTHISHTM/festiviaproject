//Creator model

import mongoose, { Document } from "mongoose";

export interface ICreatorInput {
  name?: string;
  email?: string;
  password: string;
  isVerified: boolean;
  isBlocked?: Boolean;
  wallet: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;

  refreshToken?: string;
  otp?: string
  googleId: { type: String }
}


export interface ICreator extends Document, ICreatorInput {
  createdAt: Date;
  updatedAt: Date;
}



const CreatorSchema = new mongoose.Schema<ICreator>(
  {

    name: {
      type: String,
      required: function () {
        return !this.googleId;
      }
    },
    email: {
      type: String,
      required: function () {
        return !this.googleId;
      }
    },
     wallet: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      }
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },


    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: { type: String },   
    
    

    refreshToken: { type: String },
    otp: { type: String },
    googleId: { type: String }

  },
  { timestamps: true }
);

export default mongoose.model<ICreator>("Creator", CreatorSchema);
