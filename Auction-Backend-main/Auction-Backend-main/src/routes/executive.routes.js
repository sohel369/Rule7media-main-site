import express from "express";
import {  createExecutive,
    getExecutives,
    getExecutiveById,
    updateExecutive,
    deleteExecutive, } from "../controllers/executive.controller.js"; 
    import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

// POST /api/executives
router.post("/executive",upload.single("photo"), createExecutive);
router.get("/", getExecutives);
router.get("/executive/:id", getExecutiveById);
router.put("/executive/:id",upload.single("photo"), updateExecutive);
router.delete("/executive/:id", deleteExecutive);
export default router;
