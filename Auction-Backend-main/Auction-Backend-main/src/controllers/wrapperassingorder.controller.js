import Order from "../models/Order.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import sendPushNotification from '../firebase/firebaseAdmin.js';
import WrapperAssignment from "../models/wrapperassignment.model.js";

export const getWrappersForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("fleetOwner")
      .populate("assignedWrapper", "firstName email city state country userType");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const fleetOwner = order.fleetOwner;
    if (!fleetOwner || (!fleetOwner.city && !fleetOwner.state && !fleetOwner.country)) {
      return res.status(400).json({ message: "No wrapper available in this city/state/country" });
    }

    const fleetCity = fleetOwner.city?.trim() || "";
    const fleetState = fleetOwner.state?.trim() || "";
    const fleetCountry = fleetOwner.country?.trim() || "";

    // ✅ Fetch all active assignments
    const activeAssignments = await WrapperAssignment.find({
      status: { $nin: ["DELIVERED", "CANCELLED"] },
    }).select("wrapper order");

    // ✅ Convert to string IDs
    const assignedWrapperIds = activeAssignments.map((a) => a.wrapper.toString());

    let matchingWrappers = [];

    // 1️⃣ City + State + Country
    if (fleetCity && fleetState && fleetCountry) {
      matchingWrappers = await User.find({
        userType: "wrapper",
        city: { $regex: `^${fleetCity}$`, $options: "i" },
        state: { $regex: `^${fleetState}$`, $options: "i" },
        country: { $regex: `^${fleetCountry}$`, $options: "i" },
      }).select("-password -resetOtp -resetOtpExpires");
    }

    // 2️⃣ State + Country
    if (matchingWrappers.length === 0 && fleetState && fleetCountry) {
      matchingWrappers = await User.find({
        userType: "wrapper",
        state: { $regex: `^${fleetState}$`, $options: "i" },
        country: { $regex: `^${fleetCountry}$`, $options: "i" },
      }).select("-password -resetOtp -resetOtpExpires");
    }

    // 3️⃣ Country only
    if (matchingWrappers.length === 0 && fleetCountry) {
      matchingWrappers = await User.find({
        userType: "wrapper",
        country: { $regex: `^${fleetCountry}$`, $options: "i" },
      }).select("-password -resetOtp -resetOtpExpires");
    }

    // 4️⃣ City only
    if (matchingWrappers.length === 0 && fleetCity) {
      matchingWrappers = await User.find({
        userType: "wrapper",
        city: { $regex: `^${fleetCity}$`, $options: "i" },
      }).select("-password -resetOtp -resetOtpExpires");
    }

    // 5️⃣ No wrapper found
    if (matchingWrappers.length === 0) {
      return res.status(404).json({
        message: "No wrapper available in this city/state/country",
        fleetOwner: {
          _id: fleetOwner._id,
          name: fleetOwner.firstName,
          city: fleetOwner.city,
          state: fleetOwner.state,
          country: fleetOwner.country,
        },
      });
    }

    // ✅ Mark each wrapper's status
    const wrappersWithStatus = matchingWrappers.map((wrapper) => ({
      ...wrapper.toObject(),
      assignmentStatus: assignedWrapperIds.includes(wrapper._id.toString())
        ? "Already Assigned"
        : "Available",
    }));

    res.status(200).json({
      wrapType: order.wrapType,
      fleetOwner: {
        _id: fleetOwner._id,
        name: fleetOwner.firstName,
        city: fleetOwner.city,
        state: fleetOwner.state,
        country: fleetOwner.country,
      },
      matchingWrappers: wrappersWithStatus,
      alreadyAssigned: assignedWrapperIds, // ✅ explicitly return
      count: wrappersWithStatus.length,
    });
  } catch (error) {
    console.error("Error fetching wrappers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const assignWrapperToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;  
    const { wrapperId } = req.body;

    if (!orderId || !wrapperId) {
      return res.status(400).json({ message: "Order ID and Wrapper ID are required" });
    }

    // Check if wrapper is already assigned to this order (excluding DELIVERED status)
    const existingAssignment = await WrapperAssignment.findOne({
      order: orderId,
      wrapper: wrapperId,
      status: { $nin: ["DELIVERED", "CANCELLED"] }
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        message: "This wrapper is already assigned to this order",
        assignmentId: existingAssignment._id
      });
    }

    const order = await Order.findById(orderId);
    const wrapper = await User.findById(wrapperId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!wrapper || wrapper.userType !== "wrapper") return res.status(404).json({ message: "Wrapper not found" });

    order.assignedWrapper = wrapperId;
    order.assignmentDate = new Date();
    await order.save();

    const wrapperAssignmentLog = new WrapperAssignment({
      order: order._id,
      wrapper: wrapper._id,
      vehicleDetails: order.vehicleDetails,
      assignedAt: new Date(),
    });
    await wrapperAssignmentLog.save();

    const wrapperNotification = new Notification({
      user: wrapperId,
      order: orderId,
      message: `You have been assigned a new order #${order._id.toString().substring(0, 8)}`,
      type: "wrapper_assignment",
      link: `/user-profile/wrapper-order-details/${orderId}`,
      isImportant: false,
    });
    await wrapperNotification.save();

    if (wrapper.fcmToken) {
      await sendPushNotification(
        wrapper.fcmToken,
        "New Vehicle Assignment",
        `You have been assigned a new order #${order._id.toString().substring(0, 8)}`,
        { orderId: order._id.toString(), type: "wrapper_assignment", link: `/user-profile/order-page` }
      );
    }

    if (order.fleetOwner) {
      const fleetOwnerNotification = new Notification({
        user: order.fleetOwner,
        order: orderId,
        message: `A wrapper has been assigned to your order #${order._id.toString().substring(0, 8)}`,
        type: "order_update",
        isImportant: false,
      });
      await fleetOwnerNotification.save();

      const fleetOwner = await User.findById(order.fleetOwner);
      if (fleetOwner?.fcmToken) {
        await sendPushNotification(
          fleetOwner.fcmToken,
          "Wrapper Assigned",
          `A wrapper has been assigned to your order #${order._id.toString().substring(0, 8)}`,
          { orderId: order._id.toString(), type: "order_update", link: `/fleet-owner/orders` }
        );
      }
    }

    const updatedOrder = await Order.findById(orderId).populate("assignedWrapper");

    res.status(200).json({
      message: "Wrapper assigned successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error assigning wrapper:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getWrapperOrders = async (req, res) => {
  try {
    const { wrapperId } = req.params; 

    if (!wrapperId) {
      return res.status(400).json({ message: "wrapperId is required" });
    }

    const filter = { wrapper: wrapperId };

    const assignments = await WrapperAssignment.find(filter)
      .populate({
        path: "order",
        model: "Order",
        populate: [
          {
            path: "fleetAuction.fleetAuctionId",
            model: "FleetOwner",
            select: `
              _id user startTime endTime bids purchaseStatus status currentBids 
              fullWrap oneSide bothSides rearDoors vehicleWrapCpms company 
              accountNumber suburb townOrCity state country zipCodesCovered 
              interRoutes minAuctionRates buyNowRates discountOffers 
              vehicleManufacturer vehicleModel yearofmanufacturer 
              vehicleAvailability prohibitedAds images location additionalLocations 
              isApprovedByAdmin createdAt updatedAt
            `,
          },
          {
            path: "products.productId",
            model: "FleetOwner",
            select: "vehicleManufacturer vehicleModel yearofmanufacturer images location",
          },
          {
            path: "auction.auctionId",
            model: "FleetOwner",
            select: `
              _id user startTime endTime bids purchaseStatus status currentBids 
              fullWrap oneSide bothSides rearDoors vehicleWrapCpms company 
              accountNumber suburb townOrCity state country zipCodesCovered 
              interRoutes minAuctionRates buyNowRates discountOffers 
              vehicleManufacturer vehicleModel yearofmanufacturer 
              vehicleAvailability prohibitedAds images location additionalLocations 
              isApprovedByAdmin createdAt updatedAt
            `,
          },
        ],
      })
      .populate("wrapper", "firstName lastName email");

    res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Error in getWrapperOrders:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateWrapperAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, acceptStatus } = req.body;

    const assignment = await WrapperAssignment.findById(assignmentId)
      .populate("order")
      .populate("wrapper");

    if (!assignment) {
      console.error("Assignment not found for ID:", assignmentId);
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (status) {
      assignment.status = status;
    }
    if (acceptStatus) {
      assignment.acceptStatus = acceptStatus;
    }

    await assignment.save();

    const adminUsers = await User.find({ userType: "admin" });

    if (!adminUsers || adminUsers.length === 0) {
      console.warn("No admin users found for notification. Falling back to logging.");
      const fallbackNotification = new Notification({
        user: null,
        message: `No admins found. Wrapper ${assignment.wrapper.firstName} updated order ${assignment.order._id} to status: ${status || assignment.status}, acceptStatus: ${acceptStatus || assignment.acceptStatus}`,
        type: "SYSTEM_LOG",
        relatedId: assignment._id,
        link: `/admin/assign-wrapper/${assignment.order._id}`,
        read: false,
        createdAt: new Date(),
      });
      await fallbackNotification.save();
    } else {
      for (const adminUser of adminUsers) {
        let notificationMessage = "";
        if (status) {
          notificationMessage = `Wrapper ${assignment.wrapper.firstName} updated order ${assignment.order._id} to status: ${status}`;
        } else if (acceptStatus) {
          notificationMessage = `Wrapper ${assignment.wrapper.firstName} ${acceptStatus === "ACCEPTED" ? "accepted" : "rejected"} order ${assignment.order._id}`;
        }

        if (notificationMessage) {
          const notification = new Notification({
            user: adminUser._id,
            message: notificationMessage,
            type: "ORDER_STATUS_UPDATE",
            relatedId: assignment._id,
            link: `/admin/assign-wrapper/${assignment.order._id}`,
            read: false,
            createdAt: new Date(),
          });
          await notification.save();

          if (adminUser.fcmToken) {
            try {
              await sendPushNotification(
                adminUser.fcmToken,
                `Order ${status ? status.toLowerCase() : acceptStatus.toLowerCase()}`,
                notificationMessage,
                {
                  assignmentId: assignment._id.toString(),
                  orderId: assignment.order._id.toString(),
                  link: `/admin/assign-wrapper/${assignment.order._id}`,
                  type: "ORDER_STATUS_UPDATE",
                }
              );
            } catch (pushError) {
              console.error("Error sending push notification to admin", adminUser._id, ":", pushError);
            }
          } else {
            console.warn(`No FCM token for admin ${adminUser._id}`);
          }
        }
      }
    }

    if (status === "DELIVERED") {
      const order = await Order.findById(assignment.order._id);
      if (order) {
        order.assignedWrapper = null;
        order.assignmentDate = null;
        await order.save();
      }
    }

    res.status(200).json({
      message: `Assignment updated successfully`,
      assignment,
    });
  } catch (error) {
    console.error("Error in updateWrapperAssignmentStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAssignmentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const assignment = await WrapperAssignment.findOne({ order: orderId })
      .populate({
        path: "order",
        model: "Order",
        populate: [
          { path: "userId" },
          { path: "seller" },
          { path: "assignedWrapper" },
          { path: "fleetOwner" },
          { path: "auction.auctionId" },
          { path: "fleetAuction.fleetAuctionId" },
          { path: "products.productId" },
        ],
      })
      .populate("wrapper");

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found for this order" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error in getAssignmentByOrderId:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// controller
export const getAllAssignmentsStatus = async (req, res) => {
  try {
    const assignments = await WrapperAssignment.find()
      .select("status acceptStatus wrapper -_id")
      .populate("wrapper", "_id"); // wrapper का _id populate करें

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error in getAllAssignmentsStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

