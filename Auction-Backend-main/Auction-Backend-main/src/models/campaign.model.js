import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    image: [{ type: String }],
    budget: { type: Number, required: true, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      country: { type: String, required: true },
      state: { type: String },
      city: { type: String },
      zipCodes: [{ type: String }],
      geoLocations: [
        {
          name: String,
          zip: String,
          location: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], index: "2dsphere" },
          },
        },
      ],
    },
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date },
    targetVehicleTypes: [String],
    status: { type: String, enum: ["active", "ended"], default: "active" },

    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);
CampaignSchema.index({ status: 1, endAt: 1 });
CampaignSchema.index({ createdBy: 1, status: 1 });
export default mongoose.model("Campaign", CampaignSchema);
