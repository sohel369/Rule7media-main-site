import express from "express";
import { getAllCommissions, updatesubscritpionCommission } from "../controllers/commission.controller.js";

const router = express.Router();

router.get("/", getAllCommissions);

router.put("/:planDuration", updatesubscritpionCommission);

export default router;
