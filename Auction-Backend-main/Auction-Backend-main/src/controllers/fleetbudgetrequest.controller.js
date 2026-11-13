import FleetBudget from "../models/fleetrequest.model.js";
import FleetOwner from "../models/fleetowner.model.js";
import FleetRecommendation from "../models/fleetrecomendation.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import admin from "firebase-admin";
import { io } from "../index.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";

// Create Budget Request - Goes to Admin First
export const createBudgetRequest = async (req, res) => {
  try {
    const {
      accountNumber,
      fullWrap,
      oneSide,
      bothSides,
      rearDoors,
      user,
      FleetAuctionId,
      query,
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!accountNumber) missingFields.push("accountNumber");
    if (fullWrap === undefined) missingFields.push("fullWrap");
    if (oneSide === undefined) missingFields.push("oneSide");
    if (bothSides === undefined) missingFields.push("bothSides");
    if (rearDoors === undefined) missingFields.push("rearDoors");
    if (!FleetAuctionId) missingFields.push("FleetAuctionId");
    if (!user) missingFields.push("user");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields,
      });
    }

    // Verify fleet auction exists
    const fleetAuction = await FleetOwner.findById(FleetAuctionId);
    if (!fleetAuction) {
      return res.status(404).json({
        success: false,
        message: "Fleet auction not found",
      });
    }

    const fleetOwnerId = fleetAuction.user;

    // Verify fleet owner exists
    const fleetOwner = await User.findById(fleetOwnerId);
    if (!fleetOwner) {
      return res.status(404).json({
        success: false,
        message: "Fleet owner not found",
      });
    }

    // Generate anonymous IDs
    const anonymousBuyerId = `BUYER_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const anonymousRequestId = `REQ_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create budget request - Status: pending admin review
    const budgetRequest = await FleetBudget.create({
      accountNumber,
      fullWrap,
      oneSide,
      bothSides,
      rearDoors,
      user,
      fleetAuctionId: FleetAuctionId,
      fleetOwnerId: fleetOwnerId,
      query,
      status: "pending", // Overall status
      anonymousBuyerId,
      anonymousRequestId,
      status: "review_pending", // Admin review status
      showBuyerDetails: false,
      showSellerDetails: false,
      adminNotes: "",
      isAdminApproved: false,
      createdAt: new Date(),
    });

    // Populate the created request
    const populatedBudgetRequest = await FleetBudget.findById(budgetRequest._id)
      .populate({
        path: "fleetAuctionId",
        select:
          "company vehicleModel vehicleManufacturer yearofmanufacturer minAuctionRates buyNowRates",
      })
      .populate({
        path: "user",
        select: "accountNumber phone name email",
      })
      .populate({
        path: "fleetOwnerId",
        select: "name email phone company",
      });
    const adminUsers = await User.find({ userType: "admin" }).select(
      "_id fcmToken name email"
    );

    if (!adminUsers || adminUsers.length === 0) {
      console.error("No admin users found in the system");
      return res.status(500).json({
        success: false,
        message: "No admin users found. Please contact system administrator.",
      });
    }

    // Create notifications for all admins
    for (const adminUser of adminUsers) {
      // Create database notification
      const adminNotification = await Notification.create({
        user: adminUser._id,
        type: "budget_admin_review",
        message: `New budget request ${anonymousRequestId} for ${
          fleetAuction.company || "fleet auction"
        } requires admin review.`,
        auction: FleetAuctionId,
        budgetRequestId: budgetRequest._id,
        link: `/admin/singlebudgetrequest/${budgetRequest._id}`,
        isRead: false,
        createdAt: new Date(),
      });

      if (io) {
        io.to(adminUser._id.toString()).emit("newBudgetRequestAdmin", {
          message: `New budget request requires your review.`,
          budgetRequestId: budgetRequest._id,
          anonymousRequestId,
          buyerName: populatedBudgetRequest.user.name,
          fleetCompany: fleetAuction.company || "Fleet Auction",
          status: "review_pending",
          notificationId: adminNotification._id,
          timestamp: new Date().toISOString(),
        });
      }

      // Send push notification to admin
      if (adminUser?.fcmToken) {
        try {
          await sendPushNotification(
            adminUser.fcmToken,
            `New budget request from  Request ID: ${anonymousRequestId}`,
            "New Budget Request - Admin Review Required",
            {
              budgetRequestId: budgetRequest._id,
              anonymousRequestId,
              type: "budget_admin_review",
              FleetAuctionId,
              action: "admin_review",
            }
          );
        } catch (pushError) {
          console.error(
            `Failed to send push notification to admin ${adminUser.name}:`,
            pushError
          );
        }
      }
    }

    // ========= BUYER CONFIRMATION =========
    // Create confirmation notification for buyer
    const buyerNotification = await Notification.create({
      user: user,
      type: "budget_request_submitted",
      message: `Your budget request ${anonymousRequestId} has been submitted and is under admin review. You will be notified once it's processed.`,
      budgetRequestId: budgetRequest._id,
      link: `/recommendations/${budgetRequest._id}`,
      isRead: false,
    });

    // Send socket notification to buyer
    if (io) {
      io.to(user.toString()).emit("budgetRequestSubmitted", {
        message: "Your budget request has been submitted for admin review.",
        budgetRequestId: budgetRequest._id,
        anonymousRequestId,
        status: "review_pending",
        notificationId: buyerNotification._id,
      });
    }

    // ========= FLEET OWNER GETS ANONYMOUS NOTIFICATION (Optional) =========
    // Create anonymous notification for fleet owner (they know someone is interested but not who)
    const fleetOwnerNotification = await Notification.create({
      user: fleetOwnerId,
      type: "budget_interest_anonymous",
      message: `Someone has shown interest in your auction. Their request is under admin review.`,
      auction: FleetAuctionId,
      budgetRequestId: budgetRequest._id,

      isRead: false,
    });

    // Send anonymous socket notification to fleet owner
    if (io) {
      io.to(fleetOwnerId.toString()).emit("anonymousInterest", {
        message: `Someone has shown interest in your auction.`,
        FleetAuctionId,
        anonymousRequestId,
        status: "admin_review_pending",
        notificationId: fleetOwnerNotification._id,
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        budgetRequestId: budgetRequest._id,
        anonymousRequestId,
        status: "review_pending",
        status: "pending",
        message:
          "Your budget request has been submitted for admin review. You will be notified once it's processed.",
        estimatedReviewTime: "24-48 hours",
      },
      message:
        "Budget request submitted successfully and is under admin review",
    });
  } catch (error) {
    console.error("Error creating budget request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const adminManageBudgetRequest = async (req, res) => {
  try {
    const { budgetRequestId } = req.params;
    const { action, adminNotes, showBuyerDetails } = req.body;
  
    // Find the budget request and populate user and fleetOwnerId
    const budgetRequest = await FleetBudget.findById(budgetRequestId)
      .populate("user", "firstName lastName email phone accountNumber")
      .populate(
        "fleetOwnerId",
        "firstName lastName email phone accountNumber company"
      )
      .populate({
        path: "fleetAuctionId",
        select: "company vehicleModel vehicleManufacturer",
        populate: {
          path: "user",
          select: "firstName lastName email", // Populate user details
        },
      });

    if (!budgetRequest) {
      return res.status(404).json({
        success: false,
        message: "Budget request not found",
      });
    }

    let updateData = {
      adminProcessedAt: new Date(),
      adminProcessedBy: null, // Update with actual admin ID if available
    };

    let notificationData = {};

    switch (action) {
      case "approve":
        updateData = {
          ...updateData,
          status: "approved",
          isAdminApproved: true,
          showBuyerDetails: showBuyerDetails || false,
          adminNotes: adminNotes || budgetRequest.adminNotes,
        };
        notificationData = {
          buyer: {
            type: "budget_approved",
            message: `Your budget request ${budgetRequest.anonymousRequestId} has been approved.`,
            pushTitle: "Budget Request Approved",
            link: `/user-profile/fleet-budget-request`,
          },
          fleetOwner: {
            type: "new_budget_request",
            message: `New approved budget request received for ${budgetRequest.anonymousRequestId}.`,
            pushTitle: "New Budget Request",
            link: `/user-profile/fleet-budget-request`,
          },
        };

        break;

      case "reject":
        updateData = {
          ...updateData,
          status: "rejected",
          adminNotes: adminNotes || budgetRequest.adminNotes,
        };
        notificationData = {
          buyer: {
            type: "budget_rejected",
            message: `Your budget request ${
              budgetRequest.anonymousRequestId
            } was rejected. ${adminNotes ? `Reason: ${adminNotes}` : ""}`,
            pushTitle: "Budget Request Rejected",
            link: `/user-profile/fleet-budget-request`,
          },
          // Optionally notify fleet owner about rejection (if required)
          fleetOwner: {
            type: "budget_rejected_anonymous",
            message: `A budget request (${budgetRequest.anonymousRequestId}) for your auction was rejected by the admin.`,
            pushTitle: "Budget Request Rejected",
            link: `/user-profile/fleet-budget-request`,
          },
        };

        break;
      case "info_requested":
        updateData = {
          ...updateData,
          status: "info_requested",
          showBuyerDetails: true,
          directContactEnabled: true,
        };
        notificationData = {
          buyer: {
            type: "contact_enabled",
            message: `info requested for request ${budgetRequest.anonymousRequestId}.`,
            pushTitle: "info requested",
            link: `/user-profile/fleet-budget-request`,
          },
          fleetOwner: {
            type: "contact_enabled",
            message: `Buyer details revealed for request ${budgetRequest.anonymousRequestId}.`,
            pushTitle: "Buyer Details Available",
            link: `/user-profile/fleet-budget-request`,
          },
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message:
            "Invalid action. Valid actions: approve, reject, info_requested",
        });
    }

    // Update the budget request
    const updatedRequest = await FleetBudget.findByIdAndUpdate(
      budgetRequestId,
      updateData,
      { new: true }
    );

    // Create notification for buyer
    if (notificationData.buyer) {
      const buyerNotification = await Notification.create({
        user: budgetRequest.user._id,
        type: notificationData.buyer.type,
        message: notificationData.buyer.message,
        budgetRequestId: budgetRequest._id,
        link: notificationData.buyer.link,
        isRead: false,
        createdAt: new Date(),
      });

      // Send socket notification to buyer
      if (io) {
        io.to(budgetRequest.user._id.toString()).emit(
          notificationData.buyer.type,
          {
            message: notificationData.buyer.message,
            budgetRequestId: budgetRequest._id,
            anonymousRequestId: budgetRequest.anonymousRequestId,
            notificationId: buyerNotification._id,
            timestamp: new Date().toISOString(),
          }
        );
      }

      // Send push notification to buyer
      if (budgetRequest.user.fcmToken) {
        try {
          await sendPushNotification(
            budgetRequest.user.fcmToken,
            notificationData.buyer.message,
            notificationData.buyer.pushTitle,
            {
              budgetRequestId: budgetRequest._id.toString(),
              anonymousRequestId: budgetRequest.anonymousRequestId,
              type: notificationData.buyer.type,
              link: notificationData.buyer.link,
            }
          );
        } catch (pushError) {
          console.error(
            `Failed to send push notification to buyer ${budgetRequest.user.name}:`,
            pushError
          );
        }
      }
    }

    // Notify fleet owner (if applicable)
    if (notificationData.fleetOwner && budgetRequest.fleetOwnerId) {
      const fleetOwnerNotification = await Notification.create({
        user: budgetRequest.fleetOwnerId._id,
        type: notificationData.fleetOwner.type,
        message: notificationData.fleetOwner.message,
        budgetRequestId: budgetRequest._id,
        link: notificationData.fleetOwner.link,
        isRead: false,
        createdAt: new Date(),
      });

      // Send socket notification to fleet owner
      if (io) {
        io.to(budgetRequest.fleetOwnerId._id.toString()).emit(
          notificationData.fleetOwner.type,
          {
            message: notificationData.fleetOwner.message,
            budgetRequestId: budgetRequest._id,
            anonymousRequestId: budgetRequest.anonymousRequestId,
            notificationId: fleetOwnerNotification._id,
            timestamp: new Date().toISOString(),
          }
        );
      }

      // Send push notification to fleet owner
      if (budgetRequest.fleetOwnerId.fcmToken) {
        try {
          await sendPushNotification(
            budgetRequest.fleetOwnerId.fcmToken,
            notificationData.fleetOwner.message,
            notificationData.fleetOwner.pushTitle,
            {
              budgetRequestId: budgetRequest._id.toString(),
              anonymousRequestId: budgetRequest.anonymousRequestId,
              type: notificationData.fleetOwner.type,
              link: notificationData.fleetOwner.link,
            }
          );
        } catch (pushError) {
          console.error(
            `Failed to send push notification to fleet owner ${budgetRequest.fleetOwnerId.name}:`,
            pushError
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: updatedRequest,
      message: `Budget request ${action} successfully`,
    });
  } catch (error) {
    console.error("Admin action error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAdminBudgetRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = "createdAt" } = req.query;

    const validStatuses = [
      "review_pending",
      "approved",
      "rejected",
      "info_requested",
    ];
    let query = {};
    if (status && validStatuses.includes(status)) {
      query.status = status;
    } else if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const skip = (page - 1) * limit;

    const budgetRequests = await FleetBudget.find(query)
      .populate("user", "firstName email phone accountNumber")
      .populate("fleetOwnerId", "name email phone accountNumber company")
      .populate("fleetAuctionId", "company vehicleModel vehicleManufacturer")
      .populate("adminProcessedBy", "name email")
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalRequests = await FleetBudget.countDocuments(query);

    const stats = await FleetBudget.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      review_pending: 0,
      approved: 0,
      rejected: 0,
      info_requested: 0,
      total: totalRequests, // Add total count for "All Requests"
    };

    stats.forEach((stat) => {
      if (statusCounts.hasOwnProperty(stat._id)) {
        statusCounts[stat._id] = stat.count;
      }
    });

    const requestsWithSummary = budgetRequests.map((request) => ({
      ...request.toObject(),
      totalBudget:
        (request.fullWrap || 0) +
        (request.oneSide || 0) +
        (request.bothSides || 0) +
        (request.rearDoors || 0),
      riskLevel: calculateRiskLevel(request),
      adminActionRequired: request.status === "review_pending",
      daysSinceSubmitted: Math.floor(
        (new Date() - new Date(request.createdAt)) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.status(200).json({
      success: true,
      data: requestsWithSummary,
      stats: statusCounts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
        hasNext: skip + budgetRequests.length < totalRequests,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin budget requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
export const fetchBudgetRequestsForFleetOwner = async (req, res) => {
  try {
    const { fleetOwnerId } = req.params;

    if (!fleetOwnerId) {
      return res.status(400).json({
        success: false,
        message: "Fleet Owner ID is required",
      });
    }

    // ✅ SIMPLIFIED QUERY - Remove isAdminApproved filter since field doesn't exist
    const budgetRequests = await FleetBudget.find({
      fleetOwnerId: fleetOwnerId,
      status: { $in: ["approved", "direct_contact_enabled"] },
      // ❌ REMOVED: isAdminApproved: true (field doesn't exist in schema)
    })
      .populate("user", "name email phone accountNumber")
      .populate("fleetAuctionId", "company vehicleModel vehicleManufacturer")
      .sort({ adminProcessedAt: -1, createdAt: -1 });

    if (!budgetRequests || budgetRequests.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: "No approved budget requests found for this fleet owner",
        data: [],
      });
    }

    // Filter buyer details based on admin settings
    const filteredRequests = budgetRequests.map((request) => {
      const requestObj = request.toObject();

      // ✅ Use showBuyerDetails if exists, otherwise default to false
      const showBuyerDetails = request.showBuyerDetails || false;

      if (!showBuyerDetails) {
        // Hide buyer details if admin hasn't approved showing them
        requestObj.user = {
          _id: request.user._id,
          anonymousId: request.anonymousBuyerId || `ANON_${request._id}`,
          name: "Anonymous Buyer",
          email: "***@***.com",
          phone: "***-***-****",
          accountNumber: "ANON-" + request._id.toString().slice(-6),
        };
      }

      return {
        ...requestObj,
        canContactDirectly: request.directContactEnabled || false,
        adminApproved: request.status,
        adminNotes: request.showSellerDetails ? request.adminNotes || "" : "",
        totalBudget:
          (request.fullWrap || 0) +
          (request.oneSide || 0) +
          (request.bothSides || 0) +
          (request.rearDoors || 0),
        showBuyerDetails: showBuyerDetails,
      };
    });

    res.status(200).json({
      success: true,
      count: filteredRequests.length,
      data: filteredRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching budget requests:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Helper function to calculate risk level
const calculateRiskLevel = (request) => {
  const totalBudget =
    (request.fullWrap || 0) +
    (request.oneSide || 0) +
    (request.bothSides || 0) +
    (request.rearDoors || 0);

  if (totalBudget > 100000) return "high";
  if (totalBudget > 50000) return "medium";
  return "low";
};

// Send Fleet Recommendation (Only for approved requests)
export const sendFleetRecommendation = async (req, res) => {
  try {
    const { buyerId, fleetOwnerId, budgetRequestId, auctionIds, message } =
      req.body;

    // Validate required fields
    if (
      !buyerId ||
      !fleetOwnerId ||
      !budgetRequestId ||
      !auctionIds ||
      !Array.isArray(auctionIds)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: buyerId, fleetOwnerId, budgetRequestId, and auctionIds are required",
      });
    }

    // Check if the budget request is admin approved
    const budgetRequest = await FleetBudget.findById(budgetRequestId)
      .populate("user", "name email fcmToken")
      .populate("fleetOwnerId", "name email company");

    if (!budgetRequest) {
      return res.status(404).json({
        success: false,
        message: "Budget request not found",
      });
    }

    if (
      budgetRequest.status !== "approved" &&
      budgetRequest.status !== "direct_contact_enabled"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This budget request is not approved by admin yet. Please wait for admin approval.",
      });
    }

    if (!budgetRequest.status) {
      return res.status(403).json({
        success: false,
        message:
          "This budget request requires admin approval before recommendations can be sent.",
      });
    }

    // Generate anonymous recommendation ID
    const anonymousRecommendationId = `REC_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create the recommendation with correct status value
    // Replace "sent" with the correct enum value from your schema
    // Common alternatives: "pending", "active", "delivered", "submitted"
    const recommendation = await FleetRecommendation.create({
      buyerId,
      fleetOwnerId,
      budgetRequestId,
      auctionIds,
      message:
        message || `You have ${auctionIds.length} new fleet recommendations!`,
      anonymousRecommendationId,
      status: "active", // Using valid enum value from schema
      adminNotified: true,
      sentAt: new Date(),
    });

    // Update budget request - using valid enum value
    await FleetBudget.findByIdAndUpdate(budgetRequestId, {
      // Remove invalid status update since 'recommendation_sent' is not in enum
      lastRecommendationSent: new Date(),
    });

    // Notify admin about the recommendation
    const adminUsers = await User.find({ role: "admin" });
    for (const admin of adminUsers) {
      await Notification.create({
        user: admin._id,
        type: "recommendation_sent",
        message: `Fleet Owner ${budgetRequest.fleetOwnerId.name} sent Recommendation ${anonymousRecommendationId} for Budget Request ${budgetRequest.anonymousRequestId}`,

        recommendationId: recommendation._id,
        budgetRequestId: budgetRequest._id,
        link: `/admin/recommendations/${recommendation._id}`,
      });
    }

    // Determine notification message based on seller details visibility
    const buyerNotificationMessage = `You Received A Recommendation For Your Request`;

    // Send notification to buyer
    const buyerNotification = await Notification.create({
      user: buyerId,
      type: "recommendation_received",
      message: buyerNotificationMessage,
      recommendationId: recommendation._id,
      budgetRequestId: budgetRequest._id,
      link: `/recommendations/${recommendation._id}`,
    });

    // Socket notification to buyer
    if (io) {
      io.to(buyerId.toString()).emit("newRecommendation", {
        message: "You Have Received A New Recommendation",
        recommendationId: recommendation._id,
        anonymousRecommendationId,
        budgetRequestId: budgetRequest._id,
        auctionCount: auctionIds.length,
        notificationId: buyerNotification._id,
      });
    }

    // Push notification to buyer
    if (budgetRequest.user.fcmToken) {
      try {
        await sendPushNotification(
          budgetRequest.user.fcmToken,
          buyerNotificationMessage,
          "New Fleet Recommendation",
          {
            recommendationId: recommendation._id,
            budgetRequestId: budgetRequest._id,
            anonymousRecommendationId,
            type: "recommendation_received",
            auctionIds: JSON.stringify(auctionIds),
          }
        );
      } catch (pushError) {
        console.error("Failed to send push notification to buyer:", pushError);
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        recommendation,
        anonymousRecommendationId,
        auctionCount: auctionIds.length,
      },
      message: "Recommendation sent successfully",
    });
  } catch (error) {
    console.error("Error sending recommendation:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Fixed: Get fleet auctions with budget comparison
export const fetchFleetRecommendedAuctions = async (req, res) => {
  try {
    const { fleetOwnerId } = req.params;
    const { budgetRequestId } = req.query; // Get budget request ID from query params

    if (!fleetOwnerId) {
      return res.status(400).json({
        success: false,
        message: "Fleet Owner ID is required",
      });
    }

    // Get budget request details if provided
    let budgetRequest = null;
    if (budgetRequestId) {
      budgetRequest = await FleetBudget.findById(budgetRequestId);
    }

    // Fetch all auctions for this fleet owner
    const auctions = await FleetOwner.find({ user: fleetOwnerId });

    // If we have budget request, create comparison data
    let result = [];
    if (budgetRequest && auctions.length > 0) {
      result = auctions.map((auction) => {
        // Calculate price comparison percentages
        const priceComparison = {
          fullWrap: {
            auctionPrice: auction.minAuctionRates?.fullWrap || 0,
            budgetPrice: budgetRequest.fullWrap || 0,
            percentage:
              auction.minAuctionRates?.fullWrap && budgetRequest.fullWrap
                ? Math.round(
                    (auction.minAuctionRates.fullWrap /
                      budgetRequest.fullWrap) *
                      100
                  )
                : 0,
          },
          oneSide: {
            auctionPrice: auction.minAuctionRates?.oneSide || 0,
            budgetPrice: budgetRequest.oneSide || 0,
            percentage:
              auction.minAuctionRates?.oneSide && budgetRequest.oneSide
                ? Math.round(
                    (auction.minAuctionRates.oneSide / budgetRequest.oneSide) *
                      100
                  )
                : 0,
          },
          bothSides: {
            auctionPrice: auction.minAuctionRates?.bothSides || 0,
            budgetPrice: budgetRequest.bothSides || 0,
            percentage:
              auction.minAuctionRates?.bothSides && budgetRequest.bothSides
                ? Math.round(
                    (auction.minAuctionRates.bothSides /
                      budgetRequest.bothSides) *
                      100
                  )
                : 0,
          },
          rearDoors: {
            auctionPrice: auction.minAuctionRates?.rearDoors || 0,
            budgetPrice: budgetRequest.rearDoors || 0,
            percentage:
              auction.minAuctionRates?.rearDoors && budgetRequest.rearDoors
                ? Math.round(
                    (auction.minAuctionRates.rearDoors /
                      budgetRequest.rearDoors) *
                      100
                  )
                : 0,
          },
        };

        return {
          auction: {
            _id: auction._id,
            user: auction.user,
            company: auction.company,
            accountNumber: auction.accountNumber,
            suburb: auction.suburb,
            townOrCity: auction.townOrCity,
            state: auction.state,
            country: auction.country,
            zipCodesCovered: auction.zipCodesCovered,
            interRoutes: auction.interRoutes,
            minAuctionRates: auction.minAuctionRates,
            buyNowRates: auction.buyNowRates,
            discountOffers: auction.discountOffers,
            vehicleManufacturer: auction.vehicleManufacturer,
            yearofmanufacturer: auction.yearofmanufacturer,
            vehicleModel: auction.vehicleModel,
            vehicleAvailability: auction.vehicleAvailability,
            prohibitedAds: auction.prohibitedAds,
            images: auction.images,
            location: auction.location,
            createdAt: auction.createdAt,
            updatedAt: auction.updatedAt,
          },
          priceComparison,
          budgetRequest: budgetRequestId
            ? {
                _id: budgetRequest._id,
                fullWrap: budgetRequest.fullWrap,
                oneSide: budgetRequest.oneSide,
                bothSides: budgetRequest.bothSides,
                rearDoors: budgetRequest.rearDoors,
              }
            : null,
        };
      });
    } else {
      // If no budget request, return basic auction info
      result = auctions.map((auction) => ({
        auction: {
          _id: auction._id,
          user: auction.user,
          company: auction.company,
          accountNumber: auction.accountNumber,
          suburb: auction.suburb,
          townOrCity: auction.townOrCity,
          state: auction.state,
          country: auction.country,
          zipCodesCovered: auction.zipCodesCovered,
          interRoutes: auction.interRoutes,
          minAuctionRates: auction.minAuctionRates,
          buyNowRates: auction.buyNowRates,
          discountOffers: auction.discountOffers,
          vehicleManufacturer: auction.vehicleManufacturer,
          yearofmanufacturer: auction.yearofmanufacturer,
          vehicleModel: auction.vehicleModel,
          vehicleAvailability: auction.vehicleAvailability,
          prohibitedAds: auction.prohibitedAds,
          images: auction.images,
          location: auction.location,
          createdAt: auction.createdAt,
          updatedAt: auction.updatedAt,
        },
      }));
    }

    return res.status(200).json({
      success: true,
      totalAuctions: result.length,
      data: result,
      hasBudgetComparison: !!budgetRequest,
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Fixed: Send fleet recommendation
// export const sendFleetRecommendation = async (req, res) => {
//   try {
//     const {
//       buyerId,
//       fleetOwnerId,

//       auctionIds,
//       message,
//       budgetRequestId
//     } = req.body;

//     // Validate required fields
//     if (!buyerId || !fleetOwnerId || !budgetRequestId || !auctionIds || !Array.isArray(auctionIds)) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: buyerId, fleetOwnerId, budgetRequestId, and auctionIds are required"
//       });
//     }

//     // Find the target user (buyer)
//     const targetUser = await User.findById(buyerId);
//     if (!targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: "Buyer not found"
//       });
//     }

//     // Create recommendation
//     const recommendation = await FleetRecommendation.create({
//       buyerId,
//       fleetOwnerId,
//       auctionIds,
//       message: message || `You have ${auctionIds.length} new fleet recommendations!`,
//       budgetRequestId,
//       status: 'pending'
//     });

//     // Update the budget request status
//     await FleetBudget.findByIdAndUpdate(budgetRequestId, {
//       status: 'recommendation_sent',
//       lastUpdated: new Date()
//     });

//     // Real-time notification via socket
//     if (io) {
//       io.to(buyerId.toString()).emit("newRecommendation", {
//         message: message || `You have ${auctionIds.length} new recommendations!`,
//         recommendationId: recommendation._id,
//         auctionIds,
//         timestamp: new Date().toISOString()
//       });
//     }

//     // Create notification record
//     const notification = await Notification.create({
//       user: buyerId,
//       type: "fleet_recommendation",
//       message: message || `You have ${auctionIds.length} new fleet recommendations!`,
//       relatedId: recommendation._id,
//       link: `/recommendations/${recommendation._id}`,
//     });

//     // Push Notification
//     if (targetUser.fcmToken) {
//       try {
//         const fcmMessage = {
//           token: targetUser.fcmToken,
//           notification: {
//             title: "New Fleet Recommendations",
//             body: message || `You have ${auctionIds.length} new fleet recommendations!`
//           },
//           data: {
//             recommendationId: recommendation._id.toString(),
//             type: "fleet_recommendation",
//             click_action: `/recommendations/${recommendation._id}`,
//             auctionIds: JSON.stringify(auctionIds)
//           }
//         };

//         await admin.messaging().send(fcmMessage);
//
//       } catch (pushError) {
//         console.error("Push notification error:", pushError);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Recommendations sent successfully",
//       data: {
//         recommendation,
//         notification,
//         auctionIds
//       }
//     });

//   } catch (error) {
//     console.error("Error sending recommendation:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

export const getalluserRecomendatinfleetauction = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const filter = {
      $or: [{ buyerId: userId }, { fleetOwnerId: userId }],
    };

    const recommendations = await FleetRecommendation.find(filter)
      .populate({
        path: "auctionIds",
        model: "FleetOwner", // must match exact model registration
        select: "title vehicleType price imageUrl", // optional fields
      })
      .populate("fleetOwnerId", "name email")
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getfleetauctionbyid = async (req, res) => {
  try {
    const form = await FleetOwner.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Fleet Owner form not found",
      });
    }
    const currentBid = await Bid.findOne({
      auction: req.params.id, // Assuming `auction` refers to FleetAuction ID
      auctionType: "fleetauction",
    })
      .sort({ bidTime: -1 }) // Latest bidTime first
      .populate("bidder", "firstName lastName email") // Optional: populate bidder info
      .lean();
    res.json({
      success: true,
      data: {
        ...form.toObject(), // Spread all form properties
        currentBid: currentBid || null, // Add currentBid to the data object
      },
    });
  } catch (err) {
    console.error("Error fetching fleet owner form by ID:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch form",
      error: err.message,
    });
  }
};
