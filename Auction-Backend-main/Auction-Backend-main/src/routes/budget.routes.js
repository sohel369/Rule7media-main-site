import express  from "express";
import { Router } from "express";
import { verifyAdmin, verifyUser,verifySeller,verifyBuyer } from "../middlewares/auth.middleware.js";

import {
  createBudget,
sendRecommendation,
  getBudgetRequestsBySellerId,
  fetchRecommendedAuctions,
  getBuyerRecommendations,
  getSingleBudgetRequest 
}  from "../controllers/budget.Controller.js";

const router = Router();

router.route("/add").post(verifyUser,createBudget);
router.route('/recommendations').post(sendRecommendation);
router.route("/seller/:sellerId").get(getBudgetRequestsBySellerId);
router.route("/buyer/:buyerId").get(getBuyerRecommendations);
router.route("/:id").get(getSingleBudgetRequest);

router.route("/auctionbudget/:sellerId").get(fetchRecommendedAuctions);


export default router;




