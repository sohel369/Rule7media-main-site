import mongoose from 'mongoose';

const ClickSchema = new mongoose.Schema({
  auctionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FleetOwner',
    required: true 
  },
   userType: {  // Added to directly store user type
    type: String,
    enum: ['advertiser', 'wrapper', 'buyer', 'other','fleetOwner'],
    required: true
  },
   userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
    fleetOwnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  auctionType: {
    type: String,
    enum: ['fleetauction', 'standard'],
    default: 'fleetauction'
  },
  referrer: String,
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

ClickSchema.index({ auctionId: 1 });
ClickSchema.index({ advertiser: 1 });
ClickSchema.index({ timestamp: 1 });

const Click = mongoose.model('Click', ClickSchema);

export default Click;