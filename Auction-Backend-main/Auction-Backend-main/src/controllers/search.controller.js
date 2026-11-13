import Campaign from "../models/campaign.model.js";
import Auction from "../models/auction.model.js";
import FleetOwner from "../models/fleetowner.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * COMMON / UNIFIED SEARCH ROUTE
 * -------------------------------------------------
 * searchType decides WHAT to search (campaign | auction)
 * userType decides WHICH auction source to use (fleet vs general)
 */

const buildLocationFilter = ({ country, state, postCodes }) => {
  const locationFilter = {};

  if (country && country.toString().trim()) {
    locationFilter["$or"] = [
      { "location.country": { $regex: `^${country.toString().trim()}$`, $options: "i" } },
      { "country": { $regex: `^${country.toString().trim()}$`, $options: "i" } },
    ];
  }

  if (state && state.toString().trim()) {
    const stateFilter = { $regex: state.toString().trim(), $options: "i" };
    const clause = [{ "location.state": stateFilter }, { "state": stateFilter }];
    locationFilter["$or"] = locationFilter["$or"] ? [...locationFilter["$or"], ...clause] : clause;
  }

  if (Array.isArray(postCodes) && postCodes.length > 0) {
    const codes = postCodes.filter((c) => c && c.toString().trim()).map((c) => c.toString().trim());
    if (codes.length > 0) {
      const clause = [
        { "location.zip": { $in: codes } },
        { "zip": { $in: codes } },
        { "postCode": { $in: codes } },
        { "postCodes": { $in: codes } },
        { "zipCodesCovered": { $in: codes } },
        { "location.zipCodes": { $in: codes } },
      ];
      locationFilter["$or"] = locationFilter["$or"] ? [...locationFilter["$or"], ...clause] : clause;
    }
  }

  return locationFilter["$or"]?.length ? locationFilter : {};
};

const buildVehicleTypeFilter = (vehicleType, fieldNames = ["vehicleType"]) => {
  if (!Array.isArray(vehicleType) || vehicleType.length === 0) return null;

  const cleaned = vehicleType
    .filter((t) => typeof t === "string" && t.trim())
    .map((t) => t.trim().replace(/,$/, ""));

  if (cleaned.length === 0) return null;

  const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

  return {
    "$or": fields.map((field) => ({
      [field]: { $in: cleaned.map((t) => new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")) },
    })),
  };
};

// ---------------- Campaign search ----------------
const runCampaignSearch = async ({ country, state, postCodes, vehicleType }) => {
  const filter = { status: "active" };

  const locationFilter = buildLocationFilter({ country, state, postCodes });
  Object.assign(filter, locationFilter);

  const vehicleFilter = buildVehicleTypeFilter(vehicleType, ["targetVehicleTypes"]);
  if (vehicleFilter) {
    filter["$and"] = filter["$and"] ? [...filter["$and"], vehicleFilter] : [vehicleFilter];
  }

  return Campaign.find(filter)
    .populate("createdBy", "firstName lastName email companyName")
    .sort({ createdAt: -1 });
};

// ---------------- Fleet auction search ----------------
const runFleetAuctionSearch = async ({ country, state, postCodes, vehicleType }) => {
  const filter = {
    status: { $ne: "over" },
    isApprovedByAdmin: true,
    ...buildLocationFilter({ country, state, postCodes }),
  };

  const vehicleFilter = buildVehicleTypeFilter(vehicleType, ["vehicleModel", "vehicleType"]);
  if (vehicleFilter) {
    filter["$and"] = filter["$and"] ? [...filter["$and"], vehicleFilter] : [vehicleFilter];
  }

  return FleetOwner.find(filter)
    .populate("user", "firstName email phone location profilePicture")
    .populate({
      path: "winners.fullWrap.bidder winners.oneSide.bidder winners.bothSides.bidder winners.rearDoors.bidder",
      select: "firstName profilePicture",
    })
    .sort({ createdAt: -1 });
};

// ---------------- General auction search ----------------
const runGeneralAuctionSearch = async ({ itemName, country, state, postCodes, vehicleType }) => {
  const filter = { status: { $ne: "over" } };

  if (itemName && itemName.toString().trim()) {
    filter.name = { $regex: itemName.toString().trim(), $options: "i" };
  }

  const locationFilter = buildLocationFilter({ country, state, postCodes });
  Object.assign(filter, locationFilter);

  const vehicleFilter = buildVehicleTypeFilter(vehicleType, ["vehicleType", "vehicle.model", "vehicle.manufacturer"]);
  if (vehicleFilter) {
    filter["$and"] = filter["$and"] ? [...filter["$and"], vehicleFilter] : [vehicleFilter];
  }

  return Auction.find(filter)
    .populate("seller", "firstName email phone location profilePicture")
    .sort({ createdAt: -1 });
};

export const searchMarketplace = asyncHandler(async (req, res) => {
  const {
    userType = "regular",
    searchType,
    itemName = "",
    country = "",
    state = "",
    postCodes = [],
    vehicleType = [],
  } = req.body;

  // ---- Validation ----
  const hasAnyFilter =
    itemName?.trim() ||
    country?.trim() ||
    state?.trim() ||
    (Array.isArray(postCodes) && postCodes.length > 0) ||
    (Array.isArray(vehicleType) && vehicleType.length > 0);

  if (!hasAnyFilter) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Please provide at least one search criteria (location, post code, vehicle type, or item name)"));
  }

  const validSearchTypes = ["campaign", "auction"];
  const validUserTypes = ["fleetOwner", "advertiser", "regular"];

  if (searchType && !validSearchTypes.includes(searchType)) {
    return res.status(400).json(new ApiResponse(400, null, `Invalid searchType "${searchType}". Must be "campaign" or "auction".`));
  }

  if (userType && !validUserTypes.includes(userType)) {
    return res.status(400).json(new ApiResponse(400, null, `Invalid userType "${userType}".`));
  }

  // searchType decides WHAT gets searched; userType only decides the auction source
  const effectiveSearchType = searchType || (userType === "fleetOwner" ? "campaign" : "auction");

  let results = [];
  let resultType = "";

  try {
    if (effectiveSearchType === "campaign") {
      results = await runCampaignSearch({ country, state, postCodes, vehicleType });
      resultType = "campaigns";
    } else if (userType === "advertiser") {
      results = await runFleetAuctionSearch({ country, state, postCodes, vehicleType });
      resultType = "fleetAuctions";
    } else {
      results = await runGeneralAuctionSearch({ itemName, country, state, postCodes, vehicleType });
      resultType = "auctions";
    }
  } catch (error) {
    console.error(`❌ [searchMarketplace] "${resultType || effectiveSearchType}" query failed:`, error);

    // Surface Mongoose-specific errors clearly instead of a generic 500 text
    if (error.name === "CastError") {
      return res.status(400).json(new ApiResponse(400, null, `Invalid value for field "${error.path}": ${error.value}`));
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json(new ApiResponse(400, null, messages.join(", ")));
    }

    return res
      .status(500)
      .json(new ApiResponse(500, null, error?.message || "Something went wrong while searching. Please try again."));
  }

  return res.status(200).json(
    new ApiResponse(200, "Search completed successfully", {
      resultType,
      count: results.length,
      results,
    })
  );
});