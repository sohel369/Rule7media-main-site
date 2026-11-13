// routes/subscriptionPlanRoutes.js
import express from "express";
import {
  getSubscriptionPlansforusers,
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  upgradeSubscription
} from "../controllers/subscriptionPlan.controller.js";

const router = express.Router();import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
router.route("/upgrade").post(verifyUser, upgradeSubscription);
router.get("/",verifyUser,  getSubscriptionPlansforusers);           
router.get("/all", getAllSubscriptionPlans); 
router.post("/",  createSubscriptionPlan);
router.put("/:id",   updateSubscriptionPlan);
router.delete("/:id",   deleteSubscriptionPlan);

export default router;