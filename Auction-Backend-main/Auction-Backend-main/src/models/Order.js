import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",

    },
      assignedWrapper: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fleetOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
 
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: Number,
        image: [String],
        name: String,
        description: String,
      },
    ],
    // In your Order schema
fleetAuction: [
  {
    fleetAuctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FleetOwner",
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
   
    price: Number,
    image: [String],
    name: String,
    description: String,
    bidType: {
        type: String,
        enum: ["fullWrap", "oneSide", "bothSides", "rearDoors"],
      },
    wrapType: { 
  type: String,
  enum: ["fullWrap", "oneSide", "bothSides", "rearDoors"],

}

  },
  
],
    auction: [
      {
        auctionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Auction",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
       price: {
          type: Number,
          required: true,
        },
        image: [String],
        name: String,
        description: String,
      },
    ],
    totalPrice: {
    type: Number,
    required: true,
    set: (value) => parseFloat(value.toFixed(2)), 
  },
    address: {
      firstName: String,
      mobile: String,
      street: String,
      city: String,
      state: String,
      country:String,
      pincode: String,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "CARD"],
      default: "COD",
    },
    paymentId: String,
    paymentSessionId: String,
    description: String,
    status: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED", "Cancle","PREPARED_FOR_DELIVERY"],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "REFUNDED", "FAILED"],
      default: function () {
        return this.paymentMethod === "CARD" ? "PAID" : "UNPAID";
      },
    },
   commissionDetails: {
      totalCommission: Number,
      commissionrate: Number,
      sellerCharge: Number,
      buyerCharge: Number,
      originalPrice: Number, 
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
