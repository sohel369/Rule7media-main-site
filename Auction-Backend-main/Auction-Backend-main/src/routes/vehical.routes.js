import express from "express";
import { addVehicle, getAllVehicles,getVehicalDetails,uploadVehicleCSV,updateVehicle,deleteVehicle,approveVehicle,getVehiclesByFleetOwner,createVehicleByFleetOwner,deleteVehicleByFleetOwner,updateVehicleByFleetOwner,uploadVehicleCSVByFleetOwner  } from "../controllers/vehicial.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();
router.post("/admin/vehicles",upload.array('images', 5), addVehicle);
router.get("/admin/vehicles", getAllVehicles);
router.get('/model-details/:vehicle', getVehicalDetails);
router.put("/admin/vehicles/:id",upload.array('images', 5), updateVehicle);
router.delete("/admin/vehicles/:id", deleteVehicle);

router.put("/admin/approve/:vehicleId", approveVehicle);

router.post("/upload", uploadVehicleCSV);


////fleetOwner

router.post("/fleetOwner/:fleetOwnerId",upload.array('images', 5),  createVehicleByFleetOwner);

// Get vehicles by fleet owner
router.get("/fleetOwner/:fleetOwnerId", getVehiclesByFleetOwner);

// Update vehicle
router.put("/fleetOwner/:id", updateVehicleByFleetOwner);

// Delete vehicle
router.delete("/fleetOwner/:id", deleteVehicleByFleetOwner);
//csv upload 
router.post('/fleetOwner/upload/:fleetOwnerId', uploadVehicleCSVByFleetOwner);

export default router;