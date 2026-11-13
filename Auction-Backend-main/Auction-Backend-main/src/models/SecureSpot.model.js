import mongoose from "mongoose";

const secureSpotSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      default: "Unknown",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SecureSpot", secureSpotSchema);