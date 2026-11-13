// src/cronJobs.js
import dotenv from "dotenv";
dotenv.config();
import cron from 'node-cron';
import moment from "moment";
import Auction from './models/auction.model.js'
import FleetOwner from './models/fleetowner.model.js';
import Bid from './models/bid.model.js';
import Notification from './models/notification.model.js';
import Cart from './models/cart.model.js';
import User from './models/user.model.js';
import Order from './models/Order.js';
import { io } from "./index.js";
import stripe from "stripe";
import { getEmailTransporter, getFromAddress } from "./utils/emailTransporter.js";
import Campaign from "./models/campaign.model.js";
import { asyncHandler } from "./utils/asyncHandler.js";

function formatDate(date) {
  return moment(date).format('MMMM Do YYYY');
}

// Add these functions at the top after imports

// ✅ Schedule existing auctions on server startup
async function scheduleExistingAuctions() {
  try {
    
    const now = new Date();
    
    // Find all active or upcoming auctions
    const auctions = await Auction.find({
      status: { $in: ["upcoming", "active"] },
      endTime: { $gt: now }
    });

    for (const auction of auctions) {
      const startTime = new Date(auction.startTime);
      const endTime = new Date(auction.endTime);

      // Schedule start if not started yet
      if (startTime > now) {
        const startCron = moment(startTime).format('m H D M *');
        cron.schedule(startCron, () => {
        
          updateAuctionStatus(auction._id, 'active');
        });
        
      }

      // Schedule end
      const endCron = moment(endTime).format('m H D M *');
      cron.schedule(endCron, async () => {
        
        await updateAuctionStatus(auction._id, 'over');
        await selectAuctionWinner(auction._id);
      });
      
    }

    // Check for auctions that should have ended already
    const overdueAuctions = await Auction.find({
      status: { $in: ["upcoming", "active"] },
      endTime: { $lte: now }
    });

    for (const auction of overdueAuctions) {
    
      await updateAuctionStatus(auction._id, 'over');
      await selectAuctionWinner(auction._id);
    }

   
  } catch (error) {
    console.error("❌ Error scheduling existing auctions:", error);
  }
}

// ✅ Schedule existing fleet auctions on server startup
async function scheduleExistingFleetAuctions() {
  try {
 
    
    const now = new Date();
    
    // Find all active or upcoming fleet auctions
    const fleetAuctions = await FleetOwner.find({
      status: { $in: ["upcoming", "active"] },
      endTime: { $gt: now }
    });

    for (const fleetAuction of fleetAuctions) {
      const startTime = new Date(fleetAuction.startTime);
      const endTime = new Date(fleetAuction.endTime);

      // Schedule start if not started yet
      if (startTime > now) {
        const startCron = moment(startTime).format('m H D M *');
        cron.schedule(startCron, () => {
         
          updateFleetAuctionStatus(fleetAuction._id, 'active');
        });
       
      }

      // Schedule end
      const endCron = moment(endTime).format('m H D M *');
      cron.schedule(endCron, async () => {
      
        await updateFleetAuctionStatus(fleetAuction._id, 'over');
        await selectFleetAuctionWinner(fleetAuction._id);
      });
      
    }

    // Check for fleet auctions that should have ended already
    const overdueFleetAuctions = await FleetOwner.find({
      status: { $in: ["upcoming", "active"] },
      endTime: { $lte: now }
    });

    for (const fleetAuction of overdueFleetAuctions) {

      await updateFleetAuctionStatus(fleetAuction._id, 'over');
      await selectFleetAuctionWinner(fleetAuction._id);
    }

    
  } catch (error) {
    console.error("❌ Error scheduling existing fleet auctions:", error);
  }
}

// ✅ Call this function when server starts (add this at the bottom of the file)
export const initializeAuctionScheduler = async () => {

  await scheduleExistingAuctions();
  await scheduleExistingFleetAuctions();

};

// ✅ Improved update function with better error handling
async function updateAuctionStatus(auctionId, status) {
  try {
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!auction) {
      console.error(`❌ Auction ${auctionId} not found`);
      return;
    }
    

    
    // Emit socket event for real-time update
    if (io) {
      io.emit('auctionStatusUpdate', {
        auctionId: auction._id,
        status: status
      });
    }
    
    return auction;
  } catch (error) {
    console.error(`❌ Error updating auction ${auctionId} status:`, error);
    throw error;
  }
}

// ✅ Improved fleet auction update function
async function updateFleetAuctionStatus(fleetAuctionId, status) {
  try {
    const fleetAuction = await FleetOwner.findByIdAndUpdate(
      fleetAuctionId,
      { 
        $set: { 
          status: status,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );
    
    if (!fleetAuction) {
      console.error(`❌ Fleet auction ${fleetAuctionId} not found`);
      return;
    }
    
    
    if (io) {
      io.emit('fleetAuctionStatusUpdate', {
        fleetAuctionId: fleetAuction._id,
        status: status
      });
    }
    
    return fleetAuction;
  } catch (error) {
    console.error(`❌ Error updating fleet auction ${fleetAuctionId} status:`, error);
    throw error;
  }
}

async function selectAuctionWinner(auctionId) {
  try {
    // Fetch all bids for this auction
    const bids = await Bid.find({
      auction: auctionId,
      // auctionType: 'auction' ya null ho sakta hai purane bids mein
    })
      .populate("bidder", "_id firstName lastName email phone profilePicture")
      .sort({ bidAmount: -1 });

    if (bids.length === 0) {
      await updateAuctionStatus(auctionId, 'over');
      return;
    }

    // Group bids by bidType
    const bidsByType = {
      fullWrap: [],
      oneSide: [],
      bothSides: [],
      rearDoors: []
    };

    bids.forEach(bid => {
      if (bid.bidType && bidsByType[bid.bidType]) {
        bidsByType[bid.bidType].push(bid);
      }
    });

    const winners = {};
    const winnerBidIds = [];

    // Find highest bidder for each bid type
    for (const [bidType, typeBids] of Object.entries(bidsByType)) {
      if (typeBids.length > 0) {
        typeBids.sort((a, b) => b.bidAmount - a.bidAmount);
        const winningBid = typeBids[0];

        winners[bidType] = {
          bidder: winningBid.bidder._id,
          bidAmount: winningBid.bidAmount,
          bidTime: winningBid.bidTime,
          bidId: winningBid._id
        };

        winnerBidIds.push(winningBid._id);
      }
    }

    // Reset all isWinningBid flags
    await Bid.updateMany(
      { auction: auctionId },
      { $set: { isWinningBid: false } }
    );

    // Mark actual winners
    if (winnerBidIds.length > 0) {
      await Bid.updateMany(
        { _id: { $in: winnerBidIds } },
        { $set: { isWinningBid: true } }
      );
    }

    // Prepare currentBids update object
    const currentBidsUpdate = {};
    ['fullWrap', 'oneSide', 'bothSides', 'rearDoors'].forEach(type => {
      currentBidsUpdate[`currentBids.${type}`] = winners[type]
        ? {
            bidAmount: winners[type].bidAmount,
            bidder: winners[type].bidder,
            bidTime: winners[type].bidTime
          }
        : { bidAmount: 0 };
    });

    // Update Auction document
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      {
        $set: {
          winners,
          status: "over",
          ...currentBidsUpdate
        }
      },
      { new: true }
    ).populate("seller");

    if (!auction) throw new Error("Auction not found after winner selection");

    // Emit winner selected (multiple)
    io.emit('winnerSelected', {
      auctionId: auction._id,
      winners // full winners object with bidder IDs
    });

    // Notification message
    const winnerCount = Object.keys(winners).length;
    const winnerMsg = winnerCount === 0
      ? 'no winners'
      : winnerCount === 1
      ? '1 winner'
      : `${winnerCount} winners (different wrap types)`;

    io.emit('newBidNotification', {
      message: `Auction "${auction.name}" has ended with ${winnerMsg} selected!`,
      auctionId: auction._id
    });

    const winningBids = bids.filter(bid => winnerBidIds.includes(bid._id));
    for (const winningBid of winningBids) {
      await sendWinnerNotification(winningBid, auction);
      await addToWinnerCart(winningBid, auction);
    }

  } catch (error) {
    console.error("Error in selectAuctionWinner:", error);
    throw error;
  }
}

async function selectFleetAuctionWinner(fleetAuctionId) {
  try {
    const bids = await Bid.find({
      auction: fleetAuctionId,
      auctionType: "fleetauction"
    })
      .populate("bidder", "_id firstName lastName email phone profilePicture")
      .sort({ bidAmount: -1 }); // optional, we'll sort per type anyway

    if (bids.length === 0) {
      await updateFleetAuctionStatus(fleetAuctionId, 'over');
      return;
    }

    // Group bids by bidType
    const bidsByType = {
      fullWrap: [],
      oneSide: [],
      bothSides: [],
      rearDoors: []
    };

    bids.forEach(bid => {
      if (bid.bidType && bidsByType[bid.bidType]) {
        bidsByType[bid.bidType].push(bid);
      }
    });

    const winners = {}; // This will match schema exactly
    const winnerBidIds = []; // To update isWinningBid

    for (const [bidType, typeBids] of Object.entries(bidsByType)) {
      if (typeBids.length > 0) {
        // Sort descending by bidAmount
        typeBids.sort((a, b) => b.bidAmount - a.bidAmount);
        const winningBid = typeBids[0];

        winners[bidType] = {
          bidder: winningBid.bidder._id,        // Only ID, not full object
          bidAmount: winningBid.bidAmount,
          bidTime: winningBid.bidTime,
          bidId: winningBid._id                  // Store Bid ID here
        };

        winnerBidIds.push(winningBid._id);
      }
    }

    // Reset all isWinningBid to false
    await Bid.updateMany(
      { auction: fleetAuctionId, auctionType: "fleetauction" },
      { $set: { isWinningBid: false } }
    );

    // Set winners as winning
    if (winnerBidIds.length > 0) {
      await Bid.updateMany(
        { _id: { $in: winnerBidIds } },
        { $set: { isWinningBid: true } }
      );
    }

    // Prepare currentBids for update
    const currentBidsUpdate = {};
    ['fullWrap', 'oneSide', 'bothSides', 'rearDoors'].forEach(type => {
      if (winners[type]) {
        currentBidsUpdate[`currentBids.${type}`] = {
          bidAmount: winners[type].bidAmount,
          bidder: winners[type].bidder,
          bidTime: winners[type].bidTime
        };
      } else {
        currentBidsUpdate[`currentBids.${type}`] = { bidAmount: 0 };
      }
    });

    // Update FleetOwner document
    const fleetAuction = await FleetOwner.findByIdAndUpdate(
      fleetAuctionId,
      {
        $set: {
          winners: winners,
          status: "over",
          ...currentBidsUpdate
        }
      },
      { new: true }
    ).populate("user");

    // Socket emissions
    io.emit('fleetWinnerSelected', {
      fleetAuctionId: fleetAuction._id,
      winners: winners
    });

    io.emit('newBidNotification', {
      message: `Fleet auction for ${fleetAuction.company} vehicle has ended with multiple winners selected.`,
      fleetAuctionId: fleetAuction._id
    });

    // Notifications & cart
    await sendFleetWinnerNotifications(winners, fleetAuction, bids);
    await addFleetWinnersToCart(winners, fleetAuction);

  } catch (error) {
    console.error("Error in selectFleetAuctionWinner:", error);
    throw error;
  }
}

async function addFleetWinnersToCart(winners, fleetAuction) {
  try {
    if (!fleetAuction || !winners) {
      throw new Error("Missing fleet auction or winners data");
    }

    for (const [bidType, winner] of Object.entries(winners)) {
      if (winner && winner.bidder) {
        const userId = winner.bidder._id;

        const existingCart = await Cart.findOne({
          user: userId,
          'fleetAuctions': {
            $elemMatch: {
              auction: fleetAuction._id,
              bidType: bidType
            }
          }
        });

        if (existingCart) {
          continue;
        }

        await Cart.findOneAndUpdate(
          { user: userId },
          {
            $push: {
              fleetAuctions: {
                auction: fleetAuction._id,
                bidType: bidType,
                company: fleetAuction.company,
                vehicleType: fleetAuction.vehicleType,
                image: fleetAuction.vehicleImages?.[0] || fleetAuction.image,
                quantity: 1,
                price: winner.bidAmount,
                addedAt: new Date(),
                isFleetAuctionItem: true,
                fleetOwner: fleetAuction.user,
                bidDetails: {
                  bidAmount: winner.bidAmount,
                  bidTime: winner.bidTime,
                  bidId: winner._id
                }
              }
            }
          },
          { upsert: true, new: true }
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Error in addFleetWinnersToCart:", error);
    throw error;
  }
}

// ✅ FIXED FUNCTION - Duplicate notification fix added
async function sendFleetWinnerNotifications(winners, fleetAuction, allBids) {
  if (!fleetAuction || !winners) return;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 15);
  const formattedDeadline = formatDate(deadline);

  for (const [bidType, winner] of Object.entries(winners)) {
    if (winner && winner.bidder) {
      
      // ✅ CHECK IF NOTIFICATION ALREADY EXISTS - YE LINE ADD KI HAI
      const existingNotification = await Notification.findOne({
        user: winner.bidder._id,
        auction: fleetAuction._id,
        type: "FLEET_AUCTION_WON",
        message: { $regex: bidType }
      });
      if (existingNotification) {
       
        continue;
      }

      const winnerNotification = {
        user: winner.bidder._id,
        message: `Congratulations! You won the ${bidType} bid for ${fleetAuction.company} fleet auction with amount ${winner.bidAmount}. The item has been added to your cart. Please complete your purchase by ${formattedDeadline} to avoid account limitations.`,
        type: "FLEET_AUCTION_WON",
        auction: fleetAuction._id,
        // link: `/single-fleet-auction-detail/${fleetAuction._id}`,
         link: `/user-profile/cart`,
        deadline: deadline,
        isImportant: true
      };

      await new Notification(winnerNotification).save();

      const deadlineCron = moment(deadline).format('m H D M *');
      cron.schedule(deadlineCron, async () => {
        await checkFleetPurchaseCompletion(winner.bidder._id, fleetAuction._id, bidType);
      });
    }
  }

  const winnerUserIds = new Set();
  Object.values(winners).forEach(winner => {
    if (winner && winner.bidder) {
      winnerUserIds.add(winner.bidder._id.toString());
    }
  });

  const participantIds = new Set(
    allBids.map(bid => bid.bidder._id.toString())
      .filter(id => !winnerUserIds.has(id))
  );

  if (fleetAuction.user && !winnerUserIds.has(fleetAuction.user._id.toString())) {
    participantIds.add(fleetAuction.user._id.toString());
  }

  for (const userId of participantIds) {
    await new Notification({
      user: userId,
      message: `Fleet auction for ${fleetAuction.company} vehicle has ended. Winners have been selected for different bid types.`,
      type: "FLEET_AUCTION_ENDED",
      auction: fleetAuction._id,
      link: `/single-fleet-auction-detail/${fleetAuction._id}`
    }).save();
  }
}

async function checkFleetPurchaseCompletion(userId, fleetAuctionId, bidType) {
  const order = await Order.findOne({
    user: userId,
    "items.fleetAuctions": {
      $elemMatch: {
        auction: fleetAuctionId,
        bidType: bidType
      }
    }
  });

  if (!order) {
    await User.findByIdAndUpdate(userId, {
      status: "limited",
      limitationReason: `Fleet auction purchase (${bidType}) not completed within required timeframe`
    });
    
    await new Notification({
      user: userId,
      message: `Your account access has been limited due to incomplete fleet auction purchase (${bidType}). Please contact support to resolve this.`,
      type: "ACCOUNT_LIMITED",
      isImportant: true
    }).save();

    await Cart.updateOne(
      { user: userId },
      { 
        $pull: { 
          fleetAuctions: { 
            auction: fleetAuctionId,
            bidType: bidType
          } 
        } 
      }
    );
  }
}

// ✅ FIXED FUNCTION - Duplicate notification fix added
async function sendWinnerNotification(winner, auction) {
  if (!auction || !winner) return;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 15);
  const formattedDeadline = formatDate(deadline);

  const existingNotification = await Notification.findOne({
    user: winner.bidder._id,
    auction: auction._id,
    type: "AUCTION_WON"
  });

  if (existingNotification) {
    return;
  }

  const winnerNotification = {
    user: winner.bidder._id,
    message: `Congratulations! You won the auction for ${auction.name}. The product has been added to your cart. Please complete your purchase by ${formattedDeadline} to avoid account limitations and penalties in accordance with our Terms and Conditions.`,
    type: "AUCTION_WON",
    auction: auction._id,
    //link: `/single-auction-detail/${auction._id}`,
    link: `/user-profile/cart`,
    deadline: deadline,
    isImportant: true
  };

  await new Notification(winnerNotification).save();

  const deadlineCron = moment(deadline).format('m H D M *');
  cron.schedule(deadlineCron, async () => {
    await checkPurchaseCompletion(winner.bidder._id, auction._id);
  });

  const bids = await Bid.find({ auction: auction._id });
  const userIds = new Set(
    bids.map(bid => bid.bidder.toString())
      .filter(id => id !== winner.bidder._id.toString())
  );
  
  if (auction.seller && auction.seller._id && auction.seller._id.toString() !== winner.bidder._id.toString()) {
    userIds.add(auction.seller._id.toString());
  }

  for (const userId of userIds) {
    await new Notification({
      user: userId,
      message: `${winner.bidder.fullName || winner.bidder.firstName} won the auction for ${auction.name}`,
      type: "AUCTION_ENDED",
      auction: auction._id,
      link: `/single-auction-detail/${auction._id}`
    }).save();
  }
}

async function addToWinnerCart(winner, auction) {
  try {
    if (!auction?._id || !winner?.bidder?._id) {
      throw new Error("Missing auction or winner data");
    }

    const userId = winner.bidder._id;
    
    const existingCart = await Cart.findOne({
      user: userId,
      'auctions.auction': auction._id
    });

    if (existingCart) {
      return;
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          auctions: {
            auction: auction._id,
            name: auction.name,
            image: auction.images?.[0] || auction.image,
            quantity: 1,
            price: auction.winningBidAmount || auction.currentPrice || auction.startingPrice,
            addedAt: new Date(),
            isAuctionItem: true,
            seller: auction.seller
          }
        }
      },
      { upsert: true, new: true }
    );

    return true;
  } catch (error) {
    console.error("Error in addToWinnerCart:", error);
    throw error;
  }
}

async function checkPurchaseCompletion(userId, auctionId) {
  const order = await Order.findOne({
    user: userId,
    "items.auctions": auctionId
  });

  if (!order) {
    await User.findByIdAndUpdate(userId, {
      status: "limited",
      limitationReason: "Auction purchase not completed within required timeframe"
    });
    
    await new Notification({
      user: userId,
      message: "Your account access has been limited due to incomplete auction purchase. Please contact support to resolve this.",
      type: "ACCOUNT_LIMITED",
      isImportant: true
    }).save();

    await Cart.updateOne(
      { user: userId },
      { $pull: { auctions: { auction: auctionId } } }
    );
  }
}

try {
  const changeStream = Auction.watch();

  changeStream.on('change', (change) => {
    try {
      if (change.operationType === 'insert') {
        const auction = change.fullDocument;
        const startCron = moment(auction.startTime).format('m H D M *');
        const endCron = moment(auction.endTime).format('m H D M *');

        cron.schedule(startCron, () => updateAuctionStatus(auction._id, 'active'));
        cron.schedule(endCron, async () => {
          await updateAuctionStatus(auction._id, 'over');
          await selectAuctionWinner(auction._id);
        });
      }
    } catch (err) {
      console.error("Error in auction cronjobs:", err);
    }
  });

  changeStream.on('error', (err) => {
    console.warn("⚠️ Auction changeStream error (requires replica set):", err.message);
  });
} catch (err) {
  console.warn("⚠️ Could not initialize Auction changeStream:", err.message);
}

try {
  const fleetChangeStream = FleetOwner.watch();

  fleetChangeStream.on('change', (change) => {
    try {
      if (change.operationType === 'insert') {
        const fleetAuction = change.fullDocument;
        const startCron = moment(fleetAuction.startTime).format('m H D M *');
        const endCron = moment(fleetAuction.endTime).format('m H D M *');

        cron.schedule(startCron, () => updateFleetAuctionStatus(fleetAuction._id, 'active'));
        cron.schedule(endCron, async () => {
          await updateFleetAuctionStatus(fleetAuction._id, 'over');
          await selectFleetAuctionWinner(fleetAuction._id);
        });
      }
    } catch (err) {
      console.error("Error in fleet auction cronjobs:", err);
    }
  });

  fleetChangeStream.on('error', (err) => {
    console.warn("⚠️ FleetOwner changeStream error (requires replica set):", err.message);
  });
} catch (err) {
  console.warn("⚠️ Could not initialize FleetOwner changeStream:", err.message);
}

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY || "");

const validateEnvVars = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set; relying on country-specific credentials");
  }
  if (!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL environment variable is not set");
  }
};

export const checkSubscriptionsCron = asyncHandler(async (customUsers = null) => {
  validateEnvVars();
  
  const users = customUsers || (await User.find({ 
    "subscription.stripeSubscriptionId": { 
      $exists: true, 
      $ne: null,
      $type: "string",
      $not: /^null$/i
    } 
  }).lean());
  
  const results = [];

  for (const user of users) {
    let transporter = null;
    try {
      if (!user.subscription?.stripeSubscriptionId || 
          typeof user.subscription.stripeSubscriptionId !== 'string' ||
          user.subscription.stripeSubscriptionId.trim() === '' ||
          user.subscription.stripeSubscriptionId.toLowerCase() === 'null') {
        console.warn(`Skipping user ${user._id} with invalid subscription ID: ${user.subscription?.stripeSubscriptionId}`);
        results.push({ user: user.email, action: "skipped", reason: "invalid_subscription_id" });
        continue;
      }

      transporter = await getEmailTransporter();
      let fromAddress = await getFromAddress();

      const subscription = await stripeClient.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      );

      const renewalDate = new Date(subscription.current_period_end * 1000);
      const today = new Date();
      const twoWeeksBeforeRenewal = new Date(renewalDate);
      twoWeeksBeforeRenewal.setDate(twoWeeksBeforeRenewal.getDate() - 14);

      if (user.subscription.status !== subscription.status) {
        await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              "subscription.status": subscription.status,
              "subscription.requiresBillboardRedirect": !["active", "trialing"].includes(subscription.status),
            },
          },
          { new: true }
        );
      }

      const emailSent = user.subscription?.lastReminderSent
        ? new Date(user.subscription.lastReminderSent) > twoWeeksBeforeRenewal
        : false;

      if (
        !emailSent &&
        today >= twoWeeksBeforeRenewal &&
        today <= renewalDate &&
        ["active", "trialing"].includes(subscription.status)
      ) {
          await transporter.sendMail({
            from: fromAddress,
          to: user.email,
          subject: "Subscription Renewal Reminder - Your subscription is about to expire",
          html: `
            <p>Hello ${user.firstName || "User"},</p>
            <p>Your subscription will expire on <strong>${renewalDate.toDateString()}</strong>. Please update your payment method to ensure your services remain uninterrupted.</p>
            <a href="${process.env.FRONTEND_URL}/user-profile/payment-method">Update Payment Method</a>
            <p>Thank you,<br>Rule7Media Team</p>
          `,
        });

        await User.findByIdAndUpdate(
          user._id,
          { $set: { "subscription.lastReminderSent": new Date() } },
          { new: true }
        );
        results.push({ user: user.email, action: "renewal_reminder_sent", status: "success" });
      }

      if (["past_due", "canceled", "unpaid"].includes(subscription.status)) {
        const actionEmailSent = user.subscription?.lastActionEmailSent
          ? new Date(user.subscription.lastActionEmailSent) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          : false;

        if (!actionEmailSent) {
          await transporter.sendMail({
            from: fromAddress,
            to: user.email,
            subject: "Action Required: Subscription Issue",
            html: `
              <p>Hello ${user.firstName || "User"},</p>
              <p>Your subscription has an issue (Status: ${subscription.status}). Please update your payment method to continue using our services. The expiry was on <strong>${renewalDate.toDateString()}</strong>.</p>
              <a href="${process.env.FRONTEND_URL}/user-profile/payment-method">Update Now</a>
              <p>Thank you,<br>Rule7Media Team</p>
            `,
          });

          await User.findByIdAndUpdate(
            user._id,
            {
              $set: {
                "subscription.lastActionEmailSent": new Date(),
                "subscription.requiresBillboardRedirect": true,
              },
            },
            { new: true }
          );
          results.push({ user: user.email, action: "action_required_sent", status: "success" });
        }
      }
    } catch (err) {
      if (err.type === 'StripeInvalidRequestError' && err.code === 'resource_missing') {
        await User.findByIdAndUpdate(user._id, {
          $set: {
            "subscription.status": "canceled",
            "subscription.requiresBillboardRedirect": true
          }
        });
        results.push({ user: user.email, action: "marked_canceled", reason: "subscription_not_found" });
      } else {
        console.error(`[CRON ERROR] Error processing subscription for user ${user._id}:`, {
          message: err.message,
          stack: err.stack,
        });
        results.push({ user: user.email, action: "error", error: err.message });

        if (!transporter) {
          transporter = await getEmailTransporter();
        }

        try {
          const fallbackFromAddress = await getFromAddress();
          await transporter.sendMail({
            from: fallbackFromAddress,
            to: process.env.EMAIL_USER,
            subject: "Cron Job Error: Subscription Check Failed",
            html: `<p>Error checking subscription for user ${user.email}: ${err.message}</p>`,
          });
        } catch (emailErr) {
          console.error(`[EMAIL ERROR] Failed to send admin error notification for user ${user._id}:`, {
            message: emailErr.message,
            stack: emailErr.stack,
          });
        }
      }
    } finally {
      if (transporter) {
        await transporter.close();
      }
    }
  }

  return results;
});

export const cleanupInvalidSubscriptions = asyncHandler(async () => {
  const usersWithInvalidSubs = await User.find({
    $or: [
      { "subscription.stripeSubscriptionId": null },
      { "subscription.stripeSubscriptionId": { $exists: false } },
      { "subscription.stripeSubscriptionId": "null" },
      { "subscription.stripeSubscriptionId": "" }
    ]
  });
  
  for (const user of usersWithInvalidSubs) {
    await User.findByIdAndUpdate(user._id, {
      $set: {
        "subscription.status": "inactive",
        "subscription.requiresBillboardRedirect": true
      }
    });
  }
});


export const endExpiredCampaigns = async () => {
  try {
    const now = new Date();
    
    // Find campaigns that should be ended
    const expiredCampaigns = await Campaign.updateMany(
      {
        status: "active",
        endAt: { $ne: null, $lte: now }
      },
      {
        $set: { 
          status: "ended",
          updatedAt: now
        }
      }
    );
    
    if (expiredCampaigns.modifiedCount > 0) {
      
    }
    
    const budgetExhaustedCampaigns = await Campaign.updateMany(
      {
        status: "active",
        $expr: { $gte: ["$spent", "$budget"] }
      },
      {
        $set: { 
          status: "ended",
          updatedAt: now
        }
      }
    );
    
    if (budgetExhaustedCampaigns.modifiedCount > 0) {
    
    }
    
    // Auto-start campaigns whose start time has arrived
    const startedCampaigns = await Campaign.updateMany(
      {
        status: { $in: ["paused", "ended"] },
        startAt: { $lte: now },
        endAt: { $gt: now }
      },
      {
        $set: { 
          status: "active",
          updatedAt: now
        }
      }
    );
    
    if (startedCampaigns.modifiedCount > 0) {
      
    }
    
  } catch (error) {
    console.error("Error in campaign scheduler:", error);
  }
};

export const startCampaignScheduler = () => {
  cron.schedule("* * * * *", async () => {
    await endExpiredCampaigns();
  });
};

export const checkSubscriptionRenewalsCron = asyncHandler(async () => {
  try {
   
    
    const users = await User.find({
      "subscription.status": "active",
      "subscription.willAutoRenew": true,
      "subscription.stripeSubscriptionId": { $exists: true, $ne: null }
    });
    
    const results = [];
    
    for (const user of users) {
      try {
        // Stripe subscription fetch karein
        const subscription = await stripeClient.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        );
        
        // Current period end date
        const periodEndDate = new Date(subscription.current_period_end * 1000);
        const today = new Date();
        
        // 2 weeks (14 days) before renewal calculate karein
        const twoWeeksBefore = new Date(periodEndDate);
        twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
        
        // Check if we're within the 2-week window
        const isWithinTwoWeekWindow = today >= twoWeeksBefore && today <= periodEndDate;
        
        // Check if reminder already sent
        const lastReminderSent = user.subscription?.lastRenewalReminderSent
          ? new Date(user.subscription.lastRenewalReminderSent)
          : null;
        
        const reminderAlreadySent = lastReminderSent && 
          lastReminderSent >= twoWeeksBefore &&
          lastReminderSent < periodEndDate;
        
        // Agar 2 week window mein hain aur reminder nahi bheja gaya hai
        if (isWithinTwoWeekWindow && !reminderAlreadySent) {
          // Email details
          // Email details
          const transporter = await getEmailTransporter();
          const fromAddress = await getFromAddress();
          // Format dates for email
          const renewalDateFormatted = periodEndDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const planName = user.subscription?.planDuration 
            ? `${user.subscription.planDuration}-Month Plan`
            : "Your Subscription";
          
          // Send reminder email
          await transporter.sendMail({
            from: fromAddress,
            to: user.email,
            subject: `⚠️ Reminder: Your ${planName} Will Auto-Renew Soon`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Subscription Renewal Reminder</h2>
                <p>Hello ${user.firstName || user.email.split('@')[0]},</p>
                
                <p>This is a reminder that your <strong>${planName}</strong> will <strong>auto-renew</strong> in approximately <strong>2 weeks</strong>.</p>
                
                <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                  <p><strong>Renewal Date:</strong> ${renewalDateFormatted}</p>
                  <p><strong>Auto-Renewal:</strong> Enabled</p>
                  <p><strong>Next Billing Cycle:</strong> ${planName}</p>
                </div>
                
                <p>If you wish to update your payment method or manage your subscription settings, please visit your account dashboard:</p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${process.env.FRONTEND_URL}/user-profile/subscription" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Manage Subscription
                  </a>
                </div>
                
                <p>If you have any questions, please contact our support team.</p>
                
                <p>Best regards,<br>
                <strong>The Rule7Media Team</strong></p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280;">
                  This is an automated reminder. If you wish to cancel auto-renewal, you can do so from your subscription settings.
                </p>
              </div>
            `,
          });
          
          // Update user record - reminder sent
          await User.findByIdAndUpdate(user._id, {
            $set: {
              "subscription.lastRenewalReminderSent": new Date(),
              "subscription.nextRenewalDate": periodEndDate,
            }
          });
          
          // Create notification for user
          const notificationUniqueId = `renewal_reminder_${user._id}_${periodEndDate.getTime()}`;
          const existingNotification = await Notification.findOne({
            user: user._id,
            notificationId: notificationUniqueId
          });
          
          if (!existingNotification) {
            await new Notification({
              user: user._id,
              title: "Subscription Renewal Reminder 🔄",
              message: `Your subscription will auto-renew on ${renewalDateFormatted}. Update your payment method if needed.`,
              type: "SUBSCRIPTION_RENEWAL",
              link: "/user-profile/subscription",
              isRead: false,
              notificationId: notificationUniqueId,
            }).save();
          }
          
          results.push({
            user: user.email,
            action: "renewal_reminder_sent",
            renewalDate: renewalDateFormatted,
            status: "success"
          });
          
         
        } else if (!isWithinTwoWeekWindow) {
          results.push({
            user: user.email,
            action: "not_in_window",
            daysUntilRenewal: Math.ceil((periodEndDate - today) / (1000 * 60 * 60 * 24)),
            status: "skipped"
          });
        }
        
      } catch (userError) {
        console.error(`❌ Error processing user ${user.email}:`, userError.message);
        results.push({
          user: user.email,
          action: "error",
          error: userError.message,
          status: "failed"
        });
      }
    }
    
 
    return results;
    
  } catch (error) {
    console.error("❌ Fatal error in subscription renewal cron:", error);
    throw error;
  }
});

cron.schedule("0 9 * * *", async () => {

  try {
    const results = await checkSubscriptionRenewalsCron();
   
  } catch (error) {
    console.error("❌ Error in daily renewal cron job:", error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

if (process.env.NODE_ENV === 'development') {
  cron.schedule("*/30 * * * *", async () => {
   
    try {
      const results = await checkSubscriptionRenewalsCron();
     
    } catch (error) {
      console.error("🧪 [DEV] Error in test renewal cron:", error);
    }
  });
}
cron.schedule("0 0 * * *", () => {
  checkSubscriptionsCron();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});

cron.schedule("0 0 * * 0", () => {
  cleanupInvalidSubscriptions();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata",
});























// import dotenv from "dotenv";
// dotenv.config();
// import cron from 'node-cron';
// import moment from "moment";
// import Auction from './models/auction.model.js'
// import FleetOwner from './models/fleetowner.model.js';
// import Bid from './models/bid.model.js';
// import Notification from './models/notification.model.js';
// import Cart from './models/cart.model.js';
// import User from './models/user.model.js';
// import Order from './models/Order.js';
// import { io } from "./index.js";
// import stripe from "stripe";
// import nodemailer from "nodemailer";
// import { asyncHandler } from "./utils/asyncHandler.js";
// function formatDate(date) {
//   return moment(date).format('MMMM Do YYYY');
// }

// async function updateAuctionStatus(auctionId, status) {
//   const auction = await Auction.findById(auctionId);
//   auction.status = status;
//   await auction.save();
// }

// async function updateFleetAuctionStatus(fleetAuctionId, status) {
//   const fleetAuction = await FleetOwner.findById(fleetAuctionId);
//   fleetAuction.status = status;
//   await fleetAuction.save();
// }

// async function selectAuctionWinner(auctionId) {
  
//   try {
//     // Get all bids sorted by amount (highest first)
//     const bids = await Bid.find({ auction: auctionId })
//       .populate("bidder", "_id firstName email phone profilePicture firstName lastName")
//       .sort({ bidAmount: -1 });

//     if (bids.length === 0) {
//       await updateAuctionStatus(auctionId, 'over');
//       return;
//     }

//     // Get the highest bid
//     const winningBid = bids[0];


//     // Reset all bids to isWinningBid: false
//     await Bid.updateMany(
//       { auction: auctionId },
//       { $set: { isWinningBid: false } }
//     );

//     // Set the winning bid
//     const updatedBid = await Bid.findByIdAndUpdate(
//       winningBid._id,
//       { $set: { isWinningBid: true } },
//       { new: true }
//     );

//     if (!updatedBid.isWinningBid) {
//       throw new Error("Failed to set isWinningBid to true");
//     }


//     // Update the auction
//     const auction = await Auction.findByIdAndUpdate(
//       auctionId,
//       {
//         $set: {
//           winner: winningBid.bidder._id,
//           winningBidAmount: winningBid.bidAmount,
//           status: "over"
//         }
//       },
//       { new: true }
//     ).populate("seller");



//     // Emit socket events
//     io.emit('winnerSelected', {
//       auctionId: auction._id,
//       winner: {
//         bidder: winningBid.bidder,
//         bidAmount: winningBid.bidAmount,
//         bidTime: winningBid.bidTime,
//         _id: winningBid._id
//       }
//     });

//     io.emit('newBidNotification', {
//       message: `Auction for ${auction.name} has ended with ${winningBid.bidder.fullName || winningBid.bidder.firstName} as the winner.`,
//       auctionId: auction._id
//     });

//     // Send notifications and add to cart
//     await sendWinnerNotification(winningBid, auction);
//     await addToWinnerCart(winningBid, auction);

//   } catch (error) {
//     console.error("Error in selectAuctionWinner:", error);
//     throw error;
//   }
// }

// async function selectFleetAuctionWinner(fleetAuctionId) {

  
//   try {
//     // Get all bids for this fleet auction
//     const bids = await Bid.find({ 
//       auction: fleetAuctionId,
//       auctionType: "fleetauction"
//     })
//       .populate("bidder", "_id firstName email phone profilePicture firstName lastName")
//       .populate("fleetOwner", "_id firstName email phone profilePicture firstName lastName");

//     if (bids.length === 0) {
   
//       await updateFleetAuctionStatus(fleetAuctionId, 'over');
//       return;
//     }

//     // Group bids by bidType and find highest bid for each type
//     const bidsByType = {
//       fullWrap: [],
//       oneSide: [],
//       bothSides: [],
//       rearDoors: []
//     };

//     // Group bids by their bidType
//     bids.forEach(bid => {
//       if (bidsByType[bid.bidType]) {
//         bidsByType[bid.bidType].push(bid);
//       }
//     });

//     const winners = {};
//     const winnerBids = [];

//     // Find winner for each bid type
//     for (const [bidType, typeBids] of Object.entries(bidsByType)) {
//       if (typeBids.length > 0) {
//         // Sort by bidAmount (highest first)
//         typeBids.sort((a, b) => b.bidAmount - a.bidAmount);
//         const winningBid = typeBids[0];
        
//         winners[bidType] = {
//           bidder: winningBid.bidder,
//           bidAmount: winningBid.bidAmount,
//           bidTime: winningBid.bidTime,
//           _id: winningBid._id
//         };
        
//         winnerBids.push(winningBid);
       
//       }
//     }

//     // Reset all bids to isWinningBid: false
//     await Bid.updateMany(
//       { auction: fleetAuctionId, auctionType: "fleetauction" },
//       { $set: { isWinningBid: false } }
//     );

//     // Set winning bids for each type
//     for (const winningBid of winnerBids) {
//       await Bid.findByIdAndUpdate(
//         winningBid._id,
//         { $set: { isWinningBid: true } },
//         { new: true }
//       );
//     }

//     // Update the fleet auction with winners
//     const fleetAuction = await FleetOwner.findByIdAndUpdate(
//       fleetAuctionId,
//       {
//         $set: {
//           winners: winners,
//           status: "over",
//           // Update currentBids with winning amounts
//           currentBids: {
//             fullWrap: winners.fullWrap ? {
//               bidAmount: winners.fullWrap.bidAmount,
//               bidder: winners.fullWrap.bidder._id,
//               bidTime: winners.fullWrap.bidTime
//             } : { bidAmount: 0 },
//             oneSide: winners.oneSide ? {
//               bidAmount: winners.oneSide.bidAmount,
//               bidder: winners.oneSide.bidder._id,
//               bidTime: winners.oneSide.bidTime
//             } : { bidAmount: 0 },
//             bothSides: winners.bothSides ? {
//               bidAmount: winners.bothSides.bidAmount,
//               bidder: winners.bothSides.bidder._id,
//               bidTime: winners.bothSides.bidTime
//             } : { bidAmount: 0 },
//             rearDoors: winners.rearDoors ? {
//               bidAmount: winners.rearDoors.bidAmount,
//               bidder: winners.rearDoors.bidder._id,
//               bidTime: winners.rearDoors.bidTime
//             } : { bidAmount: 0 }
//           }
//         }
//       },
//       { new: true }
//     ).populate("user");

    

//     // Emit socket events for fleet auction
//     io.emit('fleetWinnerSelected', {
//       fleetAuctionId: fleetAuction._id,
//       winners: winners
//     });

//     io.emit('newBidNotification', {
//       message: `Fleet auction for ${fleetAuction.company} vehicle has ended with multiple winners selected.`,
//       fleetAuctionId: fleetAuction._id
//     });

//     // Send notifications to winners and add to their carts
//     await sendFleetWinnerNotifications(winners, fleetAuction, bids);
//     await addFleetWinnersToCart(winners, fleetAuction);

//   } catch (error) {
//     console.error("Error in selectFleetAuctionWinner:", error);
//     throw error;
//   }
// }

// // NEW FUNCTION: Add fleet auction winners to cart
// async function addFleetWinnersToCart(winners, fleetAuction) {
//   try {
//     if (!fleetAuction || !winners) {
//       throw new Error("Missing fleet auction or winners data");
//     }

//     // Add each winner's bid type to their cart
//     for (const [bidType, winner] of Object.entries(winners)) {
//       if (winner && winner.bidder) {
//         const userId = winner.bidder._id;

//         // Check if this specific fleet auction and bid type combo is already in cart
//         const existingCart = await Cart.findOne({
//           user: userId,
//           'fleetAuctions': {
//             $elemMatch: {
//               auction: fleetAuction._id,
//               bidType: bidType
//             }
//           }
//         });

//         if (existingCart) {
         
//           continue;
//         }

//         // Add to cart
//         await Cart.findOneAndUpdate(
//           { user: userId },
//           {
//             $push: {
//               fleetAuctions: {
//                 auction: fleetAuction._id,
//                 bidType: bidType,
//                 company: fleetAuction.company,
//                 vehicleType: fleetAuction.vehicleType,
//                 image: fleetAuction.vehicleImages?.[0] || fleetAuction.image,
//                 quantity: 1,
//                 price: winner.bidAmount,
//                 addedAt: new Date(),
//                 isFleetAuctionItem: true,
//                 fleetOwner: fleetAuction.user,
//                 bidDetails: {
//                   bidAmount: winner.bidAmount,
//                   bidTime: winner.bidTime,
//                   bidId: winner._id
//                 }
//               }
//             }
//           },
//           { upsert: true, new: true }
//         );

//       }
//     }

//     return true;
//   } catch (error) {
//     console.error("Error in addFleetWinnersToCart:", error);
//     throw error;
//   }
// }

// async function sendFleetWinnerNotifications(winners, fleetAuction, allBids) {
//   if (!fleetAuction || !winners) return;

//   // Calculate deadline (15 days from now)
//   const deadline = new Date();
//   deadline.setDate(deadline.getDate() + 15);
//   const formattedDeadline = formatDate(deadline);

//   // Send notifications to winners
//   for (const [bidType, winner] of Object.entries(winners)) {
//     if (winner && winner.bidder) {
//       const winnerNotification = {
//         user: winner.bidder._id,
//         message: `Congratulations! You won the ${bidType} bid for ${fleetAuction.company} fleet auction with amount ${winner.bidAmount}. The item has been added to your cart. Please complete your purchase by ${formattedDeadline} to avoid account limitations.`,
//         type: "FLEET_AUCTION_WON",
//         auction: fleetAuction._id,
//         link: `/single-fleet-auction-detail/${fleetAuction._id}`,
//         deadline: deadline,
//         isImportant: true
//       };

//       await new Notification(winnerNotification).save();

//       // Schedule account check for after deadline
//       const deadlineCron = moment(deadline).format('m H D M *');
//       cron.schedule(deadlineCron, async () => {
//         await checkFleetPurchaseCompletion(winner.bidder._id, fleetAuction._id, bidType);
//       });
//     }
//   }

//   // Notify other participants (non-winners)
//   const winnerUserIds = new Set();
//   Object.values(winners).forEach(winner => {
//     if (winner && winner.bidder) {
//       winnerUserIds.add(winner.bidder._id.toString());
//     }
//   });

//   const participantIds = new Set(
//     allBids.map(bid => bid.bidder._id.toString())
//       .filter(id => !winnerUserIds.has(id))
//   );

//   // Add fleet owner to participants if not a winner
//   if (fleetAuction.user && !winnerUserIds.has(fleetAuction.user._id.toString())) {
//     participantIds.add(fleetAuction.user._id.toString());
//   }

//   for (const userId of participantIds) {
//     await new Notification({
//       user: userId,
//       message: `Fleet auction for ${fleetAuction.company} vehicle has ended. Winners have been selected for different bid types.`,
//       type: "FLEET_AUCTION_ENDED",
//       auction: fleetAuction._id,
//       link: `/single-fleet-auction-detail/${fleetAuction._id}`
//     }).save();
//   }
// }

// async function checkFleetPurchaseCompletion(userId, fleetAuctionId, bidType) {
//   // Check if user has placed an order for this fleet auction item
//   const order = await Order.findOne({
//     user: userId,
//     "items.fleetAuctions": {
//       $elemMatch: {
//         auction: fleetAuctionId,
//         bidType: bidType
//       }
//     }
//   });

//   if (!order) {
//     // Limit user account
//     await User.findByIdAndUpdate(userId, {
//       status: "limited",
//       limitationReason: `Fleet auction purchase (${bidType}) not completed within required timeframe`
//     });
    
//     // Send final notification
//     await new Notification({
//       user: userId,
//       message: `Your account access has been limited due to incomplete fleet auction purchase (${bidType}). Please contact support to resolve this.`,
//       type: "ACCOUNT_LIMITED",
//       isImportant: true
//     }).save();

//     // Remove from cart if still there
//     await Cart.updateOne(
//       { user: userId },
//       { 
//         $pull: { 
//           fleetAuctions: { 
//             auction: fleetAuctionId,
//             bidType: bidType
//           } 
//         } 
//       }
//     );
//   }
// }

// async function sendWinnerNotification(winner, auction) {
//   if (!auction || !winner) return;

//   // Calculate deadline (15 days from now)
//   const deadline = new Date();
//   deadline.setDate(deadline.getDate() + 15);
//   const formattedDeadline = formatDate(deadline);

//   // Winner notification
//   const winnerNotification = {
//     user: winner.bidder._id,
//     message: `Congratulations! You won the auction for ${auction.name}. The product has been added to your cart. Please complete your purchase by ${formattedDeadline} to avoid account limitations and penalties in accordance with our Terms and Conditions.`,
//     type: "AUCTION_WON",
//     auction: auction._id,
//     link: `/single-auction-detail/${auction._id}`,
//     deadline: deadline,
//     isImportant: true
//   };

//   // Save winner notification
//   await new Notification(winnerNotification).save();

//   // Schedule account check for after deadline
//   const deadlineCron = moment(deadline).format('m H D M *');
//   cron.schedule(deadlineCron, async () => {
//     await checkPurchaseCompletion(winner.bidder._id, auction._id);
//   });

//   // Notify other participants
//   const bids = await Bid.find({ auction: auction._id });
//   const userIds = new Set(
//     bids.map(bid => bid.bidder.toString())
//       .filter(id => id !== winner.bidder._id.toString())
//   );
  
//   if (auction.seller && auction.seller._id && auction.seller._id.toString() !== winner.bidder._id.toString()) {
//     userIds.add(auction.seller._id.toString());
//   }

//   for (const userId of userIds) {
//     await new Notification({
//       user: userId,
//       message: `${winner.bidder.fullName || winner.bidder.firstName} won the auction for ${auction.name}`,
//       type: "AUCTION_ENDED",
//       auction: auction._id,
//       link: `/single-auction-detail/${auction._id}`
//     }).save();
//   }
// }

// async function addToWinnerCart(winner, auction) {
//   try {
//     if (!auction?._id || !winner?.bidder?._id) {
//       throw new Error("Missing auction or winner data");
//     }

//     const userId = winner.bidder._id;
    
//     // Check if auction is already in cart
//     const existingCart = await Cart.findOne({
//       user: userId,
//       'auctions.auction': auction._id
//     });

//     if (existingCart) {
    
//       return;
//     }

//     await Cart.findOneAndUpdate(
//       { user: userId },
//       {
//         $push: {
//           auctions: {
//             auction: auction._id,
//             name: auction.name,
//             image: auction.images?.[0] || auction.image,
//             quantity: 1,
//             price: auction.winningBidAmount || auction.currentPrice || auction.startingPrice,
//             addedAt: new Date(),
//             isAuctionItem: true,
//             seller: auction.seller
//           }
//         }
//       },
//       { upsert: true, new: true }
//     );

//     return true;
//   } catch (error) {
//     console.error("Error in addToWinnerCart:", error);
//     throw error;
//   }
// }

// async function checkPurchaseCompletion(userId, auctionId) {
//   // Check if user has placed an order for this auction item
//   const order = await Order.findOne({
//     user: userId,
//     "items.auctions": auctionId
//   });

//   if (!order) {
//     // Limit user account
//     await User.findByIdAndUpdate(userId, {
//       status: "limited",
//       limitationReason: "Auction purchase not completed within required timeframe"
//     });
//     // Send final notification
//     await new Notification({
//       user: userId,
//       message: "Your account access has been limited due to incomplete auction purchase. Please contact support to resolve this.",
//       type: "ACCOUNT_LIMITED",
//       isImportant: true
//     }).save();

//     // Remove from cart if still there
//     await Cart.updateOne(
//       { user: userId },
//       { $pull: { auctions: { auction: auctionId } } }
//     );
//   }
// }

// // Watch for new regular auctions
// const changeStream = Auction.watch();

// changeStream.on('change', (change) => {
//   try {
//     if (change.operationType === 'insert') {
//       const auction = change.fullDocument;
//       const startCron = moment(auction.startTime).format('m H D M *');
//       const endCron = moment(auction.endTime).format('m H D M *');

//       cron.schedule(startCron, () => updateAuctionStatus(auction._id, 'active'));
//       cron.schedule(endCron, async () => {
//         await updateAuctionStatus(auction._id, 'over');
//         await selectAuctionWinner(auction._id);
//       });
//     }
//   } catch (err) {
//     console.error("Error in auction cronjobs:", err);
//   }
// });

// // Watch for new fleet auctions
// const fleetChangeStream = FleetOwner.watch();

// fleetChangeStream.on('change', (change) => {
//   try {
//     if (change.operationType === 'insert') {
//       const fleetAuction = change.fullDocument;
//       const startCron = moment(fleetAuction.startTime).format('m H D M *');
//       const endCron = moment(fleetAuction.endTime).format('m H D M *');

//       cron.schedule(startCron, () => updateFleetAuctionStatus(fleetAuction._id, 'active'));
//       cron.schedule(endCron, async () => {
//         await updateFleetAuctionStatus(fleetAuction._id, 'over');
//         await selectFleetAuctionWinner(fleetAuction._id);
//       });
//     }
//   } catch (err) {
//     console.error("Error in fleet auction cronjobs:", err);
//   }
// });


// //const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

// const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

// const emailMap = {
//   US: { email: process.env.US_EMAIL || process.env.EMAIL_USER, password: process.env.US_PASSWORD || process.env.EMAIL_PASS },
//   IN: { email: process.env.IN_EMAIL || process.env.EMAIL_USER, password: process.env.IN_PASSWORD || process.env.EMAIL_PASS },
//   CA: { email: process.env.CA_EMAIL || process.env.EMAIL_USER, password: process.env.CA_PASSWORD || process.env.EMAIL_PASS },
//   AU: { email: process.env.AU_EMAIL || process.env.EMAIL_USER, password: process.env.AU_PASSWORD || process.env.EMAIL_PASS },
//   CN: { email: process.env.CN_EMAIL || process.env.EMAIL_USER, password: process.env.CN_PASSWORD || process.env.EMAIL_PASS },
//   TH: { email: process.env.TH_EMAIL || process.env.EMAIL_USER, password: process.env.TH_PASSWORD || process.env.EMAIL_PASS },
//   JP: { email: process.env.JP_EMAIL || process.env.EMAIL_USER, password: process.env.JP_PASSWORD || process.env.EMAIL_PASS },
//   FR: { email: process.env.FR_EMAIL || process.env.EMAIL_USER, password: process.env.FR_PASSWORD || process.env.EMAIL_PASS },
//   ID: { email: process.env.ID_EMAIL || process.env.EMAIL_USER, password: process.env.ID_PASSWORD || process.env.EMAIL_PASS },
//   GB: { email: process.env.GB_EMAIL || process.env.EMAIL_USER, password: process.env.GB_PASSWORD || process.env.EMAIL_PASS },
//   ES: { email: process.env.ES_EMAIL || process.env.EMAIL_USER, password: process.env.ES_PASSWORD || process.env.EMAIL_PASS },
// };

// // Function to create transporter based on country code
// const createTransporter = (countryCode) => {
//   const countryKey = countryCode || "AU";
//   const senderDetails = emailMap[countryKey] || emailMap["AU"];
  
//   if (!senderDetails.email || !senderDetails.password) {
//     console.error(`[EMAIL ERROR] Missing credentials for country: ${countryKey}`);
//     throw new Error(`Email credentials not found for country: ${countryKey}`);
//   }
  
//   return nodemailer.createTransport({
//     service: "Gmail",
//     auth: {
//       user: senderDetails.email,
//       pass: senderDetails.password,
//     },
//   });
// };

// // Validate environment variables
// const validateEnvVars = () => {
//   if (!process.env.STRIPE_SECRET_KEY) {
//     throw new Error("STRIPE_SECRET_KEY is not set");
//   }
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     console.warn("EMAIL_USER or EMAIL_PASS not set; relying on country-specific credentials");
//   }
//   if (!process.env.FRONTEND_URL) {
//     throw new Error("FRONTEND_URL environment variable is not set");
//   }
// };

// // Check subscriptions function
// export const checkSubscriptionsCron = asyncHandler(async (customUsers = null) => {
//   validateEnvVars();
  
//   // Query only users with valid subscription IDs
//   const users = customUsers || (await User.find({ 
//     "subscription.stripeSubscriptionId": { 
//       $exists: true, 
//       $ne: null,
//       $type: "string",
//       $not: /^null$/i
//     } 
//   }).lean());
  
//   const results = [];

//   for (const user of users) {
//     let transporter = null;
//     try {
//       // Validate stripeSubscriptionId more thoroughly
//       if (!user.subscription?.stripeSubscriptionId || 
//           typeof user.subscription.stripeSubscriptionId !== 'string' ||
//           user.subscription.stripeSubscriptionId.trim() === '' ||
//           user.subscription.stripeSubscriptionId.toLowerCase() === 'null') {
//         console.warn(`Skipping user ${user._id} with invalid subscription ID: ${user.subscription?.stripeSubscriptionId}`);
//         results.push({ user: user.email, action: "skipped", reason: "invalid_subscription_id" });
//         continue;
//       }

//       const userCountry = user.country || "AU";
//       const countryKey = Object.keys(emailMap).find((key) => 
//         key.toUpperCase() === userCountry.toUpperCase()
//       ) || "AU";

//       if (!emailMap[countryKey]) {
//         console.warn(`No email configuration for country ${userCountry}, defaulting to AU`);
//       }

//       transporter = createTransporter(countryKey);

//       // Retrieve subscription from Stripe
//       const subscription = await stripeClient.subscriptions.retrieve(
//         user.subscription.stripeSubscriptionId
//       );

//       const renewalDate = new Date(subscription.current_period_end * 1000);
//       const today = new Date();
//       const twoWeeksBeforeRenewal = new Date(renewalDate);
//       twoWeeksBeforeRenewal.setDate(twoWeeksBeforeRenewal.getDate() - 14);

//       // Update user subscription status if changed
//       if (user.subscription.status !== subscription.status) {
//         await User.findByIdAndUpdate(
//           user._id,
//           {
//             $set: {
//               "subscription.status": subscription.status,
//               "subscription.requiresBillboardRedirect": !["active", "trialing"].includes(subscription.status),
//             },
//           },
//           { new: true }
//         );
//       }

//       const emailSent = user.subscription?.lastReminderSent
//         ? new Date(user.subscription.lastReminderSent) > twoWeeksBeforeRenewal
//         : false;

//       // Send renewal reminder if needed
//       if (
//         !emailSent &&
//         today >= twoWeeksBeforeRenewal &&
//         today <= renewalDate &&
//         ["active", "trialing"].includes(subscription.status)
//       ) {
//         await transporter.sendMail({
//           from: `"Rule7Media" <${emailMap[countryKey].email}>`,
//           to: user.email,
//           subject: "Subscription Renewal Reminder - Your subscription is about to expire",
//           html: `
//             <p>Hello ${user.firstName || "User"},</p>
//             <p>Your subscription will expire on <strong>${renewalDate.toDateString()}</strong>. Please update your payment method to ensure your services remain uninterrupted.</p>
//             <a href="${process.env.FRONTEND_URL}/user-profile/payment-method">Update Payment Method</a>
//             <p>Thank you,<br>Rule7Media Team</p>
//           `,
//         });

//         await User.findByIdAndUpdate(
//           user._id,
//           { $set: { "subscription.lastReminderSent": new Date() } },
//           { new: true }
//         );
//         results.push({ user: user.email, action: "renewal_reminder_sent", status: "success" });
//       }

//       // Handle problematic subscription statuses
//       if (["past_due", "canceled", "unpaid"].includes(subscription.status)) {
//         const actionEmailSent = user.subscription?.lastActionEmailSent
//           ? new Date(user.subscription.lastActionEmailSent) > new Date(Date.now() - 24 * 60 * 60 * 1000)
//           : false;

//         if (!actionEmailSent) {
//           await transporter.sendMail({
//             from: `"Rule7Media" <${emailMap[countryKey].email}>`,
//             to: user.email,
//             subject: "Action Required: Subscription Issue",
//             html: `
//               <p>Hello ${user.firstName || "User"},</p>
//               <p>Your subscription has an issue (Status: ${subscription.status}). Please update your payment method to continue using our services. The expiry was on <strong>${renewalDate.toDateString()}</strong>.</p>
//               <a href="${process.env.FRONTEND_URL}/user-profile/payment-method">Update Now</a>
//               <p>Thank you,<br>Rule7Media Team</p>
//             `,
//           });

//           await User.findByIdAndUpdate(
//             user._id,
//             {
//               $set: {
//                 "subscription.lastActionEmailSent": new Date(),
//                 "subscription.requiresBillboardRedirect": true,
//               },
//             },
//             { new: true }
//           );
//           results.push({ user: user.email, action: "action_required_sent", status: "success" });
//         }
//       }
//     } catch (err) {
//       // Handle specific Stripe errors
//       if (err.type === 'StripeInvalidRequestError' && err.code === 'resource_missing') {
//         // Subscription doesn't exist in Stripe
//         await User.findByIdAndUpdate(user._id, {
//           $set: {
//             "subscription.status": "canceled",
//             "subscription.requiresBillboardRedirect": true
//           }
//         });
//         results.push({ user: user.email, action: "marked_canceled", reason: "subscription_not_found" });
//       } else {
//         console.error(`[CRON ERROR] Error processing subscription for user ${user._id}:`, {
//           message: err.message,
//           stack: err.stack,
//         });
//         results.push({ user: user.email, action: "error", error: err.message });

//         if (!transporter) {
//           transporter = createTransporter("AU");
//         }

//         try {
//           await transporter.sendMail({
//             from: `"Rule7Media" <${transporter.options.auth.user}>`,
//             to: process.env.EMAIL_USER,
//             subject: "Cron Job Error: Subscription Check Failed",
//             html: `<p>Error checking subscription for user ${user.email}: ${err.message}</p>`,
//           });
//         } catch (emailErr) {
//           console.error(`[EMAIL ERROR] Failed to send admin error notification for user ${user._id}:`, {
//             message: emailErr.message,
//             stack: emailErr.stack,
//           });
//         }
//       }
//     } finally {
//       if (transporter) {
//         await transporter.close();
//       }
//     }
//   }

//   return results;
// });

// // Clean up users with invalid subscription IDs
// export const cleanupInvalidSubscriptions = asyncHandler(async () => {
//   const usersWithInvalidSubs = await User.find({
//     $or: [
//       { "subscription.stripeSubscriptionId": null },
//       { "subscription.stripeSubscriptionId": { $exists: false } },
//       { "subscription.stripeSubscriptionId": "null" },
//       { "subscription.stripeSubscriptionId": "" }
//     ]
//   });
  
//   for (const user of usersWithInvalidSubs) {
//     await User.findByIdAndUpdate(user._id, {
//       $set: {
//         "subscription.status": "inactive",
//         "subscription.requiresBillboardRedirect": true
//       }
//     });
//   }
  
// });

// // Schedule the cron job to run daily at midnight (IST)
// cron.schedule("0 0 * * *", () => {
//   checkSubscriptionsCron();
// }, {
//   scheduled: true,
//   timezone: "Asia/Kolkata",
// });

// // Schedule cleanup job to run weekly
// cron.schedule("0 0 * * 0", () => {

//   cleanupInvalidSubscriptions();
// }, {
//   scheduled: true,
//   timezone: "Asia/Kolkata",
// });