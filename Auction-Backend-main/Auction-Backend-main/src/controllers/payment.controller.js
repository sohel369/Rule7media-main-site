import dotenv from "dotenv";
dotenv.config();

import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { getUserCurrency, convertCurrency } from "../utils/currencyUtils.js";
import PaymentMethod from "../models/userPaymentMethod.model.js";
import Transaction from "../models/transaction.model.js";
import Stripe from "stripe";
import Order from "../models/Order.js";
import User from "../models/user.model.js";
import Commission from "../models/commission.model.js";
import Auction from "../models/auction.model.js";
import Product from "../models/Product.js";
import Notification from "../models/notification.model.js";
import { io } from "../index.js";
import mongoose from "mongoose";
import FleetOwner from "../models/fleetowner.model.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// @desc Add payment method
// @route POST /api/v1/payments/add-payment-method
// @access Private

const addPaymentMethodToCustomer = asyncHandler(async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "payment Method is required"));
    }
    const getUserId = req.user._id.toString();

    let stripeCustomer = await PaymentMethod.findOne({ userId: getUserId });

    if (!stripeCustomer) {
      const createdCustomer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
      });

      stripeCustomer = await PaymentMethod.create({
        userId: getUserId,
        stripeCustomerId: createdCustomer.id,
      });
    }

    if (!stripeCustomer) {
      return res.status(404).json(new ApiResponse(404, "Customer not found"));
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer?.stripeCustomerId,
    });
    if (!paymentMethod) {
      return res
        .status(404)
        .json(new ApiResponse(404, "Payment method not added."));
    }

    if (paymentMethod) {
      stripeCustomer.paymentMethodId = paymentMethodId;
      await stripeCustomer.save();
    }

    //finde user and update verifiedPayment
    const user = await User.findById({ _id: getUserId });

    if (!user) {
      return res.status(404).json(new ApiResponse(404, "User not found"));
    }
    user.paymentVerified = true;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "Payment method added successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, stripeAccountId, billingDetails } = req.body;
    const userId = req.user.id;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID is required"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let stripeCustomerId = user.stripeCustomerId;
    let isNewCustomer = false;

    // Create customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: billingDetails?.email || user.email,
        name: billingDetails?.name || user.name,
        metadata: {
          userId: userId.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      isNewCustomer = true;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Check if we already have a payment method
    let existingPaymentMethods = [];
    if (!isNewCustomer) {
      try {
        existingPaymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: 'card',
        });
      } catch (error) {
 
      }
    }

    let updatedPaymentMethod;
    
    if (existingPaymentMethods.data.length > 0 && !isNewCustomer) {

      const existingPaymentMethodId = existingPaymentMethods.data[0].id;
      
      // First, try to detach old payment method if it exists
      try {
        await stripe.paymentMethods.detach(existingPaymentMethodId);
      } catch (detachError) {
        
      }
    }
    
    // Attach new payment method to customer FIRST
    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });


    // Now update billing details
    if (billingDetails) {
    
      updatedPaymentMethod = await stripe.paymentMethods.update(paymentMethodId, {
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            line1: billingDetails.address.line1,
            line2: billingDetails.address.line2 || null,
            city: billingDetails.address.city,
            state: billingDetails.address.state,
            postal_code: billingDetails.address.postal_code,
            country: billingDetails.address.country,
          }
        }
      });
    } else {
      updatedPaymentMethod = attachedPaymentMethod;
    }


    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Update user
    user.paymentVerified = true;
    if (stripeAccountId && !user.stripeAccountId) {
      user.stripeAccountId = stripeAccountId;
    }
    await user.save();

    return res.json({
      success: true,
      message: "Payment method updated successfully",
      paymentMethod: {
        id: updatedPaymentMethod.id,
        card: {
          brand: updatedPaymentMethod.card.brand,
          last4: updatedPaymentMethod.card.last4,
          exp_month: updatedPaymentMethod.card.exp_month,
          exp_year: updatedPaymentMethod.card.exp_year,
          funding: updatedPaymentMethod.card.funding,
          country: updatedPaymentMethod.card.country
        },
        billing_details: {
          name: updatedPaymentMethod.billing_details.name,
          email: updatedPaymentMethod.billing_details.email,
          phone: updatedPaymentMethod.billing_details.phone,
          address: {
            line1: updatedPaymentMethod.billing_details.address?.line1,
            line2: updatedPaymentMethod.billing_details.address?.line2,
            city: updatedPaymentMethod.billing_details.address?.city,
            state: updatedPaymentMethod.billing_details.address?.state,
            postal_code: updatedPaymentMethod.billing_details.address?.postal_code,
            country: updatedPaymentMethod.billing_details.address?.country
          }
        },
        created: updatedPaymentMethod.created,
        livemode: updatedPaymentMethod.livemode
      }
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment method'
    });
  }
};

const paymentCheckout = asyncHandler(async (req, res) => {
  try {
    const getUserId = req.user._id.toString();

    if (!getUserId) {
      return res.status(400).json(new ApiResponse(400, "User not found"));
    }

    const stripeCustomer = await PaymentMethod.findOne({ userId: getUserId });

    if (!stripeCustomer) {
      return res.status(400).json(new ApiResponse(400, "Customer not found"));
    }

    const session = await stripe.checkout.sessions.create({
      line_items: req.body.sendProductData.lineItems,
      customer: stripeCustomer.StripeCustomerId,
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/success/${req.body.sendProductData.id}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/cancel`,

      // success_url: `https://www.rule7media.com/success/${req.body.sendProductData.id}`,
      // cancel_url: "https://www.rule7media.com/cancel",
    });

    return res.status(201).json(session);
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

const createOrderCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const { productName, amount, quantity, productId, address, description } =
      req.body;
    const buyerId = req.user._id;

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json(new ApiResponse(400, "Invalid amount"));
    }
    if (!productId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Product ID is required"));
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json(new ApiResponse(404, "Product not found"));
    }

    // Get buyer and seller users
    const buyer = await User.findById(buyerId).select(
      "subscription.durationMonths"
    );
    const seller = await User.findById(product.seller).select(
      "subscription.durationMonths stripeAccountId"
    );

    if (!seller) {
      return res.status(404).json(new ApiResponse(404, "Seller not found"));
    }

    if (!buyer?.subscription?.durationMonths) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Buyer has no active subscription"));
    }

    if (!seller?.subscription?.durationMonths) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Seller has no active subscription"));
    }
const buyerDuration = parseInt(buyer.subscription.durationMonths, 10);
const sellerDuration = parseInt(seller.subscription.durationMonths, 10);
    const durationMap = {
  3: "threeMonth",
  6: "sixMonth",
  12: "twelveMonth",
};
const buyerPlanDuration = durationMap[buyerDuration];
const sellerPlanDuration = durationMap[sellerDuration];
    if (!buyerPlanDuration || !sellerPlanDuration) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription duration: buyer(${buyer.subscription.durationMonths}), seller(${seller.subscription.durationMonths})`,
      });
    }

    // Fetch commission rates
    const buyerCommissionDoc = await Commission.findOne({
      planDuration: buyerPlanDuration,
    });
    const sellerCommissionDoc = await Commission.findOne({
      planDuration: sellerPlanDuration,
    });

    if (!buyerCommissionDoc || !sellerCommissionDoc) {
      return res.status(400).json({
        success: false,
        message: "Commission rates not found for buyer or seller",
      });
    }

    const buyerCommissionRate = buyerCommissionDoc.commissionRate;
    const sellerCommissionRate = sellerCommissionDoc.commissionRate;

    // Calculate amounts (all in USD)
    const round2 = (num) => Math.round(num * 100) / 100;
    const baseAmount = round2(amount / (1 + buyerCommissionRate / 100));
    const buyerCommission = round2(baseAmount * (buyerCommissionRate / 100));
    const sellerCommission = round2(baseAmount * (sellerCommissionRate / 100));
    const totalCommission = round2(buyerCommission + sellerCommission);
    const sellerPayout = round2(baseAmount - sellerCommission);
    const buyerTotal = round2(amount);
   


    // Validate
    // Validate commissions
    if (totalCommission >= amount || sellerPayout <= 0) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "Commissions exceed the total amount or invalid payout"
          )
        );
    }

    // Create transaction
    const transaction = new Transaction({
      product: productId,
      buyer: buyerId,
      seller: product.seller,
      amount: buyerTotal,
      paymentMethod: "CARD",
      buyerTotal: buyerTotal,
      sellerPayout: sellerPayout,
      totalCommission: totalCommission,
      commissions: {
        buyerRate: buyerCommissionRate,
        sellerRate: sellerCommissionRate,
        buyer: buyerCommission,
        seller: sellerCommission,
        total: totalCommission,
      },
      currency: "usd",
      status: "pending",
    });
    await transaction.save();

    // Format product images for Stripe
    let productImages = [];
    if (product.image) {
      if (Array.isArray(product.image)) {
        productImages = product.image.slice(0, 1);
      } else if (typeof product.image === "string") {
        productImages = [product.image];
      } else if (typeof product.image === "object") {
        productImages = Object.values(product.image).slice(0, 1);
      }
    }

    // Create Stripe checkout session (without destination charges)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: (productName || product.name || "Product Item").substring(
                0,
                100
              ),
              description: (
                description ||
                product.description ||
                "Product Item"
              ).substring(0, 500),
              images: productImages,
            },
            unit_amount: Math.round(buyerTotal * 100),
          },
          quantity: quantity || 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/order-success/${productId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/payment-cancel`,
      metadata: {
        userId: buyerId.toString(),
        address: JSON.stringify(address).substring(0, 500),
        description: (description || "").substring(0, 500),
        totalPrice: buyerTotal.toString(),
        basePrice: baseAmount.toString(),
        buyerCommission: buyerCommission.toString(),
        sellerCommission: sellerCommission.toString(),
        totalCommission: totalCommission.toString(),
        sellerPayout: sellerPayout.toString(),
        productId: product._id.toString(),
        transactionId: transaction._id.toString(),
        buyerCommissionRate: buyerCommissionRate.toString(),
        sellerCommissionRate: sellerCommissionRate.toString(),
        currency: "usd",
      },
    });

    res.status(200).json({
      url: session.url,
      currency: "usd",
      amount: buyerTotal,
    });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          error.message || "Failed to create checkout session"
        )
      );
  }
});

const getSessionInfo = asyncHandler(async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Session ID is required"));
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json(new ApiResponse(404, "Session not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Session retrieved successfully", { session })
      );
  } catch (error) {
    console.error("Error retrieving session:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message || "Internal Server Error"));
  }
});

// 1. First, let's modify the confirmOrderAfterStripePayment function
// The issue is that it's setting status: 'PAID' which is not valid

const confirmOrderAfterStripePayment = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { session_id } = req.body;

    if (!session_id) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json(new ApiResponse(400, "Session ID is required"));
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "payment_intent.latest_charge", "line_items"],
    });

    if (!stripeSession || stripeSession.payment_status !== "paid") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json(new ApiResponse(400, "Payment not successful"));
    }

    const { metadata } = stripeSession;
    const {
      userId,
      address,
      description,
      totalPrice,
      productId,
      auctionId,
      fleetAuctionId,
      isAuction,
      isFleetAuction,
      quantity,
      buyerCommissionRate,
      sellerCommissionRate,
      buyerCommission,
      sellerCommission,
      totalCommission,
      sellerPayout,
      basePrice,
      transactionId,
      wrapType,
    } = metadata;

    // Get buyer details
    const buyer = await User.findById(userId).session(session);
    if (!buyer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json(new ApiResponse(404, "Buyer not found"));
    }

    // Parse financial values
    const buyerTotal = parseFloat(totalPrice);
    const calcBasePrice = parseFloat(basePrice);
    const calcBuyerCommission = parseFloat(buyerCommission);
    const calcSellerCommission = parseFloat(sellerCommission);
    const calcTotalCommission = parseFloat(totalCommission);
    const calcSellerPayout = parseFloat(sellerPayout);
    const calcBuyerCommissionRate = parseFloat(buyerCommissionRate);
    const calcSellerCommissionRate = parseFloat(sellerCommissionRate);

    let order;
    let transaction;
    let seller = null;
    let fleetOwner = null;
    let productName = "Product";
    let productType = "product";

    // 1. Handle FLEET AUCTION
    if (isFleetAuction === "true") {
      const auction = await FleetOwner.findById(fleetAuctionId).session(
        session
      );
      if (!auction) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json(new ApiResponse(404, "Fleet auction not found"));
      }

      seller = await User.findById(auction.user).session(session);
      productName =
        auction.vehicleModel || auction.name || "Fleet Auction Item";
      productType = "fleet";

      // Create/update transaction
      if (transactionId) {
        transaction = await Transaction.findById(transactionId).session(
          session
        );
      }

      if (!transaction) {
        transaction = new Transaction({
          fleetAuction: auction._id,
          buyer: userId,
          seller: auction.user,
          amount: buyerTotal,
          paymentMethod: "CARD",
          buyerTotal: buyerTotal,
          sellerPayout: calcSellerPayout,
          totalCommission: calcTotalCommission,
          commissions: {
            buyerRate: calcBuyerCommissionRate,
            sellerRate: calcSellerCommissionRate,
            buyer: calcBuyerCommission,
            seller: calcSellerCommission,
            total: calcTotalCommission,
          },
          currency: "usd",
          status: "completed",
        });
        await transaction.save({ session });
      }

      // Create fleet auction order
      order = new Order({
        userId,
        seller: auction.user,
        fleetOwner: auction.user,
        fleetAuction: [
          {
            fleetAuctionId: auction._id,
            quantity: 1,
            price: calcBasePrice,
            image: auction.images?.map((img) => img.url) || [],
            name: productName,
            description: description || auction.description || "",
            wrapType: wrapType || "",
          },
        ],
        totalPrice: buyerTotal,
        paymentMethod: "CARD",
        description: description || "",
        address: JSON.parse(address),
        status: "PENDING",
        paymentStatus: "PAID",
        paymentSessionId: session_id,
        wrapType: wrapType || "",
        commissionDetails: {
          totalCommission: calcTotalCommission,
          commissionrate: calcBuyerCommissionRate,
          sellerCharge: calcSellerCommission,
          buyerCharge: calcBuyerCommission,
          originalPrice: calcBasePrice,
        },
        transactionId: transaction._id,
      });

      await order.save({ session });

      // Update fleet auction status
      auction.purchaseStatus = "sold";
      auction.winner = userId;
      auction.paymentStatus = "paid";
      await auction.save({ session });
    }
    // 2. Handle REGULAR AUCTION
    else if (isAuction === "true") {
      const auction = await Auction.findById(auctionId).session(session);
      if (!auction) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json(new ApiResponse(404, "Auction not found"));
      }

      seller = await User.findById(auction.seller).session(session);
      productName = auction.title || auction.name || "Auction Item";
      productType = "auction";

      let auctionImages = [];
      if (auction.images && Array.isArray(auction.images)) {
        auctionImages = auction.images.map((img) =>
          typeof img === "string" ? img : img.url || img
        );
      } else if (auction.image) {
        auctionImages = [auction.image];
      } else {
        auctionImages = [metadata?.image || "https://via.placeholder.com/150"];
      }

      if (transactionId) {
        transaction = await Transaction.findById(transactionId).session(
          session
        );
      }

      if (!transaction) {
        transaction = new Transaction({
          auction: auctionId,
          buyer: userId,
          seller: auction.seller,
          amount: buyerTotal,
          paymentMethod: "CARD",
          buyerTotal: buyerTotal,
          sellerPayout: calcSellerPayout,
          totalCommission: calcTotalCommission,
          commissions: {
            buyerRate: calcBuyerCommissionRate,
            sellerRate: calcSellerCommissionRate,
            buyer: calcBuyerCommission,
            seller: calcSellerCommission,
            total: calcTotalCommission,
          },
          currency: "usd",
          status: "completed",
        });
        await transaction.save({ session });
      }

      // Create regular auction order
      order = new Order({
        userId,
        seller: auction.seller,
        auction: [
          {
            auctionId: auction._id,
            quantity: 1,
            price: calcBasePrice,
            image: auctionImages,
            name: productName,
            description: description || auction.description || "",
          },
        ],
        totalPrice: buyerTotal,
        paymentMethod: "CARD",
        description: description || "",
        address: JSON.parse(address),
        status: "PENDING",
        paymentStatus: "PAID",
        paymentSessionId: session_id,
        commissionDetails: {
          totalCommission: calcTotalCommission,
          commissionrate: calcBuyerCommissionRate,
          sellerCharge: calcSellerCommission,
          buyerCharge: calcBuyerCommission,
          originalPrice: calcBasePrice,
        },
        transactionId: transaction._id,
      });

      await order.save({ session });

      // Update auction status
      auction.status = "completed";
      auction.winner = userId;
      auction.paymentStatus = "PAID";
      await auction.save({ session });
    }
    // 3. Handle REGULAR PRODUCT
    else {
      const product = await Product.findById(productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json(new ApiResponse(404, "Product not found"));
      }

      seller = await User.findById(product.seller).session(session);
      productName = product.name || "Product";
      productType = "product";

      if (product.fleetOwner) {
        fleetOwner = await FleetOwner.findById(product.fleetOwner).session(
          session
        );
      }

      // Create transaction
      transaction = new Transaction({
        product: productId,
        buyer: userId,
        seller: product.seller,
        amount: buyerTotal,
        paymentMethod: "CARD",
        buyerTotal: buyerTotal,
        sellerPayout: calcSellerPayout,
        totalCommission: calcTotalCommission,
        commissions: {
          buyerRate: calcBuyerCommissionRate,
          sellerRate: calcSellerCommissionRate,
          buyer: calcBuyerCommission,
          seller: calcSellerCommission,
          total: calcTotalCommission,
        },
        currency: "usd",
        status: "completed",
      });
      await transaction.save({ session });

      // Create product order
      order = new Order({
        userId,
        seller: product.seller,
        products: [
          {
            productId,
            quantity: parseInt(quantity || "1"),
            price: calcBasePrice,
            image: product.image
              ? Array.isArray(product.image)
                ? product.image
                : [product.image]
              : [],
            name: productName,
            description: product.description || description || "",
          },
        ],
        totalPrice: buyerTotal,
        paymentMethod: "CARD",
        description: description || "",
        address: JSON.parse(address),
        status: "PENDING",
        paymentStatus: "PAID",
        paymentSessionId: session_id,
        commissionDetails: {
          totalCommission: calcTotalCommission,
          commissionrate: calcBuyerCommissionRate,
          sellerCharge: calcSellerCommission,
          buyerCharge: calcBuyerCommission,
          originalPrice: calcBasePrice,
        },
        transactionId: transaction._id,
      });

      await order.save({ session });

      // Update product quantity
      product.quantity -= parseInt(quantity || "1");
      await product.save({ session });
    }

    // Update admin earnings
    if (transaction && transaction.commissions) {
      await User.findOneAndUpdate(
        { userType: "admin" },
        { $inc: { earnings: transaction.commissions.total } },
        { session, upsert: true }
      );
    }

    // Commit transaction before notifications
    await session.commitTransaction();
    session.endSession();

    // Notification handling (outside transaction)
    try {
      const generateProductUrl = (productType, productId) => {
        const baseUrl =
          process.env.FRONTEND_URL || "https://www.rule7media.com";

        switch (productType) {
          case "product":
            return `${baseUrl}/ProductDetails/${productId}`;
          case "auction":
            return `${baseUrl}/single-auction-detail/${auctionId}`;
          case "fleet":
            return `${baseUrl}/single-fleet-auction-detail/${fleetAuctionId}`;
          default:
            return baseUrl;
        }
      };

      const buyerName = buyer.firstName || buyer.email || "a buyer";
      const formattedAmount = `USD ${buyerTotal.toFixed(2)}`;
      const commissionAmount = transaction?.commissions?.total
        ? `USD ${transaction.commissions.total.toFixed(2)}`
        : "0";

      // 1. NOTIFICATION TO SELLER
      if (seller) {
        const productUrl = generateProductUrl(
          productType,
          productId || fleetAuctionId || auctionId
        );
        const sellerMessage = `${buyerName} purchased your ${
          productType === "fleet" ? "fleet item" : productName
        } for ${formattedAmount}. Your payout: USD ${calcSellerPayout.toFixed(
          2
        )}`;

        const sellerNotification = new Notification({
          user: seller._id,
          title: "🎉 New Sale!",
          message: sellerMessage,
          type: "order",
          relatedId: transaction._id,
          link: productUrl,
          metadata: {
            productType,
            productId: productId || fleetAuctionId || auctionId,
            buyerId: userId,
            sellerPayout: calcSellerPayout,
            totalCommission: calcTotalCommission,
          },
        });
        await sellerNotification.save();

        if (seller.fcmToken) {
          await sendPushNotification(
            seller.fcmToken,
            "New Sale!",
            sellerMessage,
            {
              type: "order",
              orderId: order._id.toString(),
              productId: productId || fleetAuctionId || auctionId,
              buyerId: userId,
              link: productUrl,
              click_action: productUrl,
            }
          );
        }
      }

      // 2. NOTIFICATION TO FLEET OWNER (if applicable)
      if (fleetOwner) {
        const fleetOwnerUser = await User.findById(
          fleetOwner.userId || fleetOwner._id
        );
        if (fleetOwnerUser) {
          const fleetUrl = generateProductUrl("fleet", fleetAuctionId);
          const fleetMessage = `${buyerName} purchased ${productName} from your fleet for ${formattedAmount}. Your payout: USD ${calcSellerPayout.toFixed(
            2
          )}`;

          const fleetNotification = new Notification({
            user: fleetOwnerUser._id,
            title: "🚚 Fleet Item Sold!",
            message: fleetMessage,
            type: "fleet_order",
            relatedId: transaction._id,
            link: fleetUrl,
            metadata: {
              productType: "fleet",
              productId: fleetAuctionId,
              buyerId: userId,
              sellerPayout: calcSellerPayout,
              totalCommission: calcTotalCommission,
            },
          });
          await fleetNotification.save();

          if (fleetOwnerUser.fcmToken) {
            await sendPushNotification(
              fleetOwnerUser.fcmToken,
              "Fleet Item Sold!",
              fleetMessage,
              {
                type: "fleet_order",
                orderId: order._id.toString(),
                fleetId: fleetOwner._id.toString(),
                buyerId: userId,
                link: fleetUrl,
                click_action: fleetUrl,
              }
            );
          }
        }
      }

      // 3. NOTIFICATION TO ADMINS
      const admins = await User.find({ userType: "admin" }).select(
        "_id fcmToken"
      );
      if (admins.length > 0) {
        const adminUrl = generateProductUrl(
          productType,
          productId || fleetAuctionId || auctionId
        );
        const adminMessage = `New ${productType} order: ${buyerName} purchased ${productName} for ${formattedAmount}. `;

        await Promise.all(
          admins.map(async (admin) => {
            const adminNotification = new Notification({
              user: admin._id,
              title: "💰 New Order",
              message: adminMessage,
              type: "ADMIN_ORDER",
              relatedId: order._id,
              entityType: productType.toUpperCase(),
              entityId: productId || fleetAuctionId || auctionId,
              link: adminUrl,
              metadata: {
                orderId: order._id.toString(),
                buyerId: userId,
                sellerId: seller?._id?.toString(),
                amount: buyerTotal,
                buyerCommission: calcBuyerCommission,
                sellerCommission: calcSellerCommission,
                totalCommission: calcTotalCommission,
                sellerPayout: calcSellerPayout,
                currency: "usd",
              },
            });
            await adminNotification.save();

            if (admin.fcmToken) {
              try {
                await sendPushNotification(
                  admin.fcmToken,
                  "New Order Notification",
                  adminMessage,
                  {
                    type: "ADMIN_ORDER",
                    orderId: order._id.toString(),
                    click_action: adminUrl,
                  }
                );
              } catch (pushError) {
                console.error(
                  `Push notification failed for admin ${admin._id}:`,
                  pushError
                );
              }
            }
          })
        );
      }

      return res.status(200).json(
        new ApiResponse(200, "Payment processed successfully", {
          order,
          transaction,
          paymentDetails: {
            amount: stripeSession.amount_total / 100,
            currency: stripeSession.currency,
          },
        })
      );
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
      return res.status(200).json(
        new ApiResponse(200, "Payment processed but notifications failed", {
          order,
          transaction,
          paymentDetails: {
            amount: stripeSession.amount_total / 100,
            currency: stripeSession.currency,
          },
          notificationError: notificationError.message,
        })
      );
    }
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Payment processing error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message || "Failed to process payment"));
  }
});

// Updated commission calculation function

// Process auction payment with commissions
// Updated processAuctionPayment function
 const processAuctionPayment = asyncHandler(async (req, res) => {
  try {
    const { auctionId, paymentMethod, paymentDetails } = req.body;
    const buyerId = req.user._id;

    // Get auction and commission details
    const auction = await Auction.findById(auctionId)
      .populate("seller", "_id")
      .populate("winner", "_id");

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    // Get current commission rates from database
    const commission = await Commission.findOne();
    const sellerRate = commission?.rate || 15; // Default 10%

    const amount = auction.amount;
    const sellerCharge = amount * (sellerRate / 100);
    const totalCommission = sellerCharge;

    const buyerTotal = amount;
    const sellerPayout = amount - sellerCharge;

    // Create transaction record
    const transaction = new Transaction({
      auction: auctionId,
      buyer: buyerId,
      seller: auction.seller._id,
      amount: amount,
      paymentMethod,
      commissions: {
        seller: sellerCharge,
        total: totalCommission,
        sellerRate,
      },
      sellerPayout,
      buyerTotal,
      status: "pending",
    });

    let paymentResult;
    const stripeCustomer = await PaymentMethod.findOne({ userId: buyerId });

    if (paymentMethod === "creditCard" && stripeCustomer) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(buyerTotal * 100),
        currency: "usd",
        customer: stripeCustomer.stripeCustomerId,
        payment_method: stripeCustomer.paymentMethodId,
        confirm: true,
        metadata: {
          auctionId: auctionId.toString(),
          buyerId: buyerId.toString(),
          transactionType: "auction",
        },
      });

      if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment processing failed");
      }

      paymentResult = { success: true, paymentId: paymentIntent.id };
    } else {
      paymentResult = { success: false, message: "Unsupported payment method" };
    }

    if (!paymentResult.success) {
      throw new Error(paymentResult.message || "Payment processing failed");
    }

    // Update auction and save transaction
    auction.paid = true;
    auction.paymentStatus = "completed";
    await Promise.all([auction.save(), transaction.save()]);

    // Update admin earnings
    await User.findOneAndUpdate(
      { userType: "admin" },
      { $inc: { earnings: totalCommission } },
      { upsert: true }
    );

    // Create order record
    const order = new Order({
      userId: buyerId,
      products: [
        {
          productId: auction._id,
          quantity: 1,
          price: amount,
          name: auction.name,
          description: auction.description,
          image: auction.image ? [auction.image] : [],
        },
      ],
      totalPrice: buyerTotal,
      paymentMethod: paymentMethod.toUpperCase(),
      address: paymentDetails.address || {},
      status: "PAID",
      sellerCharge,
      transactionId: transaction._id,
    });

    await order.save();

    return res.status(200).json(
      new ApiResponse(200, "Payment processed successfully", {
        transaction,
        order,
        commissions: {
          seller: sellerCharge,
          total: totalCommission,
        },
      })
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message || "Payment processing failed"));
  }
});

const createAuctionCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const {
      productName,
      amount,
      quantity,
      productId,
      address,
      description,
      isAuction,
      image,
      auctionId,
    } = req.body;
    const buyerId = req.user._id;

    // Validate input
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json(new ApiResponse(400, "Invalid amount"));
    }
    if (!auctionId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Auction ID is required"));
    }
    if (!isAuction) {
      return res
        .status(400)
        .json(new ApiResponse(400, "This endpoint is for auctions only"));
    }

    // Verify auction exists
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    // Get buyer and seller users
    const buyer = await User.findById(buyerId).select(
      "subscription.durationMonths userType"
    );
    const seller = await User.findById(auction.seller).select(
      "subscription.durationMonths userType stripeAccountId"
    );

    if (!seller) {
      return res.status(404).json(new ApiResponse(404, "Seller not found"));
    }

    // Validate subscriptions
    if (!buyer?.subscription?.durationMonths) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Buyer has no active subscription"));
    }
    if (!seller?.subscription?.durationMonths) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Seller has no active subscription"));
    }

    // Map subscription duration to plan
const buyerDuration = parseInt(buyer.subscription.durationMonths, 10);
const sellerDuration = parseInt(seller.subscription.durationMonths, 10);
    const durationMap = {
  3: "threeMonth",
  6: "sixMonth",
  12: "twelveMonth",
};
const buyerPlanDuration = durationMap[buyerDuration];
const sellerPlanDuration = durationMap[sellerDuration];

    if (!buyerPlanDuration || !sellerPlanDuration) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription duration: buyer(${buyer.subscription.durationMonths}), seller(${seller.subscription.durationMonths})`,
      });
    }

    // Fetch commission rates dynamically based on userType
    const buyerCommissionDoc = await Commission.findOne({
      planDuration: buyerPlanDuration,
    });
    const sellerCommissionDoc = await Commission.findOne({
      planDuration: sellerPlanDuration,
    });

    if (!buyerCommissionDoc || !sellerCommissionDoc) {
      return res.status(400).json({
        success: false,
        message: `Commission rates not found for buyer (${buyer.userType}) or seller (${seller.userType})`,
      });
    }

    const buyerCommissionRate = buyerCommissionDoc.commissionRate;
    const sellerCommissionRate = sellerCommissionDoc.commissionRate;

    // Calculate amounts (all in USD)
    const round2 = (num) => Math.round(num * 100) / 100;
    const baseAmount = round2(amount / (1 + buyerCommissionRate / 100)); // Base price before buyer commission
    const buyerCommission = round2(baseAmount * (buyerCommissionRate / 100));
    const sellerCommission = round2(baseAmount * (sellerCommissionRate / 100));
    const totalCommission = round2(buyerCommission + sellerCommission);
    const sellerPayout = round2(baseAmount - sellerCommission);
    const buyerTotal = round2(amount); // Buyer pays amount (includes buyer commission)

    // Validate amounts
    const MINIMUM_AMOUNT_USD = 0.5;
    if (buyerTotal < MINIMUM_AMOUNT_USD) {
      return res.status(400).json({
        success: false,
        message: `Total amount (${buyerTotal.toFixed(
          2
        )}) is below the minimum required amount (${MINIMUM_AMOUNT_USD} USD)`,
      });
    }
    if (buyerTotal > 999999.99) {
  return res.status(400).json({
    success: false,
    message: "Amount exceeds Stripe's maximum limit of $999,999.99",
  });
}
    if (totalCommission >= amount || sellerPayout <= 0) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "Commissions exceed the total amount or invalid payout"
          )
        );
    }

    // Create transaction
    const transaction = new Transaction({
      auction: auctionId,
      buyer: buyerId,
      seller: auction.seller,
      amount: buyerTotal,
      paymentMethod: "CARD",
      buyerTotal: buyerTotal,
      sellerPayout: sellerPayout,
      totalCommission: totalCommission,
      commissions: {
        buyerRate: buyerCommissionRate,
        sellerRate: sellerCommissionRate,
        buyer: buyerCommission,
        seller: sellerCommission,
        total: totalCommission,
      },
      currency: "usd",
      status: "pending",
    });
    await transaction.save();

    // Prepare product images for Stripe
    const productImages = Array.isArray(image)
      ? image.slice(0, 1)
      : [image || auction.image || "https://via.placeholder.com/150"];

    // Create Stripe checkout session (without destination charges)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd", // Hardcode to USD
            product_data: {
              name: (productName || auction.name || "Auction Item").substring(
                0,
                100
              ),
              description: (
                description ||
                auction.description ||
                "Auction Item"
              ).substring(0, 500),
              images: productImages,
            },
            unit_amount: Math.round(buyerTotal * 100), // Convert to cents
          },
          quantity: quantity || 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/order-success/${auctionId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/payment-cancel`,
      metadata: {
        isAuction: "true",
        userId: buyerId.toString(),
        address: JSON.stringify(address).substring(0, 500),
        description: (description || "").substring(0, 500),
        totalPrice: buyerTotal.toString(),
        basePrice: baseAmount.toString(),
        buyerCommission: buyerCommission.toString(),
        sellerCommission: sellerCommission.toString(),
        totalCommission: totalCommission.toString(),
        sellerPayout: sellerPayout.toString(),
        auctionId: auction._id.toString(),
        transactionId: transaction._id.toString(),
        buyerCommissionRate: buyerCommissionRate.toString(),
        sellerCommissionRate: sellerCommissionRate.toString(),
        buyerUserType: buyer.userType, // Store buyer userType
        sellerUserType: seller.userType, // Store seller userType
        currency: "usd",
        image: productImages[0],
      },
    });

    res.status(200).json({
      success: true,
      url: session.url,
      currency: "usd",
      amount: buyerTotal,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          error.message || "Failed to create auction checkout session"
        )
      );
  }
});

 const createFleetCheckoutSession = asyncHandler(async (req, res) => {
  try {
    const {
      vehicleModel,
      amount,
      quantity = 1,
      fleetAuctionId,
      address,
      description,
      isFleetAuction,
      image,
      wrapType,
    } = req.body;

    // Validate flag
    if (!isFleetAuction) {
      return res.status(400).json({
        success: false,
        message: "This endpoint is for fleet auctions only",
      });
    }

    const buyerId = req.user._id;
    const userType = req.user.userType;
    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    // Minimum amount validation for USD
    const MINIMUM_AMOUNT_USD = 0.5;
    if (amount < MINIMUM_AMOUNT_USD) {
      return res.status(400).json({
        success: false,
        message: `Amount must be at least $${MINIMUM_AMOUNT_USD} to meet Stripe's minimum requirement`,
      });
    }

    if (!fleetAuctionId) {
      return res
        .status(400)
        .json({ success: false, message: "Fleet Auction ID is required" });
    }

    // Get fleet auction and populate fleetOwner
    const fleetAuction = await FleetOwner.findById(fleetAuctionId).populate(
      "user"
    );

    if (!fleetAuction) {
      return res
        .status(404)
        .json({ success: false, message: "Fleet auction not found" });
    }

    if (!fleetAuction.user) {
      return res
        .status(404)
        .json({ success: false, message: "Fleet owner not linked in auction" });
    }

    const fleetOwner = fleetAuction.user;

    // Fetch buyer's and seller's subscription details
    const buyer = await User.findById(buyerId).select(
      "subscription.durationMonths"
    );

    const seller = await User.findById(fleetOwner._id).select(
      "subscription.durationMonths stripeAccountId"
    );
    if (!buyer?.subscription?.durationMonths) {
      return res
        .status(400)
        .json({ success: false, message: "Buyer has no active subscription" });
    }

    if (!seller?.subscription?.durationMonths) {
      return res
        .status(400)
        .json({ success: false, message: "Seller has no active subscription" });
    }
const buyerDuration = parseInt(buyer.subscription.durationMonths, 10);
const sellerDuration = parseInt(seller.subscription.durationMonths, 10);
    const durationMap = {
  3: "threeMonth",
  6: "sixMonth",
  12: "twelveMonth",
};
const buyerPlanDuration = durationMap[buyerDuration];
const sellerPlanDuration = durationMap[sellerDuration];

    if (!buyerPlanDuration || !sellerPlanDuration) {
      return res.status(400).json({
        success: false,
        message: `Invalid subscription duration: buyer(${buyer.subscription.durationMonths}), seller(${seller.subscription.durationMonths})`,
      });
    }

    // Fetch commission rates
    const buyerCommissionDoc = await Commission.findOne({
      planDuration: buyerPlanDuration,
    });
   const sellerCommissionDoc = await Commission.findOne({
      planDuration: sellerPlanDuration,
    });

    if (!buyerCommissionDoc || !sellerCommissionDoc) {
      return res.status(400).json({
        success: false,
        message: "Commission rates not found for buyer or seller",
      });
    }

    const buyerCommissionRate = buyerCommissionDoc.commissionRate;
    const sellerCommissionRate = sellerCommissionDoc.commissionRate;

    // Commission Calculations (all in USD)
    const round2 = (num) => Math.round(num * 100) / 100;
    const baseAmount = round2(amount / (1 + buyerCommissionRate / 100)); // Base price before buyer commission
    const buyerCommission = round2(baseAmount * (buyerCommissionRate / 100));
    const sellerCommission = round2(baseAmount * (sellerCommissionRate / 100));
    const totalCommission = round2(buyerCommission + sellerCommission);
    const sellerPayout = round2(baseAmount - sellerCommission);
    const buyerTotal = round2(amount); // Buyer pays amount (includes buyer commission)

    if (totalCommission >= amount || sellerPayout <= 0) {
      return res.status(400).json({
        success: false,
        message: "Commissions exceed the total amount or invalid payout",
      });
    }

    if (buyerTotal < MINIMUM_AMOUNT_USD) {
      return res.status(400).json({
        success: false,
        message: `Total amount after commissions (${buyerTotal.toFixed(
          2
        )}) is below the minimum required amount (${MINIMUM_AMOUNT_USD})`,
      });
    }
if (buyerTotal > 999999.99) {
  return res.status(400).json({
    success: false,
    message: "Amount exceeds Stripe's maximum limit of $999,999.99",
  });
}
    // Create Transaction
    const transaction = new Transaction({
      fleetAuction: fleetAuctionId,
      buyer: buyerId,
      seller: fleetOwner._id,
      amount: buyerTotal,
      paymentMethod: "CARD",
      buyerTotal: buyerTotal,
      sellerPayout: sellerPayout,
      totalCommission: totalCommission,
      commissions: {
        buyerRate: buyerCommissionRate,
        sellerRate: sellerCommissionRate,
        buyer: buyerCommission,
        seller: sellerCommission,
        total: totalCommission,
      },
      currency: "usd",
      status: "pending",
    });
    await transaction.save();

    // Prepare Stripe image
    const productImages = Array.isArray(image)
      ? image.slice(0, 1)
      : [image || "https://via.placeholder.com/150"];

    // Stripe Session (without destination charges)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: vehicleModel || "Fleet Auction Item",
              description:
                description?.substring(0, 500) || "Fleet auction item",
              images: productImages,
            },
            unit_amount: Math.round(buyerTotal * 100), // Convert to cents
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/order-success/${fleetAuctionId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/payment-cancel`,
      metadata: {
        userId: buyerId.toString(),
        vehicleModel: vehicleModel || "Fleet Auction Item",
        address: JSON.stringify(address).substring(0, 500),
        description: description?.substring(0, 500) || "",
        basePrice: baseAmount.toString(),
        totalPrice: buyerTotal.toString(),
        fleetAuctionId: fleetAuctionId.toString(),
        transactionId: transaction._id.toString(),
        buyerCommissionRate: buyerCommissionRate.toString(),
        sellerCommissionRate: sellerCommissionRate.toString(),
        buyerCommission: buyerCommission.toString(),
        sellerCommission: sellerCommission.toString(),
        totalCommission: totalCommission.toString(),
        sellerPayout: sellerPayout.toString(),
        isFleetAuction: "true",
        wrapType: wrapType || "",
        currency: "usd",
      },
    });
    res.status(200).json({
      success: true,
      url: session.url,
      currency: "usd",
      amount: buyerTotal,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Fleet checkout error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create fleet checkout session",
    });
  }
});
// Add Payment Method
const addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, stripeAccountId, billingDetails } = req.body;
    const userId = req.user.id;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID is required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let stripeCustomerId = user.stripeCustomerId;


    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: billingDetails?.email || user.email,
        name: billingDetails?.name || user.name,
        metadata: {
          userId: userId.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      
   
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    if (billingDetails) {
      await stripe.paymentMethods.update(paymentMethodId, {
        billing_details: {
          name: billingDetails.name,
          email: billingDetails.email,
          address: {
            line1: billingDetails.address.line1,
            line2: billingDetails.address.line2 || null,
            city: billingDetails.address.city,
            state: billingDetails.address.state,
            postal_code: billingDetails.address.postal_code,
            country: billingDetails.address.country,
          }
        }
      });
    }

    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    user.paymentVerified = true;
    if (!user.stripeAccountId && stripeAccountId) {
      user.stripeAccountId = stripeAccountId;
    }
    await user.save();

    return res.json({
      success: true,
      message: "Payment method added successfully",
      paymentMethod: {
        id: paymentMethod.id,
        card: {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
          funding: paymentMethod.card.funding,
          country: paymentMethod.card.country
        },
        billing_details: {
          name: paymentMethod.billing_details.name,
          email: paymentMethod.billing_details.email,
          phone: paymentMethod.billing_details.phone,
          address: {
            line1: paymentMethod.billing_details.address?.line1,
            line2: paymentMethod.billing_details.address?.line2,
            city: paymentMethod.billing_details.address?.city,
            state: paymentMethod.billing_details.address?.state,
            postal_code: paymentMethod.billing_details.address?.postal_code,
            country: paymentMethod.billing_details.address?.country
          }
        },
        created: paymentMethod.created,
        livemode: paymentMethod.livemode
      }
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add payment method'
    });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'User or payment method not found'
      });
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No payment methods found'
      });
    }

    // BUSINESS RULE: Subscribers must always have a payment method
    // Check if this is the ONLY payment method
    if (paymentMethods.data.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the only payment method. Please add another payment method first.'
      });
    }

    // Get the specific payment method to delete
    // Either from request or delete the default one
    let paymentMethodId = req.body.paymentMethodId;
    
    if (!paymentMethodId) {
      // If no specific ID provided, get the default
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      paymentMethodId = customer.invoice_settings?.default_payment_method;
    }

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'No payment method specified to delete'
      });
    }

    // Detach the specific payment method
    await stripe.paymentMethods.detach(paymentMethodId);
    
    // Update customer's default payment method if we deleted the default one
    // IMPORTANT: Get customer again if we didn't already retrieve it above
    let customer;
    if (!req.body.paymentMethodId) {
      // We already have customer from above
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      // We need to get customer now
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    }
    
    if (customer.invoice_settings?.default_payment_method === paymentMethodId) {
      // Get remaining payment methods
      const remainingMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });

      // Set a new default payment method if any remain
      if (remainingMethods.data.length > 0) {
        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: remainingMethods.data[0].id,
          },
        });
      }
    }

    // Check if user still has any payment methods
    const updatedPaymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    // Update user's payment verification status
    user.paymentVerified = updatedPaymentMethods.data.length > 0;
    await user.save();

    return res.json({
      success: true,
      message: "Payment method removed successfully",
      remainingPaymentMethods: updatedPaymentMethods.data.length,
      paymentVerified: user.paymentVerified
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove payment method'
    });
  }
};
const getPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user doesn't have Stripe customer ID yet
    if (!user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'No payment method found'
      });
    }

    // Get customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    // Get default payment method from customer
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    // Find the default payment method
    let paymentMethod = null;
    if (defaultPaymentMethodId) {
      paymentMethod = paymentMethods.data.find(
        pm => pm.id === defaultPaymentMethodId
      );
    }

    // If no default found, return the first one
    if (!paymentMethod && paymentMethods.data.length > 0) {
      paymentMethod = paymentMethods.data[0];
    }

    if (paymentMethod) {
      return res.json({
        success: true,
        paymentMethod: {
          id: paymentMethod.id,
          card: {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
            funding: paymentMethod.card.funding,
            country: paymentMethod.card.country
          },
          billing_details: {
            name: paymentMethod.billing_details.name,
            email: paymentMethod.billing_details.email,
            phone: paymentMethod.billing_details.phone,
            address: {
              line1: paymentMethod.billing_details.address?.line1,
              line2: paymentMethod.billing_details.address?.line2,
              city: paymentMethod.billing_details.address?.city,
              state: paymentMethod.billing_details.address?.state,
              postal_code: paymentMethod.billing_details.address?.postal_code,
              country: paymentMethod.billing_details.address?.country
            }
          },
          created: paymentMethod.created,
          livemode: paymentMethod.livemode
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: 'No payment method found'
    });
  } catch (error) {
    console.error('Error fetching payment method:', error);
    
    // Don't show internal errors to client
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'resource_missing') {
        return res.status(404).json({
          success: false,
          message: 'No payment method found'
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment method',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
const getAllPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'No payment methods found'
      });
    }

    // Get ALL payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    // Get default payment method
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;

    // Format the response
    const formattedMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      isDefault: pm.id === defaultPaymentMethodId,
      card: {
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year,
        funding: pm.card.funding,
        country: pm.card.country
      },
      billing_details: {
        name: pm.billing_details.name,
        email: pm.billing_details.email,
        address: {
          line1: pm.billing_details.address?.line1,
          line2: pm.billing_details.address?.line2,
          city: pm.billing_details.address?.city,
          state: pm.billing_details.address?.state,
          postal_code: pm.billing_details.address?.postal_code,
          country: pm.billing_details.address?.country
        }
      },
      created: pm.created
    }));

    return res.json({
      success: true,
      paymentMethods: formattedMethods,
      defaultPaymentMethodId
    });

  } catch (error) {
    console.error('Error fetching all payment methods:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment methods'
    });
  }
};


const setDefaultPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'User or payment method not found'
      });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return res.json({
      success: true,
      message: "Default payment method updated successfully"
    });

  } catch (error) {
    console.error('Error setting default payment method:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to set default payment method'
    });
  }
};

const updateBillingAddress = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { paymentMethodId, address } = req.body;

    if (!paymentMethodId || !address) {
      return res.status(400).json({
        success: false,
        message: "Payment method ID and address are required"
      });
    }

    
    if (!address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required"
      });
    }

   
    const updatedPaymentMethod = await stripe.paymentMethods.update(
      paymentMethodId,
      {
        billing_details: {
          address: {
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country
          }
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "Billing address updated successfully",
      paymentMethod: updatedPaymentMethod
    });

  } catch (error) {
    console.error("Error updating billing address:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update billing address"
    });
  }
};
export {
  addPaymentMethodToCustomer,
  updatePaymentMethod,
  processAuctionPayment,
  paymentCheckout,
  createOrderCheckoutSession,
  createAuctionCheckoutSession,
  confirmOrderAfterStripePayment,
  getSessionInfo,
  createFleetCheckoutSession,
  getPaymentMethod,
  deletePaymentMethod,
  addPaymentMethod,
  updateBillingAddress,
   getAllPaymentMethods,
  setDefaultPaymentMethod
};
