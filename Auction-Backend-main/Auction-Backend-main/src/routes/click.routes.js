import express from 'express';
import { 
  trackClick, 
  getAdminCTR,
  getAdvertiserCTR
} from '../controllers/click.controller.js';

const router = express.Router();

router.post('/track-click', trackClick);
router.get('/ctr', getAdminCTR);
router.get('/advertiser/:advertiserId', getAdvertiserCTR);

export default router;