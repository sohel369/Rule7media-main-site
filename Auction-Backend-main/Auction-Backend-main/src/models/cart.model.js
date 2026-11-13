// cart.model.js
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
   ref: 'Product'
  }],
  auctions: [
    {
      type: mongoose.Schema.Types.ObjectId,
     ref: 'Auction'
    }
  ],
  quantity: [Number],
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'upi'],
    default: 'cod',
  }
});

export default mongoose.model('Cart', cartSchema);
// products: [
//     {
//         type: Schema.Types.ObjectId, ref: "Auction", required: true
//     }
    
   
// ],