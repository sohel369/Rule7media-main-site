import mongoose from "mongoose";

const CpmComparisonSchema = new mongoose.Schema({
  Industry: { type: String, required: true },
  GoogleAdvertisingCPMRange: { type: String, required: true },
  VehicleWrapCPMCost: { type: Number, required: true },
  MeasurableSaving: { type: Number, required: true },
  pageType: {
    type: String,
    enum: ["traditional", "google", "auction",],
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("CpmComparison", CpmComparisonSchema);
