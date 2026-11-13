import express from "express";
import {
  createBudgetRequest,
  fetchBudgetRequestsForFleetOwner,
  sendFleetRecommendation,
  fetchFleetRecommendedAuctions,
  getalluserRecomendatinfleetauction,
  getfleetauctionbyid,
  getAdminBudgetRequests,
  adminManageBudgetRequest,
} from "../controllers/fleetbudgetrequest.controller.js";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
const router = express.Router();
router.get(
  "/admin/budget-requests",
  getAdminBudgetRequests
);

router.post(
  "/admin/budget-requests/:budgetRequestId",
  adminManageBudgetRequest
);
router.post("/budget-requests", createBudgetRequest);
router.route("/fleetRecomendation").post(sendFleetRecommendation);
router
  .route("/getfleetauction/:fleetOwnerId")
  .get(fetchFleetRecommendedAuctions);
router.get(
  "/fleetbudgetrequest/:fleetOwnerId",
  fetchBudgetRequestsForFleetOwner
);
router.get("/fleetrecomendation/:userId", getalluserRecomendatinfleetauction);
router.get("/getfleetauctionby/:id", getfleetauctionbyid);
export default router;
