
import mongoose from "mongoose";

const EventProfileSchema = new mongoose.Schema({
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

export default mongoose.model("EventProfile", EventProfileSchema);






