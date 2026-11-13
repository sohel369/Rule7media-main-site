import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats/:userId", getDashboardStats);

export default router;
