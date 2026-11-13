import dotenv from "dotenv";
dotenv.config();
import { getEmailTransporter, getFromAddress } from "../utils/emailTransporter.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Stripe from "stripe";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";  
import Notification from "../models/notification.model.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";

import mongoose from "mongoose";
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import Subscription from "../models/subscription.model.js";
import { getInvoicePdfUrl } from '../utils/invoiceUtils.js';
import subscritpionTemplate from '../subscritpionTemplate.js'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ADVERTISER_TYPES = ["advertiser", "buyer"]; 

const getSuccessUrl = (userType, sessionIdPlaceholder, email) => {
  const type   = userType?.toLowerCase() || "";
  const page   = ADVERTISER_TYPES.includes(type)
    ? "BuyerMarketSubsriptionPaymentSuccess"
    : "subscriptionpaymentsuccess";
  return `${process.env.FRONTEND_URL}/${page}?session_id=${sessionIdPlaceholder}&email=${email}`;
};  


export const notifyAdmin = async (req, res) => {
  const { email, countryCode } = req.body;

  if (!email || !countryCode) {
    return res
      .status(400)
      .json({ success: false, message: "Missing email or countryCode" });
  }

  try {
    const transporter = await getEmailTransporter();
    const fromAddress = await getFromAddress();

    const mailOptions = {
      from: fromAddress,
      to: fromAddress,
      subject: `New Subscription from ${email} on Rule7Media website`,
      html: `<p><strong>Email:</strong> ${email}</p>`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Admin notified via email." });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
};


export const getSubscriptionPlanes = async (req, res) => {
  try {
    const userType = req.user?.userType?.toLowerCase();
    const userTypeToStatementDescriptor = {
      fleetowner: "Fleet Owner",
      seller: "Fleet Owner",
      advertiser: "Advertiser",
      buyer: "Advertiser",
      wrapper: "Wrapper",
    };
    const statementDescriptor = userTypeToStatementDescriptor[userType];

    const products = await stripe.products.list({ active: true, limit: 100 });

    const productWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 100,
        });
        return {
          ...product,
          prices: prices.data.map((price) => ({
            ...price,
            durationMonths: parseInt(price.metadata.durationMonths || product.metadata.durationMonths || "3"),
            discount: price.metadata.discount || "0%",
            monthlyCost: price.unit_amount / 100,
            totalCost: (price.unit_amount / 100) * (parseInt(price.metadata.durationMonths || "3")),
          })),
        };
      })
    );

    const filtered = statementDescriptor
      ? productWithPrices.filter((p) => p.statement_descriptor === statementDescriptor)
      : productWithPrices;

    // Sort by durationMonths
    filtered.sort((a, b) => {
      const durationA = parseInt(a.prices[0]?.durationMonths || 3);
      const durationB = parseInt(b.prices[0]?.durationMonths || 3);
      return durationA - durationB;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error("getSubscriptionPlanes Error:", error);
    res.status(500).json({ error: error.message });
  }
};




// export const subscriptionCheckout = asyncHandler(async (req, res) => {
//   const { priceId, campaignId, price, currency, recurring, email, planDuration, country } = req.body;
//   const parsedPlanDuration = parseInt(planDuration, 10);

//   if (!priceId || !campaignId || !email || !price || !currency || !recurring || isNaN(parsedPlanDuration)) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing or invalid required fields",
//       received: { priceId, campaignId, price, currency, recurring, email, planDuration, country },
//     });
//   }

//   if (![3, 6, 12].includes(parsedPlanDuration)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid plan duration. Must be 3, 6, or 12 months.",
//     });
//   }

//   let user = await User.findOne({ email });
//   if (!user) {
//     user = await User.create({
//       email,
//       userType: "guest",
//       subscription: {},
//     });
//   }

//   const userId = user._id.toString();
//   let stripeCustomerId = user.stripeCustomerId;

//   if (!stripeCustomerId) {
//     const customer = await stripe.customers.create({
//       email: user.email,
//       metadata: { userId },
//     });
//     stripeCustomerId = customer.id;
//     await User.findByIdAndUpdate(userId, { stripeCustomerId });
//   }

//   const subscriptions = await stripe.subscriptions.list({
//     customer: stripeCustomerId,
//     status: "active",
//   });

//   if (subscriptions.data.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Customer already has an active subscription.",
//     });
//   }

//   try {
//     const commitmentEndDate = new Date();
//     commitmentEndDate.setMonth(commitmentEndDate.getMonth() + parsedPlanDuration);

//     // Fetch price to get discount and validate
//     const priceObj = await stripe.prices.retrieve(priceId);
//     const discount = priceObj.metadata.discount || "0%";
//     const totalCost = (priceObj.unit_amount / 100) * parsedPlanDuration;

//     const session = await stripe.checkout.sessions.create({
//       customer: stripeCustomerId,
//       payment_method_types: ["card"],
//       line_items: [{ price: priceId, quantity: 1 }],
//       mode: "subscription",
//       success_url: `${process.env.FRONTEND_URL}/subscriptionpaymentsuccess?session_id={CHECKOUT_SESSION_ID}&email=${email}`,
//       cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
//       metadata: {
//         campaignId,
//         userId,
//         planDuration: parsedPlanDuration,
//         commitmentPeriod: parsedPlanDuration,
//         priceId,
//         price,
//         currency,
//         country,
//         discount,
//       },
//       subscription_data: {
//         metadata: {
//           totalMonthsCommitment: parsedPlanDuration,
//           userId,
//           campaignId,
//           commitmentEndDate: commitmentEndDate.toISOString(),
//           priceId,
//           price,
//           currency,
//           country,
//           discount,
//         },
//       },
//     });

//     await User.findByIdAndUpdate(userId, {
//       subscription: {
//         planDuration: parsedPlanDuration,
//         startDate: new Date(),
//         commitmentEndDate,
//         status: "pending",
//         totalMonths: parsedPlanDuration,
//         monthsCompleted: 0,
//         priceId,
//         price,
//         currency,
//         discount,
//         totalCost,
//         willAutoRenew: true,
//         isInCommitmentPeriod: true,
//       },
//     });

//     return res.status(200).json({ success: true, url: session.url });
//   } catch (err) {
//     console.error("Stripe session creation error:", {
//       message: err.message,
//       stack: err.stack,
//       email,
//       userId,
//       priceId,
//     });
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create checkout session",
//       error: err.message,
//     });
//   }
// });


// export const verifySession = asyncHandler(async (req, res) => {
//   const { sessionId } = req.params;
//   const userId = req.user?._id?.toString();
//   if (!sessionId) {
//     console.error("Session ID is missing");
//     return res.status(400).json({ success: false, message: "Session ID is required" });
//   }

//   if (!userId) {
//     console.error("User ID is missing from req.user");
//     return res.status(401).json({ success: false, message: "Unauthorized: No user ID found" });
//   }

//   try {
//     // Retrieve the Stripe session
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
   
//     // Verify the session belongs to the user
//     if (session.metadata.userId !== userId) {
//       console.error("Session metadata userId does not match:", {
//         sessionUserId: session.metadata.userId,
//         requestUserId: userId,
//       });
//       return res.status(403).json({ success: false, message: "Unauthorized access to session" });
//     }

//     // Check if the payment was successful
//     if (session.payment_status !== "paid" || session.status !== "complete") {
//       console.error("Payment not completed:", {
//         payment_status: session.payment_status,
//         status: session.status,
//       });
//       return res.status(400).json({ success: false, message: "Payment not completed" });
//     }

//     // Fetch subscription details from Stripe
//     if (!session.subscription) {
//       console.error("No subscription found in session:", session.id);
//       return res.status(400).json({ success: false, message: "No subscription found in session" });
//     }

//     const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
//     // Determine duration from metadata or price details
//  const durationMonths = session.metadata?.planDuration
//   ? parseInt(session.metadata.planDuration, 10)
//   : null;

// const updateData = {
//   stripeSubscriptionId: subscription.id,
//   campaignId: session.metadata.campaignId,
//   subscribedAt: new Date(),
//   status: subscription.status,
// };

// // ✅ केवल तभी save करो जब durationMonths मौजूद हो
// if (durationMonths !== null && !isNaN(durationMonths)) {
//   updateData.durationMonths = durationMonths;
// }

// const updatedUser = await User.findByIdAndUpdate(
//   userId,
//   { $set: { subscription: updateData } },
//   { new: true, runValidators: true }
// );
//     if (!updatedUser) {
//       console.error("Failed to update user in database for userId:", userId);
//       return res.status(500).json({ success: false, message: "Failed to update user subscription" });
//     }

//     // Return subscription details
//     return res.status(200).json({
//       success: true,
//       subscription: {
//         stripeSubscriptionId: subscription.id,
//         campaignId: session.metadata.campaignId,
//         subscribedAt: new Date(),
//         status: subscription.status,
//         ...updateData,
//       },
//     });
//   } catch (err) {
//     console.error("Error verifying session:", {
//       message: err.message,
//       stack: err.stack,
//       sessionId,
//       userId,
//     });
//     return res.status(500).json({
//       success: false,
//       message: "Failed to verify subscription details",
//       error: err.message,
//     });
//   }
// });
export const verifySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user?._id?.toString();

  if (!sessionId || !userId) {
    return res.status(400).json({ success: false, message: "Session ID and User ID required" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.latest_invoice', 'customer'],
    });

    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    if (session.metadata.userId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const subscription = session.subscription;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    try {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false,
      });
    } catch (updateError) {
      // Ignore update error
    }

    // === Get Invoice PDF URL ===
    let invoicePdfUrl = null;
    if (subscription?.latest_invoice) {
      invoicePdfUrl = await getInvoicePdfUrl(subscription);
    }

    // === Plan Details ===
    const planDuration = parseInt(session.metadata.planDuration || 3);
    const planName = `${planDuration}-Month Plan`;
    const amountPaid = subscription?.latest_invoice?.amount_paid 
      ? (subscription.latest_invoice.amount_paid / 100).toFixed(2) 
      : "0.00";
    const currency = subscription?.plan?.currency?.toUpperCase() || "USD";
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + planDuration);

    const userName = user.firstName || user.name || user.email.split("@")[0];

    // === UPDATE DB PEHLE (Email se pehle) ===
    const updateData = {
      "subscription.stripeSubscriptionId": subscription.id,
      "subscription.campaignId": session.metadata.campaignId,
      "subscription.status": subscription.status,
      "subscription.planDuration": planDuration,
      "subscription.durationMonths": planDuration.toString(),
      "subscription.subscribedAt": new Date(),
      "subscription.validUntil": validUntil,
      "subscription.priceId": session.metadata.priceId,
      "subscription.totalCost": amountPaid,
      "subscription.discount": session.metadata.discount || "0%",
      "subscription.willAutoRenew": true,
      "subscription.isInCommitmentPeriod": true,
    };

    await User.findByIdAndUpdate(userId, { $set: updateData });

    // === NOTIFICATION CREATE KARO ===
    const notificationUniqueId = `sub_success_${subscription.id}`;
    const existingNotification = await Notification.findOne({
      user: user._id,
      notificationId: notificationUniqueId 
    });

    if (!existingNotification) {
      await new Notification({
        user: user._id,
        title: "Subscription Active! 🎉",
        message: `Welcome! Your ${planName} plan is now active until ${validUntil.toLocaleDateString()}.`,
        type: "SUBSCRIPTION_SUCCESS",
        link: "/user-profile/profile",
        isRead: false,
        notificationId: notificationUniqueId,
      }).save();
    }

    // === EMAIL BHEJNE KI KOSHISH KARO (AGAR FAIL HO TOH IGNORE KARO) ===
    try {
      const transporter = await getEmailTransporter();
      const fromAddress = await getFromAddress();

      // === USER EMAIL ===
      const userEmailContent = `
        <p>Dear ${userName},</p>
        <p>Thank you for your purchase! Your subscription is now <strong>active</strong>.</p>
        <ul>
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Amount Paid:</strong> ${currency} ${amountPaid}</li>
          <li><strong>Valid Until:</strong> ${validUntil.toLocaleDateString()}</li>
          <li><strong>Status:</strong> Active</li>
        </ul>
        <p>Thank you for choosing Rule7Media!</p>
        <p>Best regards,<br><strong>Rule7Media Team</strong></p>
      `;

      await transporter.sendMail({
        from: fromAddress,
        to: user.email,
        subject: "Payment Successful - Your Invoice 📄",
        html: subscritpionTemplate(
          "Welcome to Premium! 🎉",
          userEmailContent,
          "Go to Dashboard",
          `${process.env.FRONTEND_URL}/user-profile/profile`,
          invoicePdfUrl
        ),
        attachments: [
          { filename: 'header.png', path: path.join(__dirname, '..', 'header.png'), cid: 'header' },
          { filename: 'footer.png', path: path.join(__dirname, '..', 'footer.png'), cid: 'footer' }
        ]
      });

      console.log('✅ User email sent successfully to:', user.email);

      // === ADMIN EMAIL ===
      const adminEmailContent = `
        <p><strong>New Subscription Purchased</strong></p>
        <p>A new user has successfully subscribed:</p>
        <ul>
          <li><strong>User:</strong> ${userName} (${user.email})</li>
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Amount:</strong> ${currency} ${amountPaid}</li>
          <li><strong>Session ID:</strong> ${sessionId}</li>
          ${invoicePdfUrl ? `<li><strong>Invoice:</strong> <a href="${invoicePdfUrl}">Download PDF</a></li>` : ''}
        </ul>
      `;

      await transporter.sendMail({
        from: fromAddress,
        to: fromAddress,
        subject: `New Subscription: ${user.email} - ${planName}`,
        html: subscritpionTemplate("New Subscription Alert", adminEmailContent),
        attachments: [
          { filename: 'header.png', path: path.join(__dirname, '..', 'header.png'), cid: 'header' },
          { filename: 'footer.png', path: path.join(__dirname, '..', 'footer.png'), cid: 'footer' }
        ]
      });

      console.log('✅ Admin email sent successfully');

    } catch (emailError) {
      // ⚠️ EMAIL FAIL HO GAYA - IGNORE KARO
      console.error('⚠️ Email sending failed (ignored):', emailError.message);
      // Yaha par kuch nahi karo, bas log karo
    }

    // ✅ SUCCESS RESPONSE (Email fail bhi ho toh bhi)
    res.status(200).json({
      success: true,
      message: "Subscription verified and activated",
      subscription: {
        status: subscription.status,
        planName,
        validUntil,
        invoicePdfUrl,
      },
    });

  } catch (err) {
    console.error("verifySession Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify session",
      error: err.message,
    });
  }
});
// backend/controllers/subscriptionController.js

export const checkSubscriptionStatus = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user || !user.subscription || !user.subscription.stripeSubscriptionId) {
      return res.status(200).json({
        success: true,
        subscription: { status: "inactive" },
      });
    }

    // 🔹 Fetch subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    // 🔹 Extract duration ONLY from metadata or DB
    let durationMonths =
      subscription.metadata?.parsedPlanDuration ||
      user.subscription.durationMonths ||
      null;

    // ❌ Default duration kabhi mat do — sirf jo user ne plan select kiya
    // (no default "3", "6", etc.)

    // 🔹 Update DB if duration missing or changed
    if (
      durationMonths &&
      user.subscription.durationMonths !== durationMonths
    ) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          subscription: {
            ...user.subscription,
            durationMonths,
            status: subscription.status,
          },
        },
      });
    }

    // 🔹 Send response
    return res.status(200).json({
      success: true,
      subscription: {
        stripeSubscriptionId: subscription.id,
        campaignId: user.subscription.campaignId,
        subscribedAt: user.subscription.subscribedAt,
        status: subscription.status,
        durationMonths, // 👈 Sirf user-selected duration
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        autoRenew: subscription.cancel_at_period_end === false, // 👈 Auto renew check
      },
    });
  } catch (err) {
    console.error("❌ Error fetching subscription:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//cancle subscritpion 
export const cancelSubscription = async (req, res) => {
  try {
    const { stripeSubscriptionId, userEmail, userId, password, countryCode } = req.body;

    // ✅ 1. Validate input
    if (!stripeSubscriptionId || !userEmail || !userId || !password || !countryCode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ 2. Verify user & password
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // ✅ 3. Fetch subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    if (stripeSubscription.cancel_at_period_end) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already set to cancel at period end.",
        status: stripeSubscription.status,
      });
    }

    // ✅ 4. Get subscribedAt & durationMonths
    const subscribedAt = new Date(stripeSubscription.start_date * 1000);
    let durationMonths =
      Number(stripeSubscription.metadata?.totalMonthsCommitment || user.subscription?.planDuration);

    if (isNaN(durationMonths) || durationMonths <= 0) durationMonths = 3; // default fallback

    // ✅ 5. Compute validUntil date from plan duration
    const validUntil = new Date(subscribedAt);
    validUntil.setMonth(validUntil.getMonth() + durationMonths);

    const daysLeft = Math.ceil((validUntil - new Date()) / (1000 * 60 * 60 * 24));

    if (daysLeft > 14) {
      return res.status(400).json({
        success: false,
        message: `You can only cancel within the last 14 days of your ${durationMonths}-month plan. ${daysLeft} days remain.`,
        daysLeft,
      });
    }

    const updatedStripeSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // ✅ 9. Format display dates
    const formattedSubscribedAt = subscribedAt.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    const formattedValidUntil = validUntil.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    // ✅ 10. Update user DB
    user.subscription = {
      ...user.subscription,
      stripeSubscriptionId,
      cancelAtPeriodEnd: true,
      status: updatedStripeSubscription.status,
      durationMonths,
      subscribedAt,
      currentPeriodEnd: Math.floor(validUntil.getTime() / 1000),
      updatedAt: new Date(),
    };
    await user.save();

    // ✅ 11. Send cancellation email (dynamic SMTP)
    try {
    const transporter = await getEmailTransporter();
    const fromAddress = await getFromAddress();

    await transporter.sendMail({
      from: fromAddress,
      to: userEmail,
      subject: "Subscription Cancelled",
      html: `
        <p>Hello,</p>
        <p>Your <b>${durationMonths}-month</b> subscription has been set to cancel.</p>
        <p>You’ll continue to have access until <b>${formattedValidUntil}</b>.</p>
        <p>After that, no further payments will be charged.</p>
        <br/>
        <p>Thank you,<br/>Rule7Media Team</p>
      `,
    });
    } catch (emailErr) {
      console.error('⚠️ Cancellation email failed (ignored):', emailErr.message);
    }

    // ✅ 12. Final response
    res.json({
      success: true,
      message: `Your ${durationMonths}-month plan is set to cancel. You’ll have access until ${formattedValidUntil}.`,
      durationMonths,
      subscribedAt: formattedSubscribedAt,
      expiryDate: formattedValidUntil,
      daysLeft,
      status: updatedStripeSubscription.status,
      cancelAtPeriodEnd: true,
    });
  } catch (error) {
    console.error("❌ Cancel Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getSubscriptionStatus = async (req, res) => {
  try {
    const { userId, stripeSubscriptionId } = req.body;

    if (!userId || !stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "userId and stripeSubscriptionId are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    // Extract plan duration (try metadata first, then DB)
    let durationMonths = Number(
      stripeSubscription.metadata?.totalMonthsCommitment ||
      user.subscription?.planDuration ||
      0
    );

    // fallback if not numeric
    if (isNaN(durationMonths) || durationMonths <= 0) {
      durationMonths = 3; // Default fallback
    }

    // Stripe subscription start date
    const subscribedAt = new Date(stripeSubscription.start_date * 1000);

    // ✅ Calculate valid until date correctly
    const validUntil = new Date(subscribedAt);
    validUntil.setMonth(validUntil.getMonth() + durationMonths);

    const formattedSubscribedAt = subscribedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedValidUntil = validUntil.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Days remaining until full plan expiry
    const daysRemaining = Math.ceil(
      (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
const autoRenew = !stripeSubscription.cancel_at_period_end;
let renewalDate = null;
let renewalReminderSent = false;

if (autoRenew) {
  renewalDate = new Date(stripeSubscription.current_period_end * 1000);
  
  // Check if renewal reminder already sent (2 weeks before)
  const twoWeeksBefore = new Date(renewalDate);
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
  const today = new Date();
  
  renewalReminderSent = user.subscription?.lastRenewalReminderSent 
    ? new Date(user.subscription.lastRenewalReminderSent) > twoWeeksBefore
    : false;
}
    const response = {
      success: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        durationMonths,
        subscribedAt: formattedSubscribedAt,
        validUntil: formattedValidUntil,
        daysRemaining,
        autoRenew,
         planSummary: `${durationMonths}-month plan (${autoRenew ? 'Auto-renew enabled' : 'Auto-renew disabled'})`
      },
    };

    // Optional DB sync
    user.subscription = {
      ...user.subscription,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      durationMonths,
      updatedAt: new Date(),
    };
    await user.save();

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Get Subscription Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get subscription status",
    });
  }
};

export const subscriptionCheckout = asyncHandler(async (req, res) => {
  const {
    priceId, campaignId, price, currency,
    recurring, email, planDuration, country,
  } = req.body;

  const parsedPlanDuration = parseInt(planDuration, 10);

  if (
    !priceId || !campaignId || !email || !price ||
    !currency || !recurring || isNaN(parsedPlanDuration)
  ) {
    return res.status(400).json({ success: false, message: "Missing or invalid required fields" });
  }

  if (![3, 6, 12].includes(parsedPlanDuration)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan duration. Must be 3, 6, or 12 months.",
    });
  }

  /* Find or create user */
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, userType: "guest", subscription: {} });
  }

  const userId    = user._id.toString();
  const userType  = user.userType?.toLowerCase() || "guest";

  /* Stripe customer */
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email, metadata: { userId } });
    stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId });
  }

  /* Block double subscription */
  const activeSubs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
  });
  if (activeSubs.data.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Customer already has an active subscription.",
    });
  }

  try {
    const startDate         = new Date();
    const commitmentEndDate = new Date();
    commitmentEndDate.setMonth(startDate.getMonth() + parsedPlanDuration);

    const priceObj  = await stripe.prices.retrieve(priceId);
    const discount  = priceObj.metadata.discount || "0%";
    const totalCost = (priceObj.unit_amount / 100) * parsedPlanDuration;

    /* ── SUCCESS URL — advertiser vs everyone else ── */
    const successUrl = getSuccessUrl(
      userType,
      "{CHECKOUT_SESSION_ID}",
      email
    );

    const session = await stripe.checkout.sessions.create({
      customer:              stripeCustomerId,
      payment_method_types:  ["card"],
      line_items:            [{ price: priceId, quantity: 1 }],
      mode:                  "subscription",
      success_url:           successUrl,
      cancel_url:            `${process.env.FRONTEND_URL}/subscription-cancel`,
      subscription_data: {
        metadata: {
          userId,
          campaignId,
          totalMonthsCommitment: parsedPlanDuration,
          commitmentEndDate:     commitmentEndDate.toISOString(),
          priceId,
          price,
          currency,
          country,
          discount,
          userType,          // ← stored so verifySession can also use it
        },
      },
      metadata: {
        userId,
        campaignId,
        planDuration: parsedPlanDuration,
        country,
        userType,            // ← stored in session metadata too
      },
    });

    await User.findByIdAndUpdate(userId, {
      subscription: {
        planDuration:         parsedPlanDuration,
        startDate,
        commitmentEndDate,
        status:               "pending",
        totalMonths:          parsedPlanDuration,
        monthsCompleted:      0,
        priceId,
        price,
        currency,
        discount,
        totalCost,
        willAutoRenew:        true,
        isInCommitmentPeriod: true,
        autoRenewEnabled:     true,
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    console.error("Stripe session creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: err.message,
    });
  }
});


