// models/adGif.model.js
import mongoose from "mongoose";

const adGifSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  gifs: [{ type: String }], // Cloudinary URLs
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },


  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 }, 
  views: { type: Number, default: 0 }, 


  isPublic: { type: Boolean, default: true }, 

  createdAt: { type: Date, default: Date.now },
});

adGifSchema.virtual("ctrPercentage").get(function () {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

const AdGif = mongoose.model("AdGif", adGifSchema);
export default AdGif;