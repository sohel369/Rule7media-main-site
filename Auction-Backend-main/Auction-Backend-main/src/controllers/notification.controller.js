import dotenv from "dotenv";
dotenv.config();
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Notification from "../models/notification.model.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { getEmailTransporter, getFromAddress } from "../utils/emailTransporter.js";
import Order from "../models/Order.js";
import getEmailTemplate from "../emailTemplate.js";
import { fileURLToPath } from "url";
import path from "path";
import Product from "../models/Product.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";
import { log } from "console";
import FleetOwner from "../models/fleetowner.model.js";
// @desc send notification
// @route POST /api/v1/send-notification
// @access Private
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendNotification = asyncHandler(async (req, res) => {
  const { auctionId, type, newBidAmount } = req.body;

  

  if (!auctionId || !type || !newBidAmount) {
    return res.status(400).json(new ApiResponse(400, "Auction ID, type and new bid amount are required"));
  }

  let auction = await Auction.findById(auctionId);
  let auctionType = "auction";

  if (!auction) {
    // Try in FleetAuction
    auction = await FleetOwner.findById(auctionId);
    auctionType = "fleetauction";
  }

  if (!auction) {
 
    return res.status(404).json(new ApiResponse(404, "Auction not found"));
  }



  try {
    const bids = await Bid.find({ auction: auctionId });
 

    const bidderIds = new Set(bids.map((bid) => bid.bidder.toString()));
 

    const fleetOwnerIds = new Set(
      bids
        .filter((bid) => bid.auctionType === "fleetauction")
        .map((bid) => bid.fleetOwner?.toString())
        .filter(Boolean)
    );
  

    const userIds = new Set([
      ...bidderIds,
      ...(auctionType === "fleetauction" ? fleetOwnerIds : [auction.seller.toString()])
    ]);

    

    const baseNotification = {
      auction: auctionId,
      link:
        auctionType === "fleetauction"
          ? `/single-fleet-auction-detail/${auctionId}`
          : `/single-auction-detail/${auctionId}`,
      type: "BID_PLACED"
    };
const auctionTitle = auction.name || auction.company || "this auction";
    for (const id of userIds) {
     const message =
  id === req?.user?._id.toString()
    ? `You placed a ${newBidAmount} bid on ${auctionTitle}`
    : `${req?.user?.firstName} placed a ${newBidAmount} bid on ${auctionTitle}`;

      await new Notification({
        ...baseNotification,
        user: id,
        message
      }).save();

    }

    return res.status(200).json(new ApiResponse(200, "Notification sent successfully"));
  } catch (error) {
    console.error("Notification error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});



// @desc Get all notifications for a user
// @route GET /api/v1/notifications/get-notification/:userId
// @access Private

const getUserNotifications = asyncHandler(async (req, res) => {
  if (!req?.user?._id) {
    return res.status(400).json(new ApiResponse(400, "User ID is required"));
  }
  
  try {
    const notifications = await Notification.find({
      user: req.user._id // simplified from req?.user?._id
    })
    .sort({ createdAt: -1 })
    .populate([
      {
        path: "auction",
        select: "name image",
        populate: {
          path: "bids",
          model: "Bid"
        }
      },
      {
        path: "order", // populate order details if exists
        select: "amount status"
      }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, "Notifications found", notifications));
      
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
////////Purchase notification
// Add this to your existing notification controller

// @desc mark notification as read
// @route PUT /api/v1/notifications/mark-as-read/:id
// @access Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req?.params?.id);

  if (!notification) {
    return res.status(404).json(new ApiResponse(404, "Notification not found"));
  }

  notification.isRead = true;
  await notification.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Notification marked as read"));
});

// @desc mark all notification as read
// @route PUT /api/v1/notifications/mark-all-as-read
// @access Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req?.user?._id },
    { $set: { isRead: true } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "All notifications marked as read"));
});

const sendOrderStatusNotification = asyncHandler(async (req, res) => {
  const { userId, orderId, status } = req.body;

  if (!userId || !orderId || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid Order ID format" });
  }
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const notification = {
      user: new mongoose.Types.ObjectId(userId),
      message: `Your order status has been updated to '${status}'`,
      type: "ORDER_STATUS",
      order: orderId,
      link: `/order-details/${orderId}` || "/default-link",
    };

    

    await new Notification(notification).save();

    res
      .status(200)
      .json({
        success: true,
        message: "Order notification sent successfully!",
      });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ error: error.message });
  }
});


/////////////send order notification in user email
const sendOrderStatusUserEmail = async (emailData) => {
  try {
    const { 
      email,
      country = 'US', 
      userId,
      orderId,
      status,
      products = []
    } = emailData;
  
    
    if (!email || !orderId || !status) {
      throw new Error("Missing required fields (email, orderId, status)");
    }

    let user = { email, firstName: "Customer" };
    if (userId) {
      const userData = await User.findById(userId).lean();
      if (userData) {
        user = {
          email: userData.email || email,
          firstName: userData.firstName || "Customer"
        };
      }
    }

    let countryKey = 'US'; 
    
    if (country) {
      if (typeof country === 'string') {
        if (country.length === 2) {
          countryKey = country.toUpperCase();
        } else if (country.length > 2) {
          countryKey = country.substring(0, 2).toUpperCase();
        }
      }
    }
    
    const transporter = await getEmailTransporter();
    const fromAddress = await getFromAddress();

    const productName = products[0]?.productId?.name || "your product";

    const statusMessages = {
      DELIVERED: `Hooray! Your order <b>${productName}</b> has been successfully delivered.`,
      PENDING: `Your order <b>${productName}</b> is being processed.`,
      PREPARE_FOR_DELIVERY: `Your order <b>${productName}</b> is being <b>prepared for delivery</b>.`,
      Delivered: `Hooray! Your order <b>${productName}</b> has been successfully <b>delivered.</b>`,
      Pending: `Your order <b>${productName}</b> is being processed.`,
      "Prepare for delivery": `Your order <b>${productName}</b> is being <b>prepared for delivery.</b>`,
    };

    const message = statusMessages[status] || 
      `Your order status has been updated to '<b>${status}</b>'.`;

    const emailContent = `
      <p style="font-size: 16px;">Dear ${user.firstName},</p>
      <p style="font-size: 16px;">${message}</p>
      <p style="font-size: 14px;">Order ID: ${orderId}</p>
      <p style="font-size: 14px;">Thank you for shopping with us!</p>
    `;

    const mailOptions = {
      from: fromAddress,
      to: user.email,
      subject: `Order Status Update - ${productName}`,
      html: getEmailTemplate("Order Status Update", emailContent),
      attachments: [
        {
          filename: "header.png",
          path: path.join(__dirname, "..", "header.png"),
          cid: "header",
        },
        {
          filename: "footer.png",
          path: path.join(__dirname, "..", "footer.png"),
          cid: "footer",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    
    return { success: true };

  } catch (error) {
    console.error("Email sending error:", error.message);
    throw error;
  }
};


export {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendOrderStatusNotification,
  sendOrderStatusUserEmail,
};