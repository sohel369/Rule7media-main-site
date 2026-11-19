import mongoose from "mongoose";

const secureSpotSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      default: "Unknown",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SecureSpot", secureSpotSchema);