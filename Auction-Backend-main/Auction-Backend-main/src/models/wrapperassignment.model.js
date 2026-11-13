import mongoose from "mongoose";

const wrapperAssignmentSchema = new mongoose.Schema({
order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  wrapper: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicleDetails: { type: Object,}, 
    status: {
    type: String,
    enum: ["PENDING", "PREPARE_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    default: "PENDING",
  },
  acceptStatus: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING",
  },
  assignedAt: { type: Date, default: Date.now },
});

export default mongoose.model("WrapperAssignment", wrapperAssignmentSchema);
