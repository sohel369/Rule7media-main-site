import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEmailSettings, saveEmailSettings, resetEmailSettingsState } from "../../store/emailSettings/emailSettingsSlice";
import { toast } from "react-toastify";

const EmailSettings = () => {
  const dispatch = useDispatch();
  const { settings, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.emailSettings
  );

  // Initial empty form state
  const initialFormData = {
    host: "",
    port: 465,
    secure: false,
    user: "",
    password: "",
    fromName: "Rule 7 Media",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(getEmailSettings());
    
    return () => {
      dispatch(resetEmailSettingsState());
      setIsLoaded(false);
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess && message) {
      toast.success(message);
    }

    // Only update form when settings are loaded and not undefined
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        host: settings.host || "",
        port: settings.port || 587,
        secure: settings.secure || false,
        user: settings.user || "",
        password: settings.password || "", // Will likely come masked
        fromName: settings.fromName || "Rule 7 Media",
      });
      setIsLoaded(true);
    } else if (settings && Object.keys(settings).length === 0) {
      // If settings exist but are empty, reset to initial form
      setFormData(initialFormData);
      setIsLoaded(false);
    }
    
    dispatch(resetEmailSettingsState());
  }, [settings, isError, isSuccess, message, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // basic validation
    if (!formData.host || !formData.port || !formData.user || !formData.fromName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!settings && !formData.password) {
      toast.error("Password is required for first time setup");
      return;
    }
    
    // Only send password if it's changed from the masked value
    const submitData = { ...formData };
    if (submitData.password === "********") {
      delete submitData.password; // Don't send masked password back to server
    }

    dispatch(saveEmailSettings(submitData));
  };

  // Function to check if form has values
  const hasValues = () => {
    return formData.host || formData.user || formData.fromName;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">Email & SMTP Settings</h1>
      
      <div className="bg-[#111111] border border-gray-800 p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Host *
              </label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={handleChange}
                className={`w-full bg-[#1a1a1a] border ${
                  hasValues() ? 'border-gray-700' : 'border-gray-800'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200`}
                placeholder="smtp.gmail.com"
                required
              />
              {!formData.host && !isLoading && (
                <p className="text-xs text-gray-600 mt-1">Enter your SMTP host address</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Port *
              </label>
              <input
                type="number"
                name="port"
                value={formData.port}
                onChange={handleChange}
                className={`w-full bg-[#1a1a1a] border ${
                  hasValues() ? 'border-gray-700' : 'border-gray-800'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200`}
                placeholder="587"
                required
              />
              {formData.port === 465 && !isLoaded && (
                <p className="text-xs text-gray-600 mt-1">Default port: 465 (SSL)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP User (Email) *
              </label>
              <input
                type="email"
                name="user"
                value={formData.user}
                onChange={handleChange}
                className={`w-full bg-[#1a1a1a] border ${
                  hasValues() ? 'border-gray-700' : 'border-gray-800'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200`}
                placeholder="noreply@example.com"
                required
              />
              {!formData.user && !isLoading && (
                <p className="text-xs text-gray-600 mt-1">Enter your email address</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                SMTP Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-[#1a1a1a] border ${
                  hasValues() ? 'border-gray-700' : 'border-gray-800'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200`}
                placeholder={settings && settings.password ? "Enter new password (optional)" : "Enter your SMTP password"}
                required={!settings || !settings.password}
              />
              <p className="text-xs text-gray-500 mt-1">
                {settings && settings.password 
                  ? "✓ Password is saved. Enter new password to update." 
                  : "Enter your SMTP password"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                From Name *
              </label>
              <input
                type="text"
                name="fromName"
                value={formData.fromName}
                onChange={handleChange}
                className={`w-full bg-[#1a1a1a] border ${
                  hasValues() ? 'border-gray-700' : 'border-gray-800'
                } text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 transition-colors duration-200`}
                placeholder="Rule 7 Media"
                required
              />
              {formData.fromName === "Rule 7 Media" && !isLoaded && (
                <p className="text-xs text-gray-600 mt-1">Default sender name</p>
              )}
            </div>

            <div className="flex items-center mt-8">
              <input
                type="checkbox"
                name="secure"
                id="secure"
                checked={formData.secure}
                onChange={handleChange}
                className="w-4 h-4 text-green-500 bg-[#1a1a1a] border-gray-700 rounded focus:ring-green-500 focus:ring-offset-gray-900"
              />
              <label htmlFor="secure" className="ml-2 text-sm font-medium text-gray-400">
                Use Secure Connection (TLS/SSL)
              </label>
              {formData.secure && isLoaded && (
                <span className="ml-2 text-xs text-green-500">✓ Enabled</span>
              )}
            </div>
          </div>

          {/* Status indicator */}
          {isLoaded && (
            <div className="flex items-center justify-start space-x-2 text-sm">
              <span className="text-green-500">✓</span>
              <span className="text-gray-400">Settings loaded successfully</span>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailSettings;