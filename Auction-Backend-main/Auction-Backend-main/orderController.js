import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendOrderStatusNotification,sendOrderStatusUserEmail } from "./notification.controller.js";
import PDFDocument from "pdfkit";
import User from "../models/user.model.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Notification from "../models/notification.model.js";
import ApiResponse from "../utils/ApiResponse.js";
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
      sessionId
    } = req.body;

    // Validate required fields
    if (!userId || !products || !totalPrice || !paymentMethod || !address) {
      return res.status(400).json(
        new ApiResponse(400, "Required order details are missing", null)
      );
    }
    
    // Validate payment method
    let validPaymentMethod = paymentMethod;
    
    // Create new order with valid data
    const order = new Order({
      userId,
      products: products.map(product => ({
        productId: product.productId,
        quantity: product.quantity,
        price: product.price, 
        image: Array.isArray(product.image) ? product.image : [product.image],
      })),
      totalPrice,
      paymentMethod: validPaymentMethod,
      description,
      address,
      // Status defaults to "Pending"
    });
    
    // Save to database
    const savedOrder = await order.save();
    
    // Return response
    return res.status(201).json(
      new ApiResponse(201, "Order created successfully", savedOrder)
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json(
      new ApiResponse(500, error.message || "Internal Server Error", null)
    );
  }
};
export const placeAuctionOrder = async (req, res) => {
  try {
    const {
      userId,
      auction,
      totalPrice,
      paymentMethod,
      description,
      address,
     
    } = req.body;


    // Validate required fields
    if (!userId || !auction || !totalPrice || !paymentMethod || !address) {
      return res.status(400).json(
        new ApiResponse(400, "Required order details are missing", null)
      );
    }

    const orderData = {
      userId,
      auction: auction.map(item => ({
        auctionId: item.auctionId,
        quantity: item.quantity || 1,
        price: item.price,
        image: Array.isArray(item.image) ? item.image : [item.image],
        name: item.name || "Auction Item",
        description: item.description || "",
      })),
      totalPrice,
      paymentMethod: paymentMethod.toUpperCase(),
      description,
      address,
     
      status: "PENDING"
    };

    
    const order = new Order(orderData);
    
    const savedOrder = await order.save();

    // Calculate commission with better error handling
    try {
    } catch (commissionError) {
      console.error("Commission calculation failed but order was saved:", commissionError);
      // Don't fail the API response if commission calculation fails
    }

    return res.status(201).json(
      new ApiResponse(201, "Auction order created successfully", savedOrder)
    );
  } catch (error) {
    console.error("Error creating auction order:", error);
    return res.status(500).json(
      new ApiResponse(500, error.message || "Internal Server Error", null)
    );
  }
};



////get buyer of product 
// controllers/orderController.js
export const getOrdersForSellerProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: 'Invalid seller ID format' });
    }

    // Find orders that contain products from this seller with auction details
    const orders = await Order.aggregate([
      {
        $unwind: "$products" // Split by products array
      },
      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      // Lookup auction details for the product
      {
        $lookup: {
          from: "auction",
          localField: "products.productId",
          foreignField: "product",
          as: "auctionDetails"
        }
      },
      { $unwind: { path: "$auctionDetails", preserveNullAndEmptyArrays: true } },
      // Match only seller's products
      {
        $match: {
          "productDetails.seller": new mongoose.Types.ObjectId(sellerId)
        }
      },
      // Group back by order
      {
        $group: {
          _id: "$_id",
          order: { $first: "$$ROOT" },
          products: { $push: "$products" },
          productDetails: { $push: "$productDetails" },
          auctionDetails: { $push: "$auctionDetails" }
        }
      },
      // Project needed fields
      {
        $project: {
          "_id": 1,
          "userId": 1,
          "address": 1,
          "totalPrice": 1,
          "status": 1,
          "createdAt": 1,
          "updatedAt": 1,
          "paymentStatus": 1,
          "products": 1,
          "productDetails": 1,
          "auctionDetails": 1
        }
      },
      // Sort by newest first
      { $sort: { createdAt: -1 } }
    ]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No orders found for your products' 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: orders.length, 
      data: orders 
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get order summary for a seller
export const getSellerOrderSummary = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    
    // Validate if sellerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ success: false, message: 'Invalid seller ID format' });
    }

    // Get all products by this seller
    const sellerProducts = await Product.find({ seller: sellerId });
    const productIds = sellerProducts.map(product => product._id);
    
    // Find orders containing seller's products or auctions
    const findSellerOrders = async () => {
      // Build an array of possible conditions for finding seller's products in orders
      const conditions = [
        { 'products.productId': { $in: productIds } }
      ];
      
      // Fetch all orders that match any of the conditions
      return await Order.find({ $or: conditions })
        .populate('products.productId')
        .populate('auction.auctionId');
    };
    
    const allOrders = await findSellerOrders();
    
    // Group orders by status
    const paidOrders = allOrders.filter(order => order.status === 'PAID');
    const pendingOrders = allOrders.filter(order => order.status === 'PENDING');
    const shippedOrders = allOrders.filter(order => order.status === 'SHIPPED');
    const deliveredOrders = allOrders.filter(order => order.status === 'DELIVERED');
    const cancelledOrders = allOrders.filter(order => order.status === 'CANCELLED');
    
    // Create summary
    const summary = {
      total: allOrders.length,
      paid: paidOrders.length,
      pending: pendingOrders.length,
      shipped: shippedOrders.length,
      delivered: deliveredOrders.length,
      cancelled: cancelledOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      paidRevenue: paidOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      pendingRevenue: pendingOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      shippedRevenue: shippedOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      deliveredRevenue: deliveredOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    };

    res.status(200).json({ 
      success: true, 
      summary,
      // Return orders grouped by status
      paidOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders
    });
  } catch (error) {
    console.error('Error generating seller order summary:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};



//  Get All Orders
export const getAllOrders = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        // Convert to numbers explicitly
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        const totalOrders = await Order.countDocuments();
        
        const orders = await Order.find()
            .populate("products.productId")
            .populate("userId")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        res.status(200).json({
            success: true,
            orders,
            totalPages: Math.ceil(totalOrders / limitNum),
            currentPage: pageNum,
            totalOrders
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

//  Get Order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Order ID format" });
    }

    try {
        const order = await Order.findById(id).populate("products.productId", "name price");

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

// 🟢 Order Summary
export const getOrderSummary = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: "Delivered" });
        const pendingOrders = await Order.countDocuments({ status: "Pending" });

        res.status(200).json({
            totalOrders,
            completedOrders,
            pendingOrders,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

//  Update Order Status
// 🟢 Update Order Status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, fcmToken } = req.body;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
  }

  try {
      const updatedOrder = await Order.findByIdAndUpdate(
          id,
          { $set: { status } },
          { new: true }
      ).populate("userId").populate("products.productId");

      if (!updatedOrder) {
          return res.status(404).json({ message: "Order not found" });
      }

      // Handle commission based on status change
      if (status === "DELIVERED") {
          // Update existing commission status
          await updateCommissionStatus(id, status);
      }

      // Send Push Notification
      if (fcmToken) {
          await sendPushNotification(
              fcmToken,
              "Order Status Updated",
              `Your order is now marked as '${status}'`
          );
      }
      
      await sendOrderStatusNotification({
          body: {
              userId: updatedOrder.userId._id.toString(),
              orderId: updatedOrder._id.toString(),
              status
          }
      }, { 
          status: () => ({
              json: (data) => console.log("Notification Sent:", data)
          }) 
      });
      
      // Send Email Notification
      await sendOrderStatusUserEmail(
          {
              body: {
                  userId: updatedOrder.userId._id.toString(),
                  orderId: updatedOrder._id.toString(),
                  status,
                  country: updatedOrder.userId.country || "US",
              },
          },
          {
              status: () => ({
                  json: (data) => console.log("Email Sent:", data)
              })
          }
      );

      res.status(200).json(updatedOrder);
  } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: error.message });
  }
};
/////////notification seller 
export const notifySellerOnPurchase = async ({ orderId, productId, userId, sellerId, io }) => {
  const product = await Product.findById(productId);
  const buyer = await User.findById(userId);
  const seller = await User.findById(sellerId);

  
  if (!product || !buyer || !seller) throw new Error("Product or user not found");

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
    io.to(sellerId.toString()).emit("newPurchaseNotification", sellerNotification);
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
              { "products.productId": productId } // Match both ObjectId and string
            ]
          } 
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

        const order = await Order.findById(orderId).populate("products.productId");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const headerImagePath = path.join(__dirname, "../header.png");
        const footerImagePath = path.join(__dirname, "../footer.png");

        const doc = new PDFDocument({ size: "A4", margin: 0 });


        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="invoice-${orderId}.pdf"`);

        doc.pipe(res);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const contentWidth = pageWidth - 100; // 50px margin on each side
        let yPosition = 50;

        // **Header Image (Full Width)**
        if (fs.existsSync(headerImagePath)) {
            doc.image(headerImagePath, 0, 0, { width: pageWidth, height: 100 });
            yPosition = 120; // Adjusted after header
        }

        // **Invoice Title**
        doc.font("Helvetica-Bold").fontSize(22).text("INVOICE", 50, yPosition, { align: "center" });
        yPosition += 30;

        // **Order Details**
        doc.fontSize(11).font("Helvetica");
        doc.text(`Order ID: ${order._id}`, 50, yPosition);
        doc.text(`Date: ${order.createdAt.toLocaleDateString()}`, 350, yPosition);
        doc.text(`Payment Method: ${order.paymentMethod}`, 50, yPosition + 15);
        yPosition += 40;

        // **Billing Address**
        const address = order.address || {};
        doc.fontSize(12).font("Helvetica-Bold").text("Billing & Shipping Address:", 50, yPosition, { underline: true });
        doc.fontSize(11).font("Helvetica");
        doc.text(`Name: ${address.firstName || "N/A"}`);
        doc.text(`Street: ${address.street || "N/A"}`);
        doc.text(`City: ${address.city || "N/A"}`);
        doc.text(`State: ${address.state || "N/A"}`);
        doc.text(`Pincode: ${address.pincode || "N/A"}`);
        doc.text(`Phone: ${address.mobile || "N/A"}`);
        yPosition += 100;

        // **Table Header**
        const tableStartX = 50;
        const columnWidths = [200, 80, 80, 80];

        doc.fontSize(12).font("Helvetica-Bold");
        doc.text("Product", tableStartX, yPosition, { width: columnWidths[0] });
        doc.text("Qty", tableStartX + columnWidths[0], yPosition, { width: columnWidths[1] });
        doc.text("Price", tableStartX + columnWidths[0] + columnWidths[1], yPosition, { width: columnWidths[2] });
        doc.text("Total", tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2], yPosition, { width: columnWidths[3] });

        doc.moveTo(tableStartX, yPosition + 15).lineTo(tableStartX + 440, yPosition + 15).stroke();
        yPosition += 25;

        // **Table Content**
        doc.font("Helvetica").fontSize(11);
        order.products.forEach((product) => {
            if (yPosition + 50 > pageHeight - 150) { // Check for page overflow
                addFooter(doc, footerImagePath, pageWidth, pageHeight);
                doc.addPage();
                addHeader(doc, headerImagePath, pageWidth);
                yPosition = 120; // Reset after header
            }

            doc.text(product.productId?.name || "Unknown", tableStartX, yPosition, { width: columnWidths[0] });
            doc.text(product.quantity.toString(), tableStartX + columnWidths[0], yPosition, { width: columnWidths[1] });
            doc.text(`${product.productId?.price || 0}`, tableStartX + columnWidths[0] + columnWidths[1], yPosition, { width: columnWidths[2] });
            doc.text(`${(product.productId?.price || 0) * product.quantity}`, tableStartX + columnWidths[0] + columnWidths[1] + columnWidths[2], yPosition, { width: columnWidths[3] });

            yPosition += 20;
        });

        yPosition += 10;
        doc.fontSize(13).font("Helvetica-Bold");
        doc.text(`Grand Total: ${order.totalPrice}`, {
            align: "right",
            width: contentWidth
        });

        // **Ensure Footer Image is Full Width and at Bottom**
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
