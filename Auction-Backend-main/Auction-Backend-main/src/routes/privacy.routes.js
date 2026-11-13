
import express from "express";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
import {
  getPrivacyPolicy,
  updatePrivacyPolicy,
  addPrivacyPolicy
} from "../controllers/privacy.controller.js";

const router = express.Router();
router.get("/", getPrivacyPolicy);
router.post("/add",addPrivacyPolicy);
router.post("/", updatePrivacyPolicy);

export default router;





