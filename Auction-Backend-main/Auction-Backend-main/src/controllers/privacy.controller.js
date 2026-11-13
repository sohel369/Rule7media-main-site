// import Privacy  from"../models/privacy.model.js";

// export const getPrivacyPolicy = async (req, res) => {
//   try {
//     let policy = await Privacy.findOne();
//     if (!policy) {
//       policy = new Privacy({ content: "" });
//       await policy.save();
//     }
//     res.status(200).json({ content: policy.content });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to load privacy policy." });
//   }
// };

// // POST controller
// export const updatePrivacyPolicy = async (req, res) => {
//     try {
//       const { content } = req.body;
//       let policy = await Privacy.findOne();
//       if (policy) {
//         policy.content = content;
//         await policy.save();
//       } else {
//         policy = new Privacy({ content });
//         await policy.save();
//       }
//       res.status(200).json({ success: true, policy });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to update privacy policy." });
//     }
//   };
  

// export const addPrivacyPolicy = async (req, res) => {
//     try {
//       const { content } = req.body;
//       const newPolicy = new Privacy({ content });
//       await newPolicy.save();
//       res.status(201).json({ success: true, policy: newPolicy });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to add privacy policy." });
//     }
//   };



import Privacy from "../models/privacy.model.js";

const validCountries = ["US", "CA", "AU", "CN", "JP", "IN", "TH", "ID", "ES", "FR", "GB"];

// GET controller: Fetch all policies
export const getPrivacyPolicy = async (req, res) => {
  try {
    let policy = await Privacy.findOne();
    if (!policy) {
      policy = new Privacy({ policies: new Map() });
      await policy.save();
    }
    res.status(200).json({ policies: Object.fromEntries(policy.policies) });
  } catch (err) {
    console.error("Error fetching policies:", err);
    res.status(500).json({ error: "Failed to load privacy policies" });
  }
};

// POST controller: Update or add policy for a specific country
export const updatePrivacyPolicy = async (req, res) => {
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

    let policy = await Privacy.findOne();
    if (!policy) {
      policy = new Privacy({ policies: new Map() });
    }

    policy.policies.set(country, content);
    await policy.save();

    res.status(200).json({ 
      success: true,
      policies: Object.fromEntries(policy.policies),
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
// POST controller: Add policy (same as update)
export const addPrivacyPolicy = async (req, res) => {
  try {
    const { country, content } = req.body;
    if (!country || !content) {
      return res.status(400).json({ error: "Country and content are required" });
    }
    if (!validCountries.includes(country)) {
      return res.status(400).json({ error: "Invalid country code" });
    }
    let policy = await Privacy.findOne();
    if (!policy) {
      policy = new Privacy({ policies: new Map() });
    }
    if (policy.policies.has(country)) {
      return res.status(400).json({ error: "Policy for this country already exists" });
    }
    policy.policies.set(country, content);
    await policy.save();
    res.status(200).json({ success: true, policies: Object.fromEntries(policy.policies) });
  } catch (err) {
    console.error("Error adding policy:", err);
    res.status(500).json({ error: "Failed to add privacy policy" });
  }
};