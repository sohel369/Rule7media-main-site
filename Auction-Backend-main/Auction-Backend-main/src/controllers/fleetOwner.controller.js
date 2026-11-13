// fleetowner.controller.js
import FleetOwner from "../models/fleetowner.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import Bid from "../models/bid.model.js";
import BudgetRequest from "../models/budget.model.js";
import moment from 'moment';
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
// export const createFleetOwnerForm = async (req, res) => {
//   try {


//     if (!req.body.user) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     if (!req.body.startTime || !req.body.endTime) {
//       return res.status(400).json({
//         success: false,
//         message: "Both start time and end time are required",
//       });
//     }

//     // Parse and validate dates
//     const startTime = Array.isArray(req.body.startTime) 
//       ? req.body.startTime[0] 
//       : req.body.startTime;
      
//     const endTime = Array.isArray(req.body.endTime) 
//       ? req.body.endTime[0] 
//       : req.body.endTime;


//     const startDate = new Date(startTime);
//     const endDate = new Date(endTime);
    
  
//     if (isNaN(startDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid start time format: ${startTime}`
//       });
//     }

//     if (isNaN(endDate.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid end time format: ${endTime}`
//       });
//     }

//     if (startDate >= endDate) {
//       return res.status(400).json({
//         success: false,
//         message: `Start time (${startDate.toISOString()}) must be before end time (${endDate.toISOString()})`
//       });
//     }

//     // FIXED: Calculate status based on UTC times for consistency
//     let status = "upcoming";
//     const now = new Date();
    
//     // Convert all times to UTC timestamps for accurate comparison
//     const nowUTC = now.getTime();
//     const startUTC = startDate.getTime();
//     const endUTC = endDate.getTime();
    

    
//     if (nowUTC >= startUTC && nowUTC < endUTC) {
//       status = "active";

//     } else if (nowUTC >= endUTC) {
//       status = "over";

//     } else {
//       status = "upcoming";

//     }

//     // Handle image uploads
//     const imageUrls = [];
//     if (req.files && Array.isArray(req.files)) {
//       for (const file of req.files) {
   
//         const result = await uploadOnCloudinary(file.path);
//         if (!result?.secure_url) {
//           return res.status(500).json({
//             success: false,
//             message: "Image upload failed",
//           });
//         }
//         imageUrls.push({
//           url: result.secure_url,
//           public_id: result.public_id,
//           isPrimary: false,
//         });
//       }
//     }

//     // Parse availability
//     let availability = [];
//     try {
//       availability = JSON.parse(req.body.availability || "[]");
//     } catch (e) {
//       console.error("Error parsing availability:", e);
//     }

//     // Parse CPA data
//     let cpaData = {};
//     try {
//       cpaData = JSON.parse(req.body.cpaData || "{}");
//     } catch (e) {
//       console.error("Error parsing CPA data:", e);
//     }

//     // Parse prohibited ads
//     let prohibitedAds = {
//       gambling: false,
//       alcohol: false,
//       smoking: false,
//       other: false,
//       otherSpecify: "",
//     };
//     try {
//       prohibitedAds = JSON.parse(req.body.prohibitedAds || "{}");
//     } catch (e) {
//       console.error("Error parsing prohibitedAds:", e);
//     }

//     const formData = {
//       user: req.body.user,
//       company: req.body.company,
//       accountNumber: req.body.accountNumber,
//       suburb: req.body.suburb,
//       townOrCity: req.body.city,
//       state: req.body.state,
//       country: req.body.country,
      
//       // Store as proper Date objects (MongoDB will handle UTC storage)
//       startTime: startDate,
//       endTime: endDate,
      
//       zipCodesCovered: req.body.zipCodes
//         ? req.body.zipCodes.split(",").map((z) => z.trim())
//         : [],
//       interRoutes:
//         req.body.routeFrom && req.body.routeTo
//           ? [
//               {
//                 from: req.body.routeFrom,
//                 to: req.body.routeTo,
//               },
//             ]
//           : [],
//       location:
//         req.body.latitude && req.body.longitude
//           ? {
//               type: "Point",
//               coordinates: [
//                 parseFloat(req.body.longitude), 
//                 parseFloat(req.body.latitude),
//               ],
//               name: req.body.locationName || "",
//               zip: req.body.zipCode || "",
//             }
//           : null,
//       cpaData: {
//         vehicleWrapCpm: cpaData.vehicleWrapCpm || 0,
//         comparisons: cpaData.comparisonData || [],
//       },
//       minAuctionRates: {
//         fullWrap: parseFloat(req.body.auctionRateFullWrap) || 0,
//         oneSide: parseFloat(req.body.auctionRateOneSide) || 0,
//         bothSides: parseFloat(req.body.auctionRateBothSides) || 0,
//         rearDoors: parseFloat(req.body.auctionRateRearDoors) || 0,
//       },
//       buyNowRates: {
//         fullWrap: parseFloat(req.body.buyNowRateFullWrap) || 0,
//         oneSide: parseFloat(req.body.buyNowRateOneSide) || 0,
//         bothSides: parseFloat(req.body.buyNowRateBothSides) || 0,
//         rearDoors: parseFloat(req.body.buyNowRateRearDoors) || 0,
//       },
//       discountOffers: {
//         threeMonth: parseFloat(req.body.discount3Month) || 0,
//         sixMonth: parseFloat(req.body.discount6Month) || 0,
//         twelveMonth: parseFloat(req.body.discount12Month) || 0,
//         twentyFourMonth: parseFloat(req.body.discount24Month) || 0,
//       },
//       vehicleManufacturer: req.body.manufacturer,
//       yearofmanufacturer: req.body.yearofmanufacturer,
//       vehicleModel: req.body.model,
//       vehicleAvailability: {
//         threeMonths: availability.includes("3 Months"),
//         sixMonths: availability.includes("6 Months"),
//         twelveMonths: availability.includes("12 Months"),
//          twentyFourMonths: availability.includes("24 Months"),
//       },
//       prohibitedAds: {
//         gambling: prohibitedAds.gambling || false,
//         alcohol: prohibitedAds.alcohol || false,
//         smoking: prohibitedAds.smoking || false,
//         other: prohibitedAds.other || false,
//         otherSpecify: prohibitedAds.otherSpecify || "",
//       },
//       images: imageUrls,
//       status,
      
//       // Add these fields for better tracking
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };



//     const form = await FleetOwner.create(formData);

//     res.status(201).json({
//       success: true,
//       message: "Fleet form created successfully",
//       data: form,
//     });
//   } catch (err) {
//     console.error("Error creating fleet form:", err);

//     res.status(500).json({
//       success: false,
//       message: "Form creation failed",
//       error: err.message,
//     });
//   }
// };

export const createFleetOwnerForm = async (req, res) => {
  try {
   

    // Validate required fields (unchanged)
    if (!req.body.user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!req.body.startTime || !req.body.endTime) {
      return res.status(400).json({
        success: false,
        message: "Both start time and end time are required",
      });
    }
const dailyMileage = parseFloat(req.body.dailyMileage) || 0;
    if (isNaN(dailyMileage) || dailyMileage < 0) {
      return res.status(400).json({
        success: false,
        message: "Daily Mileage must be a valid non-negative number",
      });
    }
    // Parse and validate dates (unchanged)
    const startTime = Array.isArray(req.body.startTime)
      ? req.body.startTime[0]
      : req.body.startTime;
    const endTime = Array.isArray(req.body.endTime)
      ? req.body.endTime[0]
      : req.body.endTime;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for startTime or endTime",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    // Calculate status (unchanged)
    const currentDate = new Date();
    let status = "upcoming";
    if (startDate < currentDate) {
      status = "active";
    }
    if (endDate < currentDate) {
      status = "over";
    }


    const buyNowRates = {
  fullWrap: parseFloat(req.body.buyNowRateFullWrap) || 0,
  oneSide: parseFloat(req.body.buyNowRateOneSide) || 0,
  bothSides: parseFloat(req.body.buyNowRateBothSides) || 0,
  rearDoors: parseFloat(req.body.buyNowRateRearDoors) || 0,
};
    
    // Handle image uploads (unchanged)
    const imageUrls = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (!result?.secure_url) {
          return res.status(500).json({
            success: false,
            message: "Image upload failed",
          });
        }
        imageUrls.push({
          url: result.secure_url,
          public_id: result.public_id,
          isPrimary: false,
        });
      }
    }

    let availability = [];
    try {
      availability = JSON.parse(req.body.availability || "[]");
     
    } catch (err) {
      console.error("Error parsing availability:", err);
    }

   let rawProhibited = {};
try {
  rawProhibited = JSON.parse(req.body.prohibitedAds || "{}");
} catch (err) {
  console.error("Error parsing prohibitedAds:", err);
}

const prohibitedAds = {
  gambling: Boolean(rawProhibited.gambling),
  alcohol:  Boolean(rawProhibited.alcohol),
  smoking:  Boolean(rawProhibited.smoking),
  otherSpecify: rawProhibited.otherSpecify?.trim() || "",
};

    let locations = [];
    try {
      if (req.body.locations) {
        locations = JSON.parse(req.body.locations);
        if (!Array.isArray(locations)) {
          locations = [locations]; 
        }
       
      }
    } catch (err) {
      console.error("Error parsing locations:", err);
    }

    locations = locations.filter(loc => 
      loc.location && 
      Array.isArray(loc.location.coordinates) && 
      loc.location.coordinates.length === 2 && 
      loc.location.coordinates.every(coord => !isNaN(coord) && coord !== 0)
    );
   

    // Extract all zip codes from req.body.zipCodes
    let zipCodes = [];
    if (req.body.zipCodes) {
      try {
    
        if (typeof req.body.zipCodes === 'string') {
          try {
            zipCodes = JSON.parse(req.body.zipCodes);
            if (!Array.isArray(zipCodes)) {
              zipCodes = req.body.zipCodes.split(',').map(zip => zip.trim()).filter(Boolean);
            }
          } catch {
            zipCodes = req.body.zipCodes.split(',').map(zip => zip.trim()).filter(Boolean);
          }
        } else if (Array.isArray(req.body.zipCodes)) {
          zipCodes = req.body.zipCodes.map(zip => String(zip)).filter(Boolean);
        } else {
          zipCodes = [String(req.body.zipCodes)];
        }
      
      } catch (err) {
        console.error("Error parsing zipCodes:", err);
        return res.status(400).json({
          success: false,
          message: "Invalid zipCodes format",
        });
      }
    }

    // Merge zip codes from locations
    const locationZipCodes = locations.map(loc => loc.zip).filter(Boolean);
  
    zipCodes = [...new Set([...zipCodes, ...locationZipCodes])];


    // Primary location (single GeoJSON Point)
    const primaryLocation = locations.length > 0 ? {
      type: "Point",
      coordinates: locations[0].location.coordinates || [0, 0],
      name: locations[0].name || "",
      zip: locations[0].zip || ""
    } : req.body.latitude && req.body.longitude ? {
      type: "Point",
      coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      name: req.body.locationName || "",
      zip: req.body.zipCode || ""
    } : null;
  

    // Additional locations (for all locations beyond the first)
    const additionalLocations = locations.slice(1).map(loc => ({
      type: "Point",
      coordinates: loc.location.coordinates || [0, 0],
      name: loc.name || "",
      zip: loc.zip || ""
    }));


    // Validate that we have at least one valid location
    if (!primaryLocation || !primaryLocation.coordinates || primaryLocation.coordinates.every(coord => coord === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one valid location with coordinates is required",
      });
    }

    // Parse interRoutes (unchanged)
    let interRoutes = [];
    try {
      if (req.body.interRoutes) {
        interRoutes = JSON.parse(req.body.interRoutes);
        if (!Array.isArray(interRoutes)) {
          interRoutes = [interRoutes];
        }
      } else if (req.body.routeFrom && req.body.routeTo) {
        interRoutes = [{ from: req.body.routeFrom, to: req.body.routeTo }];
      }

    } catch (err) {
      console.error("Error parsing interRoutes:", err);
    }

    // Form data object
    const formData = {
  user: req.body.user,
  company: req.body.company,
  accountNumber: req.body.accountNumber,
  suburb: req.body.suburb,
  townOrCity: req.body.city,
  state: req.body.state,
  country: req.body.country,
  startTime: startDate,
  endTime: endDate,
  location: primaryLocation,
  additionalLocations,
  zipCodesCovered: zipCodes,
  interRoutes,
  minAuctionRates: {
    fullWrap: parseFloat(req.body.auctionRateFullWrap) || 0,
    oneSide: parseFloat(req.body.auctionRateOneSide) || 0,
    bothSides: parseFloat(req.body.auctionRateBothSides) || 0,
    rearDoors: parseFloat(req.body.auctionRateRearDoors) || 0,
  },
  buyNowRates,
  discountOffers: {
    threeMonth: parseFloat(req.body.discount3Month) || 0,
    sixMonth: parseFloat(req.body.discount6Month) || 0,
    twelveMonth: parseFloat(req.body.discount12Month) || 0,
    twentyFourMonth: parseFloat(req.body.discount24Month) || 0,
  },
  vehicleManufacturer: req.body.manufacturer,
  yearofmanufacturer: req.body.yearofmanufacturer,
 vehicleType: req.body.vehicleType ? String(req.body.vehicleType).trim() : "",
  manufactureCountry: req.body.manufactureCountry || "Not Available",
  vehicleModel: req.body.model,
   registrationPlate: req.body.registrationPlate ? 
    String(req.body.registrationPlate).toUpperCase().trim() : "",
     dailyMileage: dailyMileage,
  vehicleAvailability: {
    threeMonths: availability.includes("3 Months") ? "Available" : "Unavailable",
    sixMonths: availability.includes("6 Months") ? "Available" : "Unavailable",
    twelveMonths: availability.includes("12 Months") ? "Available" : "Unavailable",
    twentyFourMonths: availability.includes("24 Months") ? "Available" : "Unavailable",
  },
  prohibitedAds: {
    gambling: prohibitedAds.gambling || false,
    alcohol: prohibitedAds.alcohol || false,
    smoking: prohibitedAds.smoking || false,
    other: prohibitedAds.other || false,
    otherSpecify: prohibitedAds.otherSpecify || "",
  },
  images: imageUrls,
  status,
  createdAt: new Date(),
  updatedAt: new Date(),
};


 if (!formData.registrationPlate || formData.registrationPlate.trim() === '') {
  return res.status(400).json({
    success: false,
    message: "Registration plate is required",
  });
}
const existingVehicle = await mongoose.model("FleetOwner").findOne({
  user: formData.user,
  registrationPlate: formData.registrationPlate,
  status: { $in: ['upcoming', 'active'] }
});

if (existingVehicle) {
  return res.status(400).json({
    success: false,
    message: `Vehicle with registration plate ${formData.registrationPlate} already exists in your fleet auctions.`,
  });
}

    // Save to database
    const form = await mongoose.model("FleetOwner").create(formData);


    res.status(201).json({
      success: true,
      message: "Fleet form created successfully",
      data: form,
    });
  } catch (err) {
    console.error("Error creating fleet form:", err);
    res.status(500).json({
      success: false,
      message: "Form creation failed",
      error: err.message,
    });
  }
};

export const getallfleetauction = async (req, res) => {
  try {
     const page = parseInt(req.query.page) || 1;       
    const limit = parseInt(req.query.limit) || 10;   
    const skip = (page - 1) * limit;
      const total = await FleetOwner.countDocuments();
    const forms = await FleetOwner.find().populate(
      "user",
      "firstName lastName email"
    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({
      success: true,
       currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: forms,
    });
  } catch (err) {
    console.error("Error fetching fleet forms:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch forms",
      error: err.message,
    });
  }
};

export const getfleetauctionbyid = async (req, res) => {
  try {
    // Step 1: Find the Fleet Owner form using the auction ID
    const form = await FleetOwner.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Fleet Owner form not found",
      });
    }

    const bidTypes = ["fullWrap", "oneSide", "bothSides", "rearDoors"];

    const currentBids = {};

    for (const type of bidTypes) {
      const bid = await Bid.findOne({
        auction: req.params.id,         
        auctionType: "fleetauction",     
        bidType: type                    
      })
        .sort({ bidTime: -1 })           
        .populate("bidder", "firstName lastName email") 
        .lean();

      currentBids[type] = bid || null;
    }

    res.json({
      success: true,
      data: {
        ...form.toObject(),   
        currentBids           
      }
    });

  } catch (err) {
    console.error("Error fetching fleet owner form by ID:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch form",
      error: err.message,
    });
  }
};


export const getVehicalAvalibality = async (req, res) => {
  const { fleetOwnerId } = req.params;
  
  try {
    const vehicles = await FleetOwner.find(fleetOwnerId )
      .select('vehicleModel registrationPlate  status accountNumber company vehicleAvailability currentBids');

    if (!vehicles.length) {
      return res.status(404).json({ success: false, message: 'No vehicles found' });
    }

    const totalVehicles = vehicles.length;
    const availableNow = vehicles.filter(v =>
      v.status === 'available' ||
      v.vehicleAvailability?.sixMonths === 'true'
    ).length;

    res.json({
      success: true,
      data: {
        owner: {
          accountNumber: vehicles[0].accountNumber,
          company: vehicles[0].company
        },
        stats: {
          totalVehicles,
          availableNow,
          utilizationRate: `${Math.round((totalVehicles - availableNow) / totalVehicles * 100)}%`
        },
        vehicles: vehicles.map(v => ({
          id: v._id,
          model: v.vehicleModel,
          status: v.status,
          registrationPlate: v.registrationPlate,
          availability: v.vehicleAvailability,
          hasBids: !!v.currentBids
        }))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const approveFleetAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await FleetOwner.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Fleet Auction not found" });
    }

    auction.isApprovedByAdmin = true;
    await auction.save();

    res.status(200).json({ message: "Auction approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export const rejectFleetAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    // Find the auction
    const auction = await FleetOwner.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Fleet Auction not found" });
    }

    // Prevent rejecting an already approved or rejected auction
    if (auction.isApprovedByAdmin) {
      return res.status(400).json({ message: "Cannot reject an approved auction" });
    }
    if (auction.status === "rejected") {
      return res.status(400).json({ message: "Auction is already rejected" });
    }

    // Update status to rejected and set endTime to current time to stop the auction
    auction.status = "rejected";
    auction.endTime = new Date(); // Stop the auction immediately
    await auction.save();

    // Optionally: Clear any active bids or notify bidders (if required)
    // Example: await Bid.deleteMany({ auction: auctionId });

    res.status(200).json({ message: "Auction rejected successfully" });
  } catch (err) {
    console.error("Error rejecting auction:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// In your controller file (e.g., fleetOwner.controller.js)
export const deleteSingleFleetAuctionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find the auction and verify ownership
    const auction = await FleetOwner.findById(id);
    
    if (!auction) {
      return res.status(404).json(
        new ApiResponse(404, null, "Auction not found")
      );
    }

    // 2. Verify the requesting user owns this auction
    if (auction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json(
        new ApiResponse(403, null, "You can only delete your own auctions")
      );
    }

    // 3. Perform deletion
    await FleetOwner.findByIdAndDelete(id);
    
    return res.status(200).json(
      new ApiResponse(200, null, "Auction deleted successfully")
    );

  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, null, error?.message || "Internal server error")
    );
  }
});


export const getTopFleetAuctions = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || "bids";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Fetch all active + unsold fleet auctions
    const allAuctions = await FleetOwner.find({
      status: "active",
      purchaseStatus: "unsold",
    }).lean();

    const scored = await Promise.all(
      allAuctions.map(async (a) => {
        const bidsCount = a.bids?.length || 0;
        const wrapTypes = ["fullWrap", "oneSide", "bothSides", "rearDoors"];

        const highestBids = {};
        const buyNowRates = {};

        // ✅ Get highest bid & buy now rate for each wrap type
        for (const type of wrapTypes) {
          // Highest bid for each wrap type
          const topBid = await Bid.findOne({
            auction: a._id,
            auctionType: "fleetauction",
            bidType: type,
          })
            .sort({ bidAmount: -1 })
            .select("bidAmount bidder bidType")
            .lean();

          highestBids[type] = topBid?.bidAmount || 0;
          buyNowRates[type] = a.buyNowRates?.[type] || 0;
        }

        // Compute metrics
        const overallHighestBid = Math.max(...Object.values(highestBids));
        const zipCoverageCount = a.zipCodesCovered?.length || 0;
        const routeCoverageCount = a.interRoutes?.length || 0;
        const duration =
          (new Date(a.endTime) - new Date(a.startTime)) /
          (1000 * 60 * 60 * 24);

        return {
          ...a,
          highestBids,
          buyNowRates,
          overallHighestBid,
          __score: {
            bids: bidsCount,
            highestBid: overallHighestBid,
            coverage: zipCoverageCount + routeCoverageCount,
            buyNowPrice: buyNowRates.fullWrap || 0,
            duration,
          },
        };
      })
    );

    // Filter only auctions with bids
    const activeBiddedAuctions = scored.filter(
      (a) => a.__score.bids > 0 || a.__score.highestBid > 0
    );

    if (activeBiddedAuctions.length === 0) {
      return res.status(200).json({
        currentPage: 1,
        totalPages: 1,
        totalTopAuctions: 0,
        topAuctions: [],
        message: "No active auctions with bids found.",
      });
    }

    // Sorting logic
    const sorters = {
      bids: (a, b) => b.__score.bids - a.__score.bids,
      highestBid: (a, b) => b.__score.highestBid - a.__score.highestBid,
      coverage: (a, b) => b.__score.coverage - a.__score.coverage,
      buyNowPrice: (a, b) => b.__score.buyNowPrice - a.__score.buyNowPrice,
      duration: (a, b) => b.__score.duration - a.__score.duration,
    };
    const sorted = activeBiddedAuctions.sort(sorters[sortBy]);

    // Pagination
    const totalTopAuctions = sorted.length;
    const totalPages = Math.ceil(totalTopAuctions / limit);
    const paginated = sorted.slice((page - 1) * limit, page * limit);

    // ✅ Include buyNowRates in final output
    res.status(200).json({
      currentPage: page,
      totalPages,
      totalTopAuctions,
      topAuctions: paginated.map((a) => ({
        _id: a._id,
        company: a.company,
         vehicleModel: a.vehicleModel,
         registrationPlate: a.registrationPlate,
        bidsCount: a.__score.bids,
        highestBids: a.highestBids,
        buyNowRates: a.buyNowRates,
        overallHighestBid: a.overallHighestBid,
        coverage: a.__score.coverage,
        buyNowPrice: a.__score.buyNowPrice,
        duration: a.__score.duration,
        zipCodesCovered: a.zipCodesCovered || [],
        interRoutes: a.interRoutes || [],
        location: a.location || {},
        additionalLocations: a.additionalLocations || [],
      })),
    });
  } catch (err) {
    console.error("Error fetching top fleet auctions:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


const industryBenchmarks = {
  "Real Estate": { average: 8.5, saving: 92 },
  "Legal": { average: 10.5, saving: 92 },
  "Finance/Insurance": { average: 8.5, saving: 90 },
  "B2B": { average: 6.5, saving: 86 },
  "Education": { average: 4.5, saving: 84 },
  "Technology": { average: 5.5, saving: 84 },
  "Healthcare": { average: 4.5, saving: 81 },
  "Travel": { average: 2.75, saving: 69 },
  "Retail/ECommerce": { average: 1.25, saving: 38 }
};

export const getFleetCPMComparison = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid fleet ID format." });
    }
    const fleet = await FleetOwner.findById(id, "vehicleWrapCpms");

    if (!fleet) {
      return res.status(404).json({ error: "Fleet not found." });
    }

    const { vehicleWrapCpms } = fleet;

    // Default to oneSide CPM
    const actualCPM = vehicleWrapCpms?.oneSide || 0;

    // Compare with each industry
    const comparison = Object.entries(industryBenchmarks).map(([industry, data]) => {
      const savingPercentage = ((data.average - actualCPM) / data.average) * 100;
      return {
        industry,
        averageCPM: data.average,
        actualCPM: actualCPM,
        saving: Math.round(savingPercentage),
      };
    });

    res.json({
     
      actualCPM,
      comparison,
    });

  } catch (err) {
    console.error("Fetch CPM error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};





export const getAuctionsByFleetOwner = async (req, res) => {
  try {
    const { fleetOwnerId } = req.params;

    if (!fleetOwnerId) {
      return res.status(400).json({
        success: false,
        message: "fleetOwnerId is required",
      });
    }

    // Fetch all auctions by this fleet owner
    const auctions = await FleetOwner.find({ user: fleetOwnerId })
      .populate({
        path: "user",
        select: "firstName lastName email company telephoneNumber",
      })
      .populate({
        path: "bids", 
        populate: {
          path: "bidder", 
          select: "firstName lastName email profileImage telephoneNumber ",
        },
      })
      .populate({
    path: "winners.fullWrap.bidder",
    select: "firstName lastName email telephoneNumber profileImage "
  })
  .populate({
    path: "winners.oneSide.bidder",
    select: "firstName lastName email telephoneNumber profileImage"
  })
  .populate({
    path: "winners.bothSides.bidder",
    select: "firstName lastName email telephoneNumber profileImage"
  })
  .populate({
    path: "winners.rearDoors.bidder",
    select: "firstName lastName email telephoneNumber profileImage"
  })
  .select(
    "company registrationPlate vehicleManufacturer vehicleModel yearofmanufacturer location auctionType startTime endTime basePrice images status createdAt updatedAt bids currentBids isApprovedByAdmin winners"  // ← YEH ADD KIYA
  );

    if (!auctions || auctions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No auctions found ",
      });
    }

    // Format auctions for response
    const formattedAuctions = auctions.map((auction) => ({
      _id: auction._id,
      company: auction.company,
      vehicleManufacturer: auction.vehicleManufacturer,
      vehicleModel: auction.vehicleModel,
      registrationPlate: auction.registrationPlate,
      yearofmanufacturer: auction.yearofmanufacturer,
      location: auction.location,
      auctionType: auction.auctionType,
      startTime: auction.startTime,
      endTime: auction.endTime,
      basePrice: auction.basePrice,
      status: auction.status,
      images: auction.images || [],
      createdAt: auction.createdAt,
      updatedAt: auction.updatedAt,
      isApprovedByAdmin: auction.isApprovedByAdmin,
      user: auction.user,
      bids: auction.bids || [],
      currentBids: auction.currentBids || {},
       winners: auction.winners || {}, 
    }));

    return res.status(200).json({
      success: true,
      data: formattedAuctions,
      message: "Fleet Owner auctions retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching auctions by fleet owner:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const searchFleetAuction = async (req, res) => {
  try {
    const {
      campaignArea,
      vehicleType, 
      availability,
      postCodes = [], 
    } = req.body;

    const filter = {
      status: "active",
      isApprovedByAdmin: true,
    };

    if (campaignArea?.trim()) {
      const regex = new RegExp(campaignArea.trim(), "i");
      filter.$or = [
        { townOrCity: regex },
        { suburb: regex },
        { state: regex },
        { country: regex },
        { company: regex },
      ];
    }

    if (vehicleType) {
      if (Array.isArray(vehicleType) && vehicleType.length > 0) {
  
        const cleanedTypes = vehicleType
          .filter(type => typeof type === 'string' && type.trim())
          .map(type => type.trim());
        
        if (cleanedTypes.length > 0) {
          filter.vehicleType = { $in: cleanedTypes.map(type => new RegExp(`^${type}$`, "i")) };
        }
      } else if (typeof vehicleType === "string" && vehicleType.trim()) {
    
        filter.vehicleType = { $regex: `^${vehicleType.trim()}$`, $options: "i" };
      }
    }

    if (postCodes.length > 0) {
      const codes = postCodes
        .filter(code => code && code.toString().trim())
        .map(code => code.toString().trim());
      
      if (codes.length > 0) {
        filter.zipCodesCovered = { $in: codes };
      }
    }

    if (availability) {
      const fieldMap = {
        threeMonths: "threeMonths",
        sixMonths: "sixMonths",
        twelveMonths: "twelveMonths",
        twentyFourMonths: "twentyFourMonths",
      };
      const field = fieldMap[availability];
      if (field) {
        filter[`vehicleAvailability.${field}`] = { $in: ["Available", "Yes", true, "true"] };
      }
    }


    const campaigns = await FleetOwner.find(filter)
      .populate("user", "firstName lastName profilePicture")
      .populate("seller", "firstName lastName profilePicture")
      .populate([
        { path: "winners.fullWrap.bidder", select: "firstName lastName" },
        { path: "winners.oneSide.bidder", select: "firstName lastName" },
        { path: "winners.bothSides.bidder", select: "firstName lastName" },
        { path: "winners.rearDoors.bidder", select: "firstName lastName" }
      ])
      .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateFleetAuction = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid auction ID",
      });
    }

    // Find existing auction
    const auction = await FleetOwner.findById(id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    // Only owner can edit
    if (auction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own auctions",
      });
    }

    // Only upcoming or rejected auctions can be edited
    if (!["upcoming", "rejected"].includes(auction.status)) {
      return res.status(400).json({
        success: false,
        message: "Only upcoming or rejected auctions can be edited",
      });
    }
 const dailyMileage = req.body.dailyMileage ? parseFloat(req.body.dailyMileage) : auction.dailyMileage;
    if (isNaN(dailyMileage) || dailyMileage < 0) {
      return res.status(400).json({
        success: false,
        message: "Daily Mileage must be a valid non-negative number",
      });
    }
    // Parse dates
    const startTime = req.body.startTime ? new Date(req.body.startTime) : auction.startTime;
    const endTime = req.body.endTime ? new Date(req.body.endTime) : auction.endTime;

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for startTime or endTime",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time",
      });
    }

    // Recalculate status
    const currentDate = new Date();
    let status = "upcoming";
    if (startTime < currentDate) status = "active";
    if (endTime < currentDate) status = "over";

    // Buy Now Rates
    const buyNowRates = {
      fullWrap: parseFloat(req.body.buyNowRateFullWrap) || auction.buyNowRates.fullWrap,
      oneSide: parseFloat(req.body.buyNowRateOneSide) || auction.buyNowRates.oneSide,
      bothSides: parseFloat(req.body.buyNowRateBothSides) || auction.buyNowRates.bothSides,
      rearDoors: parseFloat(req.body.buyNowRateRearDoors) || auction.buyNowRates.rearDoors,
    };

    // Handle new image uploads
    let images = auction.images;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (result?.secure_url) {
          newImages.push({
            url: result.secure_url,
            public_id: result.public_id,
            isPrimary: false,
          });
        }
      }
      images = [...images, ...newImages];
    }

let availability = [];
try {
  if (req.body.availability) {
    const parsed = JSON.parse(req.body.availability);
    if (Array.isArray(parsed)) {
      availability = parsed;
    } else if (typeof parsed === 'string') {
      // Agar string aayi hai, to use array mein daal do
      availability = [parsed];
    }
  }
} catch (err) {
  console.error("Error parsing availability:", err);
  availability = [];
}

const vehicleAvailability = {
  threeMonths: "Unavailable",
  sixMonths: "Unavailable",
  twelveMonths: "Unavailable",
  twentyFourMonths: "Unavailable"
};
if (availability.includes("3 Months")) vehicleAvailability.threeMonths = "Available";
if (availability.includes("6 Months")) vehicleAvailability.sixMonths = "Available";
if (availability.includes("12 Months")) vehicleAvailability.twelveMonths = "Available";
if (availability.includes("24 Months")) vehicleAvailability.twentyFourMonths = "Available";
    let rawProhibited = {};
    try {
      rawProhibited = req.body.prohibitedAds ? JSON.parse(req.body.prohibitedAds) : {};
    } catch (err) {
      console.error("Error parsing prohibitedAds:", err);
    }

    const prohibitedAds = {
      gambling: Boolean(rawProhibited.gambling),
      alcohol: Boolean(rawProhibited.alcohol),
      smoking: Boolean(rawProhibited.smoking),
      otherSpecify: rawProhibited.otherSpecify?.trim() || "",
    };

    // Locations parsing
    let locations = [];
    try {
      if (req.body.locations) {
        locations = JSON.parse(req.body.locations);
        if (!Array.isArray(locations)) locations = [locations];
      }
    } catch (err) {
      console.error("Error parsing locations:", err);
    }

    locations = locations.filter(loc =>
      loc.location &&
      Array.isArray(loc.location.coordinates) &&
      loc.location.coordinates.length === 2 &&
      loc.location.coordinates.every(coord => !isNaN(coord) && coord !== 0)
    );

    // Zip codes
    let zipCodes = auction.zipCodesCovered || [];
    if (req.body.zipCodes) {
      try {
        let parsedZipCodes = [];
        if (typeof req.body.zipCodes === 'string') {
          try {
            parsedZipCodes = JSON.parse(req.body.zipCodes);
            if (!Array.isArray(parsedZipCodes)) {
              parsedZipCodes = req.body.zipCodes.split(',').map(z => z.trim()).filter(Boolean);
            }
          } catch {
            parsedZipCodes = req.body.zipCodes.split(',').map(z => z.trim()).filter(Boolean);
          }
        } else if (Array.isArray(req.body.zipCodes)) {
          parsedZipCodes = req.body.zipCodes.map(z => String(z)).filter(Boolean);
        }
        zipCodes = [...new Set([...zipCodes, ...parsedZipCodes])];
      } catch (err) {
        console.error("Error parsing zipCodes:", err);
      }
    }

    // Add zip codes from locations
    const locationZipCodes = locations.map(loc => loc.zip).filter(Boolean);
    zipCodes = [...new Set([...zipCodes, ...locationZipCodes])];

    // Primary location
    const primaryLocation = locations.length > 0 ? {
      type: "Point",
      coordinates: locations[0].location.coordinates || auction.location.coordinates,
      name: locations[0].name || auction.location.name || "",
      zip: locations[0].zip || auction.location.zip || ""
    } : auction.location;

    const additionalLocations = locations.slice(1).map(loc => ({
      type: "Point",
      coordinates: loc.location.coordinates || [0, 0],
      name: loc.name || "",
      zip: loc.zip || ""
    }));

    // Inter routes
    let interRoutes = auction.interRoutes || [];
    try {
      if (req.body.interRoutes) {
        interRoutes = JSON.parse(req.body.interRoutes);
        if (!Array.isArray(interRoutes)) interRoutes = [interRoutes];
      }
    } catch (err) {
      console.error("Error parsing interRoutes:", err);
    }

    // Final update data
    const updateData = {
      company: req.body.company || auction.company,
      accountNumber: req.body.accountNumber || auction.accountNumber,
      suburb: req.body.suburb || auction.suburb,
      townOrCity: req.body.city || auction.townOrCity,
      state: req.body.state || auction.state,
      country: req.body.country || auction.country,
      startTime,
      endTime,
      location: primaryLocation,
      additionalLocations,
      zipCodesCovered: zipCodes,
      interRoutes,
      minAuctionRates: {
        fullWrap: parseFloat(req.body.auctionRateFullWrap) || auction.minAuctionRates.fullWrap,
        oneSide: parseFloat(req.body.auctionRateOneSide) || auction.minAuctionRates.oneSide,
        bothSides: parseFloat(req.body.auctionRateBothSides) || auction.minAuctionRates.bothSides,
        rearDoors: parseFloat(req.body.auctionRateRearDoors) || auction.minAuctionRates.rearDoors,
      },
      buyNowRates,
      discountOffers: {
        threeMonth: parseFloat(req.body.discount3Month) || auction.discountOffers.threeMonth,
        sixMonth: parseFloat(req.body.discount6Month) || auction.discountOffers.sixMonth,
        twelveMonth: parseFloat(req.body.discount12Month) || auction.discountOffers.twelveMonth,
        twentyFourMonth: parseFloat(req.body.discount24Month) || auction.discountOffers.twentyFourMonth,
      },
      vehicleManufacturer: req.body.manufacturer || auction.vehicleManufacturer,
      yearofmanufacturer: req.body.yearofmanufacturer || auction.yearofmanufacturer,
      vehicleType: req.body.vehicleType ? String(req.body.vehicleType).trim() : auction.vehicleType,
      manufactureCountry: req.body.manufactureCountry || auction.manufactureCountry,
      vehicleModel: req.body.model || auction.vehicleModel,
      registrationPlate: req.body.registrationPlate ? 
    String(req.body.registrationPlate).toUpperCase().trim() : auction.registrationPlate,
    dailyMileage: dailyMileage,
      vehicleAvailability,
      prohibitedAds: {
        gambling: prohibitedAds.gambling,
        alcohol: prohibitedAds.alcohol,
        smoking: prohibitedAds.smoking,
        otherSpecify: prohibitedAds.otherSpecify,
      },
      images,
      status,
      updatedAt: new Date(),
    };
if (updateData.registrationPlate !== auction.registrationPlate) {
  const duplicatePlate = await mongoose.model("FleetOwner").findOne({
    user: auction.user,
    registrationPlate: updateData.registrationPlate,
    _id: { $ne: auction._id },
    status: { $in: ['upcoming', 'active'] }
  });
  
  if (duplicatePlate) {
    return res.status(400).json({
      success: false,
      message: `Vehicle with registration plate ${updateData.registrationPlate} already exists in your active fleet`,
    });
  }
}

    // Update auction
    const updatedAuction = await FleetOwner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Fleet auction updated successfully",
      data: updatedAuction,
    });
  } catch (err) {
    console.error("Error updating fleet auction:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: err.message,
    });
  }
};