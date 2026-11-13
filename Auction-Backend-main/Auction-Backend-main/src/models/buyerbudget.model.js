// models/BudgetRequest.js
import mongoose from "mongoose";

const BudgetRequestSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  auctionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Auction" 
  },
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  
  budgetRates: {
    fullWrap: { type: Number, default: 0 },
    oneSide: { type: Number, default: 0 },
    bothSides: { type: Number, default: 0 },
    rearDoors: { type: Number, default: 0 }
  },

  description: String,
 
  
  status: {
    type: String,
    enum: ["open", "closed", "accepted", "rejected"],
    default: "open",
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('BudgetRequest', BudgetRequestSchema);