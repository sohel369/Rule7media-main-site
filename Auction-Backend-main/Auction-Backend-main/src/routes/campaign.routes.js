// routes/campaignRoutes.js
import express from "express";
import { Router } from "express";
import {
  createCampaign,
  getActiveCampaigns,
  trackClick,
  trackImpression,
  getCampaignsbyuser,
   getCampaignById, 
  updateCampaign,
  deleteCampaign,
  searchCampaigns
} from "../controllers/campaign.controller.js";
import {verifyUser, } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/").get( getActiveCampaigns);
router.route("/create").post(verifyUser, upload.array('images', 3), createCampaign);

router.route("/my-campaigns").get( verifyUser, getCampaignsbyuser);
router.route("/search").post(verifyUser, searchCampaigns);
router.route("/:id/click").get( trackClick);
router.route("/:id/impression").get(trackImpression);
router.route("/:id").get(getCampaignById);
router.route("/:id").put(verifyUser, upload.array('images', 3), updateCampaign);
router.route("/:id").delete(verifyUser, deleteCampaign);

export default router;
