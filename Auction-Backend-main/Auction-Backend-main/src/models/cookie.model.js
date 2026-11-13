import mongoose from "mongoose";

const cookieSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Cookie = mongoose.model("Cookie", cookieSchema);
export default Cookie;
