import { Router } from "express";
import {  verifyUser, } from "../middlewares/auth.middleware.js";
import {getCartItems , deleteCartItem,addToCart,clearCart,getWinningBid } from "../controllers/cart.controller.js";



const router = Router();




router.route("/").get(verifyUser,getCartItems);
// router.route("/removecart/:auctionId").delete(verifyUser, removeAuctionFromCart);
router.route("/winning-bid/:userId").get(verifyUser,getWinningBid);
router.post("/add", verifyUser, addToCart);
router.delete("/clear",verifyUser, clearCart);
router.route("/:id").delete(verifyUser, deleteCartItem)



export default router;
