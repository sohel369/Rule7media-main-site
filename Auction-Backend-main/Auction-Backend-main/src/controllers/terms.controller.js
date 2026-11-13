import Terms from "../models/terms.model.js";
const validCountries = ["US", "CA", "AU", "CN", "JP", "IN", "TH", "ID", "ES", "FR", "GB"];
// GET controller
export const getTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    if (!terms) {
      terms = new Terms({ content: "" });
      await terms.save();
    }
    res.status(200).json({ terms: Object.fromEntries(terms.terms) });
  } catch (err) {
    res.status(500).json({ error: "Failed to load terms and conditions." });
  }
};

// POST controller (update)
export const updateTerms = async (req, res) => {
  try {
    const { country, content } = req.body;
    if (!country || !content) {
      return res.status(400).json({ 
        success: false,
        error: "Country and content are required",
        message: "Country and content are required"
      });
    }
      if (!validCountries.includes(country)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid country code",
        message: "Invalid country code provided"
      });
    }
    let terms = await Terms.findOne();
    if (!terms) {
      terms = new Privacy({ terms: new Map() });
    }
     terms.terms.set(country, content);
    await terms.save();
    res.status(200).json({ 
      success: true,
      terms: Object.fromEntries(terms.terms),
      message: "Policy updated successfully"
    });
  } catch (err) {
    console.error("Error updating policy:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to update privacy policy",
      message: "Server error while updating policy"
    });
  }
};

// POST controller (add new)
export const addTerms = async (req, res) => {
  try {
    const { content } = req.body;
    const newTerms = new Terms({ content });
    await newTerms.save();
    res.status(201).json({ success: true, terms: newTerms });
  } catch (err) {
    res.status(500).json({ error: "Failed to add terms and conditions." });
  }
};
