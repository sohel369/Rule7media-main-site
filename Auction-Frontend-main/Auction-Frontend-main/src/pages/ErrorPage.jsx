import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ← Ye add karna zaroori hai
import errorimg from "../assets/error.png";

const ErrorPage = () => {
  const { user } = useSelector((state) => state.auth || {}); // ← Logged-in user check
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user) {
      navigate("/user-profile/profile"); // Agar login hai → Dashboard
    } else {
      navigate("/"); // Nahi to Home
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10 text-white text-center h-screen bg-theme-bg px-6 rounded-2xl w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Oops... Page Not Found
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Optional: Error Image */}
      <img src={errorimg} alt="404 Error" className="w-64 md:w-80 opacity-80" />

      {/* Smart Button */}
      <button
        onClick={handleGoBack}
        className="font-Roboto text-lg md:text-xl mx-3 rounded-xl px-8 py-4 cursor-pointer font-bold tracking-wide bg-theme-color hover:bg-color-danger transition-all shadow-lg transform hover:scale-105"
      >
        {user ? "Back to Dashboard" : "Go To Home"}
      </button>
    </div>
  );
};

export default ErrorPage;
