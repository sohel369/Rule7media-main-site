import { Router } from "express";
import { verifyAdmin, verifyUser,verifySeller } from "../middlewares/auth.middleware.js";
import { addCity, getAllCities ,deleteCity } from "../controllers/city.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

// router.route("/register").post(registerUser);



router.route("/").post(verifyUser,verifyAdmin, upload.none(), addCity );
router.route("/").get( getAllCities);
router.route("/:id").delete(verifyUser,verifyAdmin,deleteCity);



 upload.single("image")


export default router;
