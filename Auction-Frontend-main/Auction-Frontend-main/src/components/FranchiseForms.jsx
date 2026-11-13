import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Send } from "lucide-react";
import {
  addFranchise,
  resetFranchise,
} from "../store/franchise/franchiseSlice";

const FranchiseForms = ({ variant = "standard" }) => {
  const dispatch = useDispatch();
  const {
    loading: franchiseLoading,
    error: franchiseError,
    success,
  } = useSelector((state) => state.franchise);

  // To remember which variant was submitted last (for success toast)
  const lastVariantRef = useRef(variant);

  // Field configurations
  const fields =
    variant === "risk"
      ? {
          firstName: {
            id: "fname",
            label: "First Name",
            placeholder: "Alex",
            required: true,
          },
          lastName: {
            id: "lname",
            label: "Last Name",
            placeholder: "Sterling",
            required: true,
          },
          email: {
            id: "email",
            label: "Professional Email",
            placeholder: "alex@company.com",
            required: true,
          },
          extraField1: {
            id: "region",
            label: "Target Region",
            placeholder: "Greater Manchester, UK",
            required: true,
            type: "text",
          },
          extraField2: {
            id: "timeline",
            label: "Investment Timeline",
            type: "select",
            options: [
              {
                value: "Immediate (Next 30 days)",
                label: "Immediate (Next 30 days)",
              },
              { value: "Within 3 Months", label: "Within 3 Months" },
              { value: "General Research", label: "General Research" },
            ],
            required: true,
          },
        }
      : {
          firstName: {
            id: "firstName",
            label: "First Name",
            placeholder: "First Name",
            required: true,
          },
          lastName: {
            id: "lastName",
            label: "Last Name",
            placeholder: "Last Name",
            required: true,
          },
          email: {
            id: "email",
            label: "Professional Email",
            placeholder: "Email Address",
            required: true,
          },
          territory: {
            id: "territory",
            label: "Desired Territory",
            placeholder: "Desired Territory",
            required: true,
            type: "text",
          },
          background: {
            id: "background",
            label: "Background / Business Experience",
            placeholder: "Tell us about your background...",
            type: "textarea",
            rows: 3,
            required: true,
          },
        };

  const [formData, setFormData] = useState(() => {
    const initialState = {};
    Object.keys(fields).forEach((key) => {
      initialState[fields[key].id] = "";
    });
    return initialState;
  });

  const resetLocalForm = () => {
    const emptyState = {};
    Object.keys(fields).forEach((key) => {
      emptyState[fields[key].id] = "";
    });
    setFormData(emptyState);
  };

  // Handle success / error from Redux (common for both variants)
  useEffect(() => {
    if (success) {
      if (lastVariantRef.current === "standard") {
        toast.success(
          "Application received! Our executive team will review your profile and reach out within 48 hours.",
        );
      } else {
        toast.success(
          "Inquiry Received. A Rule 7 Media Risk Specialist will reach out within 24 hours.",
        );
      }
      resetLocalForm();
      dispatch(resetFranchise()); // clear success flag
    }
    if (franchiseError) {
      toast.error(
        franchiseError ||
          "Submission error. Please email us directly at Franchiseenquiries@rule7media.com",
      );
      dispatch(resetFranchise()); // clear error flag
    }
  }, [success, franchiseError, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Remember which variant is submitting
    lastVariantRef.current = variant;

    // Prepare payload with formType
    let payload;
    if (variant === "standard") {
      payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        territory: formData.territory,
        background: formData.background,
        formType: "franchise_kit",
      };
    } else {
      // risk variant
      payload = {
        firstName: formData.fname,
        lastName: formData.lname,
        email: formData.email,
        region: formData.region,
        timeline: formData.timeline,
        formType: "risk_mitigation_inquiry",
      };
    }

    dispatch(addFranchise(payload));
  };

  const renderField = (fieldKey, fieldConfig) => {
    if (fieldConfig.type === "select") {
      return (
        <div key={fieldConfig.id} className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
            {fieldConfig.label}
          </label>
          <select
            id={fieldConfig.id}
            value={formData[fieldConfig.id] || ""}
            onChange={handleChange}
            required={fieldConfig.required}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 focus:outline-none focus:border-rose-500/50 transition-all appearance-none"
          >
            {fieldConfig.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (fieldConfig.type === "textarea") {
      return (
        <div key={fieldConfig.id} className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
            {fieldConfig.label}
          </label>
          <textarea
            id={fieldConfig.id}
            rows={fieldConfig.rows || 3}
            value={formData[fieldConfig.id] || ""}
            onChange={handleChange}
            required={fieldConfig.required}
            placeholder={fieldConfig.placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 transition-all outline-none"
          />
        </div>
      );
    }
    return (
      <div key={fieldConfig.id} className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
          {fieldConfig.label}
        </label>
        <input
          type={fieldConfig.type || "text"}
          id={fieldConfig.id}
          value={formData[fieldConfig.id] || ""}
          onChange={handleChange}
          required={fieldConfig.required}
          placeholder={fieldConfig.placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-rose-500 transition-all outline-none"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {renderField("firstName", fields.firstName)}
        {renderField("lastName", fields.lastName)}
      </div>
      {renderField("email", fields.email)}
      {variant === "standard" && renderField("territory", fields.territory)}
      {variant === "standard" && renderField("background", fields.background)}
      {variant === "risk" && renderField("extraField1", fields.extraField1)}
      {variant === "risk" && renderField("extraField2", fields.extraField2)}
      <button
        type="submit"
        disabled={franchiseLoading}
        className="w-full py-5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-bold text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
      >
        {franchiseLoading ? (
          "Submitting..."
        ) : (
          <>
            Submit {variant === "risk" ? "Inquiry" : "Application"}{" "}
            <Send size={18} />
          </>
        )}
      </button>
    </form>
  );
};

export default FranchiseForms;
