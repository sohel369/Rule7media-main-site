// routes/mapRoutes.js

import express from "express";
import { getGoogleMapsApiKey } from'../controllers/googlemapapi.js';

const router = express.Router();

import {verifyUser} from "../middlewares/auth.middleware.js";


router.route('/').get(getGoogleMapsApiKey);

export default router;
