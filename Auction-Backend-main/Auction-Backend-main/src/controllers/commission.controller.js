import Commission from "../models/commission.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllCommissions = asyncHandler(async (req, res) => {
  const commissions = await Commission.find();
  res.status(200).json({ success: true, commissions });
});

// Update commission rate for a specific plan duration
export const updatesubscritpionCommission = asyncHandler(async (req, res) => {
  const { planDuration } = req.params;
  const { commissionRate } = req.body;
  if (commissionRate === undefined) {
    return res.status(400).json({ success: false, message: "commissionRate is required" });
  }

  const commission = await Commission.findOneAndUpdate(
    { planDuration },
    { commissionRate },
    { new: true, upsert: true }
  );

  res.status(200).json({ success: true, commission });
});