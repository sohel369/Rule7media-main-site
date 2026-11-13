import mongoose from 'mongoose';

const fleetrecommendationSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fleetOwnerId: {
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
   enum: ['pending', 'approved', 'rejected', 'active', 'sent'],
  default: 'pending'
}
}, {
  timestamps: true
});

// Remove the custom validation for advertiser/wrapper



const FleetRecommendation = mongoose.model('FleetRecommendation', fleetrecommendationSchema);

export default FleetRecommendation;
