import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  auctionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  }],
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  budgetRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BudgetRequest'
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'interested', 'not_interested'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;