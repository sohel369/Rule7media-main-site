import express from "express";
import {
  downloadMediaKit,
  getAvailableKits,
  uploadActiveKit,
  getAdminLanguageKits,
  getActiveKit,
  getAllDownloads,
  deleteDownload,
  deleteLanguageKit,
  deleteActiveKit,
  getKitHistory,
  streamMediaKitFile,
} from "../controllers/mediaLead.controller.js";
import { uploadPdf } from "../middlewares/multer.middleware.js";

const router = express.Router();

// ─── Public routes ──────────────────────────────────────────────────────────
router.get("/available-kits", getAvailableKits);
router.post("/download", downloadMediaKit);
router.get("/file/:filename", streamMediaKitFile);

// ─── Admin routes ───────────────────────────────────────────────────────────
router.get("/admin/language-kits", getAdminLanguageKits);
router.get("/admin/active-kit", getActiveKit);
router.get("/admin/kit-history", getKitHistory);
router.post("/admin/upload-kit", uploadPdf.single("pdf"), uploadActiveKit);
router.delete("/admin/kit/:language", deleteLanguageKit);
router.get("/admin/downloads", getAllDownloads);
router.delete("/admin/downloads/:id", deleteDownload);
router.delete("/admin/active-kit", deleteActiveKit);

export default router;