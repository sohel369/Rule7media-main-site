import mongoose from "mongoose";
const DimensionsSchema = new mongoose.Schema(
  {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    wheelbase: { type: Number, default: 0 },
    curbWeight: { type: String, default: 0 },
    engineSize: { type: String, default: "" },
    cabwidth: { type: Number, default: 0 },
    cabheight: { type: Number, default: 0 },
    bonnetwidth: { type: Number, default: 0 },
    bonnetLength: { type: Number, default: 0 },
  },
  { _id: false }
);
const vehicleSchema = new mongoose.Schema(
  {
    country: { type: String,},
    vehicle: { type: String, required: true },
    yearOfManufacture: { type: Number, required: true },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    dailyMileage: {
    type: Number,
    //required: true,
    min: 0
  },
    registrationPlate: { 
      type: String, 
      //required: true,     
      unique: true,       
      trim: true,
      uppercase: true
    },
    dimensions: { type: DimensionsSchema, required: true },
    images: [{ type: String }],
    isApproved: { type: Boolean, default: false }, // Tracks approval status
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
