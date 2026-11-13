// controllers/subscriptionPlan.controller.js
import Stripe from "stripe";
import CustomPlan from "../models/SubscriptionPlan.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import sendPushNotification from "../firebase/firebaseAdmin.js";
import { getEmailTransporter, getFromAddress } from "../utils/emailTransporter.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import subscritpionTemplate from '../subscritpionTemplate.js'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getSubscriptionPlansforusers = async (req, res) => {
  try {
    const userType = req.user?.userType?.toLowerCase();

    const query = { active: true };

    if (userType) {
      if (["seller", "fleetowner"].includes(userType)) {
        query.userType = { $in: ["seller", "fleetowner"] };
      } else if (["buyer", "advertiser"].includes(userType)) {
        query.userType = { $in: ["buyer", "advertiser"] };
      } else if (userType === "wrapper") {
        query.userType = "wrapper";
      }
    }

    const plans = await CustomPlan.find(query).lean();

    const plansWithPrice = await Promise.all(
      plans.map(async (plan) => {
        try {
          const price = await stripe.prices.retrieve(plan.stripePriceId, {
            expand: ["currency_options"],
          });

          return {
            _id: plan._id,
            name: plan.name,
            description: plan.description,
            planCode: plan.planCode,
            durationMonths: plan.durationMonths,
            discountLabel: plan.discountLabel,
            marketingFeatures: plan.marketingFeatures,
            userType: plan.userType,
            price: {
              id: price.id,
              amount: (price.unit_amount / 100).toFixed(2),
              unit_amount: price.unit_amount,
              currency: price.currency.toUpperCase(),
            },
          };
        } catch (err) {
          //console.error(`Stripe price fetch failed for ${plan.stripePriceId}`, err.message);
          return {
            ...plan,
            price: null,
            priceError: "Price temporarily unavailable",
          };
        }
      })
    );

    // Sort by duration
    plansWithPrice.sort((a, b) => a.durationMonths - b.durationMonths);

    res.status(200).json(plansWithPrice);
  } catch (error) {
    console.error("getSubscriptionPlansWithPrice Error:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
};
// export const upgradeSubscription = asyncHandler(async (req, res) => {
//   const { newPriceId, userEmail } = req.body;

//   if (!newPriceId || !userEmail) {
//     return res.status(400).json({
//       success: false,
//       message: "newPriceId and userEmail required",
//     });
//   }

//   const user = await User.findOne({ email: userEmail });
  
//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }

//   const userId = user._id.toString();

//   if (!user.subscription?.stripeSubscriptionId) {
//     return res.status(400).json({
//       success: false,
//       message: "No active subscription found",
//     });
//   }

//   const oldSubId = user.subscription.stripeSubscriptionId;

//   try {
//     const subscription = await stripe.subscriptions.retrieve(oldSubId);

//     if (subscription.status !== "active" && subscription.status !== "trialing") {
//       return res.status(400).json({
//         success: false,
//         message: "Subscription is not active",
//       });
//     }
//     const [oldPrice, newPrice] = await Promise.all([
//       stripe.prices.retrieve(subscription.items.data[0].price.id),
//       stripe.prices.retrieve(newPriceId),
//     ]);

//     const [oldProduct, newProduct] = await Promise.all([
//       stripe.products.retrieve(oldPrice.product),
//       stripe.products.retrieve(newPrice.product),
//     ]);

//     const extractDuration = (product) => {
//       if (!product) return 3;
      
//       const description = product.description || product.name || '';
//       const lowerDesc = description.toLowerCase();
      
//       if (lowerDesc.includes('12') || lowerDesc.includes('year') || lowerDesc.includes('annual')) {
//         return 12;
//       }
//       if (lowerDesc.includes('6') || lowerDesc.includes('half')) {
//         return 6;
//       }
//       if (lowerDesc.includes('3') || lowerDesc.includes('quarter')) {
//         return 3;
//       }
      
//       return 3;
//     };

//     const currentDuration = parseInt(user.subscription?.durationMonths) || 
//                            parseInt(user.subscription?.planDuration) || 
//                            3;

//     const newDuration = extractDuration(newProduct);
//     const oldDuration = extractDuration(oldProduct);


//     if (newDuration <= currentDuration) {
//       return res.status(400).json({
//         success: false,
//         message: `This is not an upgrade. Current: ${currentDuration} months, Requested: ${newDuration} months`,
//       });
//     }
//     const subscribedAt = user.subscription?.subscribedAt || new Date();
//     const newValidUntil = new Date(subscribedAt);
//     newValidUntil.setMonth(newValidUntil.getMonth() + newDuration);
    
//     const updatedSubscription = await stripe.subscriptions.update(oldSubId, {
//       cancel_at_period_end: false,
//       proration_behavior: "create_prorations",
//       items: [
//         {
//           id: subscription.items.data[0].id,
//           price: newPriceId,
//         },
//       ],
//       metadata: {
//         ...subscription.metadata,
//         totalMonthsCommitment: newDuration,
//         parsedPlanDuration: newDuration,
//         validUntil: newValidUntil.toISOString(),
//       }
//     });

//     const updateData = {
//       "subscription.priceId": newPriceId,
//       "subscription.planDuration": newDuration,
//       "subscription.durationMonths": newDuration.toString(), 
//       "subscription.campaignId": newProduct.id,
//       "subscription.totalMonths": newDuration,
//       "subscription.discount": "0%",
//       "subscription.totalCost": (newPrice.unit_amount / 100) * newDuration,
//       "subscription.willAutoRenew": true,
//       "subscription.isInCommitmentPeriod": true,
//       "subscription.updatedAt": new Date(),
//       "subscription.planName": newProduct.name || `Plan (${newDuration} months)`,
//       "subscription.validUntil": newValidUntil, 
//       "subscription.statementDescriptor": newProduct.statement_descriptor || "",
//       "subscription.status": updatedSubscription.status,
//     };

//     if (user.subscription.commitmentEndDate !== undefined) {
//       updateData["subscription.commitmentEndDate"] = newValidUntil;
//     }

//     const updatedUser = await User.findOneAndUpdate(
//       { _id: userId },
//       { 
//         $set: updateData,
//         $setOnInsert: {
//           ...(user.subscription.subscribedAt && { "subscription.subscribedAt": user.subscription.subscribedAt }),
//           ...(user.subscription.stripeSubscriptionId && { "subscription.stripeSubscriptionId": user.subscription.stripeSubscriptionId }),
//         }
//       },
//       { 
//         new: true,
//         runValidators: false,
//         returnOriginal: false
//       }
//     );

//     if (!updatedUser) {
//       throw new Error("Failed to update user in database");
//     }

//     const verifyUser = await User.findById(userId).lean();
 
//     res.status(200).json({
//       success: true,
//       message: `Subscription upgraded successfully from ${currentDuration} months to ${newDuration} months!`,
//       data: {
//         subscription: {
//           status: updatedSubscription.status,
//           priceId: newPriceId,
//           planDuration: newDuration,
//           durationMonths: newDuration,
//           planName: newProduct.name,
//           campaignId: newProduct.id,
//           discount: "0%",
//           currentPeriodEnd: updatedSubscription.current_period_end,
//           monthlyPrice: newPrice.unit_amount / 100,
//           totalCost: (newPrice.unit_amount / 100) * newDuration,
//           subscribedAt: subscribedAt,
//           validUntil: newValidUntil,
//           stripeSubscriptionId: updatedSubscription.id,
//           statementDescriptor: newProduct.statement_descriptor,
//         },
//         oldPlan: `${currentDuration} months`,
//         newPlan: `${newDuration} months`,
//         oldPrice: oldPrice.unit_amount / 100,
//         newPrice: newPrice.unit_amount / 100,
//         currency: newPrice.currency,
//         proration: updatedSubscription.latest_invoice ? "Applied" : "None",
//         nextBillingDate: new Date(updatedSubscription.current_period_end * 1000),
//       },
//     });
//   } catch (error) {
//     console.error("❌ Upgrade failed:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to upgrade subscription",
//       error: error.message,
//       stack: error.stack
//     });
//   }
// });

export const upgradeSubscription = asyncHandler(async (req, res) => {
  const { newPriceId, userEmail } = req.body;

  if (!newPriceId || !userEmail) {
    return res.status(400).json({
      success: false,
      message: "newPriceId and userEmail required",
    });
  }

  const user = await User.findOne({ email: userEmail });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const userId = user._id.toString();

  if (!user.subscription?.stripeSubscriptionId) {
    return res.status(400).json({
      success: false,
      message: "No active subscription found",
    });
  }

  const oldSubId = user.subscription.stripeSubscriptionId;

  try {
    const subscription = await stripe.subscriptions.retrieve(oldSubId);

    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return res.status(400).json({
        success: false,
        message: "Subscription is not active",
      });
    }

    const [oldPrice, newPrice] = await Promise.all([
      stripe.prices.retrieve(subscription.items.data[0].price.id),
      stripe.prices.retrieve(newPriceId),
    ]);

    const [oldProduct, newProduct] = await Promise.all([
      stripe.products.retrieve(oldPrice.product),
      stripe.products.retrieve(newPrice.product),
    ]);

    const extractDuration = (product) => {
      if (!product) return 3;
      
      const description = product.description || product.name || '';
      const lowerDesc = description.toLowerCase();
      
      if (lowerDesc.includes('12') || lowerDesc.includes('year') || lowerDesc.includes('annual')) {
        return 12;
      }
      if (lowerDesc.includes('6') || lowerDesc.includes('half')) {
        return 6;
      }
      if (lowerDesc.includes('3') || lowerDesc.includes('quarter')) {
        return 3;
      }
      
      return 3;
    };

    const currentDuration = parseInt(user.subscription?.durationMonths) || 
                           parseInt(user.subscription?.planDuration) || 
                           3;

    const newDuration = extractDuration(newProduct);
    const oldDuration = extractDuration(oldProduct);

    if (newDuration <= currentDuration) {
      return res.status(400).json({
        success: false,
        message: `This is not an upgrade. Current: ${currentDuration} months, Requested: ${newDuration} months`,
      });
    }

    const subscribedAt = user.subscription?.subscribedAt || new Date();
    const newValidUntil = new Date(subscribedAt);
    newValidUntil.setMonth(newValidUntil.getMonth() + newDuration);
    
    const updatedSubscription = await stripe.subscriptions.update(oldSubId, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      metadata: {
        ...subscription.metadata,
        totalMonthsCommitment: newDuration,
        parsedPlanDuration: newDuration,
        validUntil: newValidUntil.toISOString(),
      }
    });

    const updateData = {
      "subscription.priceId": newPriceId,
      "subscription.planDuration": newDuration,
      "subscription.durationMonths": newDuration.toString(), 
      "subscription.campaignId": newProduct.id,
      "subscription.totalMonths": newDuration,
      "subscription.discount": "0%",
      "subscription.totalCost": (newPrice.unit_amount / 100) * newDuration,
      "subscription.willAutoRenew": true,
      "subscription.isInCommitmentPeriod": true,
      "subscription.updatedAt": new Date(),
      "subscription.planName": newProduct.name || `Plan (${newDuration} months)`,
      "subscription.validUntil": newValidUntil, 
      "subscription.statementDescriptor": newProduct.statement_descriptor || "",
      "subscription.status": updatedSubscription.status,
    };

    if (user.subscription.commitmentEndDate !== undefined) {
      updateData["subscription.commitmentEndDate"] = newValidUntil;
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { 
        $set: updateData,
        $setOnInsert: {
          ...(user.subscription.subscribedAt && { "subscription.subscribedAt": user.subscription.subscribedAt }),
          ...(user.subscription.stripeSubscriptionId && { "subscription.stripeSubscriptionId": user.subscription.stripeSubscriptionId }),
        }
      },
      { 
        new: true,
        runValidators: false,
        returnOriginal: false
      }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user in database");
    }

    const verifyUser = await User.findById(userId).lean();
    const userName = user.firstName || user.name || user.email.split("@")[0];
    const planName = newProduct.name || `${newDuration}-Month Plan`;
    const amount = (newPrice.unit_amount / 100);
    const currency = newPrice.currency.toUpperCase();

    // ✅ Notification - Always create (no email dependency)
    await new Notification({
      user: user._id,
      title: "Subscription Upgraded! 🎉",
      message: `Your plan has been upgraded from ${oldDuration} Month to ${newDuration} Month. You can now enjoy the new benefits and features.`,
      type: "SUBSCRIPTION_UPGRADE",
      link: "/user-profile/cancel-subscription",
      isRead: false,
    }).save();

    // ✅ Push Notification - Try karo, fail ho toh ignore
    try {
      if (user.fcmToken) {
        await sendPushNotification(
          user.fcmToken,
          "Subscription Upgraded!",
          `You've successfully upgraded to ${planName}`
        );
      }
    } catch (pushError) {
      console.error('⚠️ Push notification failed (ignored):', pushError.message);
    }

    // ✅ USER EMAIL - Try karo, fail ho toh ignore
    try {
      const userEmailContent = `
        <p>Dear ${userName},</p>
        <p>Congratulations! 🎉 Your subscription has been successfully upgraded.</p>
        <ul>
          <li><strong>New Plan:</strong> ${planName}</li>
          <li><strong>Previous Plan:</strong> ${oldDuration}-Month Plan</li>
          <li><strong>New Plan:</strong> ${newDuration}-Month Plan</li>
          <li><strong>Amount Paid:</strong> ${currency} ${amount}</li>
          <li><strong>Valid Until:</strong> ${newValidUntil.toLocaleDateString()}</li>
        </ul>
        <p>Thank you for choosing premium features!</p>
        <p>Best regards,<br>Rule7Media</p>
      `;

      const transporterUser = await getEmailTransporter();
      const fromAddress = await getFromAddress();

      await transporterUser.sendMail({
        from: fromAddress,
        to: user.email,
        subject: "Subscription Upgraded Successfully! 🎉",
        html: subscritpionTemplate("Subscription Upgraded", userEmailContent),
        attachments: [
          { filename: 'header.png', path: path.join(__dirname, '..', 'header.png'), cid: 'header' },
          { filename: 'footer.png', path: path.join(__dirname, '..', 'footer.png'), cid: 'footer' }
        ]
      });
      console.log('✅ User upgrade email sent to:', user.email);
    } catch (userEmailError) {
      console.error('⚠️ User upgrade email failed (ignored):', userEmailError.message);
    }

    // ✅ ADMIN NOTIFICATIONS - Always create (no email dependency)
    try {
      const admins = await User.find({ userType: "admin" });
      for (const admin of admins) {
        await new Notification({
          user: admin._id,
          title: "User Upgraded Plan 🚀",
          message: `${userName} (${user.email}) upgraded from ${oldDuration}-month to ${newDuration}-month plan (${planName})`,
          type: "ADMIN_SUBSCRIPTION_UPGRADE",
          link: `/admin/users/profile/${user._id}`,
          metadata: {
            userId: user._id,
            userEmail: user.email,
            oldPlan: oldDuration,
            newPlan: newDuration,
            amount,
            currency,
          },
          isRead: false,
        }).save();
      }
    } catch (adminNotifError) {
      console.error('⚠️ Admin notification creation failed (ignored):', adminNotifError.message);
    }

    // ✅ ADMIN EMAIL - Try karo, fail ho toh ignore
    try {
      const adminEmailContent = `
        <p><strong>User Subscription Upgrade Alert</strong></p>
        <p>A user has upgraded their subscription:</p>
        <ul>
          <li><strong>User:</strong> ${userName} (${user.email})</li>
          <li><strong>Old Plan:</strong> ${oldDuration} months</li>
          <li><strong>New Plan:</strong> ${newDuration} months (${planName})</li>
          <li><strong>Amount:</strong> ${currency} ${amount}</li>
          <li><strong>Upgrade Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Check admin panel for details.</p>
      `;

      const adminTransporter = await getEmailTransporter();
      const fromAddress = await getFromAddress();

      await adminTransporter.sendMail({
        from: fromAddress,
        to: fromAddress,
        subject: `User Upgraded Plan: ${user.email} → ${planName}`,
        html: subscritpionTemplate("Plan Upgrade", adminEmailContent),
        attachments: [
          { filename: 'header.png', path: path.join(__dirname, '..', 'header.png'), cid: 'header' },
          { filename: 'footer.png', path: path.join(__dirname, '..', 'footer.png'), cid: 'footer' }
        ]
      });
      console.log('✅ Admin upgrade email sent');
    } catch (adminEmailError) {
      console.error('⚠️ Admin upgrade email failed (ignored):', adminEmailError.message);
    }

    // ✅ SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: `Subscription upgraded successfully from ${currentDuration} months to ${newDuration} months!`,
      data: {
        subscription: {
          status: updatedSubscription.status,
          priceId: newPriceId,
          planDuration: newDuration,
          durationMonths: newDuration,
          planName: newProduct.name,
          campaignId: newProduct.id,
          discount: "0%",
          currentPeriodEnd: updatedSubscription.current_period_end,
          monthlyPrice: newPrice.unit_amount / 100,
          totalCost: (newPrice.unit_amount / 100) * newDuration,
          subscribedAt: subscribedAt,
          validUntil: newValidUntil,
          stripeSubscriptionId: updatedSubscription.id,
          statementDescriptor: newProduct.statement_descriptor,
        },
        oldPlan: `${currentDuration} months`,
        newPlan: `${newDuration} months`,
        oldPrice: oldPrice.unit_amount / 100,
        newPrice: newPrice.unit_amount / 100,
        currency: newPrice.currency,
        proration: updatedSubscription.latest_invoice ? "Applied" : "None",
        nextBillingDate: new Date(updatedSubscription.current_period_end * 1000),
      },
    });
  } catch (error) {
    console.error("❌ Upgrade failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upgrade subscription",
      error: error.message,
      stack: error.stack
    });
  }
});





export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const plans = await CustomPlan.find();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSubscriptionPlan = async (req, res) => {
  try {
    const plan = new CustomPlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await CustomPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await CustomPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Plan permanently deleted", plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};