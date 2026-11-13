import Executive from "../models/executive.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createExecutive = async (req, res) => {
  try {
    const { name, position, bio } = req.body;
    if (!name || !position || !bio) {
      return res.status(400).json({ message: "Name, position, and bio are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Photo is required." });
    }
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

    if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
      return res.status(500).json({ message: "Failed to upload image to Cloudinary." });
    }

    // Get the secure URL from Cloudinary
    const photoUrl = cloudinaryResponse.secure_url;

    const newExecutive = new Executive({
      name,
      position,
      bio,
      photoUrl, 
    });

    const savedExecutive = await newExecutive.save();

    res.status(201).json({
      message: "Executive created successfully",
      executive: savedExecutive,
    });

  } catch (err) {
    console.error("Error creating executive:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getExecutives = async (req, res) => {
  try {
    const executives = await Executive.find().sort({ createdAt: -1 });
    res.status(200).json(executives);
  } catch (err) {
    console.error("Error fetching executives:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Single Executive
export const getExecutiveById = async (req, res) => {
  try {
    const executive = await Executive.findById(req.params.id);
    if (!executive) return res.status(404).json({ message: "Executive not found" });
    res.status(200).json(executive);
  } catch (err) {
    console.error("Error fetching executive:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Executive
export const updateExecutive = async (req, res) => {
  try {
    const { name, position, bio } = req.body;

    const executive = await Executive.findById(req.params.id);
    if (!executive) {
      return res.status(404).json({ message: "Executive not found" });
    }

    const updateData = {
      name: name?.trim() || executive.name,
      position: position?.trim() || executive.position,
      bio: bio?.trim() || executive.bio,
    };

    if (req.file) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);

      if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
        return res.status(500).json({ message: "Failed to upload new photo to Cloudinary." });
      }

      updateData.photoUrl = cloudinaryResponse.secure_url;
    }

    const updatedExecutive = await Executive.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Executive updated successfully",
      executive: updatedExecutive,
    });

  } catch (err) {
    console.error("Error updating executive:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Executive
export const deleteExecutive = async (req, res) => {
  try {
    const deletedExecutive = await Executive.findByIdAndDelete(req.params.id);
    if (!deletedExecutive) {
      return res.status(404).json({ message: "Executive not found" });
    }
    
    res.status(200).json({ message: "Executive deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("Error deleting executive:", err);
    res.status(500).json({ message: "Server Error" });
  }
};