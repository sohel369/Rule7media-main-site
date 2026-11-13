import mongoose from 'mongoose';

const statisticSchema = new mongoose.Schema({
  sources: [{
  url: [{ type: String }],
    description: { type: String, required: true },
    type: { type: String, enum: ['external', 'uploaded', 'text'], required: true },
    language: { 
      type: String, 
    enum: [  'en',    
        'fr',    
        'es',   
        'zh',    
        'ja',    
        'th',   
        'id',    
        'hi',    
        'de',    
        'it',   
        'pt',    
        'vi',    
        'fil'   
        ],
      required: true,
      default: 'en'
    }
  }],
  videoType: {
    type: String,
    enum: ['wrapper', 'cpm', 'global', "buyerMarket",
  "pricingMethodology",
  "howItWork", "franchiseFaq",
  "fleetOwner"],
    required: true,
  },
}, { timestamps: true });

const Statistic = mongoose.model('Statistic', statisticSchema);

export default Statistic;