import express from 'express';
import { createPricingPlan, getPricingPlans, updatePricingPlan, deletePricingPlan } from '../controllers/pricingPlan.controller.js';

const router = express.Router();

router.post('/create', createPricingPlan);
router.get('/', getPricingPlans);
router.put('/updateplane/:id', updatePricingPlan);
router.delete('/deleteplane/:id', deletePricingPlan);

export default router;