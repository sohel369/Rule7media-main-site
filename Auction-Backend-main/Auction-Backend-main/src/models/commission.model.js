
import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    planDuration: {
      type: String, 
      required: true,
      unique: true,
    },
    commissionRate: {
      type: Number, 
      required: true,
    },
  },
  { timestamps: true }
);

const Commission = mongoose.model("Commission", commissionSchema);

export default Commission;

