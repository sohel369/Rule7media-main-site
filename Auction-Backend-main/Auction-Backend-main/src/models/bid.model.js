import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
fleetOwner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'FleetOwner' 
},

  bidAmount: { type: Number, required: true },
  bidType: {
      type: String,
      enum: ["fullWrap", "oneSide", "bothSides", "rearDoors"],
     
    },
  bidTime: { type: Date, default: Date.now },
  isWinningBid: { type: Boolean, default: false },
  auctionType: { type: String, enum: ['auction', 'fleetauction'] } 
},
{
  timestamps: true,
});

const Bid = mongoose.model("Bid", bidSchema);

export default Bid;
