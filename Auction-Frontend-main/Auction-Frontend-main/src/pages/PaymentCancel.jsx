// src/pages/PaymentCancel.js
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimesCircle, FaArrowLeft, FaRedoAlt, FaHome } from "react-icons/fa";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // productId query param nikalna
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("productId");

  const handleRetry = () => {
    if (productId) {
      navigate(`/our-products`);
    } else {
      navigate("/user-profile/cart");
    }
  };

  // Animation effect for icon
  useEffect(() => {
    const icon = document.getElementById("cancel-icon");
    if (icon) {
      icon.classList.add("animate-pulse");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
        {/* Decorative top line */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full"></div>

        {/* Icon with animated background */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-ping"></div>
          <div className="relative flex justify-center">
            <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full">
              <FaTimesCircle
                id="cancel-icon"
                className="text-red-500 text-7xl filter drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-yellow-500 bg-clip-text text-transparent">
            Payment Cancelled
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed">
            Your payment was not completed. Don't worry, your items are still
            <span className="text-yellow-400 font-semibold">
              {" "}
              saved in your cart
            </span>
            .
          </p>

          {/* Info box */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 my-6">
            <p className="text-sm text-gray-400">
              🔒 This is a secure transaction. You can try again anytime.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-8">
          <button
            onClick={handleRetry}
            className="w-full group relative px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-semibold rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transform hover:scale-[1.02] transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <span className="relative flex items-center justify-center gap-2">
              <FaRedoAlt className="animate-spin-slow" />
              Try Again
            </span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-700 hover:border-gray-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <button
              onClick={() => navigate("/user-profile/profile")}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-xl border border-gray-600 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <FaHome className="group-hover:scale-110 transition-transform" />
              Dashboard
            </button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Need help?{" "}
          <button
            onClick={() => navigate("/contact-us")}
            className="text-yellow-500 hover:text-yellow-400 hover:underline transition-colors"
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
};

export default PaymentCancel;
