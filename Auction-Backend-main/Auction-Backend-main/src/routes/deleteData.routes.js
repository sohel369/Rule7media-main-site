// routes/deleteData.routes.js
import express from 'express';
import {
    sendDeletionOTP,
    resendDeletionOTP,
    verifyDeletionOTP,
    deleteAllData,
    checkDeletionStatus
} from '../controllers/deleteData.controller.js';

const router = express.Router();

// Routes (No admin authentication required)
router.post('/send-otp', sendDeletionOTP);
router.post('/resend-otp', resendDeletionOTP);
router.post('/verify-otp', verifyDeletionOTP);
router.post('/delete-all', deleteAllData);
router.get('/status', checkDeletionStatus);

export default router;