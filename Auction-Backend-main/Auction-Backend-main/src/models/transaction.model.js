// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  totalCommission: {
    type: Number,
   
    min: 0
  },

paymentMethod: {
  type: String,
  enum: ['CARD', 'creditCard', 'debitCard', 'paypal', 'bankTransfer', 'bnpl'],
  required: true
},
commissions: {
  buyer: { type: Number,  },  
  seller: { type: Number,  }
},
  sellerPayout: {
    type: Number,
   
  },
  buyerTotal: {
    type: Number,
   
  },
  currency: {
    type: String,
    default: 'usd',
    enum: ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'inr', 'thb', 'sgd', 'myr', 'idr', 'php', 'vnd', 'dkk', 'nok', 'sek', 'rub'],
  },
  exchangeDetails: {
    buyerCurrency: String,
    sellerCurrency: String,
    exchangeRate: Number,
    rateTimestamp: Date
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    type: Object
  }
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);