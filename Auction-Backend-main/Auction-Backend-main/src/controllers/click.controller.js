import Click from "../models/Click.js";
import mongoose from "mongoose";
import User from "../models/user.model.js"; // Assuming User model exists
import FleetOwner from "../models/fleetowner.model.js";
// controllers/clickController.js

export const trackClick = async (req, res) => {
  try {
 
    const { auctionId, userType,userId, fleetOwnerId, referrer, userAgent } = req.body;

    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: "Missing auctionId field"
      });
    }

   
    const clickData = {
      auctionId,
   
     userType: userType || 'other',
      fleetOwnerId,
      referrer,
      userAgent,
      auctionType: 'fleetauction'
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
  clickData.userId = userId;
} else {
  clickData.userId = null; // guest user
}
    const click = new Click(clickData);
    await click.save();

    res.status(201).json({
      success: true,
      message: "Click tracked successfully",
      data: click
    });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking click",
      error: error.message
    });
  }
};

export const getAdminCTR = async (req, res) => {
  try {
    const clicks = await Click.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            auctionId: "$auctionId",
            userId: "$userId",
          },
          count: { $sum: 1 },
          auctionType: { $first: "$auctionType" },
        },
      },
      // 👉 Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

      // 👉 Lookup FleetOwner (or auction collection) for vehicleModel
      {
        $lookup: {
          from: "fleetowners", // 👈 adjust if your collection name is different
          localField: "_id.auctionId",
          foreignField: "_id",
          as: "auctionDetails",
        },
      },
      { $unwind: { path: "$auctionDetails", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          auctionId: "$_id.auctionId",
          userId: "$_id.userId",
          clickCount: "$count",
          userEmail: "$userDetails.email",
          firstName: "$userDetails.firstName",
          lastname: "$userDetails.lastname",
          userType: "$userDetails.userType",
          auctionType: { $ifNull: ["$auctionType", "Unknown Auction"] },
          vehicleModel: "$auctionDetails.vehicleModel", // 👈 we extract this
        },
      },
      { $sort: { clickCount: -1 } },
    ]);

    // Group by vehicleModel (instead of auctionId)
    const groupedByModel = clicks.reduce((acc, click) => {
      const key = click.vehicleModel || "Unknown Vehicle";
      if (!acc[key]) {
        acc[key] = {
          vehicleModel: key,
          auctionType: click.auctionType,
          users: [],
        };
      }

      acc[key].users.push({
        userId: click.userId,
        email: click.userEmail || "N/A",
        firstName: click.firstName || "N/A",
        lastname: click.lastname || "N/A",
        userType: click.userType || "other",
        clickCount: click.clickCount,
      });

      return acc;
    }, {});

    const responseData = Object.values(groupedByModel).map((model) => ({
      vehicleModel: model.vehicleModel,
      auctionType: model.auctionType,
      users: model.users.sort((a, b) => b.clickCount - a.clickCount),
    }));

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error in getAdminCTR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





// Helper function for date ranges
function getDateFilter(timeRange) {
  const now = new Date();
  let startDate;

  switch (timeRange) {
    case "24h":
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "7d":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "30d":
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    default:
      startDate = new Date(0); // All time
  }

  return { $gte: startDate };
}

export const getAdvertiserCTR = async (req, res) => {
  try {
    const { advertiserId } = req.params;

    const [totalClicks, clicksByAdType] = await Promise.all([
      Click.countDocuments({ advertiser: advertiserId }),
      Click.aggregate([
        { $match: { advertiser: advertiserId } },
        { $group: { _id: "$adType", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      totalClicks,
      clicksByAdType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch advertiser CTR",
      error: error.message,
    });
  }
};
