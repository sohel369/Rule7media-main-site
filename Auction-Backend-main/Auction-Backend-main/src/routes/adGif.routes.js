// routes/addGif.routes.js
import { Router } from "express";
import {
  uploadAdGifs,
  getMyGifAds,
  updateGifAd,
  deleteGifAd,
  getAllGifAds,
  trackImpression,
  trackClick,
  getGifById
} from "../controllers/adGif.Controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(verifyUser, upload.array("gifs", 50), uploadAdGifs);

router.route("/",).get (verifyUser, getMyGifAds);
router.route("/public").get(getAllGifAds); 
router.route("/:id").put( verifyUser, upload.array("gifs", 50),updateGifAd);

router.route("/:id").delete( verifyUser, deleteGifAd);
router.route("/:id").get( getGifById);

router.route("/track/impression/:adId").post( trackImpression);
router.route("/track/click/:adId").post(trackClick);

export default router;