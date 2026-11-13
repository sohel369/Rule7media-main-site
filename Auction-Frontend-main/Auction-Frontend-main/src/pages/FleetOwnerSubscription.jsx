import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { logout } from "../store/auth/authSlice";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
const FleetOwnerSubscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAbandonPage, setShowAbandonPage] = useState(false);
  const { country, currency } = useSelector((state) => state.country);
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Hide scrollbar globally
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Auto-scroll for slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 12000);
    return () => clearInterval(interval);
  }, []);
  const handleLogout = async () => {
    try {
      await dispatch(logout());
      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/login", { replace: true }), 200);
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Logout failed!");
    }
  };
  const slides = [
    {
      content: (
        <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white text-center">
          For example, in the USA, average rates per square metre are
          approximately $60,{""} meaning that a fully wrapped delivery vehicle
          (such as one with Mercedes Sprinter dimensions) could possibly
          generate an income of $30,000 annually, {""}for the utilization of
          your currently unused or redundant space
        </p>
      ),
    },
    {
      content: (
        <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white text-center">
          Awareness thrives by tapping into{" "}
          <span className="text-green-500 font-semibold">genuine dialogue</span>
          , leveraging insights to tailor messaging, and building trust by
          showing the{" "}
          <span className="text-green-300 font-semibold">
            people behind the brand
          </span>
          .
        </p>
      ),
    },
    {
      content: (
        <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white text-center">
          As AI-generated noise increases, campaigns blending technology with a{" "}
          <span className="text-green-500 font-semibold">human touch</span>
          —like vehicle wraps sparking real-world interactions—will{" "}
          <span className="text-green-300 font-semibold">stand out</span>.
        </p>
      ),
    },
    {
      content: (
        <p className="text-sm md:text-base lg:text-lg leading-relaxed text-white text-center">
          It's not about outshouting competitors but{" "}
          <span className="text-green-500 font-semibold">outsmarting them</span>{" "}
          with strategy, authenticity, and memorable experiences that translate{" "}
          <span className="text-green-300 font-semibold">online and off</span>.
        </p>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white overflow-y-auto scrollbar-hide">
        {/* <div className="flex justify-end gap-3 p-4">
    {user?.subscription?.status === "active" ? (
        <button
         onClick={() => navigate("/user-profile/profile")}
          className="w-28 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200"
        >
          Dashboard
        </button>
      ) : (
        <button
          onClick={() => navigate("/subscriberonly")}
          className="w-28 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200 cursor-pointer"
        >
          Dashboard
        </button>
      )}

    <button
      onClick={handleLogout}
      className="w-28 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md text-center transition duration-200"
    >
      Logout
    </button>
  </div> */}
        {showAbandonPage ? (
          <AbandonCartPage />
        ) : (
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-300 text-center mb-2">
              Secure Your Passive Income Now!
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-green-500 text-center mb-6">
              Earn Up to {currency}100,000 Per Vehicle Per Annum
            </h2>

            {/* Slider - Completely fixed overlapping issue */}
            <div className="w-full max-w-4xl mb-8 px-12">
              <div className="relative">
                {/* Navigation Buttons - Outside the slider container */}
                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === 0 ? slides.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-gray-800/70 rounded-full p-3 text-white hover:bg-gray-700 transition-all z-30 shadow-lg"
                  aria-label="Previous slide"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() =>
                    setCurrentSlide((prev) =>
                      prev === slides.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-gray-800/70 rounded-full p-3 text-white hover:bg-gray-700 transition-all z-30 shadow-lg"
                  aria-label="Next slide"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Slider Container */}
                <div className="overflow-hidden rounded-xl bg-gray-800/50">
                  {/* Slider Content */}
                  <div className="p-6">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {slides.map((slide, index) => (
                        <div
                          key={index}
                          className="w-full flex-shrink-0 py-4 px-5"
                        >
                          {slide.content}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex justify-center space-x-2 pb-4">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide
                            ? "bg-purple-400 w-6"
                            : "bg-gray-600"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 shadow-lg">
                <p className="text-sm md:text-base text-white text-center">
                  Transform fleet management costs into a{" "}
                  <span className="text-green-500 font-semibold">
                    profit center
                  </span>
                  . A fully wrapped delivery vehicle could generate up to{" "}
                  <span className="text-green-300 font-semibold">
                    {currency}30,000 annually
                  </span>{" "}
                  using unused space.
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-6">
                <p className="text-sm md:text-base text-gray-200 text-center">
                  Advertisers commit upfront to vehicle wraps, providing income
                  for up to 5 years—potentially{" "}
                  <span className="text-green-500 font-semibold">
                    {currency}150,000
                  </span>{" "}
                  per small van, offsetting acquisition and operating costs.
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 shadow-lg">
                <p className="text-sm md:text-base text-white text-center">
                  Vehicle owners can reserve advertising space for their own
                  brand, joining the{" "}
                  <a
                    href="https://www.scanthemall.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 font-semibold"
                  >
                    www.scanthemall.com
                  </a>
                  promotion to boost visibility via social media and email
                  campaigns.
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="w-full mt-8">
              <h3 className="text-lg md:text-xl font-semibold text-purple-300 text-center mb-4">
                Additional Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Enhanced Fleet Resale Value",
                    desc: "Vinyl wraps protect paintwork, restoring vehicles to near-new condition for higher resale value.",
                  },
                  {
                    title: "Theft Deterrence",
                    desc: "Visible markings make vehicles less likely to be stolen, as they're easily traceable.",
                  },
                  {
                    title: "Employee Satisfaction",
                    desc: "Branded vehicle operators report higher job satisfaction, reducing turnover.",
                  },
                  {
                    title: "Reduced Insurance Costs",
                    desc: "Bright wraps increase visibility, leading to fewer collisions and lower insurance claims.",
                  },
                  {
                    title: "Optimized Fleet Renewal",
                    desc: "Advertising revenue enables more frequent vehicle replacements, improving fuel efficiency and sustainability.",
                  },
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/40 rounded-lg p-4 border-l-4 border-purple-400"
                  >
                    <h4 className="text-sm md:text-base font-semibold text-green-500">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-200">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Policies */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">
                All subscriptions auto-renew unless cancelled. A renewal
                notification will be sent 2 weeks prior to the renewal date. By
                purchasing, you agree to our{" "}
                <a
                  href="/terms-conditions"
                  className="text-purple-300 hover:underline"
                >
                  Terms of Use
                </a>
                , and{" "}
                <a
                  href="/privacy-policy"
                  className="text-purple-300 hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-6">
              {/* <button
              onClick={() => navigate("/user-profile/profile")} // Fixed: Use navigate as a function
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Back
            </button> */}
              {user ? (
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-2 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Continue To Checkout
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Login To Continue
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FleetOwnerSubscription;
