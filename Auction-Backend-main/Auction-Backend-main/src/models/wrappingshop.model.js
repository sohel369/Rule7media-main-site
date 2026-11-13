import mongoose from "mongoose";

const wrappingShopSchema = new mongoose.Schema({
  company: { type: String, required: true },
  firstName: { type: String, required: true },
  lastname: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true },
  phoneCode: { type: String, required: true },
  phone: { type: String, required: true },
  street1: { type: String, required: true },
  street2: { type: String },
  suburb: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  website: { type: String },
  employees: { type: Number },
  designService: { type: String, enum: ["YES", "NO"] },
  fittingTime: {
    smallVan: {
      oneSide: String,
      twoSide: String,
      rear: String,
      fullWrap: String
    },
    mediumVan: {
      oneSide: String,
      twoSide: String,
      rear: String,
      fullWrap: String
    },
    largeVan: {
      oneSide: String,
      twoSide: String,
      rear: String,
      fullWrap: String
    },
    interCityTruck: {
      oneSide: String,
      twoSide: String,
      rear: String,
      fullWrap: String
    },
  },
  overnightFitting: { type: String, enum: ["YES", "NO"] }
});

export default mongoose.model("WrappingShop", wrappingShopSchema);
