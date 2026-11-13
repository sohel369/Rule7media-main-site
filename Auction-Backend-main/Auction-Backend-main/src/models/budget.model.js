// models/recommendation.model.js
import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   auctionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction", // 👈 Yeh important hai populate ke liye
    },
  ],
  budgetRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetRequest', required: true },

  message: String,
  viewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;