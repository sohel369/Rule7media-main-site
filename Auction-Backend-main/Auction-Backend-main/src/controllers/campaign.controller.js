// controllers/campaignController.js
import Campaign from "../models/campaign.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
export const createCampaign = async (req, res) => {
  try {

    const {
      title,
      description,
      budget,
      country,
      state,
      city,
      zipCodes,        
      locations,       
      target,
      startAt,
      endAt,
    } = req.body;

    if (!title || !budget ||  !country || !state) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);
      if (result?.secure_url) {
        imageUrls.push(result.secure_url);
      }
    }

    if (imageUrls.length === 0) {
      return res.status(500).json({ success: false, message: "Image upload failed" });
    }

    const parsedZipCodes = zipCodes ? JSON.parse(zipCodes) : [];
    const parsedLocations = locations ? JSON.parse(locations) : [];
    let targetVehicleTypes = [];
    if (target) {
      try {
        const parsedTarget = typeof target === 'string' 
          ? JSON.parse(target) 
          : target;
        targetVehicleTypes = Array.isArray(parsedTarget.vehicleTypes) 
          ? parsedTarget.vehicleTypes 
          : [];

      } catch (parseError) {
        console.error("❌ Error parsing target:", parseError);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid target format" 
        });
      }
    }
    const newCampaign = await Campaign.create({
      title,
      description: description || "",
      budget: Number(budget),

      location: {
        country,
        state,
        city,
        zipCodes: parsedZipCodes,
        geoLocations: parsedLocations,
      },

      image: imageUrls,
    targetVehicleTypes: targetVehicleTypes, 
      startAt,
      endAt: endAt || null,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Campaign created successfully!",
      data: newCampaign,
    });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveCampaigns = async (req, res) => {
  try {
    const results = await Campaign.find({}).lean();

    res.json({ 
      success: true, 
      data: results 
    });
  } catch (err) {
    console.error("Error fetching all campaigns:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
export const getCampaignsbyuser = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
   
    res.json({ success: true, data: campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID format"
      });
    }

    const campaign = await Campaign.findById(id).lean();

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: "Campaign not found" 
      });
    }

    // YE PURA CHECK HATA DIYA → ab koi bhi dekh sakta hai
    // if (campaign.createdBy.toString() !== req.user._id.toString()) { ... }

    res.json({ 
      success: true, 
      data: campaign 
    });
  } catch (error) {
    console.error("Get campaign by ID error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: "Campaign not found" 
      });
    }
    
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    const {
      title,
      description,
      budget,
      country,
      state,
      city,
      zipCodes,
      locations,
      target,
      startAt,
      endAt,
      existingImages
    } = req.body;
    
    // 1. Parse target properly
    let targetVehicleTypes = [];
    if (target) {
      try {
        const parsedTarget = typeof target === 'string' 
          ? JSON.parse(target) 
          : target;
        
        // Fix: Extract vehicleTypes correctly
        if (parsedTarget.vehicleTypes) {
          targetVehicleTypes = Array.isArray(parsedTarget.vehicleTypes) 
            ? parsedTarget.vehicleTypes 
            : [];
        } else if (Array.isArray(parsedTarget)) {
          // If target is directly an array
          targetVehicleTypes = parsedTarget;
        }
       
      } catch (parseError) {
        console.error("❌ Error parsing target:", parseError);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid target format" 
        });
      }
    } else if (campaign.targetVehicleTypes) {
      // Keep existing if no new target provided
      targetVehicleTypes = campaign.targetVehicleTypes;
    }

    // 2. Handle images
    let imageUrls = [];
    if (existingImages) {
      try {
        imageUrls = typeof existingImages === 'string' 
          ? JSON.parse(existingImages) 
          : existingImages;
      } catch (e) {
        imageUrls = campaign.image || [];
      }
    } else {
      imageUrls = campaign.image || [];
    }
    
    // Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (result?.secure_url) {
          imageUrls.push(result.secure_url);
        }
      }
    }

    // 3. Parse locations
    let parsedZipCodes = campaign.location?.zipCodes || [];
    let parsedLocations = campaign.location?.geoLocations || [];
    
    if (zipCodes) {
      try {
        parsedZipCodes = typeof zipCodes === 'string' 
          ? JSON.parse(zipCodes) 
          : zipCodes;
      } catch (e) {
        console.error("Error parsing zipCodes:", e);
      }
    }
    
    if (locations) {
      try {
        parsedLocations = typeof locations === 'string' 
          ? JSON.parse(locations) 
          : locations;
      } catch (e) {
        console.error("Error parsing locations:", e);
      }
    }

    // Build update data with proper structure
    const updateData = {
      title: title || campaign.title,
      description: description || campaign.description,
      budget: budget ? Number(budget) : campaign.budget,
      location: {
        country: country || campaign.location?.country,
        state: state || campaign.location?.state,
        city: city || campaign.location?.city,
        zipCodes: parsedZipCodes,
        geoLocations: parsedLocations,
      },
      image: imageUrls,
      targetVehicleTypes: targetVehicleTypes, 
    };
    
    // Only add dates if they are provided
    if (startAt) updateData.startAt = startAt;
    if (endAt) updateData.endAt = endAt;

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,  
        runValidators: true  
      }
    );

    res.status(200).json({ 
      success: true, 
      message: "Campaign updated successfully", 
      data: updatedCampaign 
    });

  } catch (error) {
    console.error("❌ Update campaign error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);

    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Campaign.findByIdAndDelete(id);
    res.json({ success: true, message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const trackClick = async (req, res) => {
  await Campaign.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
  res.json({ success: true });
};

export const trackImpression = async (req, res) => {
  await Campaign.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } });
  res.json({ success: true });
};


export const searchCampaigns = async (req, res) => {
  try {
    const {
      country,
      state,
      postCodes = [],
      vehicleType = [],
    } = req.body;


    const filter = {
      status: "active",
    };

    // 1. Country Filter
    if (country?.trim()) {
      filter["location.country"] = { 
        $regex: `^${country.trim()}$`, 
        $options: "i" 
      };
    }

    // 2. State Filter
    if (state?.trim()) {
      filter["location.state"] = { 
        $regex: state.trim(), 
        $options: "i" 
      };
    }

    // 3. Post Codes Filter
    if (postCodes.length > 0) {
      const codes = postCodes
        .filter(code => code && code.toString().trim())
        .map(code => code.toString().trim());
      
      if (codes.length > 0) {
        filter["location.zipCodes"] = { $in: codes };
      }
    }

    // 4. Vehicle Type Filter (Multi-choice)
    if (Array.isArray(vehicleType) && vehicleType.length > 0) {
      const cleanedTypes = vehicleType
        .filter(type => typeof type === 'string' && type.trim())
        .map(type => type.trim());
      
      if (cleanedTypes.length > 0) {
        filter["targetVehicleTypes"] = { 
          $in: cleanedTypes.map(type => new RegExp(type, "i")) 
        };
      }
    }

    const campaigns = await Campaign.find(filter)
      .populate("createdBy", "firstName lastName email companyName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error("Campaign search error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};