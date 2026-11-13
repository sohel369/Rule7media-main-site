import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",       // Links to User model
    required: true,
  },
  planId: {
    type: String,      // Store Stripe Product ID or custom plan identifier
    required: true,
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",  // Optional: If tied to a campaign
  },
  sessionId: {
    type: String,      // Stripe session ID (for verification)
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "cancelled", "expired"],
    default: "inactive",
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  expiresAt: {
    type: Date,    // Expiration date of subscription
    required: true,
  },
  currentPeriodEnd: { type: Number },
  durationMonths: { type: String },
  price: {
    type: Number,  // Plan price in smallest currency unit (e.g., cents)
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
});

export default mongoose.model("Subscription", subscriptionSchema);
