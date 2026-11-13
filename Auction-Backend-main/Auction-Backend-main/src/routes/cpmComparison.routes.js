import express from "express";
import {
  createCpmComparison,
  getAllCpmComparisons,
  getCpmComparisonById,
  getCpmByPageType,
  updateCpmComparison,
  deleteCpmComparison
} from "../controllers/CpmComparison.controller.js";

const router = express.Router();

router.post("/", createCpmComparison);
router.get("/", getAllCpmComparisons);
router.get("/page/:pageType", getCpmByPageType);
router.get("/:id", getCpmComparisonById);
router.put("/:id", updateCpmComparison);
router.delete("/:id", deleteCpmComparison);

export default router;
