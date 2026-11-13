import express from "express";
import {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
  getOrderSummary,
  downloadInvoice,
  counttotalqunaty,
  placeAuctionOrder,
  getOrdersForSellerProducts, 
  getSellerOrderSummary,
  getOrderSummaryForSeller,
  getBuyerProfileStatus,
  adminUpdateOrderStatus,
  getWrapTypesSoldByFleetAuctionId,
  getfleetOrderSummary
} from "../controllers/orderController.js";
import { verifySellerOrFleetOwner, verifyUser,verifySeller, } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route('/orders/summary/:sellerId').get(verifySeller, getSellerOrderSummary);
router.route("/orders-summary", getOrderSummary).get(getOrderSummary);;
router.route("/:id").get(getOrderById);
router.route("/wrap-types/:fleetAuctionId").get(verifyUser, getWrapTypesSoldByFleetAuctionId);
router.route("/").post( placeOrder);
router.route("/auction").post( placeAuctionOrder);
router.route("/").get(getAllOrders);
router.route("/soldquantity/:productId").get(verifyUser, counttotalqunaty);
router.route("/user/:userId").get(verifyUser, getOrdersByUser);
router.route("/download-invoice/:orderId").get(verifyUser,downloadInvoice);
router.route("/:id").put(verifyUser, verifySellerOrFleetOwner, updateOrderStatus);
router.put("/status/:id", adminUpdateOrderStatus);
router.route("/fleet-orders-summary/:fleetownerId").get(getfleetOrderSummary);
router.route("/:id").delete(deleteOrder);
//////sellerorder routes
router.route('/Order/:userId').get(verifyUser, getOrdersForSellerProducts);
router.route('/summary/:sellerId').get( getOrderSummaryForSeller);
///////buyer order 
router.route('/stats/:userId').get(verifyUser, getBuyerProfileStatus);
export default router;
