import mongoose from 'mongoose';

const finalisedFeeSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: true
  },
  feeRate: {
    type: Number, // e.g. 10 for 10%
    required: true
  },
  sellerFee: {
    type: Number, // calculated as bidAmount * (feeRate / 100)
    required: true
  },
}, { timestamps: true });

export default mongoose.model('FinalisedFee', finalisedFeeSchema);