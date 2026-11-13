import { Router } from "express";
import {
  getEmailSettings,
  createEmailSettings,
  updateEmailSettings,
} from "../controllers/emailSettings.controller.js";
import {
  verifyUser,
  verifyAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();


/**
 * GET  /api/v1/admin/email-settings
 * Returns the SMTP settings document with masked password.
 */
router.get("/email-settings", getEmailSettings);

/**
 * POST /api/v1/admin/email-settings
 * Creates the initial SMTP settings (only if none exist yet).
 */
router.post("/email-settings", createEmailSettings);

/**
 * PUT  /api/v1/admin/email-settings
 * Updates the existing SMTP settings.
 */
router.put("/email-settings", updateEmailSettings);

export default router;
