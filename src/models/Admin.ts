import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId; 
  username: string;
  password: string;
  isAdmin: boolean;
  refreshToken?: string;
}

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true },
  refreshToken: { type: String },
});

export const AdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);
