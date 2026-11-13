import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  filterProducts,
  getAllPro,
  getProductsBySeller
} from "../controllers/product.controller.js"; 
import { verifyUser, verifySeller, verifyAdmin } from "../middlewares/auth.middleware.js";


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });
const router = express.Router();

// Routes for Products
router.post("/",verifyUser,verifySeller, upload.array('images'), createProduct);  
router.get("/",getAllProducts); 
router.get("/seller/:UserId",verifyUser,verifySeller,getProductsBySeller);

///admin page product routes
router.get("/getAllPRO", getAllPro); 

router.get("/:id", getProductById); 
router.put("/:id", verifyUser, verifySeller, updateProduct); 
router.delete("/:id", verifyUser, verifySeller, deleteProduct); 
router.post("/filter", verifyUser, filterProducts);

export default router;
