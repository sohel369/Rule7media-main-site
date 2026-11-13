import express,{ Router } from "express";

import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
import { addPaymentMethodToCustomer,updateBillingAddress,addPaymentMethod,deletePaymentMethod,getAllPaymentMethods,
  setDefaultPaymentMethod,updatePaymentMethod,getPaymentMethod, paymentCheckout,createOrderCheckoutSession,confirmOrderAfterStripePayment,getSessionInfo,processAuctionPayment,createAuctionCheckoutSession,createFleetCheckoutSession} from "../controllers/payment.controller.js";


const router = Router();

router.route("/checkout").post(verifyUser, paymentCheckout)
router.route('/get-all-payment-methods').get(verifyUser, getAllPaymentMethods); 
router.route('/get-payment-method').get(verifyUser, getPaymentMethod)
router.route('/add-payment-method').post(verifyUser, addPaymentMethod);
router.route('/set-default-payment-method').post(verifyUser, setDefaultPaymentMethod);
router.route('/update-billing-address').post(verifyUser, updateBillingAddress);
router.route('/delete-payment-method').delete(verifyUser, deletePaymentMethod);
router.route("/update-payment-method").post(verifyUser, updatePaymentMethod);
router.route("/add-payment-method").post(verifyUser, addPaymentMethodToCustomer );
router.post("/create-checkout-session", verifyUser, createOrderCheckoutSession);
router.post("/confirm",verifyUser, confirmOrderAfterStripePayment);
router.get('/session-info', verifyUser, getSessionInfo);
// router.post('/confirm-auction-payment', verifyUser, confirmAuctionPayment);
router.post('/process-auction-payment', verifyUser, processAuctionPayment);
router.post('/create-auction-checkout-session', verifyUser, createAuctionCheckoutSession);
router.post('/create-fleet-checkout-session', verifyUser, createFleetCheckoutSession);
export default router;
