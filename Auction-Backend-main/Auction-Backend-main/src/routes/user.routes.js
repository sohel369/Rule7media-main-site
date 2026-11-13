import dotenv from "dotenv";
dotenv.config();
import { Router } from "express";
import {
  changeCurrentPassword,
  resetPassword,
  forgetPasswordSendEmail,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getTopSellers,
  getTopCities,
  forgetPassword,
  getAllAdmin,
  getSellersForUser,
  getonboardlink,
  checkSellerVerification,
  generateOnboardingLink,
  getPayoutMethods,
  verifiystripaccount,
  generateUpdateLink,
  getSellerPayouts,
  saveFCMToken
} from "../controllers/user.controller.js";
import {
  verifyAdmin,
  verifyUser,
  verifyOtp,
 
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/getAllAdmin").get(getAllAdmin);
router.post('/save-fcm-token', saveFCMToken);

router.route("/payouts/:sellerId").get(getSellerPayouts);
router.route("/get-seller-onboarding/:sellerId").get(getonboardlink);
router
  .route("/check-seller-verification/:sellerId")
  .get(checkSellerVerification);
router
  .route("/generate-onboarding-link/:sellerId")
  .post(generateOnboardingLink);
router.route("/:accountId/payout-method").get(getPayoutMethods);
router.route("/stripe-account-status/:accountId").get(verifiystripaccount);
router.route("/generate-update-link/:sellerId").post(generateUpdateLink);
router.route("/return").get((req, res) => {
  res.redirect(
    `${process.env.FRONTEND_URL}/user-profile/SellerOnboarding?redirect_from=stripe&status=success`
  );
});

router.route("/reauth").get((req, res) => {
  res.redirect(
    `${process.env.FRONTEND_URL}/user-profile/SellerOnboarding?redirect_from=stripe&status=reauth`
  );
});
// router.route('/stripe/reauth').get(stripeReturn)
// router.route('/stripe/return').get(stripeReauth)

router.route("/getSaller/:id").get(async (req, res) => {
  try {
    const sellers = await getSellersForUser(req.params.id);
    res.json(sellers);
  } catch (error) {
    console.error("Error in route handler:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.post("/verify-otp", verifyOtp);

router.route("/forgot-password").post(forgetPasswordSendEmail);
router.post("/forgotpassword", forgetPassword);
router.route("/reset-password/:userId/:token").post(resetPassword);

router.route("/logout").post( logoutUser);
router.route("/current-user").get(verifyUser, getCurrentUser);
router.route("/change-password").put(verifyUser, changeCurrentPassword);
router
  .route("/update-user-profile")
  .put(verifyUser, upload.single("profilePicture"), updateUserProfile);

router.route("/top-cities").get(verifyAdmin, getTopCities);

router.route("/top-sellers").get(getTopSellers);
router.route("/:id").delete(verifyUser, verifyAdmin, deleteUserById);
router
  .route("/update-user/:id")
  .put(
    verifyUser,
    verifyAdmin,
    upload.single("profilePicture"),
    updateUserById
  );
router.route("/:userid").get(verifyUser, verifyAdmin, getUserById);
router.route("/").get(getAllUsers);

export default router;
