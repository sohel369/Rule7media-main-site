import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Auction from "../models/auction.model.js";
import Bid from "../models/bid.model.js";
import City from "../models/city.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import fs from "fs";
import { promisify } from "util";
import moment from "moment-timezone";
import FleetOwner from "../models/fleetowner.model.js";
import ProductCategory from "../models/productCategory.model.js";
const readFile = promisify(fs.readFile);

const createAuction = asyncHandler(async (req, res) => {
  try {
    // Extract fields from request body
    const {
      name,
      description,
      vehicleType,
      startTime,
      endTime,
      location,
      vehicle,
      additionalLocations,
    } = req.body;

    if (
      !name ||
      !description ||
      !vehicleType ||
      !startTime ||
      !endTime ||
      !location?.zip ||
      !location?.name ||
      !location?.latitude ||
      !location?.longitude
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All basic fields are required"));
    }

    // Validate vehicleType
    if (!vehicleType) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Vehicle type is required"));
    }

    // Validate vehicle fields
    if (
      !vehicle ||
      !vehicle.country ||
      !vehicle.yearofmanufacture ||
      !vehicle.manufacturer ||
      !vehicle.model ||
      !vehicle.dimensions?.length ||
      !vehicle.dimensions?.width ||
      !vehicle.dimensions?.height ||
      !vehicle.dimensions?.wheelbase ||
      !vehicle.dimensions?.curbWeight ||
      !vehicle.dimensions?.engineSize ||
      !vehicle.dimensions?.cabwidth ||
      !vehicle.dimensions?.cabheight ||
      !vehicle.dimensions?.bonnetwidth ||
      !vehicle.dimensions?.bonnetLength
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All vehicle fields are required"));
    }

    // Validate timestamps
    const currentDate = new Date();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Start time must be before end time"));
    }

    // Validate additionalLocations
    let parsedAdditionalLocations = [];
    if (additionalLocations) {
      try {
        parsedAdditionalLocations = JSON.parse(additionalLocations);
        if (!Array.isArray(parsedAdditionalLocations)) {
          return res
            .status(400)
            .json(
              new ApiResponse(400, null, "additionalLocations must be an array")
            );
        }
        // Validate each location in additionalLocations
        for (const loc of parsedAdditionalLocations) {
          if (
            !loc.name ||
            !loc.zip ||
            !loc.type ||
            loc.type !== "Point" ||
            !loc.coordinates ||
            !Array.isArray(loc.coordinates) ||
            loc.coordinates.length !== 2 ||
            typeof loc.coordinates[0] !== "number" ||
            typeof loc.coordinates[1] !== "number"
          ) {
            return res
              .status(400)
              .json(
                new ApiResponse(
                  400,
                  null,
                  "Invalid format in additionalLocations"
                )
              );
          }
        }
      } catch (error) {
        return res
          .status(400)
          .json(
            new ApiResponse(400, null, "Failed to parse additionalLocations")
          );
      }
    }
    const campingAvailability = req.body.campingAvailability
      ? JSON.parse(req.body.campingAvailability)
      : {
          threeMonths: "Unavailable",
          sixMonths: "Unavailable",
          twelveMonths: "Unavailable",
          twentyFourMonths: "Unavailable",
        };
    // Upload images to Cloudinary
    const imageUrls = [];

    // 1. Agar files aaye hain (future mein agar manual upload add karna ho)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (result?.secure_url) {
          imageUrls.push({
            url: result.secure_url,
            public_id: result.public_id,
            isPrimary: imageUrls.length === 0,
          });
        }
      }
    }

    // 2. Agar direct URLs aaye hain (auto-filled images)
    if (req.body.images) {
      const images = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];

      images.forEach((img) => {
        if (typeof img === "string" && img.startsWith("http")) {
          imageUrls.push({
            url: img.trim(),
            public_id: null, // ya "" kar do
            isPrimary: imageUrls.length === 0,
          });
        }
      });
    }

    // Agar koi image nahi mili
    if (imageUrls.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "At least one image is required"));
    }

    // First image ko primary bana do
    if (imageUrls.length > 0) {
      imageUrls[0].isPrimary = true;
    }
    // Determine auction status
    let status = "upcoming";
    if (startDate < currentDate) {
      status = "active";
    }
    if (endDate < currentDate) {
      status = "over";
    }
    let minAuctionRates = {};

    if (req.body.minAuctionRates) {
      minAuctionRates =
        typeof req.body.minAuctionRates === "string"
          ? JSON.parse(req.body.minAuctionRates)
          : req.body.minAuctionRates;
    } else {
      minAuctionRates = {
        fullWrap:
          req.body.fullWrap || req.body["minAuctionRates[fullWrap]"] || 0,
        oneSide: req.body.oneSide || req.body["minAuctionRates[oneSide]"] || 0,
        bothSides:
          req.body.bothSides || req.body["minAuctionRates[bothSides]"] || 0,
        rearDoors:
          req.body.rearDoors || req.body["minAuctionRates[rearDoors]"] || 0,
      };
    }

    // Create auction with additionalLocations
    const auction = await Auction.create({
      name,
      description,
      vehicleType,
      seller: req.user._id,
      startTime: startDate,
      endTime: endDate,
      minAuctionRates: minAuctionRates,
      location: {
        zip: location.zip,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        type: "Point",
        coordinates: [
          parseFloat(location.longitude),
          parseFloat(location.latitude),
        ],
      },
      additionalLocations: parsedAdditionalLocations, // Add this field
      images: imageUrls,

      status,
      campingAvailability: {
        threeMonths: campingAvailability.threeMonths || "Unavailable",
        sixMonths: campingAvailability.sixMonths || "Unavailable",
        twelveMonths: campingAvailability.twelveMonths || "Unavailable",
        twentyFourMonths: campingAvailability.twentyFourMonths || "Unavailable",
      },
      vehicle,
    });

    if (!auction) {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Error creating auction"));
    }

    return res
      .status(201)
      .json(new ApiResponse(201, auction, "Auction created successfully"));
  } catch (error) {
    console.error("Auction creation error:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, error?.message || "Internal server error")
      );
  }
});

const createAuctionsFromCSV = asyncHandler(async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Array of auction data is required"));
    }

    const auctionsData = req.body;
    if (auctionsData.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Auction data array is empty"));
    }

    // ✅ Get logged-in sellerId from auth middleware
    const sellerId = req.user?._id;
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized or invalid seller ID"));
    }

    const seller = await User.findById(sellerId);
    if (!seller) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Seller not found"));
    }

    const createdAuctions = [];
    const errors = [];
    const now = new Date();

    // ✅ Process each auction row
    for (const [index, auctionData] of auctionsData.entries()) {
      try {
        // ✅ Validate required fields
        const requiredFields = [
          "name",
          "description",
          "vehicleType",
          "startTime",
          "endTime",
          "location.zip",
          "location.name",
          "vehicle.country",
          "vehicle.yearofmanufacture",
          "vehicle.manufacturer",
          "vehicle.model",
          "vehicle.dimensions.cabwidth",
          "vehicle.dimensions.cabheight",
          "vehicle.dimensions.bonnetwidth",
          "vehicle.dimensions.bonnetLength",
        ];

        for (const field of requiredFields) {
          const parts = field.split(".");
          let value = auctionData;
          for (const part of parts) value = value?.[part];
          if (value === undefined || value === null || value === "")
            throw new Error(`Missing required field: ${field}`);
        }

        // ✅ Handle images
        let images = [];
        if (auctionData.images?.length) {
          // If images is a string (URLs separated by commas)
          if (typeof auctionData.images === "string") {
            const imageUrls = auctionData.images
              .split(",")
              .map((url) => url.trim());
            images = imageUrls.map((url, index) => ({
              url,
              public_id: `csv_upload_${Date.now()}_${index}`,
              isPrimary: index === 0, // First image is primary
            }));
          }
          // If images is already an array
          else if (Array.isArray(auctionData.images)) {
            images = auctionData.images.map((image, index) => {
              if (typeof image === "string") {
                return {
                  url: image,
                  public_id: `csv_upload_${Date.now()}_${index}`,
                  isPrimary: index === 0,
                };
              } else if (image && typeof image === "object") {
                // If already in correct format
                return {
                  url: image.url || "",
                  public_id:
                    image.public_id || `csv_upload_${Date.now()}_${index}`,
                  isPrimary: image.isPrimary || index === 0,
                };
              }
              return {
                url: "",
                public_id: `csv_upload_${Date.now()}_${index}`,
                isPrimary: index === 0,
              };
            });
          }
        } else {
          throw new Error("At least one image is required");
        }

        // Filter out any invalid images
        images = images.filter((img) => img.url && img.url.trim() !== "");
        if (images.length === 0) {
          throw new Error(
            "No valid images found. Please provide valid image URLs"
          );
        }

        const startTimeIST = moment.tz(auctionData.startTime, "Asia/Kolkata");
        const endTimeIST = moment.tz(auctionData.endTime, "Asia/Kolkata");

        if (!startTimeIST.isValid() || !endTimeIST.isValid()) {
          throw new Error(
            "Invalid date format. Use YYYY-MM-DDTHH:mm format in IST timezone"
          );
        }

        if (startTimeIST.isBefore(now)) {
          throw new Error("Start time must be in the future");
        }

        if (startTimeIST.isSameOrAfter(endTimeIST)) {
          throw new Error("End time must be after start time");
        }

        const startTimeUTC = startTimeIST.utc().toDate();
        const endTimeUTC = endTimeIST.utc().toDate();

        const campingAvailability = {
          threeMonths:
            (auctionData.campingAvailability?.threeMonths || "").trim() ===
            "Available"
              ? "Available"
              : "Unavailable",
          sixMonths:
            (auctionData.campingAvailability?.sixMonths || "").trim() ===
            "Available"
              ? "Available"
              : "Unavailable",
          twelveMonths:
            (auctionData.campingAvailability?.twelveMonths || "").trim() ===
            "Available"
              ? "Available"
              : "Unavailable",
          twentyFourMonths:
            (auctionData.campingAvailability?.twentyFourMonths || "").trim() ===
            "Available"
              ? "Available"
              : "Unavailable",
        };

        // ✅ Create auction
        const auction = await Auction.create({
          name: auctionData.name,
          description: auctionData.description,
          vehicleType: auctionData.vehicleType,
          seller: sellerId, // automatic from token
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          location: {
            zip: auctionData.location.zip,
            name: auctionData.location.name,
            type: "Point",
            coordinates: [
              parseFloat(auctionData.location.longitude || 0),
              parseFloat(auctionData.location.latitude || 0),
            ],
          },
          additionalLocations: auctionData.additionalLocations || [],
          images,
          status: "upcoming",
          vehicle: {
            country: auctionData.vehicle.country,
            yearofmanufacture: auctionData.vehicle.yearofmanufacture,
            manufacturer: auctionData.vehicle.manufacturer,
            model: auctionData.vehicle.model,
            dimensions: {
              length: auctionData.vehicle.dimensions?.length || 0,
              width: auctionData.vehicle.dimensions?.width || 0,
              height: auctionData.vehicle.dimensions?.height || 0,
              wheelbase: auctionData.vehicle.dimensions?.wheelbase || 0,
              curbWeight: auctionData.vehicle.dimensions?.curbWeight || 0,
              engineSize: auctionData.vehicle.dimensions?.engineSize || 0,
              bonnetwidth: auctionData.vehicle.dimensions?.bonnetwidth || 0,
              bonnetLength: auctionData.vehicle.dimensions?.bonnetLength || 0,
              cabheight: auctionData.vehicle.dimensions?.cabheight || 0,
              cabwidth: auctionData.vehicle.dimensions?.cabwidth || 0,
            },
            manufacturerLink: auctionData.vehicle.manufacturerLink || "",
          },
          campingAvailability,
          minAuctionRates: {
            fullWrap: parseFloat(auctionData["minAuctionRate.fullWrap"]) || 0,
            oneSide: parseFloat(auctionData["minAuctionRate.oneSide"]) || 0,
            bothSides: parseFloat(auctionData["minAuctionRate.bothSides"]) || 0,
            rearDoors: parseFloat(auctionData["minAuctionRate.rearDoors"]) || 0,
          },
          source: "csv",
        });

        createdAuctions.push(auction);
      } catch (err) {
        console.error(`Error in row ${index + 1}:`, err.message);
        errors.push({
          row: index + 1,
          error: err.message,
          data: auctionData,
        });
      }
    }

    // ✅ Response
    if (errors.length > 0 && createdAuctions.length === 0) {
      return res.status(400).json(
        new ApiResponse(400, null, {
          message: "All rows failed to process",
          errors,
        })
      );
    }

    return res.status(errors.length > 0 ? 207 : 201).json(
      new ApiResponse(
        errors.length > 0 ? 207 : 201,
        {
          successCount: createdAuctions.length,
          errorCount: errors.length,
          createdAuctions: createdAuctions.map((a) => a._id),
          errors,
        },
        errors.length > 0
          ? "Some auctions were not created"
          : "All auctions created successfully"
      )
    );
  } catch (error) {
    console.error("CSV processing error:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, error?.message || "Internal server error")
      );
  }
});
// @desc Get all auctions
// @route GET /api/v1/auctions
// @access Public

const getAllAuctions = asyncHandler(async (req, res) => {
  try {
    const { itemName = "", zip, searchType } = req.body;

    let auctionFilter = { status: { $ne: "over" } };
    let fleetFilter = { status: { $ne: "over" }, isApprovedByAdmin: true };

    if (zip && typeof zip === "string" && zip.trim()) {
      auctionFilter["location.zip"] = zip;
      fleetFilter["location.zip"] = zip;
    }
    if (itemName && typeof itemName === "string" && itemName.trim()) {
      auctionFilter.name = { $regex: itemName, $options: "i" };
      fleetFilter["vehicleModel"] = { $regex: itemName, $options: "i" };
    }

    if (!zip && !itemName) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            "Please provide at least a ZIP code or item name"
          )
        );
    }

    const auctions = await Auction.find(auctionFilter)
      .populate("seller", "firstName email phone location profilePicture")
      .populate([
        { path: "winners.fullWrap.bidder", select: "firstName profilePicture" },
        { path: "winners.oneSide.bidder", select: "firstName profilePicture" },
        {
          path: "winners.bothSides.bidder",
          select: "firstName profilePicture",
        },
        {
          path: "winners.rearDoors.bidder",
          select: "firstName profilePicture",
        },
      ])
      .populate("location", "name zip")
      .sort({ createdAt: -1 });

    // Fetch fleet owners
    const fleetOwners = await FleetOwner.find(fleetFilter)
      .populate("user", "firstName email phone location profilePicture")
      .populate({
        path: "winner",
        populate: {
          path: "bidder",
          select: "firstName profilePicture",
        },
      })
      .populate("location", "name zip")
      .sort({ createdAt: -1 });

    // Combine both collections and normalize structure
    const combinedData = [
      ...auctions.map((auc) => ({
        _id: auc._id,
        name: auc.name,
        description: auc.description,
        vehicleType: auc.vehicleType,
        seller: auc.seller,
        location: auc.location,
        startTime: auc.startTime,
        endTime: auc.endTime,
        images: auc.images,
        paid: auc.paid,
        status: auc.status,
        startingPrice: auc.startingPrice,
        vehicle: auc.vehicle,
        type: "Auction",
      })),
      ...fleetOwners.map((fleet) => ({
        _id: fleet._id,
        name: fleet.company || "Fleet Owner Auction",
        description: fleet.vehicleModel || "Fleet vehicle for auction",
        vehicleType: fleet.vehicleModel || "Fleet Vehicle",
        seller: fleet.user,
        location: fleet.location,
        startTime: fleet.startTime,
        endTime: fleet.endTime,
        images: fleet.images.map((img) => img.url),
        paid: false,
        status: fleet.status,
        startingPrice: fleet.minAuctionRates?.fullWrap || 0,
        vehicle: null,
        type: "FleetOwner",
      })),
    ];

    if (combinedData.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No auctions found"));
    }

    return res.json(
      new ApiResponse(200, "Auctions retrieved successfully", combinedData)
    );
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});

//  const getAllAuctionsCombined = asyncHandler(async (req, res) => {
//   try {
//     const { itemName = "", zip } = req.body;

//     // Filters
//     let auctionFilter = { status: { $ne: "over" } };
//     let fleetFilter = { status: { $ne: "over" }, isApprovedByAdmin: true };

//     if (zip && typeof zip === "string" && zip.trim()) {
//       auctionFilter["location.zip"] = zip;
//       fleetFilter["location.zip"] = zip;
//     }

//     if (itemName && typeof itemName === "string" && itemName.trim()) {
//       auctionFilter.name = { $regex: itemName, $options: "i" };
//       fleetFilter.vehicleModel = { $regex: itemName, $options: "i" };
//     }

//     // Fetch Auctions
//     const auctions = await Auction.find(auctionFilter)
//       .populate("seller", "firstName email phone location profilePicture")
//       .populate("fleetOwner", "user company")
//       .populate({
//         path: "winner",
//         populate: { path: "bidder", select: "firstName profilePicture" },
//       })
//       .populate("location", "name zip")
//       .sort({ createdAt: -1 });

//     // Fetch Fleet Owners
//     const fleetOwners = await FleetOwner.find(fleetFilter)
//       .populate("user", "firstName email phone location profilePicture")
//       .populate({
//         path: "winner",
//         populate: { path: "bidder", select: "firstName profilePicture" },
//       })
//       .populate("location", "name zip")
//       .sort({ createdAt: -1 });

//     // Combine & normalize
//     const combinedData = [
//       ...auctions.map((auc) => ({
//         _id: auc._id,
//         name: auc.name,
//         description: auc.description,
//         vehicleType: auc.vehicleType,
//         seller: auc.seller,
//         fleetOwner: auc.fleetOwner,
//         location: auc.location,
//         startTime: auc.startTime,
//         endTime: auc.endTime,
//         images: auc.images,
//         paid: auc.paid,
//         status: auc.status,
//         startingPrice: auc.startingPrice,
//         vehicle: auc.vehicle,
//         type: "Auction",
//       })),
//       ...fleetOwners.map((fleet) => ({
//         _id: fleet._id,
//         name: fleet.company || "Fleet Owner Auction",
//         description: fleet.vehicleModel || "Fleet vehicle for auction",
//         vehicleType: fleet.vehicleModel || "Fleet Vehicle",
//         seller: fleet.user,
//         location: fleet.location,
//         startTime: fleet.startTime,
//         endTime: fleet.endTime,
//         images: fleet.images.map((img) => img.url),
//         paid: false,
//         status: fleet.status,
//         startingPrice: fleet.minAuctionRates?.fullWrap || 0,
//         vehicle: null,
//         type: "FleetOwner",
//       })),
//     ];

//     return res.status(200).json({ message: "Auctions retrieved", data: combinedData });
//   } catch (error) {
//     console.error("Error fetching auctions:", error);
//     return res.status(500).json({ message: error.message || "Internal server error" });
//   }
// });

// @desc Get a single Auction by ID
// @route GET /api/v1/auctions/:id
// @access Public

const getAllAuctionsCombined = asyncHandler(async (req, res) => {
  try {
    const { itemName = "", zip } = req.body;

    // Build filter for auctions only
    let auctionFilter = {
      status: { $ne: "over" },
    };

    // Apply zip filter if provided
    if (zip && typeof zip === "string" && zip.trim()) {
      auctionFilter["location.zip"] = zip;
    }

    // Apply item name filter if provided
    if (itemName && typeof itemName === "string" && itemName.trim()) {
      auctionFilter.name = { $regex: itemName, $options: "i" };
    }

    // Fetch only Auctions with optimized queries
    const auctions = await Auction.find(auctionFilter)
      .populate("seller", "firstName lastName email phone profilePicture")
      .populate("fleetOwner", "company contactPerson phone")
      .populate({
        path: "winners.fullWrap.bidder",
        select: "firstName lastName profilePicture email",
      })
      .populate({
        path: "winners.oneSide.bidder",
        select: "firstName lastName profilePicture email",
      })
      .populate({
        path: "winners.bothSides.bidder",
        select: "firstName lastName profilePicture email",
      })
      .populate({
        path: "winners.rearDoors.bidder",
        select: "firstName lastName profilePicture email",
      })
      .populate("location", "name zip coordinates")
      .select("-__v -createdAt -updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    const formattedAuctions = auctions.map((auc) => ({
      _id: auc._id,
      name: auc.name,
      description: auc.description,
      vehicleType: auc.vehicleType,
      seller: auc.seller,
      fleetOwner: auc.fleetOwner,
      location: auc.location,
      startTime: auc.startTime,
      endTime: auc.endTime,
      images: auc.images,
      paid: auc.paid,
      status: auc.status,
      minAuctionRates: auc.minAuctionRates,
      currentBid: auc.currentBid || auc.startingPrice,
      vehicle: auc.vehicle,
      category: auc.category,
      campingAvailability: auc.campingAvailability,
      source: auc.source || "manual",
      type: "Auction",
      adminstatus: auc.adminstatus || "pending",
      timeRemaining: auc.endTime - Date.now(),
      bidCount: auc.bids?.length || 0,
      isActive: auc.status === "active",
      isUpcoming: auc.status === "upcoming",
      winners: auc.winners, // Include winners in the response
    }));

    return res.status(200).json({
      message: "Auctions retrieved successfully",
      data: formattedAuctions,
      count: formattedAuctions.length,
      filters: {
        itemName: itemName || "none",
        zip: zip || "none",
      },
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

const getSingleAuctionById = asyncHandler(async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("category", "name")
      .populate("location", "name")
      .populate("seller", "firstName email phone location profilePicture")
      .populate("bids")
      .populate("bids", "bidder bidAmount bidTime")
      .populate({
        path: "bids",
        populate: {
          path: "bidder",
          select: "firstName email profilePicture",
        },
      })
      // Populate all winners' bidder fields
      .populate({
        path: "winners.fullWrap.bidder",
        select: "firstName email profilePicture",
      })
      .populate({
        path: "winners.oneSide.bidder",
        select: "firstName email profilePicture",
      })
      .populate({
        path: "winners.bothSides.bidder",
        select: "firstName email profilePicture",
      })
      .populate({
        path: "winners.rearDoors.bidder",
        select: "firstName email profilePicture",
      })
      // Also populate bidId references if needed
      .populate({
        path: "winners.fullWrap.bidId",
        select: "bidAmount bidTime",
      })
      .populate({
        path: "winners.oneSide.bidId",
        select: "bidAmount bidTime",
      })
      .populate({
        path: "winners.bothSides.bidId",
        select: "bidAmount bidTime",
      })
      .populate({
        path: "winners.rearDoors.bidId",
        select: "bidAmount bidTime",
      });

    if (!auction) {
      return res.status(404).json(new ApiResponse(404, "Auction not found"));
    }

    return res.json(
      new ApiResponse(200, "Auction retrieved successfully", auction)
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal server error"));
  }
});
const getAuctionsBySellerWithBids = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // Step 1: Get all auctions for this seller
    const auctions = await Auction.find({ seller: sellerId }).select("_id");

    if (!auctions || auctions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No auctions found for this seller",
      });
    }

    const auctionIds = auctions.map((a) => a._id);

    // Step 2: Get unique bidders who placed bids on these auctions
    const bids = await Bid.find({ auction: { $in: auctionIds } }).populate({
      path: "bidder",
      select: "firstName _id",
    });

    const uniqueBiddersMap = new Map();
    bids.forEach((bid) => {
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
    // Fetch bids where the user is the bidder
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({
        path: "auction",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .populate({
        path: "fleetOwner", // Assuming Bid has a field `fleetOwner` referencing the FleetOwner model
        populate: {
          path: "vehicleModel", // Adjust if FleetOwner has a category field
          select: "name",
        },
      })
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)

    if (!bids || bids.length === 0) {
      return res.status(404).json(new ApiResponse(404, "No bids found"));
    }

    // Optionally, filter or format bids to separate Auction and FleetOwner
    const formattedBids = bids.map((bid) => ({
      _id: bid._id,
      auction: bid.auction || null, // Include auction if present
      fleetOwner: bid.fleetOwner || null, // Include fleetOwner if present
      bidAmount: bid.bidAmount, // Adjust based on your Bid schema
      bidTime: bid.createdAt,
      // Add other relevant fields
    }));

    return res.json(
      new ApiResponse(200, "Bids retrieved successfully", formattedBids)
    );
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
        path: "winners.fullWrap.bidder",
        select: "firstName email profilePicture email telephoneNumber ",
      })
      .populate({
        path: "winners.oneSide.bidder",
        select: "firstName email profilePicture email telephoneNumber",
      })
      .populate({
        path: "winners.bothSides.bidder",
        select: "firstName email profilePicture email telephoneNumber",
      })
      .populate({
        path: "winners.rearDoors.bidder",
        select: "firstName email profilePicture email telephoneNumber",
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

    return res.status(200).json(
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
      status: { $in: ["active", "pending"] },
      adminstatus: "approved",
    };

    // Optional country filter
    const country = req.query.country?.trim();
    if (country) {
      query["location.name"] = {
        $regex: `.*${country}.*`,
        $options: "i",
      };
    }

    const auctions = await Auction.find(query)
      .sort({ startTime: 1 }) // Sort by soonest ending
      .limit(20) // Increased limit
      .populate("seller", "firstName email phone location profilePicture")
      .populate({
        path: "winners.fullWrap.bidder",
        select: "firstName profilePicture",
      })
      .populate({
        path: "winners.oneSide.bidder",
        select: "firstName profilePicture",
      })
      .populate({
        path: "winners.bothSides.bidder",
        select: "firstName profilePicture",
      })
      .populate({
        path: "winners.rearDoors.bidder",
        select: "firstName profilePicture",
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
        path: "winners.fullWrap.bidder",
        select: "firstName profilePicture",
      })
      .populate({
        path: "winners.oneSide.bidder",
        select: "firstName profilePicture",
      })
      .populate({
        path: "winners.bothSides.bidder",
        select: "firstName profilePicture",
      })
      .populate({
        path: "winners.rearDoors.bidder",
        select: "firstName profilePicture",
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
  const auctions = await Auction.find({ status: "over" })
    .limit(10)
    .populate("seller", "firstName email phone location profilePicture")
    .populate({
      path: "winners.fullWrap.bidder",
      select: "firstName profilePicture",
    })
    .populate({
      path: "winners.oneSide.bidder",
      select: "firstName profilePicture",
    })
    .populate({
      path: "winners.bothSides.bidder",
      select: "firstName profilePicture",
    })
    .populate({
      path: "winners.rearDoors.bidder",
      select: "firstName profilePicture",
    });

  if (!auctions.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No ending auctions found"));
  }

  return res.json(
    new ApiResponse(200, "Ending auctions retrieved successfully", auctions)
  );
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
    status: "active",
  });

  return res.json(
    new ApiResponse(200, "Active auction count retrieved", { count })
  );
});

// const getAllAuctionWinners = asyncHandler(async (req, res) => {
//   try {
//     const winningBids = await Bid.find({ isWinningBid: true })
//       .populate({
//         path: "bidder",
//         select: "firstName lastName username email profilePicture phoneNumber",
//       })
//       .populate({
//         path: "auction",
//         select:
//           "name description startingPrice currentPrice startTime endTime status images vehicleModel location seller vehicle",
//         populate: [
//           {
//             path: "seller",
//             select:
//               "firstName lastName username email profilePicture state country phoneNumber",
//           },
//           {
//             path: "category",
//             select: "name description",
//           },
//         ],
//       })
//       .populate({
//         path: "fleetOwner", // This holds the FleetAuction reference
//         model: "FleetOwner",
//         select:
//           "company fleetName description startTime endTime status vehicleCount location fleetOwner images vehicleModel",
//         populate: {
//           path: "fleetOwner",
//           model: "User",
//           select:
//             "firstName lastName username email profilePicture state country phoneNumber",
//         },
//       })
//       .sort({ bidTime: -1 });

//     const formattedWinners = winningBids.map((bid) => {
//       const isFleet = bid.auctionType === "fleetauction";

//       const auctionData = isFleet ? bid.fleetOwner : bid.auction;
//       const sellerData = isFleet
//         ? bid.fleetOwner?.fleetOwner
//         : bid.auction?.seller;

//       return {
//         bidId: bid._id,
//         bidAmount: bid.bidAmount,
//         bidTime: bid.bidTime,
//         paymentStatus: bid.paymentStatus || "pending",
//         buyer: bid.bidder
//           ? {
//               id: bid.bidder._id,
//               name:
//                 [bid.bidder.firstName, bid.bidder.lastName]
//                   .filter(Boolean)
//                   .join(" ") || bid.bidder.username || "Unnamed Buyer",
//               email: bid.bidder.email,
//               phone: bid.bidder.phoneNumber,
//               profilePicture: bid.bidder.profilePicture,
//             }
//           : null,
//         auction: auctionData
//           ? {
//               id: auctionData._id,
//               name: auctionData.name || auctionData.fleetName || auctionData.company || "Fleet Auction",
//               description: auctionData.description || "",
//               startingPrice: auctionData.startingPrice || null,
//               currentPrice: auctionData.currentPrice || null,
//               startTime: auctionData.startTime,
//               endTime: auctionData.endTime,
//               status: auctionData.status,
//               images: auctionData.images || [],
//               category: auctionData.category
//                 ? {
//                     id: auctionData.category._id,
//                     name: auctionData.category.name,
//                     description: auctionData.category.description,
//                   }
//                 : null,
//               location: auctionData.location || null,
//               vehicleModel: auctionData.vehicleModel || null,
//               seller: sellerData
//                 ? {
//                     id: sellerData._id,
//                     name:
//                       [sellerData.firstName, sellerData.lastName]
//                         .filter(Boolean)
//                         .join(" ") || sellerData.username || "Unnamed Seller",
//                     email: sellerData.email,
//                     phone: sellerData.phoneNumber,
//                     profilePicture: sellerData.profilePicture,
//                     state: sellerData.state,
//                     country: sellerData.country,
//                   }
//                 : null,
//             }
//           : null,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       count: formattedWinners.length,
//       data: formattedWinners,
//     });
//   } catch (error) {
//     console.error("Error fetching winning bids:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching winning bids",
//       error: error.message,
//     });
//   }
// });

const getAllAuctionWinners = asyncHandler(async (req, res) => {
  try {
    const winningBids = await Bid.find({ isWinningBid: true })
      .populate({
        path: "bidder",
        select: `
          firstName lastname username email profilePicture phoneNumber 
          position company state country city street1 street2 suburb postalCode location
        `,
      })
      .populate({
        path: "auction",
        select:
          "name description startingPrice currentPrice startTime endTime status images vehicleModel location seller vehicle category",
        populate: [
          {
            path: "seller",
            select: `
              firstName lastname username email profilePicture 
              state country phoneNumber company position city street1 street2 suburb postalCode location
            `,
          },
          {
            path: "category",
            select: "name description",
          },
        ],
      })
      .populate({
        path: "fleetOwner",
        model: "FleetOwner",
        select:
          "company fleetName description bidType  startTime endTime status vehicleCount location images vehicleModel fleetOwner",
        populate: {
          path: "fleetOwner",
          model: "User",
          select: `
            firstName lastname username email profilePicture 
            state country phoneNumber bidType  company position city street1 street2 suburb postalCode location
          `,
        },
      })
      .sort({ bidTime: -1 });

    const formattedWinners = winningBids.map((bid) => {
      const isFleet = bid.auctionType === "fleetauction";
      const auctionData = isFleet ? bid.fleetOwner : bid.auction;
      const sellerData = isFleet
        ? bid.fleetOwner?.fleetOwner
        : bid.auction?.seller;

      return {
        bidId: bid._id,
        bidAmount: bid.bidAmount,
        bidTime: bid.bidTime,
        bidType: bid.bidType || "unknown",
        paymentStatus: bid.paymentStatus || "pending",
        buyer: bid.bidder
          ? {
              id: bid.bidder._id,
              firstName: bid.bidder.firstName,
              lastName: bid.bidder.lastname,
              name:
                [bid.bidder.firstName, bid.bidder.lastname]
                  .filter(Boolean)
                  .join(" ") || bid.bidder.username,
              email: bid.bidder.email,
              phone: bid.bidder.phoneNumber,
              profilePicture: bid.bidder.profilePicture,
              position: bid.bidder.position,
              company: bid.bidder.company,
              street1: bid.bidder.street1,
              street2: bid.bidder.street2,
              suburb: bid.bidder.suburb,
              city: bid.bidder.city,
              state: bid.bidder.state,
              country: bid.bidder.country,
              postalCode: bid.bidder.postalCode,
              location: bid.bidder.location,
            }
          : null,
        auction: auctionData
          ? {
              id: auctionData._id,
              name:
                auctionData.name ||
                auctionData.fleetName ||
                auctionData.company ||
                "Auction/Fleet",
              description: auctionData.description || "",
              startingPrice: auctionData.startingPrice || null,
              currentPrice: auctionData.currentPrice || null,
              startTime: auctionData.startTime,
              endTime: auctionData.endTime,
              status: auctionData.status,
              images: auctionData.images || [],
              vehicleModel: isFleet
                ? auctionData.vehicleModel
                : auctionData.vehicle?.model,

              location: auctionData.location || null,
              category: auctionData.category
                ? {
                    id: auctionData.category._id,
                    name: auctionData.category.name,
                    description: auctionData.category.description,
                  }
                : null,
              seller: sellerData
                ? {
                    id: sellerData._id,
                    firstName: sellerData.firstName,
                    lastName: sellerData.lastname,
                    name:
                      [sellerData.firstName, sellerData.lastname]
                        .filter(Boolean)
                        .join(" ") || sellerData.username,
                    email: sellerData.email,
                    phone: sellerData.phoneNumber,
                    profilePicture: sellerData.profilePicture,
                    position: sellerData.position,
                    company: sellerData.company,
                    street1: sellerData.street1,
                    street2: sellerData.street2,
                    suburb: sellerData.suburb,
                    city: sellerData.city,
                    state: sellerData.state,
                    country: sellerData.country,
                    postalCode: sellerData.postalCode,
                    location: sellerData.location,
                  }
                : null,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedWinners.length,
      data: formattedWinners,
    });
  } catch (error) {
    console.error("Error fetching winning bids:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching winning bids",
      error: error.message,
    });
  }
});

// auctionController.js में add करें
const updateCampingAdminStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { adminstatus } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Auction ID is required",
      });
    }

    if (!["pending", "approved", "rejected"].includes(adminstatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: pending, approved, rejected",
      });
    }

    // Find auction
    const auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    const updateData = {
      adminstatus: adminstatus,
    };

    // Add timestamps based on status
    if (adminstatus === "approved") {
      updateData.approvedAt = new Date();
    } else if (adminstatus === "rejected") {
      updateData.rejectedAt = new Date();
    }

    const updatedAuction = await Auction.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: `Auction status updated to ${adminstatus}`,
      data: {
        _id: updatedAuction._id,
        name: updatedAuction.name,
        adminstatus: updatedAuction.adminstatus,
      },
    });
  } catch (error) {
    console.error("Error updating auction status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export {
  createAuction,
  getAllAuctions,
  getSingleAuctionById,
  updateAuctionStatus,
  getBidsAuctionsByUser,
  getAuctionsByUser,
  getAllAuctionsCombined,
  deleteSingleAuctionById,
  updateSingleAuactionById,
  getAuctionWinner,
  getLiveAuctions,
  getUpcomingAuctions,
  updatePaymentStatus,
  getEndingAuctions,
  getAuctionsBySellerWithBids,
  getactiveauctinsellerid,
  createAuctionsFromCSV,
  getAllAuctionWinners,
  updateCampingAdminStatus,
};
