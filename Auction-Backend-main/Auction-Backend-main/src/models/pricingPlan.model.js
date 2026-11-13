import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  badge: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  plan: {
    type: String,
    required: true
  },
  priceId: {
    type: String,
    required: true
  },
  campaignId: { type: String, required: true },
  features: {
    type: [String], 
    default: []
  },
}, { timestamps: true }); 

const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

export default PricingPlan;
