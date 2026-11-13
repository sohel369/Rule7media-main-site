import mongoose from "mongoose";
const ExecutiveSchema = new mongoose.Schema({
    name: String,
    position: String,
    photoUrl: { type: String, required: true },
    bio: String,
  }, { timestamps: true });
  
  export default  mongoose.model('Executive', ExecutiveSchema);