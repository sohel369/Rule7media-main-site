import express from "express";
import {
  createVehicleWrap,
  getVehicleWraps,
  getVehicleWrapById,
  updateVehicleWrap,
  deleteVehicleWrap,
} from "../controllers/vehicleWrap.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", upload.array("image", 8), createVehicleWrap);
router.route("/").get(getVehicleWraps);

router.route("/:id").get(getVehicleWrapById);

router.put("/:id", upload.array("image", 8),updateVehicleWrap);

router.route("/:id").delete(deleteVehicleWrap);

export default router;
