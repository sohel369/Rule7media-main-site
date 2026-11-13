import Cookie from "../models/cookie.model.js";

// GET controller
export const getCookie = async (req, res) => {
  try {
    let terms = await Cookie.findOne();
    if (!terms) {
      terms = new Cookie({ content: "" });
      await terms.save();
    }
    res.status(200).json({ content: terms.content });
  } catch (err) {
    res.status(500).json({ error: "Failed to load terms and conditions." });
  }
};

// POST controller (update)
export const updateCookie = async (req, res) => {
  try {
    const { content } = req.body;
    let cookie = await Cookie.findOne();
    if (cookie) {
      cookie.content = content; // Fixed typo (was terms.content)
      await cookie.save();
    } else {
      cookie = new Cookie({ content });
      await cookie.save();
    }
    res.status(200).json({ success: true, cookie });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cookie." });
  }
};

// POST controller (add new)
export const addCookie = async (req, res) => {
  try {
    const { content } = req.body;
    const newCookie = new Cookie({ content });
    await newCookie.save();
    res.status(201).json({ success: true, terms: newCookie });
  } catch (err) {
    res.status(500).json({ error: "Failed to add terms and conditions." });
  }
};
