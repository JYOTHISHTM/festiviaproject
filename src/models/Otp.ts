// BACKEND>src>model>Otp.ts

import mongoose, { Document } from "mongoose";

interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date; 
}

const otpSchema = new mongoose.Schema<IOTP>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }, 
});

export default mongoose.model<IOTP>("OTP", otpSchema);
