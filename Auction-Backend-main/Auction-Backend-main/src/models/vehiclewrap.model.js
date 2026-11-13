
import mongoose from "mongoose";

const vehicleWrapSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  image: {
    type: [String],
    required: true,
    validate: {
      validator: function(array) {
        return array.length > 0;
      },
      message: "At least one image is required"
    }
  },
  vehicleType: {  
    type: String,
    required: true
  },

}, { 
  timestamps: true
});

const VehicleWrap = mongoose.model("VehicleWrap", vehicleWrapSchema);
export default VehicleWrap;