import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "../models/bid.model.js";
import "../models/city.model.js";
import { User } from "../models/user.model.js";

const connectDB = async () => {
  try {
    let uri = (process.env.MONGODB_URI || "").trim();
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is missing or empty. Please set MONGODB_URI in Railway Variables.");
    }

    const targetDb = process.env.DB_NAME || "Auction";
    const connectionInstance = await mongoose.connect(uri, {
      dbName: targetDb,
    });
    console.log(`✅ MongoDB Connected successfully! Host: ${connectionInstance.connection.host}, Database: ${connectionInstance.connection.db?.databaseName || targetDb}`);

    // Auto-seed or verify admin account: Admin@admin.com / Admin@1234
    try {
      const adminEmail = "Admin@admin.com";
      const existingAdmin = await User.findOne({
        email: { $regex: new RegExp(`^${adminEmail}$`, "i") }
      });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("Admin@1234", 10);
        await User.create({
          firstName: "Rule7",
          lastname: "Admin",
          email: adminEmail,
          password: hashedPassword,
          position: "Administrator",
          company: "Rule 7 Media",
          country: "Australia",
          userType: "admin",
          paymentVerified: true,
        });
        console.log("✅ Admin user (Admin@admin.com) auto-seeded in database!");
      } else if (existingAdmin.userType !== "admin") {
        existingAdmin.userType = "admin";
        await existingAdmin.save();
        console.log("✅ Admin user updated to admin role in database!");
      }
    } catch (seedErr) {
      console.warn("⚠️ Admin auto-seed check notice:", seedErr.message);
    }

    return connectionInstance;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export default connectDB;
