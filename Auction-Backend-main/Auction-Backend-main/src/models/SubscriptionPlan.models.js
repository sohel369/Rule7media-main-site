// models/CustomPlan.models.js
import mongoose from "mongoose";

const CustomPlanSchema = new mongoose.Schema({
  planCode: { 
    type: String, 
    required: true, 
    uppercase: true,
    trim: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  userType: {
    type: String,
     enum: ["fleetowner", "seller", "advertiser", "buyer", "wrapper"],
    required: true,
  },
  durationMonths: { 
    type: Number, 
    enum: [3, 6, 12], 
    required: true 
  },
  discountLabel: { type: String, default: "" }, // "Save 40%", "Best Value"
  marketingFeatures: [{ type: String }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("CustomPlan", CustomPlanSchema);