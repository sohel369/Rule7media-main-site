import CpmComparison from "../models/CpmComparison.model.js";

// Create
export const createCpmComparison = async (req, res) => {
  try {
    const newEntry = await CpmComparison.create(req.body);
    res.status(201).json({ success: true, data: newEntry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Read (all)
export const getAllCpmComparisons = async (req, res) => {
  try {
    const { pageType } = req.query;
    const query = {};
    
    if (pageType && pageType !== "all") {
      query.pageType = pageType;
    }
    
    const entries = await CpmComparison.find(query);
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get by page type
export const getCpmByPageType = async (req, res) => {
  try {
    const { pageType } = req.params;
    const entries = await CpmComparison.find({ pageType, isActive: true });
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Read (single)
export const getCpmComparisonById = async (req, res) => {
  try {
    const entry = await CpmComparison.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
export const updateCpmComparison = async (req, res) => {
  try {
    const updated = await CpmComparison.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
export const deleteCpmComparison = async (req, res) => {
  try {
    const deleted = await CpmComparison.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
