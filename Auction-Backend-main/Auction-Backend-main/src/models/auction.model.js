import mongoose from "mongoose";

const DimensionsSchema = new mongoose.Schema({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  wheelbase: { type: Number, required: true },
  curbWeight: { type: Number, required: true },
  engineSize: { type: Number, required: true },
  cabwidth: { type: Number, required: true },
  cabheight: { type: Number, required: true },
  bonnetwidth: { type: Number, required: true },
 bonnetLength: { type: Number, required: true },

}, { _id: false });

const VehicleSchema = new mongoose.Schema({
  country: { type: String, required: true },
  yearofmanufacture: { type: String, required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  dimensions: { type: DimensionsSchema, required: true },
  manufacturerLink: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    },
    required: false
  }
}, { _id: false });

const auctionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ProductCategory", 
    
  },
  vehicleType : { type: String, required: true },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fleetOwner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // or "FleetOwner" if separate model
  
},
  startTime: { type: Date, required: true },
  

  endTime: { type: Date, required: true },
  bids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bid" }],
 winners: {
  fullWrap: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: { type: Number },
    bidTime: { type: Date },
    bidId:   { type: mongoose.Schema.Types.ObjectId, ref: "Bid" } // optional
  },
  oneSide: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: { type: Number },
    bidTime: { type: Date },
    bidId:   { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  },
  bothSides: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: { type: Number },
    bidTime: { type: Date },
    bidId:   { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  },
  rearDoors: {
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bidAmount: { type: Number },
    bidTime: { type: Date },
    bidId:   { type: mongoose.Schema.Types.ObjectId, ref: "Bid" }
  },
 
},
  status: { type: String, enum: ["upcoming", "active", "over","completed",], default: "upcoming" },
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
 images: [
    {
      url: String,
      public_id: String,
      isPrimary: Boolean,
    },
  ],
minAuctionRates: {
    fullWrap: { type: Number, default: 0 },
    oneSide: { type: Number, default: 0 },
    bothSides: { type: Number, default: 0 },
    rearDoors: { type: Number, default: 0 },
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
  establishmentFeePercent: { type: Number, default: 10 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  paid: { type: Boolean, default: false },
  vehicle: { type: VehicleSchema, required: false },
  campingAvailability: {
  threeMonths: { type: String, default: "Unavailable" },
  sixMonths: { type: String, default: "Unavailable" },
  twelveMonths: { type: String, default: "Unavailable" },
  twentyFourMonths: { type: String, default: "Unavailable" },
},
   adminstatus: { 
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
}, { timestamps: true });

const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;