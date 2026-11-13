import { Router } from "express";
import { searchMarketplace } from "../controllers/search.controller.js";


const router = Router();


router.route("/").post(searchMarketplace);

export default router;