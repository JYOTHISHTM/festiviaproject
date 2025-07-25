import mongoose, { Document } from "mongoose";

export interface IEventProfile extends Document {
  creator: mongoose.Types.ObjectId;
  profileName: string;
  profileBio: string;
  eventCount: number;
  eventTypes: string[];
  profileImage: string;
}

const EventProfileSchema = new mongoose.Schema<IEventProfile>({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Creator", 
    required: true,
    unique: true  
  },
  profileName: { type: String, default: "Profile Image" },
  profileBio: { type: String, default: "Profile Bio" },
  eventCount: { type: Number, default: 0 },
  eventTypes: { type: [String], default: [] },
  profileImage: { type: String, default: "Profile Image" }
});

export default mongoose.model<IEventProfile>("EventProfile", EventProfileSchema);



