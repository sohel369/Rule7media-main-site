import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
    message: { type: String, required: true },
    type: { type: String, required: true },
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false },
    link: { type: String,  },
    isImportant: { type: Boolean, default: false },
    deadline: { type: Date },
    notificationId: {
      type: String,
      unique: true, // Unique rakhne ke liye
      sparse: true, // Allow null values ke liye
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
