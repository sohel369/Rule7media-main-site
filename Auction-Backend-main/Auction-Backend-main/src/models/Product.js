import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction", 
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{ type: String }], // Array of reviews
  quantity: { type: Number, required: true },
  officeLocations: [
    {
      country: { type: String, required: true },
      address: { type: String, required: true },
    }],
  description: { type: String },
  image: { type: [String], required: true }, 
  country: String,
   state: String,
  city: String,
  locations: [
  {
    name: String,
    zip: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' } 
    }
  }
],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product; 
