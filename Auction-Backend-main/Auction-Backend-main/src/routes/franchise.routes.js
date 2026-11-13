import express from "express";
import {
  submitFranchise,
  getFranchises,
  deleteFranchise,
  createSecureSpot,
  updateFranchiseStatus,
  sendManualEmail
} from "../controllers/franchise.controller.js";

const router = express.Router();
import {
  verifyAdmin,
} from "../middlewares/auth.middleware.js";
router.route("/add-franchise").post(submitFranchise);
router.route("/send-email").post(sendManualEmail);
router.route("/").get( getFranchises);
router.post("/secure-spot", createSecureSpot);

router.patch("/:id/status", updateFranchiseStatus);

router.route("/:id").delete( deleteFranchise);
export default router;
