import React from "react";
import { Link } from "react-router-dom";
import { FaClock, FaArrowLeft } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import { useSelector } from "react-redux";

const ComingSoon = ({ pageName = "This Page" }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {/* ✅ Show only when NOT logged in */}
      {!user && <Header />}

      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-[#0a0c0f] to-[#1a1e24]">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-lg border border-red-500/20 rounded-3xl p-12 shadow-2xl text-center">
          <div className="text-red-500 mb-8 animate-pulse">
            <FaClock size={60} className="mx-auto" />
          </div>

          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2 uppercase tracking-widest">
            Coming Soon
          </h1>

          <h2 className="text-3xl text-white font-semibold mb-6">
            {pageName} Page
          </h2>

          <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md mx-auto">
            This page is currently under construction. We’re working hard to
            bring it to you soon.
          </p>

          <div className="flex justify-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full"
            >
              <FaArrowLeft /> Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ Show only when NOT logged in */}
      {!user && <Footer />}
    </>
  );
};

export default ComingSoon;
