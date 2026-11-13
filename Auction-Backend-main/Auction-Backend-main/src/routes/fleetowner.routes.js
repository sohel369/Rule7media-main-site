import express from "express";
import {
  createFleetOwnerForm,
  getallfleetauction,
  getfleetauctionbyid,
  getAuctionsByFleetOwner,
  getVehicalAvalibality,
  approveFleetAuction,
  deleteSingleFleetAuctionById,
  getTopFleetAuctions,
  getFleetCPMComparison,
  rejectFleetAuction,
  searchFleetAuction,
  updateFleetAuction
} from "../controllers/fleetOwner.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyFleetOwner,
  verifyUser,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";
const router = express.Router();

router
  .route("/addfleetdata")
  .post(upload.array("images", 10), createFleetOwnerForm);
router.route("/").get(getallfleetauction);
router.route("/topfleetauction").get(getTopFleetAuctions);
router.route("/campaigns/search").post(verifyUser, searchFleetAuction);
router.route("/:fleetOwnerId").get(getAuctionsByFleetOwner);
router
  .route("/edit-fleet-auction/:id")
  .put(verifyUser, verifyFleetOwner, upload.array("images", 10), updateFleetAuction);
router.route("/:id").get(getFleetCPMComparison);
router.route("/getfleetauctionby/:id").get(getfleetauctionbyid);
router.route("/owner/:ownerId").get(getVehicalAvalibality);
router.route("/approve-auction/:auctionId").put(approveFleetAuction);
router.route("/reject-auction/:auctionId").put(rejectFleetAuction);
router.route("/delete/:id").delete(verifyUser, deleteSingleFleetAuctionById);
export default router;
