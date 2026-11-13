import mongoose from "mongoose";

const franchiseSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String },
    state: { type: String },         
    territories: { type: String },
    territory: { type: String },
    background: { type: String },
    region: { type: String },         
    timeline: { type: String },  
    formType: {
      type: String,
      enum: ["enquiry", "franchise_kit", "franchisefaq","risk_mitigation_inquiry"],
      required: true,
    },
    status: {
  type: String,
  enum: ["new", "contacted", "qualified", "closed"],
  default: "new",
},
notes:  { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Franchise", franchiseSchema);