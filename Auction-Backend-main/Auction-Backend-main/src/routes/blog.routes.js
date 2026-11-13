import express from "express";
import {
  getBlogsByCountry,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin,
  getBlogById
} from "../controllers/blog.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public route - get blogs by country
router.get("/country/:country", getBlogsByCountry);
router.get("/:id", getBlogById);
// Admin routes
router.post("/admin", upload.single("image"), createBlog);
router.put("/admin/:id", upload.single("image"), updateBlog);
router.delete("/admin/:id", deleteBlog);
router.get("/admin/all", getAllBlogsAdmin);

export default router;