import express from 'express';
import {
  submitEnquiry,
  getAllEnquiries,
  updateEnquiryStatus,
  getEnquiryById
} from '../controllers/enquiry.controller.js';

const router = express.Router();

router.route('/enquiry').post(submitEnquiry);

// Admin routes
router.route('/all').get(getAllEnquiries);
router.route('/:id').get(getEnquiryById).put(updateEnquiryStatus);

export default router;