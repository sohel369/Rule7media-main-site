import mongoose from "mongoose";

const fleetOwnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fleetOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
  purchaseStatus: {
    type: String,
    enum: ['sold', 'unsold'],
    default: 'unsold',
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'over','rejected'],
    default: 'upcoming',
  },
  
  currentBids: {
    fullWrap: {
      bidAmount: { type: Number, default: 0 },
      bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      bidTime: Date,
    },
    oneSide: {
      bidAmount: { type: Number, default: 0 },
      bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      bidTime: Date,
    },
    bothSides: {
      bidAmount: { type: Number, default: 0 },
      bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      bidTime: Date,
    },
    rearDoors: {
      bidAmount: { type: Number, default: 0 },
      bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      bidTime: Date,
    },
  },
  vehicleWrapCpms: {
    fullWrap: { type: Number, default: 0 },
    oneSide: { type: Number, default: 0 },
    bothSides: { type: Number, default: 0 },
    rearDoors: { type: Number, default: 0 },
  },
  currentBid: {
    bidAmount: { type: Number },
    bidType: {
      type: String,
      enum: ["fullWrap", "oneSide", "bothSides", "rearDoors"],
    },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  company: String,
  accountNumber: String,
  suburb: String,
  townOrCity: String,
  state: String,
  country: String,
  zipCodesCovered: [String],
  interRoutes: [
    {
      from: String,
      to: String,
    },
  ],
  minAuctionRates: {
    fullWrap: Number,
    oneSide: Number,
    bothSides: Number,
    rearDoors: Number,
  },
  buyNowRates: {
    fullWrap: Number,
    oneSide: Number,
    bothSides: Number,
    rearDoors: Number,
  },
  discountOffers: {
    threeMonth: Number,
    sixMonth: Number,
    twelveMonth: Number,
    twentyFourMonth: Number,
  },
  vehicleManufacturer: String,
  yearofmanufacturer: {
    type: Number,
    required: true,
  },
  yearofmanufacturer: {
  type: Number,
  required: true,
},
manufactureCountry: {           
  type: String,
  trim: true,
  default: "Not Available"
},
vehicleType: {
    type: String,
    // required: true,
    set: function(value) {
      // Setter function to clean the value before saving
      if (typeof value === 'string') {
        // Split by comma, get unique, join back
        const types = value.split(',').map(t => t.trim()).filter(Boolean);
        const uniqueTypes = [...new Set(types)];
        return uniqueTypes.join(',');
      }
      return value;
    }
  },
  vehicleModel: String,
  registrationPlate: {  
    type: String,
    //required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  dailyMileage: {
      type: Number,
      default: 0,
      min: 0,
    },
  vehicleAvailability: {
    threeMonths: String,
    sixMonths: String,
    twelveMonths: String,
    twentyFourMonths: String,
  },
  prohibitedAds: {
    gambling: Boolean, // Changed to Boolean to match form logic
    alcohol: Boolean,
    smoking: Boolean,
    otherSpecify: String,
  },
  images: [
    {
      url: String,
      public_id: String,
      isPrimary: Boolean,
    },
  ],
  estimatedDailyImpressions: Number,
  estimatedTotalImpressions: Number,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    name: { type: String },
    zip: { type: String },
  },
  // Optional: Add this if you want to store multiple locations
  additionalLocations: [
    {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: [Number],
      name: String,
      zip: String,
    },
  ],
  isApprovedByAdmin: {
    type: Boolean,
    default: false,
  },
  winners: {
  fullWrap: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: Number,
    bidTime: Date,
   bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  },
  oneSide: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: Number,
    bidTime: Date,
   bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  },
  bothSides: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: Number,
    bidTime: Date,
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  },
  rearDoors: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: Number,
    bidTime: Date,
    bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  }
},
}, { timestamps: true });

// Index for geo queries
fleetOwnerSchema.index({ location: "2dsphere" });
fleetOwnerSchema.index({ status: 1, endTime: 1 });
fleetOwnerSchema.index({ startTime: 1 });
fleetOwnerSchema.index({ registrationPlate: 1, user: 1 });
export default mongoose.model("FleetOwner", fleetOwnerSchema);