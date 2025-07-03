import mongoose from "mongoose";

const replyToSchema = new mongoose.Schema({
  messageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Message", 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  sender: { 
    type: String, 
    required: true 
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "file", null], 
    default: null,
  },
  mediaName: {
    type: String, 
  },
}, { _id: false }); 

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    sender: { type: String, required: true },
    message: { 
      type: String,
      required: function(this: any) {
        
        return !this.mediaUrl;
      }
    },
    mediaType: {
      type: String,
      enum: ["image", "video", "file", null], 
      default: null,
    },
    mediaUrl: {
      type: String,
      required: function(this: any) {
        return this.mediaType !== null;
      }
    },
    mediaName: {
      type: String, 
    },
    mediaSize: {
      type: Number, 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Creator" },
    replyTo: {
      type: replyToSchema,
      default: null
    }
  },
  { timestamps: true }
);

messageSchema.pre('validate', function(this: any) {
  if (!this.message && !this.mediaUrl) {
    throw new Error('Either message text or media must be provided');
  }
});

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ 'replyTo.messageId': 1 });

export const Message = mongoose.model("Message", messageSchema);