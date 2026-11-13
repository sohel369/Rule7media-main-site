// controllers/adGif.Controller.js
import AdGif from "../models/adGif.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/user.model.js";

const GIF_LIMITS = {
  NO_SUBSCRIPTION: {
    maxFileSize: 2 * 1024 * 1024, 
    maxGifsPerCampaign: 3,
    maxCampaigns: 1,
    label: "Free (No Subscription)",
  },
  "3_MONTHS": {
    maxFileSize: 5 * 1024 * 1024, 
    maxGifsPerCampaign: 10,
    maxCampaigns: 10,
    label: "3-Month Plan",
  },
  "6_MONTHS": {
    maxFileSize: 10 * 1024 * 1024, 
    maxGifsPerCampaign: 20,
    maxCampaigns: 20,
    label: "6-Month Plan",
  },
  "12_MONTHS": {
    maxFileSize: 20 * 1024 * 1024, 
    maxGifsPerCampaign: 50,
    maxCampaigns: 999,
    label: "12-Month Plan",
  },
};

// ✅ Server hard limit (20MB total)
const SERVER_MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB

const getGifLimits = (subscription) => {
  if (!subscription || subscription.status !== "active") {
    return GIF_LIMITS.NO_SUBSCRIPTION;
  }

  const durationMonths = parseInt(
    subscription.durationMonths || subscription.planDuration || 0
  );

  if (durationMonths >= 12) return GIF_LIMITS["12_MONTHS"];
  if (durationMonths >= 6) return GIF_LIMITS["6_MONTHS"];
  if (durationMonths >= 3) return GIF_LIMITS["3_MONTHS"];

  return GIF_LIMITS.NO_SUBSCRIPTION;
};

// Helper to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const uploadAdGifs = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validate title
    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one GIF required" });
    }

    // Get user with subscription
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get GIF limits based on subscription
    const gifLimits = getGifLimits(user.subscription);

    // ✅ ========== TOTAL SIZE CHECK ==========
    let totalSize = 0;
    for (const file of req.files) {
      totalSize += file.size;
    }
    
    // ✅ Check total size against server limit
    if (totalSize > SERVER_MAX_TOTAL_SIZE) {
      return res.status(413).json({
        success: false,
        message: `❌ Total size (${formatFileSize(totalSize)}) exceeds server limit of ${formatFileSize(SERVER_MAX_TOTAL_SIZE)}. Please compress your GIFs or upload fewer files.`,
        error: "413 Request Entity Too Large",
        details: {
          totalSize: formatFileSize(totalSize),
          maxAllowed: formatFileSize(SERVER_MAX_TOTAL_SIZE),
          fileCount: req.files.length
        }
      });
    }

    // Check existing campaigns count
    const existingCampaigns = await AdGif.countDocuments({ user: user._id });
    if (existingCampaigns >= gifLimits.maxCampaigns) {
      return res.status(403).json({
        success: false,
        message: `Campaign limit reached! Your ${gifLimits.label} allows ${gifLimits.maxCampaigns} campaigns. Please upgrade to create more.`,
        currentPlan: gifLimits.label,
        limit: gifLimits.maxCampaigns,
        current: existingCampaigns,
      });
    }

    // Check number of GIFs per campaign
    if (req.files.length > gifLimits.maxGifsPerCampaign) {
      return res.status(403).json({
        success: false,
        message: `Your ${gifLimits.label} allows maximum ${gifLimits.maxGifsPerCampaign} GIFs per campaign. You tried to upload ${req.files.length} GIFs.`,
        currentPlan: gifLimits.label,
        limit: gifLimits.maxGifsPerCampaign,
        attempted: req.files.length,
      });
    }

    // Validate each file size against subscription limit
    const oversizedFiles = [];
    for (const file of req.files) {
      if (file.size > gifLimits.maxFileSize) {
        oversizedFiles.push({
          name: file.originalname,
          size: formatFileSize(file.size),
          maxAllowed: formatFileSize(gifLimits.maxFileSize),
        });
      }
    }

    if (oversizedFiles.length > 0) {
      return res.status(413).json({
        success: false,
        message: `❌ Some files exceed your plan's size limit. Max ${formatFileSize(gifLimits.maxFileSize)} per file.`,
        currentPlan: gifLimits.label,
        maxFileSize: formatFileSize(gifLimits.maxFileSize),
        oversizedFiles: oversizedFiles,
        error: "413 Request Entity Too Large"
      });
    }

    // Upload GIFs to Cloudinary
    const gifUrls = [];
    for (const file of req.files) {
      try {
        const result = await uploadOnCloudinary(file.path, {
          resource_type: "image",
          folder: "gif-ads",
        });
        gifUrls.push(result.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload GIF to cloud storage",
          error: uploadError.message,
        });
      }
    }

    // Create new GIF ad
    const newAd = await AdGif.create({
      title,
      description,
      gifs: gifUrls,
      user: req.user._id,
      subscription: {
        plan: gifLimits.label,
        durationMonths: user.subscription?.durationMonths || 0,
        uploadedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "✅ GIF campaign created successfully",
      data: newAd,
      planInfo: {
        currentPlan: gifLimits.label,
        remainingCampaigns: gifLimits.maxCampaigns - (existingCampaigns + 1),
        maxCampaigns: gifLimits.maxCampaigns,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during GIF upload",
      error: error.message,
    });
  }
};

export const getMyGifAds = async (req, res) => {
  try {
    const ads = await AdGif.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGifAd = async (req, res) => {
  try {
    const { title, description } = req.body;
    const ad = await AdGif.findOne({ _id: req.params.id, user: req.user._id });
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    let gifUrls = ad.gifs;
    if (req.files && req.files.length > 0) {
      // ✅ Check total size for update as well
      let totalSize = 0;
      for (const file of req.files) {
        totalSize += file.size;
      }
      if (totalSize > SERVER_MAX_TOTAL_SIZE) {
        return res.status(413).json({
          success: false,
          message: `❌ Total size (${formatFileSize(totalSize)}) exceeds server limit of ${formatFileSize(SERVER_MAX_TOTAL_SIZE)}.`,
          error: "413 Request Entity Too Large"
        });
      }
      
      gifUrls = [];
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        gifUrls.push(result.secure_url);
      }
    }

    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.gifs = gifUrls;

    await ad.save();
    res.status(200).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGifAd = async (req, res) => {
  try {
    const ad = await AdGif.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllGifAds = async (req, res) => {
  try {
    const ads = await AdGif.find({ isPublic: true })
      .populate("user", "name company") 
      .sort({ createdAt: -1 })
      .limit(50); 

    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGifById = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await AdGif.findById(id)
      .populate("user", "name company") 
      .lean(); 

    if (!ad) {
      return res.status(404).json({ message: "GIF advertisement not found" });
    }
    ad.impressions += 1;
    ad.ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
    await AdGif.findByIdAndUpdate(id, { impressions: ad.impressions, ctr: ad.ctr });

    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackImpression = async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await AdGif.findById(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.impressions += 1;
    ad.ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
    await ad.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const trackClick = async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await AdGif.findById(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.clicks += 1;
    ad.ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
    await ad.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};