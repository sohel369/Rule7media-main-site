import Statistic from '../models/statistic.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from 'fs/promises';
import path  from'path';
const COUNTRY_LANGUAGE_MAP = { 
  UnitedStates: ['en'],
  Canada: ['en', 'fr'],
  Australia: ['en'],
  China: ['zh'],
  Japan: ['ja'],
  Thailand: ['th'],
  Indonesia: ['id'],
  Spain: ['es'],
  India: ['en', 'hi'],
  France: ['fr'],
  UnitedKingdom: ['en'],
  Default: ['en'],
};

export const getStatisticsByCountry = async (req, res) => {
  try {
    const { country } = req.params;
    const validLanguages = COUNTRY_LANGUAGE_MAP[country] || COUNTRY_LANGUAGE_MAP['Default'];
    if (!validLanguages || validLanguages.length === 0) {
      return res.status(400).json({ message: 'Invalid or unsupported country' });
    }

    const stats = await Statistic.find({
      sources: {
        $elemMatch: {
          language: { $in: validLanguages },
          url: { $exists: true, $type: 'array', $not: { $size: 0 } }
        }
      }
    });

    const cleanedStats = stats.map((stat) => ({
      ...stat.toObject(),
      sources: (stat.sources || []).filter(
        (source) =>
          source &&
          typeof source.language === 'string' &&
          validLanguages.includes(source.language) &&
          Array.isArray(source.url) &&
          source.url.length > 0 &&
          source.url.every((u) => typeof u === 'string' && u.trim() !== '')
      ),
    }));
  
    res.json(cleanedStats);
  } catch (err) {
    console.error('Error in getStatisticsByCountry:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const stats = await Statistic.find();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 



// createStatistic
// createStatistic - FIXED version
export const createStatistic = async (req, res) => {
  try {
    const { sources, videoType } = req.body;
   
    
    const parsedSources = typeof sources === 'string' ? JSON.parse(sources) : sources;

    // Validate videoType
    if (!videoType || !['wrapper', 'cpm', 'global',"buyerMarket", "franchiseFaq",

  "fleetOwner",
    "pricingMethodology",
    "howItWork",].includes(videoType)) {
      return res.status(400).json({ message: 'videoType must be wrapper,buyerMarket,howItWork,pricingMethodology, franchiseFaq,fleetOwner, cpm, or global' });
    }
    
    const files = req.files || [];
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        try { await fs.unlink(file.path); } catch {}
        return res.status(413).json({ 
          message: `File "${file.originalname}" is too large. Maximum size is 100MB.` 
        });
      }
    }
    
    if (!Array.isArray(parsedSources)) {
      throw new Error('Sources must be an array');
    }
    
    const finalSources = await Promise.all(
      parsedSources.map(async (source, index) => {
        if (source.type === 'uploaded' && files[index]) {
          const filePath = files[index].path; 
          const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg'];

          if (!allowedFormats.includes(files[index].mimetype)) {
            console.warn(`Invalid file format for ${files[index].originalname}`);
            return {
              url: [],
              description: source.description,
              type: 'uploaded',
              language: source.language,
            };
          }

          try {
            const uploadResult = await uploadOnCloudinary(filePath, {
              resource_type: 'video',
              folder: `videos/${source.language}`,
              public_id: `video_${source.language}_${Date.now()}_${index}`,
            });

            try {
              await fs.access(filePath); 
              await fs.unlink(filePath);
            } catch (unlinkErr) {
              if (unlinkErr.code !== 'ENOENT') {
                console.error(`Failed to delete local file: ${filePath}`, unlinkErr);
              }
            }

            return {
              url: [uploadResult.secure_url || ''],
              description: source.description,
              type: 'uploaded',
              language: source.language,
            };
          } catch (err) {
            console.warn(`Upload failed for file: ${filePath}`, err);
            return {
              url: [],
              description: source.description,
              type: 'uploaded',
              language: source.language,
            };
          }
        }

        return {
          url: source.url ? [source.url] : [],
          description: source.description,
          type: source.type,
          language: source.language,
        };
      })
    );

    // ✅ IMPORTANT FIX: Include videoType when creating the statistic
    const statistic = new Statistic({ 
      sources: finalSources,
      videoType: videoType  // ← THIS WAS MISSING!
    });
    
    const newStat = await statistic.save();
    res.status(201).json(newStat);
  } catch (err) {
    console.error('Error in createStatistic:', err);
    res.status(400).json({ message: err.message || 'Failed to create statistic' });
  }
};

// updateStatistic
// updateStatistic - FIXED version
export const updateStatistic = async (req, res) => {
  try {
    const { sources, videoType } = req.body;  // ← Get videoType
    const parsedSources = typeof sources === 'string' ? JSON.parse(sources) : sources;
    const files = req.files || [];
    const MAX_SIZE = 100 * 1024 * 1024;
    
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        try { await fs.unlink(file.path); } catch {}
        return res.status(413).json({ 
          message: `File "${file.originalname}" is too large. Maximum size is 100MB.` 
        });
      }
    }

    // Validate input
    if (!parsedSources || !Array.isArray(parsedSources)) {
      return res.status(400).json({ message: 'Invalid sources data' });
    }

    // Validate videoType if provided
    if (videoType && !['wrapper', 'cpm', 'global',"buyerMarket",
    "pricingMethodology",
    "howItWork",].includes(videoType)) {
      return res.status(400).json({ message: 'videoType must be wrapper, cpm,buyerMarket, pricingMethodology,howItWork,or global' });
    }

    const existingStat = await Statistic.findById(req.params.id);
    if (!existingStat) {
      return res.status(404).json({ message: 'Statistic not found' });
    }

    const finalSources = await Promise.all(
      parsedSources.map(async (source, index) => {
        const existingSource = existingStat.sources[index] || {};

        if (source.type === 'uploaded' && files[index]) {
          try {
            await fs.access(files[index].path);
          } catch (err) {
            console.error(`File not found: ${files[index].path}`, err);
            return {
              url: existingSource.url || [],
              description: source.description || '',
              type: 'uploaded',
              language: source.language || '',
            };
          }

          // Upload to Cloudinary
          const cloudinaryResponse = await uploadOnCloudinary(files[index].path, {
            resource_type: 'video',
            folder: `videos/${source.language}`,
            public_id: `video_${source.language}_${Date.now()}_${index}`,
          });

          if (cloudinaryResponse?.secure_url) {
            try {
              await fs.access(files[index].path);
              await fs.unlink(files[index].path);
            } catch (err) {
              if (err.code !== 'ENOENT') {
                console.error(`Failed to delete local file: ${files[index].path}`, err);
              }
            }

            return {
              url: [cloudinaryResponse.secure_url],
              description: source.description || '',
              type: 'uploaded',
              language: source.language || '',
            };
          } else {
            console.error(`Cloudinary upload failed for file: ${files[index].path}`);
            return {
              url: existingSource.url || [],
              description: source.description || '',
              type: 'uploaded',
              language: source.language || '',
            };
          }
        }

        if (source.type === 'uploaded' && existingSource.url && !files[index]) {
          return {
            url: existingSource.url || [],
            description: source.description || '',
            type: 'uploaded',
            language: source.language || '',
          };
        }

        return {
          url: source.url ? [source.url] : [],
          description: source.description || '',
          type: source.type || 'external',
          language: source.language || '',
        };
      })
    );

    // ✅ Prepare update data with videoType
    const updateData = { sources: finalSources };
    if (videoType) {
      updateData.videoType = videoType;
    }

    const updatedStat = await Statistic.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStat) {
      return res.status(404).json({ message: 'Statistic not found' });
    }

    res.json(updatedStat);
  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({
      message: err.message || 'Update failed',
      errors: err.errors,
    });
  }
};

// delet

// Delete statistic (admin only)
export const deleteStatistic = async (req, res) => {
  try {
    const stat = await Statistic.findByIdAndDelete(req.params.id);
    if (!stat) {
      return res.status(404).json({ message: 'Statistic not found' });
    }
    res.json({ message: 'Statistic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};