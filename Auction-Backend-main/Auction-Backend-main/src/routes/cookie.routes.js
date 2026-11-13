import express from "express";
import {
  getCookie,
  updateCookie,
  addCookie
} from "../controllers/cookie.controller.js";
import { verifyAdmin,  } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", getCookie); 
router.post("/add", addCookie); 
router.post("/", updateCookie); 

export default router;
