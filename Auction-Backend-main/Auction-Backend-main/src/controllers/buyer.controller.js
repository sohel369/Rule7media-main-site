import User from '../models/user.model.js';
import Auction from '../models/auction.model.js';
import Bid from "../models/bid.model.js";
// import Transaction from '../models/transaction.model.js';
// import PaymentService from '../services/payment.service.js';
// import EscrowService from '../services/escrow.service.js';

// Get sellers by ZIP code
const getSellersByZip = async (req, res) => {
  try {
    const { zipCode } = req.params;
   
    const sellers = await User.find({ 
      userType: 'seller',
      zipCodes: zipCode 
    }).select('-password');

    res.json({
      success: true,
      data: sellers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get auctions by ZIP code
const getAuctionsByZip = async (req, res) => {
  try {
    const { zipCode } = req.params;
 
    // Validate ZIP code format (example: 12345 or 12345-6789)
    const auctions = await Auction.find({ 
      zipCode,
      status: 'active'
    })
    .populate('product', 'name description images')
    .populate('seller', 'firstName lastName company profilePicture');

    res.json({
      success: true,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Place a bid
const placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    const buyerId = req.user._id;
    
    // Validate bid amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bid amount'
      });
    }
    
    const auction = await Auction.findById(auctionId);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Auction is not active'
      });
    }
    
    if (amount <= auction.currentBid) {
      return res.status(400).json({
        success: false,
        message: 'Bid amount must be higher than current bid'
      });
    }
    
    // Update auction with new bid
    auction.currentBid = amount;
    auction.winningBid = amount;
    auction.winningBuyer = buyerId;
    auction.bids.push({
      buyer: buyerId,
      amount,
      timestamp: new Date()
    });
    
    await auction.save();
    
    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Complete purchase
const completePurchase = async (req, res) => {
  try {
    const { auctionId, paymentMethod } = req.body;
    const buyerId = req.user._id;
    
    const auction = await Auction.findById(auctionId)
      .populate('seller', 'firstName lastName establishmentCosts');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }
    
    if (auction.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Auction is not closed yet'
      });
    }
    
    if (auction.winningBuyer.toString() !== buyerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not the winning bidder'
      });
    }
    
    // Calculate total cost (winning bid + establishment cost)
    const establishmentCost = auction.seller.establishmentCosts
      .find(cost => cost.zipCode === auction.zipCode)?.cost || 0;
    
    const totalAmount = auction.winningBid + establishmentCost;
    
    // Create transaction in escrow
    const transaction = await EscrowService.createEscrow({
      auction: auctionId,
      buyer: buyerId,
      seller: auction.seller._id,
      amount: totalAmount,
      paymentMethod,
      status: 'pending',
      escrowReleased: false
    });
    
    // Process payment
    const paymentResult = await PaymentService.processPayment(
      totalAmount, 
      paymentMethod,
      req.body.paymentDetails
    );
    
    res.json({ 
      success: true,
      data: {
        transaction,
        paymentResult,
        totalAmount,
        winningBid: auction.winningBid,
        establishmentCost
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Update buyer preferences
const updatePreferences = async (req, res) => {
  try {
    const { monthlyBudget, paymentMethods, zipCodes } = req.body;
    const buyerId = req.user._id;
    
    const updates = {};
    
    if (monthlyBudget !== undefined) {
      updates.monthlyBudget = monthlyBudget;
    }
    
    if (paymentMethods) {
      updates.paymentMethods = {
        bankTransfer: paymentMethods.bankTransfer || false,
        creditCard: paymentMethods.creditCard || false,
        bnpl: paymentMethods.bnpl || false
      };
    }
    
    if (zipCodes) {
      updates.zipCodes = Array.isArray(zipCodes) ? zipCodes : [zipCodes];
    }
    
    const buyer = await User.findByIdAndUpdate(
      buyerId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: buyer
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export { 
  getSellersByZip, 
  getAuctionsByZip, 
  placeBid,
  completePurchase,
  updatePreferences
};