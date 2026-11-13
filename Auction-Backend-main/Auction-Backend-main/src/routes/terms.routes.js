import express from "express";
import {
  getTerms,
  updateTerms,
  addTerms
} from "../controllers/terms.controller.js";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", getTerms); 
router.post("/add", addTerms); 
router.post("/", updateTerms); 

export default router;
