import dotenv from "dotenv";
dotenv.config();
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Bid from "../models/bid.model.js";
import Auction from "../models/auction.model.js";
import User from "../models/user.model.js";
import FleetOwner from "../models/fleetowner.model.js";
import mongoose from "mongoose";
import Notification from "../models/notification.model.js"; 
import admin from "firebase-admin";
import { io } from "../index.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";
// @desc Add bid on item
// const addBidOnItem = asyncHandler(async (req, res) => {
//   try {
//     const { amount, bidType, forceAccept } = req.body;
// 
//     const userId = req.user._id;
//     const itemId = req.params.id;

//     // Validate input
//     if (!mongoose.Types.ObjectId.isValid(itemId)) {
//       return res.status(400).json(new ApiResponse(400, "Invalid ID"));
//     }

//     if (!amount || isNaN(amount) || amount <= 0) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(400, "Please provide a valid positive bid amount")
//         );
//     }

//     // Try to find the item in either collection
//     let item = await FleetOwner.findById(itemId).lean();
//     let itemType = "fleetauction";

//     if (!item) {
//       item = await Auction.findById(itemId).lean();
//       itemType = "auction";
//     }

//     if (!item) {
//       return res.status(404).json(new ApiResponse(404, "Item not found"));
//     }

//     // Determine owner based on item type with null checks
//     const ownerId = itemType === "fleetauction" ? item.user : item.seller;

//     // Check if ownerId exists
//     if (!ownerId) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, "Item owner information is missing"));
//     }

//     // Convert to string for comparison
//     const ownerIdStr = ownerId.toString();
//     const userIdStr = userId.toString();

//     // Prevent self-bidding
//     if (ownerIdStr === userIdStr) {
//       const ownerType = itemType === "fleetauction" ? "Fleet owner" : "Seller";
//       return res
//         .status(403)
//         .json(
//           new ApiResponse(403, `${ownerType} cannot bid on their own items`)
//         );
//     }

//     // Get pricing information
//     const currentPrice = item.currentBid || item.startingPrice || 0;
//     const reservePrice = itemType === "fleetauction" 
//       ? item.minAuctionRates?.[bidType] || 0 
//       : item.reservePrice || 0;
//     const isBelowReserve = amount < reservePrice;

//     // Validate bid amount against current price (not reserve)
//     if (amount <= currentPrice) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             `Bid must be greater than current price of ${currentPrice}`
//           )
//         );
//     }

//     // Check auction status if applicable
//     if (item.auctionEndTime && new Date() > new Date(item.auctionEndTime)) {
//       return res.status(400).json(new ApiResponse(400, "Auction has ended"));
//     }

//     // For below-reserve bids that aren't force-accepted
//     if (isBelowReserve && !forceAccept) {
//       return res.status(200).json(new ApiResponse(200, {
//         message: `Your bid of ₹${amount} is below the reserve price of ₹${reservePrice}`,
//         isBelowReserve: true,
//         currentBid: amount,
//         minNextBid: currentPrice + 1,
//         reservePrice: reservePrice,
//         options: ['Increase Bid', 'Submit Anyway']
//       }));
//     }

//     // Start transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Create and save bid
//       const newBid = new Bid({
//         bidder: userId,
//         auction: itemId,
//         auctionType: itemType,
//         bidAmount: amount,
//         bidType: bidType,
//         isBelowReserve,
//         ...(itemType === "fleetauction" && { fleetOwner: ownerId }),
//       });

//       await newBid.save({ session });

//       // Fetch fresh owner data for notifications
//       const owner = await User.findById(ownerId);
//       const bidder = await User.findById(userId);

//       // Create in-app notification
//       const notificationLink = itemType === "fleetauction" 
//         ? `/single-fleet-auction-detail/${itemId}`
//         : `/single-auction-detail/${itemId}`;

//       const notificationMessage = itemType === "fleetauction"
//         ? `New bid of ₹${amount} placed (${bidType}) ${isBelowReserve ? '(Below Reserve)' : ''}`
//         : `New bid of ₹${amount} placed on your item ${isBelowReserve ? '(Below Reserve)' : ''}`;

//       await Notification.create({
//         user: ownerId,
//         message: notificationMessage,
//         type: "BID_PLACED",
//         link: notificationLink,
//         relatedId: itemId,
//         isBelowReserve,
//       });

//      

//       // Calculate CPM savings
//       const calculateSavings = (bidAmount, traditionalCPM) => {
//         const vehicleCPM = 1.25;
//         const savings = ((traditionalCPM - vehicleCPM) / traditionalCPM) * 100;
//         return savings.toFixed(1);
//       };

//       // Send email notification
//       try {
//         const emailSubject = itemType === "fleetauction"
//           ? `New Bid Received on Your Fleet - ₹${amount} ${isBelowReserve ? '(Below Reserve)' : ''}`
//           : `New Bid Received on Your Auction Item - ₹${amount} ${isBelowReserve ? '(Below Reserve)' : ''}`;

//         const cpmTable = `
//           <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
//             <tr style="background-color: #f5f5f5;">
//               <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Medium</th>
//               <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">CPM Range</th>
//               <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Your Savings</th>
//             </tr>
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd;">Radio</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">$10-$20</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${calculateSavings(amount, 15)}%</td>
//             </tr>
//             <tr style="background-color: #f9f9f9;">
//               <td style="padding: 8px; border: 1px solid #ddd;">TV</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">$20-$30</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${calculateSavings(amount, 25)}%</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd;">Billboard</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">$13-$22</td>
//               <td style="padding: 8px; border: 1px solid #ddd;">${calculateSavings(amount, 17.5)}%</td>
//             </tr>
//           </table>
//         `;

//         const emailBody = itemType === "fleetauction"
//           ? `
//             <p>Hello ${owner.firstName},</p>
//             <p>You have received a new bid of <strong>₹${amount}</strong> (${bidType}) ${isBelowReserve ? 'which is below your reserve price' : ''}.</p>
//             ${isBelowReserve ? `<p style="color: #d32f2f; font-weight: bold;">This bid is below your reserve price of ₹${reservePrice}</p>` : ''}
//             <p>Bidder: ${bidder.firstName} ${bidder.lastName}</p>
//             <p>Current highest bid: <strong>₹${amount}</strong></p>
//             ${cpmTable}
//             <p><a href="${process.env.FRONTEND_URL}${notificationLink}">View your fleet auction details</a></p>
//             ${isBelowReserve ? `<p>You can choose to accept this bid if you wish.</p>` : ''}
//           `
//           : `
//             <p>Hello ${owner.firstName},</p>
//             <p>You have received a new bid of <strong>₹${amount}</strong> on your auction item ${isBelowReserve ? 'which is below your reserve price' : ''}.</p>
//             ${isBelowReserve ? `<p style="color: #d32f2f; font-weight: bold;">This bid is below your reserve price of ₹${reservePrice}</p>` : ''}
//             <p>Bidder: ${bidder.firstName} ${bidder.lastName}</p>
//             <p>Current highest bid: <strong>₹${amount}</strong></p>
//             ${cpmTable}
//             <p><a href="${process.env.FRONTEND_URL}${notificationLink}">View your auction details</a></p>
//             ${isBelowReserve ? `<p>You can choose to accept this bid if you wish.</p>` : ''}
//           `;

//         const mailOptions = {
//           from: process.env.EMAIL_FROM,
//           to: owner.email,
//           subject: emailSubject,
//           html: emailBody,
//         };

//         await transporter.sendMail(mailOptions);
//      
//       } catch (emailError) {
//         console.error(`❌ Failed to send email to ${itemType === "fleetauction" ? "Fleet Owner" : "Seller"}:`, emailError);
//       }

//       // Update the auction/fleet owner document
//       const updateModel = itemType === "fleetauction" ? FleetOwner : Auction;
//       await updateModel.findByIdAndUpdate(
//         itemId,
//         {
//           $push: { bids: newBid._id },
//           $set: {
//             currentBid: amount,
//             bidType: bidType,
//             lastBidTime: new Date(),
//             ...(itemType === "auction" && { updatedAt: new Date() }),
//           },
//         },
//         { session }
//       );

//       await session.commitTransaction();

//       // Return populated bid
//       const populatedBid = await Bid.findById(newBid._id).populate(
//         "bidder",
//         "firstName lastName profilePicture"
//       );

//       return res
//         .status(201)
//         .json(new ApiResponse(201, {
//           message: isBelowReserve 
//             ? "Bid placed successfully (below reserve)" 
//             : "Bid placed successfully",
//           bid: populatedBid,
//           isBelowReserve,
//           savingsComparison: {
//             radio: calculateSavings(amount, 15),
//             tv: calculateSavings(amount, 25),
//             billboard: calculateSavings(amount, 17.5),
//             newspaper: calculateSavings(amount, 27.5)
//           }
//         }));
//     } catch (transactionError) {
//       await session.abortTransaction();
//       console.error("Transaction error:", transactionError);
//       throw transactionError;
//     } finally {
//       session.endSession();
//     }
//   } catch (error) {
//     console.error("Bid error:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(500, error?.message || "Internal server error"));
//   }
// });

// const addBidOnItem = asyncHandler(async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.user._id;

//     if (!amount || isNaN(amount) || amount <= 0) {
//       return res.status(400).json(new ApiResponse(400, "Valid positive amount is required"));
//     }

//     // Check if the auction is in FleetOwner or normal Auction collection
//     let item = await FleetOwner.findById(req.params.id);
//     let itemType = "fleetauction";

//     if (!item) {
//       item = await Auction.findById(req.params.id);
//       itemType = "auction";
//     }

//     if (!item) {
//       return res.status(404).json(new ApiResponse(404, "Item not found"));
//     }

//     // Determine the owner
//     let ownerId = itemType === "fleetauction" ? item.fleetOwner : item.seller;

//     const ownerIdStr = ownerId?.toString();
//     const userIdStr = userId.toString();

//     if (ownerIdStr === userIdStr) {
//       const ownerType = itemType === "fleetauction" ? "Fleet owner" : "Seller";
//       return res.status(403).json(
//         new ApiResponse(403, `${ownerType} cannot bid on their own products`)
//       );
//     }

//     // Check bid amount
//     const currentPrice = item.currentBid || item.startingPrice || 0;
//     if (amount <= currentPrice) {
//       return res.status(400).json(
//         new ApiResponse(400, `Bid amount must be greater than current price of ${currentPrice}`)
//       );
//     }

//     // Check if auction is still active
//     if (item.auctionEndTime && new Date() > new Date(item.auctionEndTime)) {
//       return res.status(400).json(new ApiResponse(400, "Auction has ended"));
//     }

//     // Start DB transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       // Create and save the new bid
//       const newBid = new Bid({
//         bidder: userId,
//         auction: req.params.id,
//         auctionType: itemType,
//         bidAmount: amount,
//       });

//       await newBid.save({ session });

//       // Update the item (Auction or FleetOwner)
//       if (!item.bids) item.bids = [];
//       item.bids.push(newBid._id);
//       item.currentBid = amount;
//       item.lastBidTime = new Date();

//       await item.save({ session });

//       await session.commitTransaction();
//       session.endSession();

//       // Populate for response
//       const populatedBid = await Bid.findById(newBid._id).populate(
//         "bidder",
//         "firstName lastName profilePicture"
//       );

//       return res.status(201).json(
//         new ApiResponse(201, "Bid placed successfully", {
//           bid: populatedBid,
//           newCurrentBid: amount,
//           itemType: itemType,
//         })
//       );
//     } catch (transactionError) {
//       await session.abortTransaction();
//       session.endSession();
//       console.error("Transaction error:", transactionError);
//       return res.status(500).json(new ApiResponse(500, "Transaction failed"));
//     }
//   } catch (error) {
//     console.error("Bid placement error:", error);
//     return res.status(500).json(
//       new ApiResponse(500, error?.message || "Internal server error")
//     );
//   }
// });

const addBidOnItem = asyncHandler(async (req, res) => {
  try {
    const { amount, bidType, forceAccept } = req.body;
    const userId = req.user._id;
    const itemId = req.params.id;

    // Convert amount to number immediately
    const bidAmount = Number(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, "Please provide a valid positive bid amount")
        );
    }

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json(new ApiResponse(400, "Invalid ID"));
    }

    // Try to find the item
    let item = await FleetOwner.findById(itemId).lean();
    let itemType = "fleetauction";

    if (!item) {
      item = await Auction.findById(itemId).lean();
      itemType = "auction";
    }

    if (!item) {
      return res.status(404).json(new ApiResponse(404, "Item not found"));
    }

    // Determine owner
    const ownerId = itemType === "fleetauction" ? item.user : item.seller;
    if (!ownerId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Item owner information is missing"));
    }

    // Prevent self-bidding
    const ownerIdStr = ownerId.toString();
    const userIdStr = userId.toString();
    if (ownerIdStr === userIdStr) {
      const ownerType = itemType === "fleetauction" ? "Fleet owner" : "Seller";
      return res
        .status(403)
        .json(
          new ApiResponse(403, `${ownerType} cannot bid on their own items`)
        );
    }

    // FLEET AUCTION HANDLING
    if (itemType === "fleetauction") {
      // Get current bid for THIS TYPE
      const currentBidForType = Number(item.currentBids?.[bidType]?.bidAmount) || 0;
      const reservePrice = Number(item.minAuctionRates?.[bidType]) || 0;
      const isBelowReserve = bidAmount < reservePrice;

      // Validate against current bid for this type
      if (bidAmount <= currentBidForType) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              `Bid must be greater than current ${bidType} bid of ${currentBidForType}`
            )
          );
      }

      // Check auction status
      if (item.auctionEndTime && new Date() > new Date(item.auctionEndTime)) {
        return res.status(400).json(new ApiResponse(400, "Auction has ended"));
      }

      // Handle below-reserve bids
      if (isBelowReserve && !forceAccept) {
        return res.status(200).json(new ApiResponse(200, {
          message: `Your ${bidType} bid of ${bidAmount} is below the reserve price of ${reservePrice}`,
          isBelowReserve: true,
          currentBid: currentBidForType,
          minNextBid: currentBidForType + 1,
          reservePrice: reservePrice,
          options: ['Increase Bid', 'Submit Anyway']
        }));
      }

      // Start transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Create and save bid
        const newBid = new Bid({
          bidder: userId,
          auction: itemId,
          auctionType: itemType,
          bidAmount: bidAmount,
          bidType: bidType,
          isBelowReserve,
          fleetOwner: item._id,
        });

        await newBid.save({ session });

        // Fetch users for notifications
        const owner = await User.findById(ownerId);
        const bidder = await User.findById(userId);

        // Create in-app notification
        const notificationLink = `/single-fleet-auction-detail/${itemId}`;
        const notificationMessage = `New ${bidType} bid of ${bidAmount} placed ${isBelowReserve ? '(Below Reserve)' : ''}`;

        await Notification.create({
          user: ownerId,
          message: notificationMessage,
          type: "BID_PLACED",
          link: notificationLink,
          relatedId: itemId,
          isBelowReserve,
        });

        // Update fleet owner document with per-type bid
        const updateResult = await FleetOwner.findByIdAndUpdate(
          itemId,
          {
            $push: { bids: newBid._id },
            $set: {
              [`startingPrice.${bidType}`]: {
                bidAmount: bidAmount,
                bidId: newBid._id,
                bidTime: new Date()
              },
              lastBidTime: new Date(),
            },
          },
          { session, new: true }
        );

        await session.commitTransaction();

        // Return populated bid
        const populatedBid = await Bid.findById(newBid._id).populate(
          "bidder",
          "firstName lastName profilePicture"
        );

        return res
          .status(201)
          .json(new ApiResponse(201, {
            message: isBelowReserve 
              ? "Bid placed successfully (below reserve)" 
              : "Bid placed successfully",
            bid: populatedBid,
            isBelowReserve,
          }));
      } catch (transactionError) {
        await session.abortTransaction();
        console.error("Transaction error:", transactionError);
        throw transactionError;
      } finally {
        session.endSession();
      }
    } 
    // REGULAR AUCTION HANDLING
    else {
      // Convert to numbers to prevent string comparison issues
      const currentPrice = Number(item.currentBid || item.startingPrice || 0);
      const reservePrice = Number(item.reservePrice || 0);
      const isBelowReserve = bidAmount < reservePrice;
 const minAuctionRate = Number(item.minAuctionRates?.[bidType]) || 0;
  const currentBidForType = Number(item.currentBids?.[bidType]?.bidAmount) || 0;
   const minRequiredBid = Math.max(minAuctionRate, currentBidForType);
      // Validate bid amount against current price
     if (bidAmount <= minRequiredBid) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          `Bid must be greater than ${currentBidForType > 0 ? 'current bid' : 'minimum rate'} of ${minRequiredBid} for ${bidType}`
        )
      );
  }

      // Check auction status
      if (item.endTime && new Date() > new Date(item.endTime)) {
    return res.status(400).json(new ApiResponse(400, "Auction has ended"));
  }

      // Handle below-reserve bids
      if (isBelowReserve && !forceAccept) {
        return res.status(200).json(new ApiResponse(200, {
          message: `Your bid of ${bidAmount} is below the reserve price of ${reservePrice}`,
          isBelowReserve: true,
          currentBid: currentPrice,
          minNextBid: currentPrice + 1,
          reservePrice: reservePrice,
          options: ['Increase Bid', 'Submit Anyway']
        }));
      }

      // Start transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Create and save bid
        const newBid = new Bid({
          bidder: userId,
          auction: itemId,
          auctionType: itemType,
          bidAmount: bidAmount,
          isBelowReserve,
          bidType: bidType,
        });

        await newBid.save({ session });

        // Update auction document
        await Auction.findByIdAndUpdate(
          itemId,
           {
        $push: { bids: newBid._id },
        $set: {
          [`currentBids.${bidType}`]: {
            bidAmount: bidAmount,
            bidder: userId,
            bidTime: new Date()
          },
          lastBidTime: new Date(),
          updatedAt: new Date(),
        },
      },
      { session, new: true }
    );

const owner = await User.findById(ownerId);
    const bidder = await User.findById(userId);
     const notificationLink = `/single-auction-detail/${itemId}`;
    const notificationMessage = `New ${bidType} bid of ${bidAmount} placed by ${bidder?.firstName || 'User'}`;

    await Notification.create(
      [{
        user: ownerId,
        message: notificationMessage,
        type: "BID_PLACED",
        link: notificationLink,
        relatedId: itemId,
      }],
      { session }
    );
        await session.commitTransaction();

        // Return populated bid
        const populatedBid = await Bid.findById(newBid._id).populate(
          "bidder",
          "firstName lastName profilePicture"
        );

        return res
          .status(201)
          .json(new ApiResponse(201, {
            message: isBelowReserve 
              ? "Bid placed successfully (below reserve)" 
              : "Bid placed successfully",
            bid: populatedBid,
            isBelowReserve,
          }));
      } catch (transactionError) {
        await session.abortTransaction();
        console.error("Transaction error:", transactionError);
        throw transactionError;
      } finally {
        session.endSession();
      }
    }
  } catch (error) {
    console.error("Bid error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
const getWinnerOfAuction = asyncHandler(async (req, res) => {

  const bids = await Bid.find({ auction: req.params.id });

  if (!bids) {
    return res.status(404).json(new ApiResponse(404, "Auction not found"));
  }
  if (bids.length === 0) {
    return res.status(406).json(new ApiResponse(406, "No bids found"));
  }

 const winnersByType = {
    fullWrap: null,
    oneSide: null,
    bothSides: null,
    rearDoors: null,
  };
bids.forEach((bid) => {
    const type = bid.bidType;
    if (
      !winnersByType[type] ||
      bid.bidAmount > winnersByType[type].bidAmount
    ) {
      winnersByType[type] = bid;
    }
  });
  let maxBidId = bids[0]._id;
  let maxAmount = bids[0].bidAmount;
  for (let i = 1; i < bids.length; i++) {
    if (bids[i].bidAmount > maxAmount) {
      maxAmount = bids[i].bidAmount;
      maxBidId = bids[i]._id;
    }
  }

  const auction = await Auction.findById(req.params.id);
  const winners = {};
  for (const [type, bid] of Object.entries(winnersByType)) {
    if (bid) {
      const populatedBid = await Bid.findById(bid._id).populate(
        "bidder",
        "firstName email phone profilePicture"
      );
      winners[type] = populatedBid;
    }
  }

  auction.winner = maxBidId;
  auction.status = "over";

  await auction.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Winner of the auction"));
});

// @desc Get all bids by user ID
// @route GET /api/bids
// @access Private

const getBidsByUser = asyncHandler(async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate("auction", "title description startingPrice")
      .sort({ createdAt: -1 });

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "All bids by user", { bids: bids }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all bids by Auction ID
// @route GET /api/bids/get-all-bids/:auctionId
// @access Public

const getAllBidsByAuctionId = asyncHandler(async (req, res) => {
  try {
    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate("bidder", "firstName profilePicture")
      .sort({ createdAt: -1 });

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "All bids by auction", { bids: bids }));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

export {
  addBidOnItem,
  getWinnerOfAuction,
  getBidsByUser,
  getAllBidsByAuctionId,
};
