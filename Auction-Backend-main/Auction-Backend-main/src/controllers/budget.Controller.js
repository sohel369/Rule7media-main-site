import BudgetRequest from "../models/buyerbudget.model.js";
import Auction from "../models/auction.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js"; // User model import karo
import sendPushNotification from "../firebase/firebaseAdmin.js";
import { io } from "../index.js";
import ProductCategory from "../models/productCategory.model.js";
import Recommendation  from "../models/budget.model.js"
import FleetBudget from "../models/fleetrequest.model.js";
import FleetOwner from '../models/fleetowner.model.js'
const createBudget = async (req, res) => {
  try {
    const {
      buyerId,
      auctionId,
      budgetRates,
      description,
      fcmToken,
    } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    }

    const sellerId = auction.seller || auction.fleetOwner;

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      console.error("Seller not found with ID:", sellerId);
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // Validate budget rates
    const validRates = budgetRates || {};
    const hasValidRate = Object.values(validRates).some(rate => 
      rate && !isNaN(rate) && Number(rate) > 0
    );
    
    if (!hasValidRate) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide at least one valid budget rate" 
      });
    }

    // Create budget request
    const newBudgetRequest = new BudgetRequest({
      buyerId,
      auctionId,
      sellerId,
      budgetRates: {
        fullWrap: validRates.fullWrap || 0,
        oneSide: validRates.oneSide || 0,
        bothSides: validRates.bothSides || 0,
        rearDoors: validRates.rearDoors || 0,
      },
      description,
      status: "open",
    });

    await newBudgetRequest.save();

    // Create notification
    const notification = await Notification.create({
      user: sellerId,
      type: "budget",
      message: `A buyer has sent a budget request for your auction.`,
      auction: auctionId,
      link: `/user-profile/budget-request`,
      budgetRequestId: newBudgetRequest._id,
    });

    // Send socket.io notification
    io.to(sellerId.toString()).emit("newBudgetRequest", {
      message: `New budget request for your auction.`,
      auctionId,
      budgetRequestId: newBudgetRequest._id,
      budgetRates: newBudgetRequest.budgetRates,
    });

    // Send push notification if token exists
    if (seller?.fcmToken) {
      try {
        await sendPushNotification(
          seller.fcmToken,
          `A buyer has sent a budget request for your auction.`,
          "New Budget Request",
          {
            auctionId,
            budgetRequestId: newBudgetRequest._id,
            type: "budget_request",
          }
        );
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
    }

    res.status(201).json({ 
      success: true, 
      data: newBudgetRequest,
      message: "Budget request submitted successfully" 
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getBudgetRequestsBySellerId = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const requests = await BudgetRequest.find({ sellerId })
      .populate("sellerId", "name email")
    
      .sort({ createdAt: -1 });

    const formatted = requests.map((req) => ({
      _id: req._id,
      buyerId: req.buyerId,
      
      auctionId: req.auctionId,
      seller: req.sellerId,
      
      budgetRates: req.budgetRates || {
        fullWrap: 0,
        oneSide: 0,
        bothSides: 0,
        rearDoors: 0
      },
      budgetAmount: req.budgetAmount || 0,
      
      description: req.description || "",
      
      location: req.location || [],
      
      status: req.status || "open",
      createdAt: req.createdAt,
      updatedAt: req.updatedAt || req.createdAt,
    }));
   
    res.status(200).json({ 
      success: true, 
      data: formatted,
      count: formatted.length 
    });
  } catch (error) {
    console.error("Error fetching budget requests:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};
const fetchRecommendedAuctions = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { budgetRequestId } = req.query; // Optional: specific budget request

    if (!sellerId) {
      return res
        .status(400)
        .json({ success: false, message: "Seller ID is required" });
    }

    // Verify seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // 1. Get seller's active auctions
    const activeAuctions = await Auction.find({ 
      seller: sellerId,
      status: { $in: ["active", "live"] },
      adminstatus: "approved"
    })
    .populate("seller", "name email")
    .populate("vehicle", "model manufacturer dimensions")
    .sort({ createdAt: -1 });

    if (activeAuctions.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No active auctions found for this seller"
      });
    }

    // 2. If budgetRequestId is provided, get budget details
    let budgetRequest = null;
    if (budgetRequestId) {
      budgetRequest = await BudgetRequest.findById(budgetRequestId);
    }

    // 3. Format response
    const formattedAuctions = activeAuctions.map(auction => {
      const baseAuction = {
        _id: auction._id,
        name: auction.name || auction.company || auction.title || "Auction",
        description: auction.description || "",
        vehicleModel: auction.vehicleModel || auction.vehicle?.model || "N/A",
        vehicleManufacturer: auction.vehicleManufacturer || auction.vehicle?.manufacturer || "N/A",
        yearOfManufacture: auction.yearofmanufacturer || "",
        status: auction.status,
        adminstatus: auction.adminstatus,
        location: auction.location || {},
        additionalLocations: auction.additionalLocations || [],
        images: auction.images || [],
        startTime: auction.startTime,
        endTime: auction.endTime,
        createdAt: auction.createdAt,
        updatedAt: auction.updatedAt,
        seller: auction.seller ? {
          _id: auction.seller._id,
          name: auction.seller.name,
          email: auction.seller.email
        } : null
      };

      // Add wrap rates if available
      if (auction.buyNowRates) {
        baseAuction.buyNowRates = auction.buyNowRates;
      }
      if (auction.minAuctionRates) {
        baseAuction.minAuctionRates = auction.minAuctionRates;
      }

      // Calculate recommendation score if budget request exists
      if (budgetRequest && budgetRequest.budgetRates) {
        const budgetRates = budgetRequest.budgetRates;
        const auctionRates = auction.minAuctionRates || auction.buyNowRates || {};
        
        let score = 0;
        let matches = 0;
        
        // Check each wrap type
        const wrapTypes = ['fullWrap', 'oneSide', 'bothSides', 'rearDoors'];
        wrapTypes.forEach(type => {
          const budgetRate = budgetRates[type] || 0;
          const auctionRate = auctionRates[type] || 0;
          
          if (budgetRate > 0 && auctionRate > 0) {
            if (budgetRate >= auctionRate) {
              score += 25; // Full match
            } else if (budgetRate >= auctionRate * 0.8) {
              score += 15; // Partial match (80% or more)
            }
            matches++;
          }
        });
        
        baseAuction.recommendationScore = matches > 0 ? Math.min(100, score) : 0;
        baseAuction.matchingWrapTypes = matches;
      } else {
        baseAuction.recommendationScore = 100; // Default score for seller's auctions
      }

      return baseAuction;
    });

    // 4. Sort by recommendation score (if budget request exists)
    if (budgetRequest) {
      formattedAuctions.sort((a, b) => b.recommendationScore - a.recommendationScore);
    }

    return res.status(200).json({
      success: true,
      count: formattedAuctions.length,
      data: formattedAuctions,
      budgetRequest: budgetRequest ? {
        _id: budgetRequest._id,
        budgetRates: budgetRequest.budgetRates
      } : null
    });

  } catch (error) {
    console.error("Error fetching seller auctions:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch auctions", 
      error: error.message 
    });
  }
};

const sendRecommendation = async (req, res) => {
  try {
    const { buyerId, auctionIds, message, sellerId, budgetRequestId } = req.body;

    // 1. Verify buyer exists
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ success: false, message: "Buyer not found" });
    }

    // 2. Create recommendation in database
    const recommendation = await Recommendation.create({
      buyerId,
      sellerId,
      auctionIds,
      message,
      budgetRequestId
    });

    // 3. Send real-time notification via socket.io
    io.to(buyerId.toString()).emit("newRecommendation", {
      message: message || `You have ${auctionIds.length} new recommendations!`,
      recommendationId: recommendation._id, 
      auctionIds,
      timestamp: new Date().toISOString()
    });

    const notification = await Notification.create({
      user: buyerId,
      type: "product_recommendation",
      message: message || `You have ${auctionIds.length} new product recommendations!`,
      auctionIds, // Store all IDs
     link: `/recommendations/${recommendation._id}`,
    });
     io.to(buyerId.toString()).emit("newRecommendation", {
      message: notification.message,
      link: notification.link,
    });
   if (buyer.fcmToken) {
  try {
    const message = {
      token: buyer.fcmToken,
      notification: {
        title: "New Recommendations",
        body:  `You have ${auctionIds.length} new recommendations!`
      },
      data: {
        recommendationId: recommendation._id.toString(),
        type: "product_recommendation",
        click_action: `/recommendations/${recommendation._id}`,
        // Include all auction IDs as string
        auctionIds: JSON.stringify(auctionIds) 
      },
      // For Android specific config
      android: {
        notification: {
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
          channelId: "recommendations_channel"
        }
      },
      // For iOS specific config
      apns: {
        payload: {
          aps: {
            sound: "default"
          }
        }
      }
    };

    // Send the message
    const response = await admin.messaging().send(message);
  
    
  } catch (pushError) {
    console.error("Push notification error:", pushError);
    
    // If token is invalid, you might want to remove it
    if (pushError.code === 'messaging/invalid-registration-token' || 
        pushError.code === 'messaging/registration-token-not-registered') {
     
      await User.findByIdAndUpdate(buyerId, { $unset: { fcmToken: 1 } });
    }
  }
}

    res.status(200).json({
      success: true,
      message: "Recommendations sent successfully",
      recommendation,
      auctionIds
    });
  } catch (error) {
    console.error("Error sending recommendation:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all recommendations for a buyer
const getBuyerRecommendations = async (req, res) => {
  try {
    const { buyerId } = req.params;
    
    const recommendations = await Recommendation.find({ buyerId })
      .populate("auctionIds") // Ensure auctionIds is an array of ObjectIds
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getSingleBudgetRequest = async (req, res) => {
  const { id } = req.params;

  try {
    // === 1. FLEET BUDGET REQUEST ===
    let request = await FleetBudget.findById(id)
      .populate({
        path: "user",
        select: "firstName lastname email company profilePicture"
      })
      .populate({
        path: "fleetOwnerId",
        select: "firstName lastname email company profilePicture"
      })
      .populate({
        path: "fleetAuctionId",
        select: "images company vehicleModel vehicleManufacturer yearofmanufacturer location user",
        populate: {
          path: "user",
          select: "firstName lastname email company profilePicture"
        }
      })
      .populate({
        path: "adminProcessedBy",
        select: "firstName lastname"
      });

    if (request) {
   
      const fleetOwner = request.fleetAuctionId?.user || request.fleetOwnerId;

      return res.json({ type: "fleet", data: request });
    }

    let auctionRequest = await BudgetRequest.findById(id)
      .populate({
        path: "user",
        select: "firstName lastname email"
      })
      .populate({
        path: "auctionId",
        select: "name images location",
        populate: { path: "seller", select: "firstName lastname email company" }
      })
      .populate({
        path: "adminProcessedBy",
        select: "firstName lastname"
      });

    if (auctionRequest) {

      return res.json({ type: "auction", data: auctionRequest });
    }

    return res.status(404).json({ message: "Not found" });

  } catch (error) {
    console.error("ERROR:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export {
  createBudget,
  fetchRecommendedAuctions,
  getBudgetRequestsBySellerId,
  sendRecommendation,
  getBuyerRecommendations,
  getSingleBudgetRequest
};
