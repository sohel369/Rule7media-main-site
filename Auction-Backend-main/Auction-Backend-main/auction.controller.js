import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import City from "../models/city.model.js";
import mongoose from "mongoose";
import csvParser from "csv-parser";
import fs from "fs";
import { promisify } from "util";
import moment from 'moment-timezone';

import ProductCategory from "../models/productCategory.model.js";
const readFile = promisify(fs.readFile);
// @desc Create auction product
// @route POST /api/v1/auctions
// @access Private/ Seller only
const createAuction = asyncHandler(async (req, res) => {
  try {
    // Extract fields from request body
    const {
      name,
      description,
      category,
      startTime,
      endTime,
      startingPrice,
      location,
      vehicle,

    } = req.body;

    // Basic validation for all auctions
    if (
      !name ||
      !description ||
      !category ||
      !startTime ||
      !endTime ||
      !startingPrice ||
      !location?.zip ||
      !location?.name
    ) {
      return res.status(400).json(
        new ApiResponse(400, null, "All basic fields are required")
      );
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json(
        new ApiResponse(400, null, "At least one image is required")
      );
    }

    // Vehicle-specific validation
  
      if (
        !vehicle ||
        !vehicle.country ||
        !vehicle.vehicleType ||
        !vehicle.manufacturer ||
        !vehicle.model ||
        !vehicle.dimensions?.length ||
        !vehicle.dimensions?.width ||
        !vehicle.dimensions?.height ||
        !vehicle.dimensions?.wheelbase ||
        !vehicle.dimensions?.curbWeight ||
        !vehicle.dimensions?.engineSize
      ) {
        return res.status(400).json(
          new ApiResponse(400, null, "All vehicle fields are required")
        );
      }
    

    // Validate timestamps
    const currentDate = new Date();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      return res.status(400).json(
        new ApiResponse(400, null, "Start time must be before end time")
      );
    }

    if (startingPrice <= 0) {
      return res.status(400).json(
        new ApiResponse(400, null, "Starting price must be a positive number")
      );
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const imgUrlCloudinary = await uploadOnCloudinary(file.path);
      if (!imgUrlCloudinary?.url) {
        return res.status(500).json(
          new ApiResponse(500, null, "Error uploading images")
        );
      }
      imageUrls.push(imgUrlCloudinary.url);
    }

    // Determine auction status
    let status = "upcoming";
    if (startDate < currentDate) {
      status = "active";
    }
    if (endDate < currentDate) {
      status = "over";
    }

    // Create auction
    const auction = await Auction.create({
      name,
      description,
      category,
      seller: req.user._id,
      startTime: startDate,
      endTime: endDate,
      location: {
        zip: location.zip,
        name: location.name,
      },
      images: imageUrls,
      startingPrice,
      status,
      vehicle,
    });

    if (!auction) {
      return res.status(500).json(
        new ApiResponse(500, null, "Error creating auction")
      );
    }

    return res.status(201).json(
      new ApiResponse(201, auction, "Auction created successfully")
    );

  } catch (error) {
    console.error("Auction creation error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, error?.message || "Internal server error")
    );
  }
});
const createAuctionsFromCSV = asyncHandler(async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json(
        new ApiResponse(400, null, "Array of auction data is required")
      );
    }

    const auctionsData = req.body;
    if (auctionsData.length === 0) {
      return res.status(400).json(
        new ApiResponse(400, null, "Auction data array is empty")
      );
    }

    const createdAuctions = [];
    const errors = [];
    const now = new Date();

    for (const [index, auctionData] of auctionsData.entries()) {
      try {
        // Validate required fields
        const requiredFields = [
          'name', 'description', 'category',
          'startTime', 'endTime', 'startingPrice',
          'location.zip', 'location.name',
          'vehicle.country', 'vehicle.vehicleType',
          'vehicle.manufacturer', 'vehicle.model'
        ];

        // Check required fields
        for (const field of requiredFields) {
          const fieldParts = field.split('.');
          let value = auctionData;
          
          for (const part of fieldParts) {
            value = value?.[part];
            if (value === undefined || value === null || value === '') {
              throw new Error(`Missing required field: ${field}`);
            }
          }
        }

        // Handle category - find or create
        let category;
        if (mongoose.Types.ObjectId.isValid(auctionData.category)) {
          category = await ProductCategory.findById(auctionData.category);
        } else {
          // Try to find by name (case insensitive)
          category = await ProductCategory.findOne({ 
            name: { $regex: new RegExp(`^${auctionData.category}$`, 'i') } 
          });
          
          if (!category) {
            category = await ProductCategory.create({ 
              name: auctionData.category,
              createdBy: req.user._id
            });
          }
        }

        if (!category) {
          throw new Error(`Invalid category: ${auctionData.category}`);
        }

        // Process images
        let images = [];
        if (auctionData.images && auctionData.images.length > 0) {
          images = Array.isArray(auctionData.images) 
            ? auctionData.images 
            : [auctionData.images];
        } else {
          throw new Error('At least one image is required');
        }

        // Convert dates to UTC after validating they're in IST
        const startTimeIST = moment.tz(auctionData.startTime, "Asia/Kolkata");
        const endTimeIST = moment.tz(auctionData.endTime, "Asia/Kolkata");

        if (!startTimeIST.isValid() || !endTimeIST.isValid()) {
          throw new Error('Invalid date format. Use YYYY-MM-DDTHH:mm format in IST timezone');
        }

        if (startTimeIST.isBefore(now)) {
          throw new Error('Start time must be in the future');
        }

        if (startTimeIST.isSameOrAfter(endTimeIST)) {
          throw new Error('End time must be after start time');
        }

        // Convert to UTC
        const startTimeUTC = startTimeIST.utc().toDate();
        const endTimeUTC = endTimeIST.utc().toDate();

        // Validate starting price
        const startingPrice = parseFloat(auctionData.startingPrice);
        if (isNaN(startingPrice) || startingPrice <= 0) {
          throw new Error('Starting price must be a positive number');
        }

        // Validate location
        
        // Create auction
        const auction = await Auction.create({
          name: auctionData.name,
          description: auctionData.description,
          category: category._id,
          seller: req.user._id,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          location: {
            zip: auctionData.location.zip,
            name: auctionData.location.name
          },
          startingPrice: startingPrice,
          images: images,
          status: "upcoming",
          vehicle: {
            country: auctionData.vehicle.country,
            vehicleType: auctionData.vehicle.vehicleType,
            manufacturer: auctionData.vehicle.manufacturer,
            model: auctionData.vehicle.model,
            dimensions: {
              length: auctionData.vehicle.dimensions?.length || '',
              width: auctionData.vehicle.dimensions?.width || '',
              height: auctionData.vehicle.dimensions?.height || '',
              wheelbase: auctionData.vehicle.dimensions?.wheelbase || '',
              curbWeight: auctionData.vehicle.dimensions?.curbWeight || '',
              engineSize: auctionData.vehicle.dimensions?.engineSize || ''
            },
            manufacturerLink: auctionData.vehicle.manufacturerLink || ''
          },
          source: 'csv'
        });

        createdAuctions.push(auction);
      } catch (error) {
        errors.push({
          row: index + 1,
          error: error.message,
          data: auctionData
        });
      }
    }

    if (errors.length > 0 && createdAuctions.length === 0) {
      // All failed
      return res.status(400).json(
        new ApiResponse(400, null, {
          message: "All rows failed to process",
          errors
        })
      );
    }

    // Partial success
    return res.status(errors.length > 0 ? 207 : 201).json(
      new ApiResponse(errors.length > 0 ? 207 : 201, {
        successCount: createdAuctions.length,
        errorCount: errors.length,
        createdAuctions: createdAuctions.map(a => a._id),
        errors
      }, errors.length > 0 ? 
        "Some auctions were not created" : 
        "All auctions created successfully")
    );

  } catch (error) {
    console.error("CSV processing error:", error);
    return res.status(500).json(
      new ApiResponse(500, null, error?.message || "Internal server error")
    );
  }
});
// @desc Get all auctions
// @route GET /api/v1/auctions
// @access Public

const getAllAuctions = asyncHandler(async (req, res) => {
  try {
    const { zipCodes, category, itemName } = req.body;
   

    let filter = {
      status: { $ne: "over" },
    };

    // Handle ZIP code filtering if provided
    if (zipCodes && Array.isArray(zipCodes) && zipCodes.length > 0) {
      filter["location.zip"] = { $in: zipCodes };
    }

    // Filter by category (ensure it's a valid ObjectId)
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    // Search by item name (case-insensitive regex)
    if (itemName) {
      filter.name = { $regex: itemName, $options: "i" };
    }

    const auctions = await Auction.find(filter)
      .populate("seller", "firstName email phone location profilePicture")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "firstName profilePicture",
        },
      })
      .populate("category", "name")
      .populate("location", "name zip") // Ensure ZIP is included in location
      .sort({ createdAt: -1 }); // Show newest auctions first

    if (!auctions || auctions.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }

    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get a single Auction by ID
// @route GET /api/v1/auctions/:id
// @access Public

const getSingleAuctionById = asyncHandler(async (req, res) => {
  try {


    const auction = await Auction.findById(req.params.id)
      .populate("category", "name")
      .populate("location", "name")
      .populate("seller", "firstName email phone location profilePicture")
      .populate("bids")
      .populate("winner", "amount")
      .populate("bids", "bidder bidAmount bidTime")
      .populate({
        path: "bids",
        populate: {
          path: "bidder",
          select: "firstName email profilePicture",
        },
      }) //populate the winner's information as well bidamount and time

      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "firstName  profilePicture",
        },
      });

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    return res.json(
      new ApiResponse(200, "Auction retrieved successfully", auction)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
const getAuctionsBySellerWithBids = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Step 1: Get all auctions for this seller
    const auctions = await Auction.find({ seller: sellerId }).select('_id');

    if (!auctions || auctions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No auctions found for this seller",
      });
    }

    const auctionIds = auctions.map(a => a._id);

    // Step 2: Get unique bidders who placed bids on these auctions
    const bids = await Bid.find({ auction: { $in: auctionIds } })
      .populate({
        path: "bidder",
        select: "firstName _id"
      });

    const uniqueBiddersMap = new Map();
    bids.forEach(bid => {
      const bidder = bid.bidder;
      if (bidder && !uniqueBiddersMap.has(bidder._id.toString())) {
        uniqueBiddersMap.set(bidder._id.toString(), {
          _id: bidder._id,
          name: bidder.firstName,
        });
      }
    });

    // Step 3: Return the list
    return res.status(200).json({
      success: true,
      bidders: Array.from(uniqueBiddersMap.values()),
    });

  } catch (err) {
    console.error("Error fetching bidders for seller auctions:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


// @desc Update auction status
// @route POST /api/v1/auctions/:id/status
// @access public

const updateAuctionStatus = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    //check start and now time and update status
    const now = new Date();

    if (now < auction.startTime) {
      auction.status = "upcoming";
    } else if (now > auction.startTime && now < auction.endTime) {
      auction.status = "active";
    } else {
      auction.status = "over";
    }

    await auction.save();
    return res.json(
      new ApiResponse(200, "Auction status updated successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions of a user on which he placed bids
// @route GET /api/v1/auctions/user-bids
// @access Private

const getBidsAuctionsByUser = asyncHandler(async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate("auction")
      // populate category in auction
      .populate({
        path: "auction",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });
    // it is not showing in reverse order

    if (!bids) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    return res.json(new ApiResponse(200, "bids retrieved successfully", bids));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get all auctions by a user uploaded by him
// @route GET /api/v1/auctions/user-auctions
// @access Private

const getAuctionsByUser = asyncHandler(async (req, res) => {
  try {
    const auctions = await Auction.find({ seller: req.user._id })
      .populate("category", "name")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "firstName",
        },
      })
      .sort({ createdAt: -1 });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }

    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", {
        auctions: auctions,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc delete auction by id
// @route DELETE /api/v1/auctions/delete/:id
// @access Private

const deleteSingleAuctionById = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    //delete all related data to this auction like bids and reviews

    const bids = await Bid.find({ auction: req.params.id });
    if (bids) {
      await Bid.deleteMany({ auction: req.params.id });
    }
 

    await Auction.deleteOne({ _id: req.params.id });
    return res.json(
      new ApiResponse(200, "Auction deleted successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc update a single auction by id
// @route PUT /api/v1/auctions/update/:id
// @access Private

const updateSingleAuactionById = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      startTime,
      endTime,
      startingPrice,
      location,
    } = req.body;
    const image = req.file?.path;

    
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    // Check if startingPrice is a positive number
    if (startingPrice <= 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Starting price must be a positive number"));
    }

    //check start and now time and update status accordingly
    let currentDate = new Date();

    if (startTime !== auction.startTime || endTime !== auction.endTime) {
      if (currentDate > new Date(auction.startTime)) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              "Auction has already started, you can't update start time or end time"
            )
          );
      }
    }

    // Improved status update logic
    const startTimeDate = new Date(startTime || auction.startTime);
    const endTimeDate = new Date(endTime || auction.endTime);

    if (currentDate > endTimeDate) {
      auction.status = "over";
    } else if (currentDate >= startTimeDate) {
      auction.status = "active";
    } else {
      auction.status = "upcoming";
    }

    if (image) {
      var imgUrlCloudinary = await uploadOnCloudinary(image);

      if (!imgUrlCloudinary?.url) {
        return res.status(400).json(new ApiResponse(400, "Invalid image"));
      }
    }

    auction.name = name ? name : auction.name;
    auction.description = description ? description : auction.description;
    auction.category = category ? category : auction.category;
    auction.startTime = startTime ? startTime : auction.startTime;
    auction.endTime = endTime ? endTime : auction.endTime;
    auction.startingPrice = startingPrice
      ? startingPrice
      : auction.startingPrice;
    auction.location = location ? location : auction.location;

    auction.image = imgUrlCloudinary?.url
      ? imgUrlCloudinary.url
      : auction.image;

    await auction.save();
    return res
      .status(201)
      .json(new ApiResponse(201, "Auction Updated Successfully."));
  } catch (error) {
    console.error(error);
    res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          error.message || "Internal Server Error"
        )
      );
  }
});

// @desc Get auction winner
// @route GET /api/v1/auctions/:id/winner
// @access Public

const getAuctionWinner = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate({
      path: "winner",

      populate: {
        path: "bidder",
        select: "firstName  profilePicture",
      },
    });

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    if (auction.bids.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }
    const winner = {
      winnerfirstName: auction?.winner?.bidder?.firstName,
      winnerProfilePicture: auction?.winner?.bidder?.profilePicture,
      winnerBidAmount: auction?.winner?.bidAmount,
      winnerBidTime: auction?.winner?.bidTime,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Auction winner retrieved successfully", {
          winner: winner,
        })
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc Get LIVE 10 auctions
// @route GET /api/v1/auctions/live
// @access Public

const getLiveAuctions = asyncHandler(async (req, res) => {
  try {
    const currentTime = new Date();
    let query = {
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
      status: { $in: ["active", "pending"] }
    };

    // Optional country filter
    const country = req.query.country?.trim();
    if (country) {
      query["location.name"] = { 
        $regex: `.*${country}.*`, 
        $options: "i" 
      };
    }

    const auctions = await Auction.find(query)
      .sort({ startTime: 1 }) // Sort by soonest ending
      .limit(20) // Increased limit
      .populate("seller", "firstName email phone location profilePicture")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "firstName profilePicture",
        },
      });

    return res.json(
      
      new ApiResponse(200, "Live auctions retrieved successfully", auctions)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
// @desc Get UPCOMING 10 auctions
// @route GET /api/v1/auctions/upcoming-auctions
// @access Public

const getUpcomingAuctions = asyncHandler(async (req, res) => {
  try {
    const country = req.query.country?.trim();
     
    let query = { status: "upcoming" };
    if (country) {
      query["location.name"] = { $regex: `.*${country}.*`, $options: "i" };
    }
    const auctions = await Auction.find(query)
      .limit(10)
      .populate("seller", "firstName email phone location profilePicture")
      .populate({
        path: "winner",

        populate: {
          path: "bidder",
          select: "firstName  profilePicture",
        },
      });

    if (!auctions) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }
    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", auctions)
    );
  } catch (error) {
    // Handle the error
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
const getEndingAuctions = asyncHandler(async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1); // 24 hours from now

    const auctions = await Auction.find({
      endDate: { $gte: now, $lte: tomorrow }, // Auctions ending within 24 hours
      status: { $ne: "ended" }, // Exclude already ended auctions
    })
      .limit(10)
      .populate("seller", "firstName email phone location profilePicture")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "firstName profilePicture",
        },
      });

    if (!auctions.length) {
      return res
        .status(404)
        .json(new ApiResponse(404, "No ending auctions found"));
    }

    return res.json(
      new ApiResponse(200, "Ending auctions retrieved successfully", auctions)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

// @desc update payment status of auction
// @route PUT /api/v1/auctions/update-payment-status/:id
// @access Private

const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }
    auction.paid = true;
    await auction.save();
    return res.json(
      new ApiResponse(
        200,
        "Auction payment status updated successfully",
        auction
      )
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
const getactiveauctinsellerid = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  if (!sellerId) {
    return res.status(400).json(new ApiResponse(400, "Seller ID is required"));
  }

  const currentTime = new Date();

  const count = await Auction.countDocuments({
    seller: sellerId,
    startTime: { $lte: currentTime },
    endTime: { $gte: currentTime },
    status: "active"
  });

  return res.json(new ApiResponse(200, "Active auction count retrieved", { count }));
});
export {
  createAuction,
  getAllAuctions,
  getSingleAuctionById,
  updateAuctionStatus,
  getBidsAuctionsByUser,
  getAuctionsByUser,
  deleteSingleAuctionById,
  updateSingleAuactionById,
  getAuctionWinner,
  getLiveAuctions,
  getUpcomingAuctions,
  updatePaymentStatus,
  getEndingAuctions,
  getAuctionsBySellerWithBids,
  getactiveauctinsellerid,
  createAuctionsFromCSV
};
