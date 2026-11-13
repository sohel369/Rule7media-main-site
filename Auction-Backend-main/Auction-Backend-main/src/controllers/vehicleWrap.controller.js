import VehicleWrap from "../models/vehiclewrap.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import fs from "fs";

export const createVehicleWrap = async (req, res) => {
  try {
   

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const imgUrlCloudinary = await uploadOnCloudinary(file.path);
      if (!imgUrlCloudinary?.url) {
        return res
          .status(500)
          .json({ message: "Error uploading images" });
      }
      imageUrls.push(imgUrlCloudinary.url);
      
      // Clean up local file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    const newWrap = await VehicleWrap.create({
      description: req.body.description,
      vehicleType: req.body.vehicleType, 
      image: imageUrls,
      
    });

    res.status(201).json({
      success: true,
      message: "Vehicle wrap created successfully",
      data: newWrap
    });
  } catch (error) {
    console.error("Create vehicle wrap error:", error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(400).json({ message: error.message });
  }
};


export const getVehicleWraps = async (req, res) => {
  try {
    const wraps = await VehicleWrap.find();
 
    res.json(wraps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getVehicleWrapById = async (req, res) => {
  try {
    const wrap = await VehicleWrap.findById(req.params.id);
    if (!wrap) {
      return res.status(404).json({ message: "Vehicle wrap not found" });
    }
    res.json(wrap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateVehicleWrap = async (req, res) => {
  try {


    const wrap = await VehicleWrap.findById(req.params.id);
    if (!wrap) {
      return res.status(404).json({ message: "Vehicle wrap not found" });
    }

    const updateData = {
      description: req.body.description,
      vehicleType: req.body.vehicleType, 
    
    };

    const currentImages = [...wrap.image];
    let newImages = [];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imgResult = await uploadOnCloudinary(file.path);
        if (!imgResult?.url) {
          // Clean up files on error
          req.files.forEach(f => {
            if (fs.existsSync(f.path)) {
              fs.unlinkSync(f.path);
            }
          });
          return res.status(500).json({ message: "Error uploading images" });
        }
        newImages.push(imgResult.url);
        
        // Clean up local file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Handle removed images
    if (req.body.removedImages) {
      const removed = Array.isArray(req.body.removedImages) 
        ? req.body.removedImages 
        : [req.body.removedImages];
      
      // Delete from Cloudinary
      for (const url of removed) {
        try {
          await deleteFromCloudinary(url);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
      
      // Remove from current images array
      updateData.image = currentImages.filter(img => !removed.includes(img));
    }

    // Add new images to the array
    if (newImages.length > 0) {
      updateData.image = [...(updateData.image || currentImages), ...newImages];
    }

    // If no image changes, keep existing images
    if (!updateData.image && !newImages.length) {
      updateData.image = currentImages;
    }

    const updatedWrap = await VehicleWrap.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: "Vehicle wrap updated successfully",
      data: updatedWrap
    });
  } catch (error) {
    console.error("Update vehicle wrap error:", error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(400).json({ message: error.message });
  }
};

export const deleteVehicleWrap = async (req, res) => {
  try {
    const deletedWrap = await VehicleWrap.findByIdAndDelete(req.params.id);
    
    if (!deletedWrap) {
      return res.status(404).json({ message: "Vehicle wrap not found" });
    }
    
    res.json({ message: "Vehicle wrap deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};