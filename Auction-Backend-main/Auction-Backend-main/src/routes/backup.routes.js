import express from "express";
import {
  getBackupList,
  getBackupStats,
  triggerManualBackup,
  deleteBackup,
  restoreBackup,
  cleanupOldBackups,
} from "../controllers/backup.controller.js";

const router = express.Router();

// GET routes
router.get("/list", getBackupList);
router.get("/stats", getBackupStats);

// POST routes
router.post("/trigger", triggerManualBackup);
router.post("/restore/:backupName", restoreBackup);
router.post("/cleanup-old", cleanupOldBackups);

// DELETE routes
router.delete("/:backupName", deleteBackup);

export default router;