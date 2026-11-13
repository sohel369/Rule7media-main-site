import { Router } from "express";
import { 
        createAuction,
        getAllAuctions, 
        getSingleAuctionById,
        updateAuctionStatus,
        getBidsAuctionsByUser,
        getAuctionsByUser,
        deleteSingleAuctionById,
        updateSingleAuactionById,
        getAuctionWinner,
        getLiveAuctions,
        getUpcomingAuctions,
        updatePaymentStatus,
        getEndingAuctions,
        getAuctionsBySellerWithBids,
        getactiveauctinsellerid,
        createAuctionsFromCSV,
        getAllAuctionWinners,
        getAllAuctionsCombined,
        updateCampingAdminStatus
    } from "../controllers/auction.controller.js";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";




const router = Router();

// router.route("/register").post(registerUser);
router.route("/winners").get(getAllAuctionWinners);
router.route("/upcoming-auctions").get(getUpcomingAuctions);
router.route("/ending-auctions").get(getEndingAuctions);
router.route("/active-count/:sellerId").get(getactiveauctinsellerid);
router.route("/live-auctions").get(getLiveAuctions);
router.route("/:id/winner").get(getAuctionWinner);
router.route("/").post( getAllAuctions);
router.route("/combined").post(getAllAuctionsCombined);
router.route("/:id/status").post(updateAuctionStatus);
router.route("/update-payment-status/:id").put(updatePaymentStatus )
router.route("/user-bids").get(verifyUser, getBidsAuctionsByUser);
router.route("/delete/:id").delete(verifyUser, verifySeller, deleteSingleAuctionById);
router.route("/update/:id").put(verifyUser, verifySeller,upload.single("image") ,  updateSingleAuactionById)
router.route("/user-auctions").get(verifyUser, getAuctionsByUser);
router.route("/create-auction").post(verifyUser,verifySeller, upload.array('images', 3), createAuction);
router.route("/uploadcsv").post(verifyUser,verifySeller, createAuctionsFromCSV);
router.route("/:id").get(getSingleAuctionById);
router.get("/seller/:sellerId", getAuctionsBySellerWithBids);
router.route("/admin-delete/:id").delete(verifyUser, verifyAdmin, deleteSingleAuctionById);
router.route('/admin-status/:id').put( updateCampingAdminStatus);








export default router;
