import express from 'express';
const router = express.Router();

import {getSellersByZip , getAuctionsByZip,placeBid,updatePreferences } from "../controllers/buyer.controller.js";
router.get('/sellers/:zipCode', getSellersByZip);

router.get('/auctions/:zipCode',getAuctionsByZip);

router.post('/bid', placeBid);

router.put('/preferences', updatePreferences);

export default router;
