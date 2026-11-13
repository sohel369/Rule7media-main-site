import Vehicle from "../models/vehicle.model.js";
import fs from "fs";
import Papa from "papaparse";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const addVehicle = async (req, res) => {
  try {
    // Get user info from request body (no middleware)
    const { userId, userType } = req.body;
    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: "User ID and user type are required",
      });
    }

    // Extract vehicle info
    const {
      //country,
      vehicle,
      model,
      yearOfManufacture,
      manufacturer,
      dimensions,
      
    } = req.body;

    if ( !vehicle || !model || !yearOfManufacture || !manufacturer) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // Parse dimensions safely
    let parsedDimensions = {};
    if (dimensions) {
      if (typeof dimensions === "string") {
        try {
          parsedDimensions = JSON.parse(dimensions);
        } catch (err) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid dimensions format" });
        }
      } else if (typeof dimensions === "object") {
        parsedDimensions = dimensions;
      }
    }

    const dimensionsObj = {
      length: parsedDimensions.length ? Number(parsedDimensions.length) : 0,
      width: parsedDimensions.width ? Number(parsedDimensions.width) : 0,
      height: parsedDimensions.height ? Number(parsedDimensions.height) : 0,
      wheelbase: parsedDimensions.wheelbase
        ? Number(parsedDimensions.wheelbase)
        : 0,
      curbWeight: parsedDimensions.curbWeight
        ? Number(parsedDimensions.curbWeight)
        : 0,
     engineSize: parsedDimensions.engineSize
        ? String(parsedDimensions.engineSize).trim() // String rakho aur trim karo
        : "",
      cabwidth: parsedDimensions.cabwidth
        ? Number(parsedDimensions.cabwidth)
        : 0,
      cabheight: parsedDimensions.cabheight
        ? Number(parsedDimensions.cabheight)
        : 0,
      bonnetwidth: parsedDimensions.bonnetwidth
        ? Number(parsedDimensions.bonnetwidth)
        : 0,
      bonnetLength: parsedDimensions.bonnetLength
        ? Number(parsedDimensions.bonnetLength)
        : 0,
    };

   for (const key in dimensionsObj) {
  if (key === "engineSize") {
    // engineSize is a string - just check it's not empty
    if (!dimensionsObj[key] || dimensionsObj[key].trim() === "") {
      return res.status(400).json({
        success: false,
        message: `Engine Size is required`,
      });
    }
  } else if (key === "curbWeight") {
    // curbWeight validation
    const weight = Number(dimensionsObj[key]);
    if (isNaN(weight) || weight < 500) {
      return res.status(400).json({
        success: false,
        message: `Invalid value for dimensions.${key} - should be 500kg or more`,
      });
    }
  } else {
    // All other numeric fields
    if (isNaN(dimensionsObj[key]) || Number(dimensionsObj[key]) < 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid value for dimensions.${key}`,
      });
    }
  }
}

    // Check images
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const imgUrlCloudinary = await uploadOnCloudinary(file.path);
      if (!imgUrlCloudinary?.url) {
        return res
          .status(500)
          .json({ success: false, message: "Error uploading images" });
      }
      imageUrls.push(imgUrlCloudinary.url);
    }

    // Auto-approve if user is admin
    const isApproved = userType === "admin";

    // Create vehicle
    const newVehicle = new Vehicle({
      //country,
      vehicle,
      model,
      yearOfManufacture: Number(yearOfManufacture),
      manufacturer,
      dimensions: dimensionsObj,
      images: imageUrls,
      isApproved,
      addedBy: userId,
    });

    const savedVehicle = await newVehicle.save();

    res.status(201).json({ success: true, data: savedVehicle });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error." });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});

    // Mark vehicles that already exist as external
    const vehiclesWithExternalFlag = vehicles.map((v) => ({
      ...v.toObject(),
      isExternal: true, // Mark all fetched vehicles as external
    }));

    res.status(200).json({ success: true, data: vehiclesWithExternalFlag });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error." });
  }
};

export const getVehicalDetails = async (req, res) => {
  try {
    const { vehicle } = req.params;
    const vehicles = await Vehicle.find({ vehicle: vehicle });

    if (!vehicles || vehicles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No vehicle records found" });
    }

    // Return all matches
    const formatted = vehicles.map((v) => ({
      manufacturer: v.manufacturer,
      yearOfManufacture: v.yearOfManufacture,
      country: v.country,
      model: v.model,
      cabwidth: v.cabwidth,
      cabheight: v.cabheight,
      bonnetwidth: v.bonnetwidth,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("Error fetching vehicle details by name:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadVehicleCSV = async (req, res) => {
  try {
    const savedVehicles = [];
    const { vehicles: vehiclesObj } = req.body;
    
    if (!vehiclesObj) {
      return res.status(400).json({ message: "vehicles object missing in request body" });
    }

    const { vehicles, userId, userType } = vehiclesObj;
   
    if (!Array.isArray(vehicles)) {
      return res.status(400).json({ message: "vehicles must be an array" });
    }
    
    const isAdmin = userType === "admin";
    const isApproved = isAdmin;

    for (const [index, v] of vehicles.entries()) {
      // Basic validation
      if (!v.model || !v.model.trim()) {
        console.warn(`Skipping vehicle at index ${index}: missing model`);
        continue;
      }

      // Create dimensions object - engineSize ko as string rakhna hai
      const dimensionsObj = {
        length: Number(v["dimensions[length]"] || 0),
        width: Number(v["dimensions[width]"] || 0),
        height: Number(v["dimensions[height]"] || 0),
        wheelbase: Number(v["dimensions[wheelbase]"] || 0),
        curbWeight: v["dimensions[curbWeight]"] || "",
        engineSize: String(v["dimensions[engineSize]"] || "").trim(),
        cabwidth: Number(v["dimensions[cabwidth]"] || 0),
        cabheight: Number(v["dimensions[cabheight]"] || 0),
        bonnetwidth: Number(v["dimensions[bonnetwidth]"] || 0),
        bonnetLength: Number(v["dimensions[bonnetLength]"] || 0),
      };
 if (!dimensionsObj.engineSize || dimensionsObj.engineSize === "") {
        console.warn(`Skipping vehicle at index ${index}: engine size is required`);
        continue;
      }
      const vehicleData = {
        addedBy: userId,
        //country: v.country || "Unknown",
        vehicle: v.vehicle || "Unknown",
        yearOfManufacture: Number(v.yearOfManufacture) || new Date().getFullYear(),
        manufacturer: v.manufacturer || "Unknown",
        model: v.model.trim(),
        dimensions: dimensionsObj,
        images: Array.isArray(v.images) ? v.images.filter(img => img && img.trim() !== "") : [],
        isApproved,
      };
      savedVehicles.push(vehicleData);
    }

    if (savedVehicles.length === 0) {
      return res.status(400).json({ message: "No valid vehicles to insert" });
    }

    const inserted = await Vehicle.insertMany(savedVehicles);

    res.status(200).json({
      message: "CSV data uploaded successfully",
      inserted: inserted.length,
      skipped: vehicles.length - inserted.length,
      data: inserted,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    const updates = { ...req.body };

    // Construct dimensions object if provided in form data
    if (req.body["dimensions[length]"]) {
      updates.dimensions = {
        length:
          Number(req.body["dimensions[length]"]) || vehicle.dimensions.length,
        width:
          Number(req.body["dimensions[width]"]) || vehicle.dimensions.width,
        height:
          Number(req.body["dimensions[height]"]) || vehicle.dimensions.height,
        wheelbase:
          Number(req.body["dimensions[wheelbase]"]) ||
          vehicle.dimensions.wheelbase,
        curbWeight:
          Number(req.body["dimensions[curbWeight]"]) ||
          vehicle.dimensions.curbWeight,
        engineSize:
          String(req.body["dimensions[engineSize]"] || vehicle.dimensions.engineSize).trim(), 
        cabwidth:
          Number(req.body["dimensions[cabwidth]"]) ||
          vehicle.dimensions.cabwidth,
        cabheight:
          Number(req.body["dimensions[cabheight]"]) ||
          vehicle.dimensions.cabheight,
        bonnetwidth:
          Number(req.body["dimensions[bonnetwidth]"]) ||
          vehicle.dimensions.bonnetwidth,
        bonnetLength:
          Number(req.body["dimensions[bonnetLength]"]) ||
          vehicle.dimensions.bonnetLength,
      };

      // Validate dimensions numbers
    for (const key in updates.dimensions) {
        if (key !== "engineSize" && isNaN(updates.dimensions[key])) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for dimensions.${key}`,
          });
        }
      }
    }
    // If new images uploaded, upload them to Cloudinary and update images array
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const imgUrlCloudinary = await uploadOnCloudinary(file.path);
        if (!imgUrlCloudinary?.url) {
          return res
            .status(500)
            .json({ success: false, message: "Error uploading images" });
        }
        imageUrls.push(imgUrlCloudinary.url);
      }
      updates.images = imageUrls;
    } else {
      updates.images = vehicle.images; // retain old images if no new images provided
    }

    // Validate images presence
    if (!updates.images || updates.images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required." });
    }

    // Convert yearOfManufacture to Number if present
    if (req.body.yearOfManufacture) {
      updates.yearOfManufacture = Number(req.body.yearOfManufacture);
    }

    // Update other fields explicitly if needed
    ["country", "vehicle", "model", "manufacturer"].forEach((field) => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    // Perform update
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedVehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error." });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveVehicle = async (req, res) => {
  try {
    const { vehicleId } =  req.params;
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { isApproved: true },
      { new: true }
    );
    if (!updatedVehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    res.status(200).json({ success: true, data: updatedVehicle });
  } catch (error) {
    console.error("Error approving vehicle:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error." });
  }
};

//////////fleetOwenr Controllers

export const createVehicleByFleetOwner = async (req, res) => {
  try {
    const fleetOwnerId = req.params.fleetOwnerId;

    if (!fleetOwnerId) {
      return res
        .status(400)
        .json({ success: false, message: "Owner ID is required" });
    }

    // Extract fields from req.body
    const {
    
      vehicle,
      model,
      yearOfManufacture,
      manufacturer,
      dimensions,
      registrationPlate,
     dailyMileage,
      images 
    } = req.body;

    // Validate required fields
    if ( !vehicle || !model || !yearOfManufacture || !manufacturer|| !registrationPlate || !dailyMileage) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields (vehicle, model, yearOfManufacture, manufacturer, registrationPlate, dailyMileage) must be provided",
      });
    }

     if (isNaN(dailyMileage) || Number(dailyMileage) < 0) {
      return res.status(400).json({
        success: false,
        message: "Daily Mileage must be a valid non-negative number",
      });
    }
const cleanRegistrationPlate = registrationPlate.trim().toUpperCase();
    
    // Check if registration plate already exists in database (case-insensitive)
    const existingVehicle = await Vehicle.findOne({
      registrationPlate: { $regex: new RegExp(`^${cleanRegistrationPlate}$`, 'i') },
      addedBy: fleetOwnerId // Same fleet owner ke liye check karein
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with registration plate "${cleanRegistrationPlate}" already exists in your fleet.`,
        duplicatePlate: cleanRegistrationPlate
      });
    }

    // Parse dimensions (handle both object and JSON string)
    let parsedDimensions;
    if (typeof dimensions === "string") {
      try {
        parsedDimensions = JSON.parse(dimensions);
      } catch (error) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid dimensions format" });
      }
    } else if (typeof dimensions === "object" && dimensions !== null) {
      parsedDimensions = dimensions;
    } else {
      parsedDimensions = {};
    }

    // Construct dimensions object
    const dimensionsObj = {
      length: parsedDimensions.length
        ? Number(parsedDimensions.length)
        : undefined,
      width: parsedDimensions.width
        ? Number(parsedDimensions.width)
        : undefined,
      height: parsedDimensions.height
        ? Number(parsedDimensions.height)
        : undefined,
      wheelbase: parsedDimensions.wheelbase
        ? Number(parsedDimensions.wheelbase)
        : undefined,
      curbWeight: parsedDimensions.curbWeight
        ? Number(parsedDimensions.curbWeight)
        : undefined,
      engineSize: parsedDimensions.engineSize
        ? String(parsedDimensions.engineSize).trim()
        : undefined,
      cabwidth: parsedDimensions.cabwidth
        ? Number(parsedDimensions.cabwidth)
        : undefined,
      cabheight: parsedDimensions.cabheight
        ? Number(parsedDimensions.cabheight)
        : undefined,
      bonnetwidth: parsedDimensions.bonnetwidth
        ? Number(parsedDimensions.bonnetwidth)
        : undefined,
      bonnetLength: parsedDimensions.bonnetLength
        ? Number(parsedDimensions.bonnetLength)
        : undefined,
    };

    // Validate dimensions - FIXED: engineSize is a STRING, not a number
    for (const [key, value] of Object.entries(dimensionsObj)) {
      if (value === undefined) continue; // Skip undefined values
      
      if (key === "engineSize") {
        // engineSize is a string - just check it's not empty
        if (typeof value !== 'string' || value.trim() === "") {
          return res.status(400).json({
            success: false,
            message: `Engine Size is required and must be non-empty text`,
          });
        }
      } else {
        // All other fields are numeric
        if (isNaN(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid value for dimensions.${key}: must be a non-negative number`,
          });
        }
      }
    }

    // Handle image uploads
   let imageUrls = [];
    
    // Option 1: Images from uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imgUrlCloudinary = await uploadOnCloudinary(file.path);
        if (!imgUrlCloudinary?.url) {
          return res
            .status(500)
            .json({ success: false, message: "Error uploading images" });
        }
        imageUrls.push(imgUrlCloudinary.url);
      }
    }
    // Option 2: Images from request body (auto-selected URLs)
    else if (images && Array.isArray(images) && images.length > 0) {
      // Validate that all images are valid URLs
      const validUrls = images.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
      
      if (validUrls.length > 0) {
        imageUrls = validUrls;
      } else {
        // If no valid URLs, try to get images from the approved vehicle template
        const approvedVehicle = await Vehicle.findOne({
          country,
          vehicle,
          model,
          manufacturer,
          isApproved: true
        });
        
        if (approvedVehicle && approvedVehicle.images && approvedVehicle.images.length > 0) {
          imageUrls = approvedVehicle.images;
        }
      }
    } else {
      const approvedVehicle = await Vehicle.findOne({
     
        vehicle,
        model,
        manufacturer,
        isApproved: true
      });
      
      if (approvedVehicle && approvedVehicle.images && approvedVehicle.images.length > 0) {
        imageUrls = approvedVehicle.images;
      }
    }
    if (imageUrls.length === 0) {
      imageUrls = ["https://via.placeholder.com/600x400?text=Vehicle+Image"];
    }
    const newVehicle = await Vehicle.create({
      vehicle,
      model,
      registrationPlate: registrationPlate.trim().toUpperCase(),
      yearOfManufacture: Number(yearOfManufacture),
      manufacturer,
      dailyMileage: Number(dailyMileage),
      dimensions: dimensionsObj,
      images: imageUrls,
      addedBy: fleetOwnerId,
      isApproved: false,
    });

    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create vehicle",
    });
  }
};

export const getVehiclesByFleetOwner = async (req, res) => {
  try {
    const { fleetOwnerId } = req.params;
    if (!fleetOwnerId) {
      return res
        .status(400)
        .json({ success: false, message: "Owner ID is required" });
    }
    const vehicles = await Vehicle.find({ addedBy: fleetOwnerId });

    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Error fetching vehicles by owner:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

export const updateVehicleByFleetOwner = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    if (!vehicleId) {
      return res
        .status(400)
        .json({ success: false, message: "Vehicle ID is required" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    // Updates object
    const updates = { ...req.body };
    
    // Handle year
    if (req.body.yearOfManufacture) {
      updates.yearOfManufacture = Number(req.body.yearOfManufacture);
    }
     if (req.body.dailyMileage) {
      const dailyMileageNum = Number(req.body.dailyMileage);
      if (isNaN(dailyMileageNum) || dailyMileageNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Daily Mileage must be a valid non-negative number"
        });
      }
      updates.dailyMileage = dailyMileageNum;
    }
if (req.body.registrationPlate) {
  updates.registrationPlate = req.body.registrationPlate.trim().toUpperCase();
}
    // Handle dimensions if they're being updated via form data
    if (req.body["dimensions[length]"]) {
      updates.dimensions = {
        length: Number(req.body["dimensions[length]"]) || vehicle.dimensions.length,
        width: Number(req.body["dimensions[width]"]) || vehicle.dimensions.width,
        height: Number(req.body["dimensions[height]"]) || vehicle.dimensions.height,
        wheelbase: Number(req.body["dimensions[wheelbase]"]) || vehicle.dimensions.wheelbase,
        curbWeight: Number(req.body["dimensions[curbWeight]"]) || vehicle.dimensions.curbWeight,
        engineSize: String(req.body["dimensions[engineSize]"] || vehicle.dimensions.engineSize).trim(),
        cabwidth: Number(req.body["dimensions[cabwidth]"]) || vehicle.dimensions.cabwidth,
        cabheight: Number(req.body["dimensions[cabheight]"]) || vehicle.dimensions.cabheight,
        bonnetwidth: Number(req.body["dimensions[bonnetwidth]"]) || vehicle.dimensions.bonnetwidth,
        bonnetLength: Number(req.body["dimensions[bonnetLength]"]) || vehicle.dimensions.bonnetLength,
      };

      // Validate dimensions - engineSize is string, others are numbers
      for (const [key, value] of Object.entries(updates.dimensions)) {
        if (key === "engineSize") {
          if (!value || value.trim() === "") {
            return res.status(400).json({
              success: false,
              message: "Engine Size is required",
            });
          }
        } else {
          if (isNaN(value) || value < 0) {
            return res.status(400).json({
              success: false,
              message: `Invalid value for dimensions.${key}`,
            });
          }
        }
      }
    }

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (!uploaded?.url) {
          return res.status(500).json({ message: "Image upload failed" });
        }
        imageUrls.push(uploaded.url);
      }
      updates.images = imageUrls;
    }
 if (registrationPlate) {
      const cleanRegistrationPlate = registrationPlate.trim().toUpperCase();
      
      // If registration plate is being changed, check for duplicates
      if (cleanRegistrationPlate !== existingVehicle.registrationPlate) {
        const duplicateVehicle = await Vehicle.findOne({
          registrationPlate: { $regex: new RegExp(`^${cleanRegistrationPlate}$`, 'i') },
          _id: { $ne: id }, // Current vehicle ko exclude karein
          addedBy: existingVehicle.addedBy // Same fleet owner ke liye check
        });

        if (duplicateVehicle) {
          return res.status(400).json({
            success: false,
            message: `Vehicle with registration plate "${cleanRegistrationPlate}" already exists in your fleet.`,
            duplicatePlate: cleanRegistrationPlate
          });
        }
      }
    }
    const updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, updates, {
      new: true,
    });
    
    res.status(200).json({ success: true, data: updatedVehicle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteVehicleByFleetOwner = async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadVehicleCSVByFleetOwner = async (req, res) => {
  try {
    const { fleetOwnerId } = req.params;
    const vehicles = req.body;

    if (!fleetOwnerId || !vehicles || !Array.isArray(vehicles)) {
      return res
        .status(400)
        .json({ message: "FleetOwnerId or vehicles missing" });
    }

    const savedVehicles = [];
    const duplicatePlates = [];
    const csvDuplicates = [];
    const csvPlateMap = new Map();
    const skippedVehicles = [];
    
    // ✅ Pehle existing vehicles fetch karein duplicate check ke liye
    const existingVehicles = await Vehicle.find({
      addedBy: fleetOwnerId
    }).select('registrationPlate');
    
    const existingPlates = new Set(existingVehicles.map(v => 
      v.registrationPlate?.trim().toUpperCase()
    ));

    // ✅ Process each vehicle with proper indexing
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      const {
        country,
        vehicle,
        yearOfManufacture,
        manufacturer,
        model,
        images,
        registrationPlate,
        dailyMileage
      } = v;

      if ( !vehicle || !manufacturer || !model || !registrationPlate || !dailyMileage) {
        skippedVehicles.push({
          index: i + 1,
          reason: "Missing required fields",
          registrationPlate: registrationPlate || "N/A"
        });
        continue;
      }

      const cleanRegistrationPlate = registrationPlate.trim().toUpperCase();
      const rowNumber = i + 1;

      // ✅ CSV ke andar duplicate check
      if (csvPlateMap.has(cleanRegistrationPlate)) {
        csvDuplicates.push({
          plate: cleanRegistrationPlate,
          row: rowNumber,
          previousRow: csvPlateMap.get(cleanRegistrationPlate)
        });
        continue;
      } const dailyMileageNum = Number(dailyMileage);
      if (isNaN(dailyMileageNum) || dailyMileageNum < 0) {
        skippedVehicles.push({
          index: i + 1,
          reason: "Invalid dailyMileage - must be non-negative number",
          registrationPlate: registrationPlate
        });
        continue;
      }else {
        csvPlateMap.set(cleanRegistrationPlate, rowNumber);
      }

      // ✅ Database mein existing duplicate check
      if (existingPlates.has(cleanRegistrationPlate)) {
        duplicatePlates.push({
          plate: cleanRegistrationPlate,
          row: rowNumber,
          reason: "Already exists in your fleet"
        });
        continue;
      }

      // Construct dimensions object
      const dimensionsObj = {
        length: Number(v["dimensions[length]"] ?? 0),
        width: Number(v["dimensions[width]"] ?? 0),
        height: Number(v["dimensions[height]"] ?? 0),
        wheelbase: Number(v["dimensions[wheelbase]"] ?? 0),
        curbWeight: Number(v["dimensions[curbWeight]"] ?? 0),
        engineSize: String(v["dimensions[engineSize]"] ?? "").trim(),
        cabwidth: Number(v["dimensions[cabwidth]"] ?? 0),
        cabheight: Number(v["dimensions[cabheight]"] ?? 0),
        bonnetwidth: Number(v["dimensions[bonnetwidth]"] ?? 0),
        bonnetLength: Number(v["dimensions[bonnetLength]"] ?? 0),
      };

      // Validate dimensions
      const numericFields = [
        "length",
        "width",
        "height",
        "wheelbase",
        "curbWeight",
        "cabwidth",
        "cabheight",
        "bonnetwidth",
        "bonnetLength",
      ];
      
      let isValid = true;
      let validationError = "";
      
      // Check numeric fields
      for (const key of numericFields) {
        const value = dimensionsObj[key];
        if (value === undefined || isNaN(value) || value < 0) {
          isValid = false;
          validationError = `Invalid ${key} value: ${value}`;
          break;
        }
      }
      
      // Check engineSize - it's a string, not a number
      if (isValid && (!dimensionsObj.engineSize || dimensionsObj.engineSize === "")) {
        isValid = false;
        validationError = "Engine Size is required";
      }
      
      if (!isValid) {
        skippedVehicles.push({
          index: rowNumber,
          reason: validationError || "Invalid dimensions",
          registrationPlate: cleanRegistrationPlate
        });
        continue;
      }

      const newVehicle = new Vehicle({
        addedBy: fleetOwnerId,
        country,
        vehicle,
        yearOfManufacture: Number(yearOfManufacture),
        manufacturer,
        
        model,
        registrationPlate: cleanRegistrationPlate,
        dailyMileage: dailyMileageNum,
        dimensions: dimensionsObj,
        images: images || [],
        isApproved: false,
      });

      const saved = await newVehicle.save();
      savedVehicles.push(saved);
      
      existingPlates.add(cleanRegistrationPlate);
    }

    const response = {
      success: true,
      message: `CSV processing completed. ${savedVehicles.length} vehicles added successfully.`,
      summary: {
        totalProcessed: vehicles.length,
        saved: savedVehicles.length,
        csvDuplicates: csvDuplicates.length,
        existingDuplicates: duplicatePlates.length,
        skipped: skippedVehicles.length
      },
      details: {
        savedVehicles: savedVehicles.map(v => ({
          id: v._id,
          registrationPlate: v.registrationPlate,
           dailyMileage: v.dailyMileage,
          vehicle: `${v.manufacturer} ${v.vehicle} ${v.model}`
        })),
        csvDuplicates: csvDuplicates,
        existingDuplicates: duplicatePlates,
        
        skipped: skippedVehicles
      }
    };
    if (savedVehicles.length === 0) {
      return res.status(400).json({
        ...response,
        message: "No vehicles were added. Please check for duplicates or errors.",
        success: false
      });
    }

    res.status(201).json(response);
  } catch (err) {
    console.error("Error saving vehicles:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};

// import Vehicle from "../models/vehicle.model.js";
// import fs from "fs";
// import Papa from "papaparse";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

// export const addVehicle = async (req, res) => {
//   try {
//     const { country, vehicle, model, yearOfManufacture, manufacturer } = req.body;

//     // Validate required fields
//     if (!country || !vehicle || !model || !yearOfManufacture || !manufacturer) {
//       return res.status(400).json({ success: false, message: "All required fields must be provided." });
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ success: false, message: "At least one image is required" });
//     }

//     const dimensions = {
//       length: Number(req.body.dimensions.length)|| 0,
//       width:  Number(req.body.dimensions.width) || 0,
//       height: Number(req.body.dimensions.height) || 0,
//       wheelbase: Number(req.body.dimensions.wheelbase) || 0,
//       curbWeight: Number(req.body.dimensions.curbWeight) || 0,
//       engineSize: Number(req.body.dimensions.engineSize) || 0,
//       cabwidth: Number(req.body.dimensions.cabwidth) || 0,
//       cabheight: Number(req.body.dimensions.cabheight) || 0,
//       bonnetwidth: Number(req.body.dimensions.bonnetwidth) || 0,
//       bonnetLength: Number(req.body.dimensions.bonnetLength) || 0,
//     };

//     for (const key in dimensions) {
//   if (isNaN(dimensions[key])) {
//     return res.status(400).json({
//       success: false,
//       message: `Invalid value for dimensions.${key}`,
//     });
//   }
// }

//     // Get image filenames from multer
//     const imageUrls = [];
//     for (const file of req.files) {
//       const imgUrlCloudinary = await uploadOnCloudinary(file.path);
//       if (!imgUrlCloudinary?.url) {
//         return res.status(500).json({ success: false, message: "Error uploading images" });
//       }
//       imageUrls.push(imgUrlCloudinary.url);
//     }

//     // Create new vehicle
//     const newVehicle = new Vehicle({
//       country,
//       vehicle,
//       model,
//       yearOfManufacture: Number(yearOfManufacture), // Ensure year is also a number
//       manufacturer,
//       dimensions,
//       images: imageUrls,
//     });

//     const savedVehicle = await newVehicle.save();
//     res.status(201).json({ success: true, data: savedVehicle });
//   } catch (error) {
//     console.error("Error adding vehicle:", error);
//     res.status(500).json({ success: false, message: error.message || "Server error." });
//   }
// };

// export const getAllVehicles = async (req, res) => {
//   try {
//     const vehicles = await Vehicle.find();
//     res.status(200).json({ success: true, data: vehicles });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Failed to fetch vehicles",
//         error: error.message,
//       });
//   }
// };

// export const getVehicalDetails = async (req, res) => {
//   try {
//     const { vehicle } = req.params;
//     const vehicles = await Vehicle.find({ vehicle: vehicle });

//     if (!vehicles || vehicles.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "No vehicle records found" });
//     }

//     // Return all matches
//     const formatted = vehicles.map((v) => ({
//       manufacturer: v.manufacturer,
//       yearOfManufacture: v.yearOfManufacture,
//       country: v.country,
//       model: v.model,
//       cabwidth: v.cabwidth,
//       cabheight: v.cabheight,
//       bonnetwidth: v.bonnetwidth,
//     }));

//     res.json({
//       success: true,
//       data: formatted,
//     });
//   } catch (err) {
//     console.error("Error fetching vehicle details by name:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// export const uploadVehicleCSV = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });
//     const csvData = fs.readFileSync(req.file.path, "utf8");

//     const { data } = Papa.parse(csvData, {
//       header: true,
//       skipEmptyLines: true,
//     });
//   const validData = data
//   .filter(
//     (row) =>
//       row.country &&
//       row.vehicle &&
//       row.model &&
//       row.yearOfManufacture &&
//       row.manufacturer &&
//       row['dimensions.length'] &&
//       row['dimensions.width'] &&
//       row['dimensions.height'] &&
//       row['dimensions.wheelbase'] &&
//       row['dimensions.curbWeight'] &&
//       row['dimensions.engineSize'] &&
//       row['dimensions.cabwidth'] &&
//       row['dimensions.cabheight'] &&
//       row['dimensions.bonnetwidth'] &&
//       row['dimensions.bonnetLength']
//   )
//   .map((row) => ({
//     country: row.country.trim(),
//     vehicle: row.vehicle.trim(),
//     model: row.model.trim(),
//     yearOfManufacture: Number(row.yearOfManufacture),
//     manufacturer: row.manufacturer.trim(),
//     dimensions: {
//       length: Number(row['dimensions.length']),
//       width: Number(row['dimensions.width']),
//       height: Number(row['dimensions.height']),
//       wheelbase: Number(row['dimensions.wheelbase']),
//       curbWeight: Number(row['dimensions.curbWeight']),
//       engineSize: Number(row['dimensions.engineSize']),
//       cabwidth: Number(row['dimensions.cabwidth']),
//       cabheight: Number(row['dimensions.cabheight']),
//       bonnetwidth: Number(row['dimensions.bonnetwidth']),
//       bonnetLength: Number(row['dimensions.bonnetLength']),
//     },
//   }));

//     // Remove duplicates within CSV
//     const seen = new Set();
//     const uniqueData = [];
//     for (const v of validData) {
//       const key = `${v.country}-${v.vehicle}-${v.model}-${v.yearOfManufacture}-${v.manufacturer}-${v.dimensions.length}-${v.dimensions.width}-${v.dimensions.height}-${v.dimensions.wheelbase}-${v.dimensions.curbWeight}-${v.dimensions.engineSize}-${v.dimensions.cabwidth}-${v.dimensions.cabheight}-${v.dimensions.bonnetwidth}-${v.dimensions.bonnetLength}`;
//       if (!seen.has(key)) {
//         seen.add(key);
//         uniqueData.push(v);
//       }
//     }
//     // Remove duplicates from DB
//     const existing = await Vehicle.find({
//       $or: uniqueData.map((v) => ({
//         country: v.country,
//         vehicle: v.vehicle,
//         model: v.model,
//         yearOfManufacture: v.yearOfManufacture,
//         manufacturer: v.manufacturer,
//         "dimensions.length": v.dimensions.length,
//         "dimensions.width": v.dimensions.width,
//         "dimensions.height": v.dimensions.height,
//         "dimensions.wheelbase": v.dimensions.wheelbase,
//         "dimensions.curbWeight": v.dimensions.curbWeight,
//         "dimensions.engineSize": v.dimensions.engineSize,
//         "dimensions.cabwidth": v.dimensions.cabwidth,
//         "dimensions.cabheight": v.dimensions.cabheight,
//         "dimensions.bonnetwidth": v.dimensions.bonnetwidth,
//          "dimensions.bonnetLength": v.dimensions.bonnetLength,
//       })),
//     });

//     const existingKeys = new Set(
//     existing.map((v) => {
//   const d = v.dimensions || {};
//   return `${v.country}-${v.vehicle}-${v.model}-${v.yearOfManufacture}-${v.manufacturer}-${d.length}-${d.width}-${d.height}-${d.wheelbase}-${d.curbWeight}-${d.engineSize}-${d.cabwidth}-${d.cabheight}-${d.bonnetwidth}-${v.dimensions.bonnetLength}`;
// })

//     );
//     const finalData = uniqueData.filter(
//       (v) =>
//         !existingKeys.has(
//           `${v.country}-${v.vehicle}-${v.model}-${v.yearOfManufacture}-${v.manufacturer}-${v.dimensions.length}-${v.dimensions.width}-${v.dimensions.height}-${v.dimensions.wheelbase}-${v.dimensions.curbWeight}-${v.dimensions.engineSize}-${v.dimensions.cabwidth}-${v.dimensions.cabheight}-${v.dimensions.bonnetwidth}-${v.dimensions.bonnetLength}`
//         )
//     );

//     await Vehicle.insertMany(finalData);
//     res.status(200).json({
//       message: "CSV uploaded",
//       inserted: finalData.length,
//       skipped: uniqueData.length - finalData.length,
//       data: finalData,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateVehicle = async (req, res) => {
//   try {
//     const vehicle = await Vehicle.findById(req.params.id);
//     if (!vehicle) {
//       return res.status(404).json({ success: false, message: "Vehicle not found" });
//     }

//     const updates = { ...req.body };

//     // Construct dimensions object if provided in form data
//     if (req.body["dimensions[length]"]) {
//       updates.dimensions = {
//         length: Number(req.body["dimensions[length]"]) || vehicle.dimensions.length,
//         width: Number(req.body["dimensions[width]"]) || vehicle.dimensions.width,
//         height: Number(req.body["dimensions[height]"]) || vehicle.dimensions.height,
//         wheelbase: Number(req.body["dimensions[wheelbase]"]) || vehicle.dimensions.wheelbase,
//         curbWeight: Number(req.body["dimensions[curbWeight]"]) || vehicle.dimensions.curbWeight,
//         engineSize: Number(req.body["dimensions[engineSize]"]) || vehicle.dimensions.engineSize,
//         cabwidth: Number(req.body["dimensions[cabwidth]"]) || vehicle.dimensions.cabwidth,
//         cabheight: Number(req.body["dimensions[cabheight]"]) || vehicle.dimensions.cabheight,
//         bonnetwidth: Number(req.body["dimensions[bonnetwidth]"]) || vehicle.dimensions.bonnetwidth,
//         bonnetLength: Number(req.body["dimensions[bonnetLength]"]) || vehicle.dimensions.bonnetLength,
//       };

//       // Validate dimensions numbers
//       for (const key in updates.dimensions) {
//         if (isNaN(updates.dimensions[key])) {
//           return res.status(400).json({
//             success: false,
//             message: `Invalid value for dimensions.${key}`,
//           });
//         }
//       }
//     }

//     // If new images uploaded, upload them to Cloudinary and update images array
//     if (req.files && req.files.length > 0) {
//       const imageUrls = [];
//       for (const file of req.files) {
//         const imgUrlCloudinary = await uploadOnCloudinary(file.path);
//         if (!imgUrlCloudinary?.url) {
//           return res.status(500).json({ success: false, message: "Error uploading images" });
//         }
//         imageUrls.push(imgUrlCloudinary.url);
//       }
//       updates.images = imageUrls;
//     } else {
//       updates.images = vehicle.images; // retain old images if no new images provided
//     }

//     // Validate images presence
//     if (!updates.images || updates.images.length === 0) {
//       return res.status(400).json({ success: false, message: "At least one image is required." });
//     }

//     // Convert yearOfManufacture to Number if present
//     if (req.body.yearOfManufacture) {
//       updates.yearOfManufacture = Number(req.body.yearOfManufacture);
//     }

//     // Update other fields explicitly if needed
//     ['country', 'vehicle', 'model', 'manufacturer'].forEach(field => {
//       if (req.body[field]) {
//         updates[field] = req.body[field];
//       }
//     });

//     // Perform update
//     const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, { new: true });

//     res.status(200).json({ success: true, data: updatedVehicle });
//   } catch (error) {
//     console.error("Error updating vehicle:", error);
//     res.status(500).json({ success: false, message: error.message || "Server error." });
//   }
// };

// export const deleteVehicle = async (req, res) => {
//   try {
//     const deleted = await Vehicle.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Vehicle not found" });
//     res.status(200).json({ message: "Vehicle deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
