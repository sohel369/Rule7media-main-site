import mongoose from "mongoose";

const budgetRequestSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true, match: /^[a-zA-Z0-9]+$/ },
    fullWrap: { type: Number, required: true },
    oneSide: { type: Number, required: true },
    bothSides: { type: Number, required: true },
    rearDoors: { type: Number, required: true },
    anonymousRequestId: {
    type: String,
    required: true,
    unique: true, 
  },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fleetAuctionId: { type: mongoose.Schema.Types.ObjectId, ref: "FleetOwner", required: true },
    fleetOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:{ type: String, 
      enum: ['review_pending', 'approved', 'rejected', 'info_requested', ],
      default: 'review_pending'
    },
    query: { type: String, default: "" },
 isAdminApproved: { type: Boolean, default: false },
    adminProcessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminProcessedAt: { type: Date }
  },
  { timestamps: true }
);

const FleetBudget = mongoose.model("FleetBudget", budgetRequestSchema);
export default FleetBudget;
