import express from "express";

import {
  notifyAdmin,
  subscriptionCheckout,
  getSubscriptionStatus,
  getSubscriptionPlanes,
  checkSubscriptionStatus,
  verifySession,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { checkSubscriptionsCron } from "../cronJobs.js";
const router = express.Router();
router.route("/notify-admin").post(notifyAdmin);
router.route("/verify-session/:sessionId").get(verifyUser, verifySession);
router.route("/status").post(verifyUser, getSubscriptionStatus);
router.route("/check-subscription").get(verifyUser, checkSubscriptionStatus);
router.route("/products").get(verifyUser, getSubscriptionPlanes);
router.route("/subscription-checkout").post(verifyUser, subscriptionCheckout);
router.route("/cancel-subscription").post(verifyUser, cancelSubscription);

router.post("/trigger-cron", async (req, res) => {
  await checkSubscriptionsCron();
  res
    .status(200)
    .json({ success: true, message: "Cron job triggered manually" });
});
export default router;
