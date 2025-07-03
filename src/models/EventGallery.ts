import mongoose, { Schema, Document } from "mongoose";

export interface EventGallery extends Document {
  eventName: string;
  date: string;
  eventType: string;
  category: "Public" | "Private";
  subCategory?: "Reserved" | "General";
  totalTicketsSold?: number;
  totalRevenue?: number;
  mainImage: string;
  additionalImages: string[];
}


const EventGallerySchema: Schema = new Schema({
  eventName: { type: String, required: true },
  date: { type: String, required: true },
  eventType: { type: String, required: true },
  category: { type: String, enum: ["Public", "Private"], required: true },
  subCategory: { type: String, enum: ["Reserved", "General"], required: false },
  totalTicketsSold: { type: Number, required: false },
  totalRevenue: { type: Number, required: false },
  mainImage: { type: String, required: true },
  additionalImages: [{ type: String }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "Creator", required: true },

});

const EventGalleryModel = mongoose.model<EventGallery>("EventGallery", EventGallerySchema);
export default EventGalleryModel;
