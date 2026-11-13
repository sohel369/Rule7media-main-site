import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  sendOrderStatusNotification,
  sendOrderStatusUserEmail,
} from "./notification.controller.js";
import PDFDocument from "pdfkit";
import User from "../models/user.model.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";
import FleetOwner from "../models/fleetowner.model.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import WrapperAssignment from "../models/wrapperassignment.model.js";
// 🟢 Place Order
export const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      products,
      totalPrice,
      paymentMethod,
      description,
      address,
      sessionId,
    } = req.body;

    // Validate required fields
    if (!userId || !products || !totalPrice || !paymentMethod || !address) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Required order details are missing", null));
    }

    // Validate payment method
    let validPaymentMethod = paymentMethod;

    const firstProduct = products[0];
    const productDetails = await Product.findById(firstProduct.productId);

    if (!productDetails) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Product not found", null));
    }

    const sellerId = productDetails.seller;

    // Set initial payment status based on payment method
    const paymentStatus = paymentMethod === "CARD" ? "PAID" : "UNPAID";

    const order = new Order({
      userId,
      products: products.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
        image: Array.isArray(product.image) ? product.image : [product.image],
      })),
      seller: sellerId,
      totalPrice,
      paymentMethod: validPaymentMethod,
      status: "PENDING",
      paymentStatus, // Set payment status based on payment method
      description,
      address,
      paymentSessionId: sessionId, // Save session ID if provided
      // Status defaults to "Pending"
    });

    // Save to database
    const savedOrder = await order.save();

    // If it's a COD order, create notification for seller
    if (paymentMethod === "COD") {
      try {
        const notification = new Notification({
          user: sellerId,
          type: "NEW_ORDER",
          title: `New COD Order #${savedOrder._id
            .toString()
            .substring(18, 24)}`,
          message: `You have received a new Cash on Delivery order worth ${totalPrice.toFixed(
            2
          )}`,
          metadata: {
            orderId: savedOrder._id,
            amount: totalPrice,
          },
          read: false,
        });
        await notification.save();

        // Send push notification to seller (if implemented)
        const seller = await User.findById(sellerId).select("fcmToken");
        if (seller && seller.fcmToken) {
          await sendPushNotification(
            seller.fcmToken,
            "New COD Order",
            `You've received a new Cash on Delivery order worth ${totalPrice.toFixed(
              2
            )}`
          );
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't fail the API call if notification fails
      }
    }

    // Return response
    return res
      .status(201)
      .json(new ApiResponse(201, "Order created successfully", savedOrder));
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, error.message || "Internal Server Error", null)
      );
  }
};

const updateFleetWrapPurchase = async (fleetAuctionId, wrapType) => {
  try {
    await FleetOwner.findByIdAndUpdate(
      fleetAuctionId,
      { $addToSet: { purchasedWrapTypes: wrapType } },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating purchased wrap types:", error);
  }
};

export const placeAuctionOrder = async (req, res) => {
  try {
    const {
      userId,
      auction,
      fleetAuction,
      totalPrice,
      paymentMethod,
      description,
      address,
      wrapType,
    } = req.body;

    // Validate required fields
    if (!userId || !totalPrice || !paymentMethod || !address) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Required order details are missing", null));
    }

    let orderItems = [];
    let sellerId;

    if (Array.isArray(fleetAuction) && fleetAuction.length > 0) {
      // ---- Fleet Auction case ----
      const fleetItemId = fleetAuction[0].fleetAuctionId;
      const fleetItem = await FleetOwner.findById(fleetItemId);
      if (!fleetItem) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Fleet auction item not found", null));
      }

      if (!fleetItem.fleetOwner && !fleetItem.user) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Fleet owner info not found", null));
      }
      if (req.body.fleetAuction && req.body.fleetAuction.length > 0) {
        for (const fleetItem of req.body.fleetAuction) {
          if (fleetItem.wrapType && fleetItem.fleetAuctionId) {
            await updateFleetWrapPurchase(
              fleetItem.fleetAuctionId,
              fleetItem.wrapType
            );
          }
        }
      }
      // Seller is fleetOwner or fallback to user
      sellerId = fleetItem.fleetOwner || fleetItem.user;

      // Map fleetAuction items to orderItems with auctionId
      orderItems = fleetAuction.map((item) => ({
        auctionId: item.fleetAuctionId, // Fleet auction ID mapped to auctionId
        quantity: item.quantity || 1,
        price: item.price,
        image: Array.isArray(item.image) ? item.image : [item.image],
        name: item.name || "Fleet Auction Item",
        description: item.description || "",
        wrapType: item.wrapType || wrapType || "",
        buyerCommission: item.buyerCommission || 0,
        buyerCommissionRate: item.buyerCommissionRate || 0,
      }));
    } else if (Array.isArray(auction) && auction.length > 0) {
      // ---- Normal Auction case ----
      const auctionId = auction[0].auctionId;
      const auctionItem = await Auction.findById(auctionId);

      if (!auctionItem) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Auction item not found", null));
      }

      if (!auctionItem.seller) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Auction seller info not found", null));
      }

      sellerId = auctionItem.seller;

      // Map normal auction items
      orderItems = auction.map((item) => ({
        auctionId: item.auctionId,
        quantity: item.quantity || 1,
        price: item.price,
        image: Array.isArray(item.image) ? item.image : [item.image],
        name: item.name || "Auction Item",
        description: item.description || "",
        wrapType: item.wrapType || wrapType || "",
        buyerCommission: item.buyerCommission || 0,
        buyerCommissionRate: item.buyerCommissionRate || 0,
      }));
    } else {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "No auction or fleet auction items provided",
            null
          )
        );
    }

    const paymentStatus =
      paymentMethod.toUpperCase() === "CARD" ? "PAID" : "UNPAID";

    // Prepare order document
    const orderData = {
      userId,
      auction: orderItems,
      seller: sellerId,
      totalPrice,
      paymentMethod: paymentMethod.toUpperCase(),
      paymentStatus,
      description,
      address,
      wrapType: wrapType || "",
      status: "PENDING",
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, "Auction order created successfully", savedOrder)
      );
  } catch (error) {
    console.error("Error creating auction order:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, error.message || "Internal Server Error", null)
      );
  }
};

// Get order summary for a seller
export const getSellerOrderSummary = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Validate if sellerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid seller ID format" });
    }

    // Get all products by this seller
    const sellerProducts = await Product.find({ seller: sellerId });
    const productIds = sellerProducts.map((product) => product._id);

    const findSellerOrders = async () => {
      const conditions = [{ "products.productId": { $in: productIds } }];
      return await Order.find({ $or: conditions })
        .populate("products.productId")
        .populate("auction.auctionId");
    };

    const allOrders = await findSellerOrders();

    // Group orders by status
    const paidOrders = allOrders.filter((order) => order.status === "PAID");
    const pendingOrders = allOrders.filter(
      (order) => order.status === "PENDING"
    );
    const shippedOrders = allOrders.filter(
      (order) => order.status === "SHIPPED"
    );
    const deliveredOrders = allOrders.filter(
      (order) => order.status === "DELIVERED"
    );
    const CancleOrders = allOrders.filter((order) => order.status === "Cancle");

    // Create summary
    const summary = {
      total: allOrders.length,
      paid: paidOrders.length,
      pending: pendingOrders.length,
      shipped: shippedOrders.length,
      delivered: deliveredOrders.length,
      Cancle: CancleOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      paidRevenue: paidOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      pendingRevenue: pendingOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      ),
      shippedRevenue: shippedOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      ),
      deliveredRevenue: deliveredOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      ),
    };

    res.status(200).json({
      success: true,
      summary,
      // Return orders grouped by status
      paidOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      CancleOrders,
    });
  } catch (error) {
    console.error("Error generating seller order summary:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

//  Get All Orders

export const getAllOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const totalOrders = await Order.countDocuments();

    // all orders
    let orders = await Order.find()
      .populate("products.productId")
      .populate("userId")
      .populate("seller")
      .populate("fleetOwner")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // find all assignments in one go
    const orderIds = orders.map((o) => o._id);
    const assignments = await WrapperAssignment.find({
      order: { $in: orderIds },
    })
      .sort({ assignedAt: -1 }) // latest first
      .lean();

    // make map of orderId → latest status
    const assignmentMap = {};
    assignments.forEach((a) => {
      if (!assignmentMap[a.order]) {
        assignmentMap[a.order.toString()] = {
          status: a.status,
          acceptStatus: a.acceptStatus,
          wrapper: a.wrapper,
        };
      }
    });

    // attach wrapperAssignmentStatus in orders
    orders = orders.map((o) => ({
      ...o,
      wrapperAssignmentStatus: assignmentMap[o._id.toString()]
        ? assignmentMap[o._id.toString()].status
        : null,
      wrapperAssignmentAccept: assignmentMap[o._id.toString()]
        ? assignmentMap[o._id.toString()].acceptStatus
        : null,
    }));

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(totalOrders / limitNum),
      currentPage: pageNum,
      totalOrders,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    const userId = req.user?._id; // Get user ID from authenticated request (if available)

    // Define query for user-specific filtering (optional)
    const query = userId ? { buyer: userId } : {};

    // Count orders by status
    const totalOrders = await Order.countDocuments(query);
    const pendingOrders = await Order.countDocuments({
      ...query,
      status: "Pending",
    });
    const deliveredOrders = await Order.countDocuments({
      ...query,
      status: "DELIVERED",
    });
    const CancleOrders = await Order.countDocuments({
      ...query,
      status: "Cancle",
    });
    const preparedOrders = await Order.countDocuments({
      ...query,
      status: "PREPARED_FOR_DELIVERY",
    });

    // Auction-related counts
    const totalAuctions = await Auction.countDocuments();
    const deliveredAuctions = await Order.countDocuments({
      ...query,
      status: "DELIVERED",
      "products.productId.auctionId": { $exists: true },
    });
    const pendingAuctions = await Order.countDocuments({
      ...query,
      status: "Pending",
      "products.productId.auctionId": { $exists: true },
    });
    const CancleAuctions = await Order.countDocuments({
      ...query,
      status: "Cancle",
      "products.productId.auctionId": { $exists: true },
    });

    res.status(200).json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      CancleOrders,
      preparedOrders,
      totalAuctions,
      deliveredAuctions,
      pendingAuctions,
      CancleAuctions,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};
//  Get Order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Order ID format" });
  }

  try {
    const order = await Order.findById(id).populate(
      "products.productId",
      "name price"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get Orders by User ID
export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const notifySellerOnPurchase = async ({
  orderId,
  productId,
  userId,
  sellerId,
  io,
}) => {
  const product = await Product.findById(productId);
  const buyer = await User.findById(userId);
  const seller = await User.findById(sellerId);

  if (!product || !buyer || !seller)
    throw new Error("Product or user not found");

  const sellerNotification = new Notification({
    user: sellerId,
    message: `Your product ${product.name} has been purchased by ${buyer.firstName} ${buyer.lastname}`,
    type: "PRODUCT_SOLD",
    product: productId,
    order: orderId,
    link: `/seller/orders/${orderId}`,
    isRead: false,
  });

  const buyerNotification = new Notification({
    user: userId,
    message: `Thanku For Purchase ${product.name} Product`,
    type: "PURCHASE_CONFIRMED",
    product: productId,
    order: orderId,
    link: `/my-orders/${orderId}`,
    isRead: false,
  });

  await Promise.all([sellerNotification.save(), buyerNotification.save()]);

  // Real-time emit via socket
  if (io) {
    io.to(sellerId.toString()).emit(
      "newPurchaseNotification",
      sellerNotification
    );
    io.to(userId.toString()).emit("newPurchaseNotification", buyerNotification);
  }

  // Push Notification
  if (seller.fcmToken) {
    await sendPushNotification(
      seller.fcmToken,
      `New sale: ${product.name}`,
      `${buyer.firstName} purchased your product`
    );
  }

  if (buyer.fcmToken) {
    await sendPushNotification(
      buyer.fcmToken,
      `Purchase confirmed: ${product.name}`,
      `Your order #${orderId} has been confirmed`
    );
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
///gettotal qunatity
export const counttotalqunaty = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Get product document
    const product = await Product.findById(productObjectId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const totalQuantity = product.quantity || 0;

    // Aggregation to calculate sold quantity - removed status filter
    const aggregationResult = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          $or: [
            { "products.productId": productObjectId },
            { "products.productId": productId }, // Match both ObjectId and string
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$products.quantity" },
        },
      },
    ]);

    const soldQuantity = aggregationResult[0]?.totalSold || 0;
    const availableQuantity = totalQuantity - soldQuantity;
    const status = availableQuantity > 0 ? "In Stock" : "Out of Stock";

    res.json({
      success: true,
      productId: product._id,
      name: product.name,
      totalQuantity,
      soldQuantity,
      availableQuantity,
      status,
    });
  } catch (error) {
    console.error("Error in countTotalQuantity:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Ensure correct model import
export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId)
      .populate("products.productId")
      .populate("auction.auctionId"); // support for auction data

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const headerImagePath = path.join(__dirname, "../header.png");
    const footerImagePath = path.join(__dirname, "../footer.png");

    const doc = new PDFDocument({ size: "A4", margin: 0 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${orderId}.pdf"`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - 100;
    let yPosition = 50;

    // Header
    addHeader(doc, headerImagePath, pageWidth);
    yPosition = 120;

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("INVOICE", 50, yPosition, { align: "center" });
    yPosition += 50;

    doc.fontSize(11).font("Helvetica");
    doc.text(`Order ID: ${order._id}`, 50, yPosition);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`, 350, yPosition);
    doc.text(`Payment Method: ${order.paymentMethod}`, 50, yPosition + 15);
    yPosition += 40;

    const address = order.address || {};
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Billing & Shipping Address:", 50, yPosition, { underline: true });
    doc.fontSize(11).font("Helvetica");
    doc.text(`Name: ${address.firstName || "N/A"}`);
    doc.text(`Street: ${address.street || "N/A"}`);
    doc.text(`City: ${address.city || "N/A"}`);
    doc.text(`State: ${address.state || "N/A"}`);
    doc.text(`Pincode: ${address.pincode || "N/A"}`);
    doc.text(`Phone: ${address.mobile || "N/A"}`);
    yPosition += 100;

    const tableStartX = 50;
    const columnWidths = [200, 80, 80, 80];

    // --------------------
    // Product Items Table
    // --------------------
    if (order.products && order.products.length > 0) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Product Items", 50, yPosition);
      yPosition += 25;

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Product", tableStartX, yPosition, { width: columnWidths[0] });
      doc.text("Qty", tableStartX + columnWidths[0], yPosition, {
        width: columnWidths[1],
      });
      doc.text(
        "Price",
        tableStartX + columnWidths[0] + columnWidths[1],
        yPosition,
        { width: columnWidths[2] }
      );
      doc.text(
        "Total",
        tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        yPosition,
        { width: columnWidths[3] }
      );

      doc
        .moveTo(tableStartX, yPosition + 15)
        .lineTo(tableStartX + 440, yPosition + 15)
        .stroke();
      yPosition += 25;

      doc.font("Helvetica").fontSize(11);
      for (const product of order.products) {
        if (yPosition + 50 > pageHeight - 150) {
          addFooter(doc, footerImagePath, pageWidth, pageHeight);
          doc.addPage();
          addHeader(doc, headerImagePath, pageWidth);
          yPosition = 120;
        }

        doc.text(product.productId?.name || "Unknown", tableStartX, yPosition, {
          width: columnWidths[0],
        });
        doc.text(
          product.quantity.toString(),
          tableStartX + columnWidths[0],
          yPosition,
          { width: columnWidths[1] }
        );
        doc.text(
          `${product.productId?.price || 0}`,
          tableStartX + columnWidths[0] + columnWidths[1],
          yPosition,
          { width: columnWidths[2] }
        );
        doc.text(
          `${(product.productId?.price || 0) * product.quantity}`,
          tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2],
          yPosition,
          { width: columnWidths[3] }
        );

        yPosition += 20;
      }

      yPosition += 20;
    }

    // --------------------
    // Auction Items Table
    // --------------------
    if (order.auction && order.auction.length > 0) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Auction Items", 50, yPosition);
      yPosition += 25;

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Auction", tableStartX, yPosition, { width: columnWidths[0] });
      doc.text("Qty", tableStartX + columnWidths[0], yPosition, {
        width: columnWidths[1],
      });
      doc.text(
        "Price",
        tableStartX + columnWidths[0] + columnWidths[1],
        yPosition,
        { width: columnWidths[2] }
      );
      doc.text(
        "Total",
        tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2],
        yPosition,
        { width: columnWidths[3] }
      );

      doc
        .moveTo(tableStartX, yPosition + 15)
        .lineTo(tableStartX + 440, yPosition + 15)
        .stroke();
      yPosition += 25;

      doc.font("Helvetica").fontSize(11);
      for (const item of order.auction) {
        const auction = item.auctionId;
        if (!auction) continue;

        if (yPosition + 50 > pageHeight - 150) {
          addFooter(doc, footerImagePath, pageWidth, pageHeight);
          doc.addPage();
          addHeader(doc, headerImagePath, pageWidth);
          yPosition = 120;
        }

        doc.text(auction.name || "Unnamed Auction", tableStartX, yPosition, {
          width: columnWidths[0],
        });
        doc.text(
          item.quantity.toString(),
          tableStartX + columnWidths[0],
          yPosition,
          { width: columnWidths[1] }
        );
        doc.text(
          `${item.price}`,
          tableStartX + columnWidths[0] + columnWidths[1],
          yPosition,
          { width: columnWidths[2] }
        );
        doc.text(
          `${item.price * item.quantity}`,
          tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2],
          yPosition,
          { width: columnWidths[3] }
        );

        yPosition += 20;
      }

      yPosition += 20;
    }

    // --------------------
    // Grand Total
    // --------------------
    doc.fontSize(13).font("Helvetica-Bold");
    doc.text(`Grand Total: ${order.totalPrice}`, {
      align: "right",
      width: contentWidth,
    });

    // Footer
    addFooter(doc, footerImagePath, pageWidth, pageHeight);

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

// **Function to Add Header (for new pages)**
const addHeader = (doc, headerImagePath, pageWidth) => {
  if (fs.existsSync(headerImagePath)) {
    doc.image(headerImagePath, 0, 0, { width: pageWidth });
  }
};

const addFooter = (doc, footerImagePath, pageWidth, pageHeight) => {
  if (fs.existsSync(footerImagePath)) {
    doc.image(footerImagePath, 0, pageHeight - 200, { width: pageWidth });
  }
};

export const getOrdersForSellerProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Check user existence and type
    const user =
      (await User.findOne({ _id: userId })) ||
      (await FleetOwner.findOne({ _id: userId }));

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let orders;
    const userType =
      user.userType || (user instanceof FleetOwner ? "fleetOwner" : "user");

    if (userType === "seller") {
      // Find orders where this user is the seller (regular products or auctions)
      orders = await Order.find({
        seller: userId,
        $or: [
          { "products.productId": { $exists: true, $ne: null } },
          { "auction.auctionId": { $exists: true, $ne: null } },
        ],
      })
        .populate("userId", "firstName lastname email phone")
        .populate("products.productId", "name price image description category")
        .populate("auction.auctionId", "title price image description")
        .sort({ createdAt: -1 });
    } else if (userType === "fleetOwner") {
      // Find orders specifically for fleet auctions where this user is either fleetOwner or seller
      orders = await Order.find({
        $or: [
          { fleetOwner: userId },
          {
            seller: userId,
            "fleetAuction.fleetAuctionId": { $exists: true, $ne: null },
          },
        ],
      })
        .populate("userId", "firstName lastname email phone")
        .populate({
          path: "fleetAuction.fleetAuctionId",
          select:
            "vehicleModel vehicleManufacturer yearofmanufacturer images description price",
          model: "FleetOwner",
        })
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Format the orders response
    const formattedOrders = orders.map((order) => {
      const baseOrder = {
        id: order._id,
        buyer: order.userId
          ? {
              name: `${order.userId.firstName || ""} ${
                order.userId.lastname || ""
              }`.trim(),
              email: order.userId.email,
              phone: order.userId.phone || null,
            }
          : null,
        address: order.address
          ? {
              firstName: order.address.firstName,
              mobile: order.address.mobile,
              street: order.address.street,
              city: order.address.city,
              state: order.address.state,
              pincode: order.address.pincode,
            }
          : null,
        amount: order.totalPrice,
        status: order.status,
        paymentMethod: order.paymentMethod,
        date: order.createdAt,
        userType,
      };

      if (userType === "seller") {
        return {
          ...baseOrder,
          products:
            order.products?.map((item) => ({
              name: item.productId?.name,
              price: item.price || item.productId?.price,
              image: Array.isArray(item.productId?.image)
                ? item.productId?.image[0]
                : item.productId?.image,
              description: item.productId?.description,
              category: item.productId?.category,
              quantity: item.quantity,
            })) || [],
          auctions:
            order.auction?.map((item) => ({
              name: item.auctionId?.title || item.auctionId?.name,
              price: item.price || item.auctionId?.price,
              image: Array.isArray(item.auctionId?.image)
                ? item.auctionId?.image[0]
                : item.auctionId?.image,
              description: item.auctionId?.description,
              quantity: item.quantity || 1,
            })) || [],
          orderType: order.products?.length
            ? "product"
            : order.auction?.length
            ? "auction"
            : "unknown",
        };
      } else {
        // fleetOwner
        return {
          ...baseOrder,
          fleetAuctions:
            order.fleetAuction?.map((item) => {
              const fleetItem = item.fleetAuctionId;
              return {
                vehicleModel: fleetItem?.vehicleModel || "N/A",
                vehicleManufacturer: fleetItem?.vehicleManufacturer || "N/A",
                year: fleetItem?.yearofmanufacturer || "N/A",
                price: item.price || fleetItem?.price,
                image:
                  fleetItem?.images?.[0]?.url ||
                  (Array.isArray(fleetItem?.image)
                    ? fleetItem?.image[0]
                    : fleetItem?.image),
                description:
                  fleetItem?.description ||
                  item.description ||
                  "No description available",
                quantity: item.quantity || 1,
                fullVehicleInfo: fleetItem
                  ? {
                      model: fleetItem.vehicleModel,
                      manufacturer: fleetItem.vehicleManufacturer,
                      year: fleetItem.yearofmanufacturer,
                      description: fleetItem.description,
                      images: fleetItem.images,
                      price: fleetItem.price,
                    }
                  : null,
              };
            }) || [],
          orderType: "fleetAuction",
        };
      }
    });

    res.json({
      success: true,
      orders: formattedOrders,
      userType,
      totalOrders: formattedOrders.length,
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getOrderSummaryForSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid seller ID" });
    }

    const orders = await Order.find({ seller: sellerId });

    let pendingCount = 0;
    let deliveredCount = 0;
    let CancleCount = 0;
    let shippedCount = 0;
    let totalOrders = orders.length;

    // Calculate the counts based on status
    orders.forEach((order) => {
      if (order.status === "PENDING") pendingCount++;
      if (order.status === "DELIVERED") deliveredCount++;
      if (order.status === "Cancle") CancleCount++;
      if (order.status === "PREPARE_FOR_DELIVERY") shippedCount++;
    });
    const totalAuctions = await Auction.countDocuments({ seller: sellerId });
 const activeAuctions = await Auction.countDocuments({ seller: sellerId, status: "active" });
    res.json({
      success: true,
      totalOrders,
      pending: pendingCount,
      delivered: deliveredCount,
      shipped: shippedCount,
      Cancle: CancleCount,
      totalAuctions,
      activeAuctions
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// export const updateOrderStatus = async (req, res) => {
//   const { id } = req.params;
//   const { status, buyerCountry } = req.body;
//   const sellerId = req.user._id;

//   if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid Order ID" });
//   }

//   try {
//     const order = await Order.findOne({ _id: id, seller: sellerId });
//     if (!order) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Order not found or unauthorized" });
//     }
//     const updatedOrder = await Order.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     )
//       .populate({
//         path: "userId",
//         select: "firstName lastName email fcmToken country",
//         model: "User",
//       })
//       .populate({
//         path: "seller",
//         select: "firstName lastName email",
//         model: "User",
//       })
//       .populate({
//         path: "products.productId",
//         select: "name price",
//         model: "Product",
//       });

//     if (!updatedOrder.userId) {
//       throw new Error("User reference missing in order");
//     }
//     const notification = new Notification({
//       user: updatedOrder.userId._id,
//       type: "ORDER_UPDATE",
//       title: `Order #${updatedOrder._id
//         .toString()
//         .substring(18, 24)} Status Updated`,
//       message: `Your order is now ${status}`,
//       metadata: {
//         orderId: updatedOrder._id,
//         status: status,
//         sellerName: updatedOrder.seller?.firstName || "Seller",
//       },
//       read: false,
//     });
//     await notification.save();
//     if (updatedOrder.userId.fcmToken) {
//       await sendPushNotification(
//         updatedOrder.userId.fcmToken,
//         `Order Status Updated`,
//         `Your order ${
//           updatedOrder.products[0]?.productId?.name || ""
//         } is now ${status}`
//       );
//     }

//     const country = buyerCountry || updatedOrder.userId.country || "US";

//     const emailData = {
//       email: updatedOrder.userId.email,
//       userId: updatedOrder.userId._id,
//       orderId: updatedOrder._id,
//       status: status,
//       products: updatedOrder.products,
//       country: country, // Use the determined country
//     };
//     try {
//       await sendOrderStatusUserEmail(emailData);
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError);
//     }

//     res.status(200).json({
//       success: true,
//       order: updatedOrder,
//       notification: notification,
//     });
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };


export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, buyerCountry } = req.body;
  const userId = req.user._id; // User can be seller or fleet owner
  const userType = req.user.userType; // Assume role is stored in user object (e.g., "seller" or "fleetOwner")

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Order ID" });
  }

  try {
    // Find order based on user role
    let order;
    if (userType === "seller") {
      order = await Order.findOne({ _id: id, seller: userId });
    } else if (userType === "fleetOwner") {
      order = await Order.findOne({ _id: id, fleetOwner: userId });
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized role" });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "firstName lastName email fcmToken country",
        model: "User",
      })
      .populate({
        path: "seller",
        select: "firstName lastName email",
        model: "User",
      })
      .populate({
        path: "fleetOwner",
        select: "firstName lastName email",
        model: "User",
      })
      .populate({
        path: "products.productId",
        select: "name price",
        model: "Product",
      });

    if (!updatedOrder.userId) {
      throw new Error("User reference missing in order");
    }

    const notification = new Notification({
      user: updatedOrder.userId._id,
      type: "ORDER_UPDATE",
      title: `Order #${updatedOrder._id.toString().substring(18, 24)} Status Updated`,
      message: `Your order is now ${status}`,
      metadata: {
        orderId: updatedOrder._id,
        status: status,
        updaterName:
          userType === "seller"
            ? updatedOrder.seller?.firstName || "Seller"
            : updatedOrder.fleetOwner?.firstName || "Fleet Owner",
      },
      read: false,
    });
    await notification.save();

    if (updatedOrder.userId.fcmToken) {
      await sendPushNotification(
        updatedOrder.userId.fcmToken,
        `Order Status Updated`,
        `Your order ${
          updatedOrder.products[0]?.productId?.name || ""
        } is now ${status}`
      );
    }

    const country = buyerCountry || updatedOrder.userId.country || "US";

    const emailData = {
      email: updatedOrder.userId.email,
      userId: updatedOrder.userId._id,
      orderId: updatedOrder._id,
      status: status,
      products: updatedOrder.products,
      country: country,
    };

    try {
      await sendOrderStatusUserEmail(emailData);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.status(200).json({
      success: true,
      order: updatedOrder,
      notification: notification,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const adminUpdateOrderStatus = async (req, res) => {
  const { id } = req.params; // order id
  const { status, buyerCountry } = req.body; // new status and optionally buyerCountry

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Order ID" });
  }

  try {
    // Order update bina seller check ke
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "firstName lastName email fcmToken country",
      })
      .populate({
        path: "seller",
        select: "firstName lastName email",
      })
      .populate({
        path: "products.productId",
        select: "name price",
      });

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (!updatedOrder.userId) {
      throw new Error("User reference missing in order");
    }

    // Notification banao
    const notification = new Notification({
      user: updatedOrder.userId._id,
      type: "ORDER_UPDATE",
      title: `Order #${updatedOrder._id.toString().slice(-6)} Status Updated`,
      message: `Your order is now ${status}`,
      metadata: {
        orderId: updatedOrder._id,
        status,
        sellerName: updatedOrder.seller?.firstName || "Seller",
      },
      read: false,
    });
    await notification.save();

    // Push notification bhejo agar fcmToken ho
    if (updatedOrder.userId.fcmToken) {
      await sendPushNotification(
        updatedOrder.userId.fcmToken,
        "Order Status Updated",
        `Your order ${
          updatedOrder.products[0]?.productId?.name || ""
        } is now ${status}`
      );
    }

    // Email bhejo
    const country = buyerCountry || updatedOrder.userId.country || "US";
    const emailData = {
      email: updatedOrder.userId.email,
      userId: updatedOrder.userId._id,
      orderId: updatedOrder._id,
      status,
      products: updatedOrder.products,
      country,
    };

    try {
      await sendOrderStatusUserEmail(emailData);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
    }

    return res
      .status(200)
      .json({ success: true, order: updatedOrder, notification });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/////buyer profile status
export const getBuyerProfileStatus = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Active Bids
    const activeAuctionIds = await Auction.find({ status: "active" }).distinct(
      "_id"
    );
    const activeBids = await Bid.countDocuments({
      bidder: userId,
      auction: { $in: activeAuctionIds },
    });

    // 2. Auctions Won
    const wonAuctions = await Auction.countDocuments({
      winner: userId,
    });

    // 3. Total Orders (All types - paid/unpaid, delivered/pending)
    const totalOrders = await Order.countDocuments({
      userId: userId,
    });

    const user = await User.findById(userId);
    const savedItems = user?.savedItems?.length || 0;

    res.status(200).json({
      activeBids,
      wonAuctions,
      totalOrders,
      savedItems,
    });
  } catch (error) {
    console.error("Error fetching buyer stats:", error);
    res.status(500).json({ message: "Failed to fetch buyer dashboard stats" });
  }
};



export const getWrapTypesSoldByFleetAuctionId = async (req, res) => {
  try {
    const { fleetAuctionId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fleetAuctionId)) {
      return res.status(400).json({ message: "Invalid fleetAuctionId" });
    }

    // Fetch FleetOwner document
    const fleet = await FleetOwner.findById(fleetAuctionId)
      .select("vehicleModel purchaseStatus currentBids")
      .lean();

    if (!fleet) return res.status(404).json({ message: "Fleet auction not found" });

    // Possible wrap types
    const wrapTypes = ["fullWrap", "oneSide", "bothSides", "rearDoors"];

    // Map each wrapType to its status
    const soldWraps = wrapTypes.map((type) => {
      // Check if this wrap type is sold
      const isSold = fleet.purchaseStatus === "sold"; // simple, or add logic per wrapType if needed

      return {
        fleetAuctionId: fleet._id,
        name: fleet.vehicleModel,
        wrapType: type,
        status: isSold ? "sold" : "unsold",
      };
    });

    res.json(soldWraps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getfleetOrderSummary = async (req, res) => {
  try {
    const { fleetownerId } = req.params;
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(fleetownerId)) {
      return res.status(400).json({ message: "Invalid Fleet Owner ID" });
    }
    const query = { fleetOwner: fleetownerId };
    const totalOrders = await Order.countDocuments(query);
    const pendingOrders = await Order.countDocuments({ ...query, status: "PENDING" });
    const deliveredOrders = await Order.countDocuments({ ...query, status: "DELIVERED" });
    const CancleOrders = await Order.countDocuments({ ...query, status: "Cancle" });
    const preparedOrders = await Order.countDocuments({ ...query, status: "PREPARE_FOR_DELIVERY" });
    const totalAuctions = await Auction.countDocuments();
    const deliveredAuctions = await Order.countDocuments({
      ...query,
      status: "DELIVERED",
      "products.productId.auctionId": { $exists: true }
    });
    const pendingAuctions = await Order.countDocuments({
      ...query,
      status: "PENDING",
      "products.productId.auctionId": { $exists: true }
    });
    const CancleAuctions = await Order.countDocuments({
      ...query,
      status: "Cancle",
      "products.productId.auctionId": { $exists: true }
    });
   const preparedAuction = await Order.countDocuments({
  ...query,
  status: "PREPARE_FOR_DELIVERY",
  "products.productId.auctionId": { $exists: true }
});
    res.status(200).json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      CancleOrders,
      preparedOrders,
      totalAuctions,
      deliveredAuctions,
      pendingAuctions,
      preparedAuction,
      CancleAuctions,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};