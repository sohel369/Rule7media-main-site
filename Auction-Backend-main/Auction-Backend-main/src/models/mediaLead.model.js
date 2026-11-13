import mongoose from "mongoose";

// Model for storing media kits (Country + Language)
const mediaKitSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      default: "Global",
      index: true,
    },
    language: {
      type: String,
      required: true,
      default: "en",
      index: true,
    },
    languageName: {
      type: String,
      default: "English",
    },
    pdfPath: {
      type: String,
      required: true,
    },
    pdfFilename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Model for storing download requests (user leads)
const downloadRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
      index: true,
    },
    language: {
      type: String,
      default: "en",
      index: true,
    },
    languageName: {
      type: String,
      default: "English",
    },
    mediaKitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaKit",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "pending", "failed"],
      default: "sent",
    },
    notes: {
      type: String,
      default: "",
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const MediaKit = mongoose.model("MediaKit", mediaKitSchema);
export const DownloadRequest = mongoose.model("DownloadRequest", downloadRequestSchema);