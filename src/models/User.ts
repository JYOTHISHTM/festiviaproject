import mongoose, { Document } from "mongoose";

export interface IUserInput {
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  occupation?: string;
  phoneNumber?: number;
  password?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  refreshToken?: string;
  otp?: string;
  googleId: string;
  wallet: number;
  location?: string;

  
geoLocation?: {
  type: 'Point';
  coordinates: [number, number]
};

}

export interface IUser extends Document, IUserInput {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    email: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    occupation: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    location: { type: String, default: null },
geoLocation: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], 
    default: [0, 0],
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
      },
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
    otp: { type: String },
    googleId: { type: String },
  },
  { timestamps: true }
);
userSchema.index({ geoLocation: '2dsphere' });

export default mongoose.model<IUser>("User", userSchema);
