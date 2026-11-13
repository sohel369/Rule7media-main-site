import mongoose from "mongoose";
// In your server.js file or wherever you set up your Mongoose connection

import "../models/bid.model.js";
import "../models/city.model.js";

const connectDB = async () => {
  try {
     
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );

  } catch (error) {
    console.error("err", error);

    throw error;
  }
};

export default connectDB;
