import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addFranchise,
  resetFranchise,
} from "../store/franchise/franchiseSlice";
import { toast } from "react-toastify";
import { CheckCircle } from "lucide-react";

const FranchiseForm = ({
  formType = "franchisefaq",
  title = "Ready to Explore Rule 7 Media Franchising?",
  subtitle = "Fill out the form below and our team will send you more information.",
}) => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.franchise);

  const [showThankYou, setShowThankYou] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    state: "",
    territories: "",
    formType: formType,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addFranchise(formData));
  };

  useEffect(() => {
    if (success) {
      setShowThankYou(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        state: "",
        territories: "",
        formType: formType,
      });
      dispatch(resetFranchise());
      toast.success("Form submitted successfully!");
    }

    if (error) {
      toast.error(error);
      dispatch(resetFranchise());
    }
  }, [success, error, dispatch, formType]);

  return (
    <>
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-[40px] p-10 md:p-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-200 leading-tight">
          {title}
        </h2>

        <p className="text-slate-400 text-center mb-12 text-base md:text-lg leading-relaxed max-w-[520px] mx-auto">
          {subtitle}
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Country of Residence
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder="e.g. Australia"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              State or Area of Interest
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="e.g. Queensland, Gold Coast"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Single or Multiple Territories?
            </label>
            <select
              name="territories"
              value={formData.territories}
              onChange={handleChange}
              required
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-rose-500 focus:outline-none text-slate-100"
            >
              <option value="" className="bg-white/5 text-black">Select option...</option>
              <option value="Single" className="bg-white/5 text-black">Single Territory</option>
              <option value="Multiple" className="bg-white/5 text-black">Multiple Territories</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-rose-600 to-rose-900 py-5 rounded-2xl font-bold text-xl text-white hover:shadow-[0_0_40px_rgba(225,29,72,0.25)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
          >
            {loading ? "Sending..." : "Send me More Information"}
          </button>
        </form>
      </div>

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 max-w-md w-full rounded-3xl p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              Thank You for Your Enquiry
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Due to the high volume of enquiries please allow us up to 48 hours
              to respond. If you have not received a response in 48 hours please
              check your Spam or Junk Mail, or in the event of input error
              please email{" "}
              <a
                href="mailto:Franchiseallocations@rule7media.com"
                className="text-rose-400 underline"
              >
                Franchiseallocations@rule7media.com
              </a>
              .
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FranchiseForm;
