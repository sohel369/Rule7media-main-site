import React, { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";

const CookieBanner = ({ onAccept, onDecline, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAcceptAll = () => {
    setIsVisible(false);
    if (onAccept) onAccept();
    // Save to localStorage
    localStorage.setItem("cookieConsent", "accepted");
  };

  const handleDecline = () => {
    setIsVisible(false);
    if (onDecline) onDecline();
    // Save to localStorage
    localStorage.setItem("cookieConsent", "declined");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0f1215] border border-gray-800 rounded-2xl shadow-2xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Section - Icon and Text */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-red-500" />
              </div>

              <div className="flex-1">
                <h3 className="text-white font-semibold text-base mb-1">
                  Cookie Preferences
                </h3>
                <p className="text-gray-400 text-sm">
                  We use cookies to enhance your experience.{" "}
                  <a
                    href="/cookie-policy"
                    className="text-red-500 hover:text-red-400 underline underline-offset-2"
                  >
                    Cookie Policy
                  </a>
                </p>
              </div>
            </div>

            {/* Right Section - Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleDecline}
                className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Decline
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
             bg-gradient-to-r from-red-600 to-black
             [background-size:170%_100%] [background-position:0%_0%] hover:from-red-700"
              >
                Accept All
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
