import mongoose from 'mongoose';

const EnquirySchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  company: { type: String, required: true },
  industry: { type: String, required: true },
  email: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Enquiry', EnquirySchema);