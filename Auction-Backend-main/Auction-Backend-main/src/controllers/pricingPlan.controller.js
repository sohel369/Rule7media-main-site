import PricingPlan from '../models/pricingPlan.model.js';

export const createPricingPlan = async (req, res) => {
  try {
    const plan = new PricingPlan(req.body);
    await plan.save();
    res.status(201).json(plan); 
  } catch (error) {
    console.error("Error saving plan:", error);
    res.status(500).json({ message: 'Error saving plan', error: error.message });
  }
};

export const getPricingPlans = async (req, res) => {
  try {
    const plans = await PricingPlan.find();
    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

export const updatePricingPlan = async (req, res) => {
  try {
    const plan = await PricingPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.status(200).json(plan);
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
};

export const deletePricingPlan = async (req, res) => {
  try {
    const plan = await PricingPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json({ message: 'Plan deleted successfully', id: req.params.id });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
};