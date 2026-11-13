import mongoose from "mongoose";
// In your server.js file or wherever you set up your Mongoose connection

import "../models/bid.model.js";
import "../models/city.model.js";

const connectDB = async () => {
  try {
    const uri = (process.env.MONGODB_URI || "").trim();
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is missing or empty. Please set MONGODB_URI in Railway Variables.");
    }
    const connectionInstance = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected successfully! Host: ${connectionInstance.connection.host}`);
    return connectionInstance;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
