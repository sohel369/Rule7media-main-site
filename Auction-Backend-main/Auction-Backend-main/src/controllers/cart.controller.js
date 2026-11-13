import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Cart from "../models/cart.model.js";
import { populate } from "dotenv";
import Auction from "../models/auction.model.js";
import Product from "../models/Product.js";
import Bid from "../models/bid.model.js";
import Order from "../models/Order.js"
import mongoose from 'mongoose';
// @desc get cart items
// @route GET /api/v1/cart
// @access Private

const getCartItems = asyncHandler(async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id })
      .populate("products"); 

    return res.status(200).json(new ApiResponse(200, "Cart items found", cartItems));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error?.message || "Internal server error")
    );
  }
});

// const getWinningBid = async (req, res) => {
//   try {
//     // Get the user's ID from the authenticated request
//     const userId = req.user._id;

//   
//     const winningBids = await Bid.find({
//       bidder: userId,
//       isWinningBid: true
//     })
//       .populate('auction')
//       .populate('bidder', '_id firstName email profilePicture')
//       .sort({ createdAt: -1 });
//     if (!winningBids || winningBids.length === 0) {
//       return res.status(404).json({ message: "No winning bids found for this user" });
//     }
   
//     res.json(winningBids);
//   } catch (error) {
//     res.status(500).json({ message: error.message || "Error fetching winning bids" });
//   }
// };


const getWinningBid = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid or missing userId" });
    }

    const winningBids = await Bid.aggregate([
      {
        $match: {
          bidder: new mongoose.Types.ObjectId(userId),
          isWinningBid: true
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const populatedBids = await Bid.populate(winningBids, [
      { path: "auction", select: "name images status description  vehicleModel" },
      {
        path: "fleetOwner",
        model: "FleetOwner",
        select: "name status images description purchaseStatus vehicleModel vehicleManufacturer yearofmanufacturer company suburb townOrCity state country"
      },
      {
        path: "bidder",
        select: "_id firstName email profilePicture"
      }
    ]);

    if (!populatedBids || populatedBids.length === 0) {
      return res.status(404).json({ success: false, message: "No winning bids found for this user" });
    }

    res.json({ success: true, bids: populatedBids });
  } catch (error) {
    console.error("Error fetching winning bids:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



const addToCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity, paymentMethod } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Product ID is required"));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json(new ApiResponse(404, "Product not found"));
    }
    const userId = req.user._id;

    const existingItem = await Cart.findOne({ productId, userId });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      const updatedCart = await Cart.find({ userId });
      return res.json({ data: updatedCart });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart if doesn't exist
      cart = await Cart.create({
        user: req.user._id,
        products: [productId],
        quantity: [quantity || 1],
        paymentMethod: paymentMethod || "cod",
      });
    } else {
      const productIndex = cart.products.findIndex(
        (id) => id.toString() === productId
      );

      if (productIndex !== -1) {
        if (Array.isArray(cart.quantity)) {
          cart.quantity[productIndex] =
            (cart.quantity[productIndex] || 0) + (quantity || 1);
        } else {
          // Initialize quantity array if it doesn't exist
          cart.quantity = cart.products.map((_, i) =>
            i === productIndex ? quantity || 1 : 1
          );
        }
      } else {
        // Add new product to cart
        cart.products.push(productId);

        if (Array.isArray(cart.quantity)) {
          cart.quantity.push(quantity || 1);
        } else {
          cart.quantity = cart.products.map((_, i) =>
            i === cart.products.length - 1 ? quantity || 1 : 1
          );
        }
      }

      // Update payment method if provided
      if (paymentMethod) {
        cart.paymentMethod = paymentMethod;
      }

      await cart.save();
    }

    // Populate product details for response
    const populatedCart = await Cart.findById(cart._id).populate("products");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Product added to cart successfully",
          populatedCart
        )
      );
  } catch (error) {
    console.error("Add to cart error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
const clearCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json(new ApiResponse(404, "Cart not found"));
    }

    cart.products = [];
    cart.quantity = [];

    await cart.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Cart cleared successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
// @desc delete item from cart
// @route Delete /api/v1/cart
// @access Private

const deleteCartItem = asyncHandler(async (req, res) => {
  try {
    //get id from endpoint
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json(new ApiResponse(404, "Cart not found"));
    }

    //remove product from cart
    cart.products = cart.products.filter(
      (product) => product.toString() !== id
    );

    await cart.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Product removed from cart successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
// Add this new function to your cart controller
// const removeAuctionFromCart = asyncHandler(async (req, res) => {
//   try {
//     const { auctionId } = req.params;
//     const userId = req.user._id;



//     // 1. Find all bids by this user in the auction
//     const bidsToDelete = await Bid.find({
//       auction: auctionId, // Ensure this matches `auctionId` in the bid document
//       bidder: userId      // Changed from `user` to `bidder` (based on your log)
//     });



//     if (!bidsToDelete || bidsToDelete.length === 0) {
//       return res.status(404).json(new ApiResponse(404, "No bids found for this user in the auction"));
//     }

//     // 2. Delete all matching bids
//     await Bid.deleteMany({
//       auction: auctionId,
//       bidder: userId      // Changed from `user` to `bidder`
//     });

//     // 3. Optional: Remove bid references from the auction document
//     await Auction.findByIdAndUpdate(
//       auctionId,
//       { $pull: { bids: { bidder: userId } } }, // Changed from `user` to `bidder`
//       { new: true }
//     );

//     return res.status(200).json(
//       new ApiResponse(200, "Bids successfully deleted after order placement")
//     );
//   } catch (error) {
//     console.error("Error in removeBidsAfterOrder:", error); // Debug
//     return res.status(500).json(
//       new ApiResponse(500, error?.message || "Internal server error")
//     );
//   }
// });
export { getCartItems, addToCart, clearCart, deleteCartItem,getWinningBid };
