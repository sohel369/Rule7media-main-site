import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/auth/authSlice";
import { toast } from "react-toastify";
import Footer from "./Footer";
const BillboardSlider = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [current, setCurrent] = useState(0);
  const [pTagSlide, setPTagSlide] = useState(0);
  const [abandonSlide, setAbandonSlide] = useState(0);
  const [showAbandonPage, setShowAbandonPage] = useState(false);
  const { country, currency } = useSelector((state) => state.country);
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // smooth scroll ke liye
    });
  }, [current]);
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);
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

  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      /* Hide pTagSlides navigation buttons by default */
     
      /* Show buttons on hover of the pTagSlides container */
      .ptag-slider-container:hover .ptag-slider-nav-button {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const pTagSlides = [
    {
      content: (
        <div className="px-6 py-4">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="flex items-start gap-4">
              <p className="text-base md:text-lg leading-relaxed text-gray-100 flex-1">
                By leveraging this model,{" "}
                <span className="text-green-500 font-semibold">
                  brands are no longer confined
                </span>{" "}
                to fleeting, one-directional advertising touchpoints. Instead,
                they become{" "}
                <span className="text-green-500 font-semibold">
                  active participants
                </span>{" "}
                in a dynamic ecosystem of consumer interaction.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="px-6 py-4">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="flex items-start gap-4">
              <p className="text-base md:text-lg leading-relaxed text-gray-100 flex-1">
                Each scan and share is not just an isolated event, but a{" "}
                <span className="text-green-500 font-semibold">
                  building block
                </span>{" "}
                in constructing robust brand-consumer relationships. This
                approach harnesses the{" "}
                <span className="text-green-400 font-semibold">
                  organic power of social media viral spread
                </span>
                , transforming every participant into a potential{" "}
                <span className="text-purple-400 font-semibold">
                  brand advocate
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setPTagSlide((prev) => (prev + 1) % pTagSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [pTagSlides.length]);
  const abandonSlides = [
    {
      content: (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/30">
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              <span className="text-green-500 font-bold text-xl">
                MAJOR GLOBAL BRANDS
              </span>{" "}
              such as Nike, HelloFresh, Tiffany, Wingstop and Verizon, actually{" "}
              <span className="text-green-400 font-bold">
                DOUBLED THEIR SPEND
              </span>{" "}
              on outdoor advertising year-over-year as a{" "}
              <span className="text-purple-400 font-semibold">
                testimony to its effectiveness
              </span>
              .
            </p>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              Employing a{" "}
              <span className="text-green-500 font-bold">MODULAR DESIGN</span>{" "}
              in your campaign facilitates seamless integration of special
              offers without disrupting core elements, allowing for{" "}
              <span className="text-green-400 font-semibold">
                consistent social media updates
              </span>{" "}
              rather than relying exclusively on paid advertising.
            </p>
          </div>
        </div>
      ),
    },
    {
      content: (
        <div className="px-6 py-4">
          <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
            <p className="text-base md:text-lg leading-relaxed text-gray-100">
              <span className="text-green-500 font-bold text-xl">
                AVOID BECOMING INDISTINGUISHABLE
              </span>{" "}
              in a crowded market or continually adjusting campaigns in response
              to evolving algorithms. Vehicle wrap advertising enables brands to
              deliver{" "}
              <span className="text-green-400 font-semibold">
                impactful, creative, and visually appealing campaigns
              </span>{" "}
              with cost efficiency and extensive visibility.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const slides = [
    {
      title: "Secure Your Mobile Billboards Now",
      subtitle: "UP TO 70,000 IMPRESSIONS PER DAY PER VEHICLE",
      content: (
        <div className="w-full flex flex-col items-center px-4 py-6 max-w-7xl mx-auto space-y-20">
          {/* Insights Slider */}
          <div className="w-full max-w-5xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
              <h3 className="text-lg font-semibold text-purple-400 uppercase tracking-wider">
                Key Insights
              </h3>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-1"></div>
            </div>
            <div className="relative ptag-slider-container">
              {/* Buttons INSIDE the relative container */}
              <button
                onClick={() =>
                  setPTagSlide((prev) =>
                    prev === 0 ? pTagSlides.length - 1 : prev - 1,
                  )
                }
                className="ptag-slider-nav-button absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-theme-bg2 hover:bg-gray-700 rounded-full p-2 text-purple-400 hover:text-purple-300 transition-all duration-200 shadow-xl border border-gray-700/50"
                aria-label="Previous insight"
              >
                <svg
                  className="w-5 h-5"
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
                  setPTagSlide((prev) =>
                    prev === pTagSlides.length - 1 ? 0 : prev + 1,
                  )
                }
                className="ptag-slider-nav-button absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-theme-bg2 hover:bg-gray-700 rounded-full p-2 text-purple-400 hover:text-purple-300 transition-all duration-200 shadow-xl border border-gray-700/50"
                aria-label="Next insight"
              >
                <svg
                  className="w-5 h-5"
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

              {/* Slider Content */}
              <div className="overflow-hidden rounded-2xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${pTagSlide * 100}%)` }}
                >
                  {pTagSlides.map((slide, index) => (
                    <div
                      key={index}
                      className="w-full flex-shrink-0"
                      style={{ minHeight: "180px" }}
                    >
                      {slide.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="w-full max-w-5xl mb-16">
            <div className="bg-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-100">
                  Cost Comparison: Traditional Media vs Mobile Billboards
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-4 text-left text-purple-400 font-semibold">
                        Media Type
                      </th>
                      <th className="py-4 px-4 text-left text-purple-400 font-semibold">
                        CPM Range
                      </th>
                      <th className="py-4 px-4 text-left text-purple-400 font-semibold">
                        Vehicle Wrap CPM
                      </th>
                      <th className="py-4 px-4 text-left text-purple-400 font-semibold">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        industry: "Radio",
                        cpm: `${currency} 10 - ${currency} 20`,
                        vehicle: `${currency} 1.25`,
                        saving: "94%",
                      },
                      {
                        industry: "Network TV",
                        cpm: `${currency} 20 - ${currency} 30`,
                        vehicle: `${currency} 1.25`,
                        saving: "96%",
                      },
                      {
                        industry: "Billboard",
                        cpm: `${currency} 13 - ${currency} 22`,
                        vehicle: `${currency} 1.25`,
                        saving: "94%",
                      },
                      {
                        industry: "Newspaper",
                        cpm: `${currency} 10 - ${currency} 45`,
                        vehicle: `${currency} 1.25`,
                        saving: "97%",
                      },
                      {
                        industry: "Direct Mail",
                        cpm: `${currency} 500 - ${currency} 1000`,
                        vehicle: `${currency} 1.25`,
                        saving: "99%",
                      },
                      {
                        industry: "Magazine",
                        cpm: `${currency} 140 - ${currency} 1300`,
                        vehicle: `${currency} 1.25`,
                        saving: "99%",
                      },
                      {
                        industry: "Super Bowl",
                        cpm: `${currency} 36`,
                        vehicle: `${currency} 1.25`,
                        saving: "97%",
                      },
                    ].map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-200">
                          {row.industry}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{row.cpm}</td>
                        <td className="py-3 px-4 text-blue-400 font-semibold">
                          {row.vehicle}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-green-500 font-bold">
                            {row.saving}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Build Lasting Brand Relationships",
      content: (
        <div className="w-full flex flex-col items-center px-4 py-6 max-w-6xl mx-auto space-y-8">
          {/* Hero Card */}
          <div className="w-full max-w-3xl mx-auto bg-theme-bg2 rounded-xl p-6 shadow-lg border border-purple-500/30 backdrop-blur-sm">
            <div className="text-center space-y-3">
              <p className="text-base md:text-lg text-gray-100 font-medium">
                Single vehicle users and multi-vehicle fleets
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
                STAND OUT FROM THE CROWD
              </h1>
              <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-400">
                REDUCE MARKETING COSTS BY 80% OR MORE
              </p>
            </div>
          </div>

          {/* Route Badge */}
          <div className="inline-flex items-center gap-2 bg-theme-bg2 px-6 py-3 rounded-full border border-purple-500/30 shadow-lg">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-purple-300 font-semibold">
              Suburban or Inter-City Routes
            </span>
          </div>

          {/* Content Cards */}
          <div className="w-full grid gap-6 max-w-5xl">
            {/* Card 1 */}
            <div className="bg-theme-bg2 rounded-xl p-6 md:p-8 shadow-xl border-l-4 border-purple-500">
              <div className="flex items-start gap-4">
                <p className="text-base md:text-lg leading-relaxed text-gray-100 flex-1">
                  <span className="text-purple-400 font-semibold">
                    IMPORTANTLY,
                  </span>{" "}
                  this participatory framework also{" "}
                  <span className="text-green-500 font-bold">
                    DEMOCRATIZES THE MARKETING PROCESS.
                  </span>{" "}
                  Rather than imposing advertisements onto passive recipients,
                  it{" "}
                  <span className="text-green-500 font-semibold">
                    invites consumers into an interactive journey
                  </span>
                  —one where they feel empowered and rewarded for their
                  engagement.
                </p>
              </div>
            </div>
            <div className="bg-theme-bg2 rounded-xl p-6 md:p-8 shadow-xl border-r-4 border-purple-500">
              <div className="flex items-start gap-4">
                <p className="text-sm md:text-base leading-relaxed text-gray-100 flex-1">
                  <span className="text-purple-400 font-semibold">
                    SUCCESS,
                  </span>{" "}
                  will hinge on{" "}
                  <span className="text-green-500 font-semibold">
                    tapping into genuine dialogue
                  </span>
                  , leveraging insights to tailor messaging, and building trust
                  by showing the{" "}
                  <span className="text-green-400 font-semibold">
                    people behind the brand
                  </span>
                  . As AI-generated noise increases, campaigns that blend
                  technology with{" "}
                  <span className="text-green-500 font-semibold">
                    human touch
                  </span>{" "}
                  — like vehicle wraps that spark real-world interactions — will{" "}
                  <span className="text-purple-400 font-semibold">
                    stand out
                  </span>
                  . It’s not about outshouting competitors, but about{" "}
                  <span className="text-green-400 font-semibold">
                    outsmarting them
                  </span>{" "}
                  with strategy, authenticity, and memorable experiences that
                  translate both online and off.
                </p>
              </div>
            </div>
            <div className="bg-theme-bg2 rounded-xl p-6 md:p-8 shadow-xl border-l-4 border-purple-500">
              <div className="flex items-center justify-center gap-3 mb-4"></div>
              <div className="flex items-start gap-4">
                <p className="text-base md:text-lg font-medium leading-relaxed text-gray-100 flex-1">
                  <span className="text-green-500 font-bold">
                    THE RESULT IS A VIRTUOUS CYCLE:
                  </span>{" "}
                  As excitement around valuable rewards grows, so too does the{" "}
                  <span className="text-green-400 font-semibold">
                    frequency and quality of interactions
                  </span>
                  , weaving brands more deeply into the fabric of everyday
                  social exchanges and ultimately{" "}
                  <span className="text-blue-400 font-bold text-lg md:text-xl">
                    driving sustained market growth.
                  </span>
                </p>
              </div>
            </div>
            {/* Card 2 - Featured */}
            <div className="bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-purple-500/30">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-16"></div>
                <span className="text-green-500 font-bold text-sm uppercase tracking-widest">
                  Subscription Notice
                </span>
                <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-16"></div>
              </div>

              <div className="flex items-start gap-4">
                <p className="text-sm md:text-base font-medium leading-relaxed text-gray-100 flex-1">
                  All subscriptions and upgrades automatically renew unless
                  cancelled prior to the renewal date. We will automatically
                  send you a notification to your registered email address about
                  upcoming renewal 2 weeks prior to the renewal date. By
                  purchasing a subscription, you certify that you have read and
                  agree to our{" "}
                  <a
                    href="/terms-conditions"
                    className="text-purple-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Use
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="text-purple-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consent to our Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => setCurrent(0)}
                className="group relative px-8 py-3 bg-theme-bg2 hover:bg-gray-700 rounded-xl font-semibold text-gray-300 transition-all duration-300 border border-gray-700 hover:border-gray-600 shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back
                </span>
              </button>

              {user ? (
                <button
                  onClick={() => navigate("/pricing")}
                  className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-bold text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Continue to Checkout
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="group relative px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-xl font-bold text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    Login to Continue
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center max-w-lg mx-auto italic">
              *Terms and Conditions apply. Based on {currency} 24,000 Annual
              Advertising Revenue.{" "}
              <a
                href="/terms-conditions"
                className="text-blue-400 hover:underline"
                rel="noopener noreferrer"
              >
                Read Terms & Conditions
              </a>
            </p>
          </div>
        </div>
      ),
    },
  ];

  const AbandonCartPage = () => (
    <div className="w-full flex flex-col items-center px-4 py-8 max-w-6xl mx-auto">
      <div className="w-full bg-gradient-to-br from-red-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-red-500/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🚨 Don't Miss Out!
          </h2>
          <p className="text-gray-300 text-lg">
            Limited time opportunity for mobile billboard advertising
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${abandonSlide * 100}%)` }}
            >
              {abandonSlides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0"
                  style={{ minHeight: "180px" }}
                >
                  {slide.content}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              setAbandonSlide((prev) =>
                prev === 0 ? abandonSlides.length - 1 : prev - 1,
              )
            }
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-theme-bg2 hover:bg-gray-700 rounded-full p-3 text-red-400 hover:text-red-300 transition-all duration-200 shadow-xl border border-gray-700/50"
          >
            <svg
              className="w-5 h-5"
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
              setAbandonSlide((prev) =>
                prev === abandonSlides.length - 1 ? 0 : prev + 1,
              )
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-theme-bg2 hover:bg-gray-700 rounded-full p-3 text-red-400 hover:text-red-300 transition-all duration-200 shadow-xl border border-gray-700/50"
          >
            <svg
              className="w-5 h-5"
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
        </div>
      </div>
    </div>
  );

  const handlePrev = () =>
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    if (showAbandonPage) {
      const interval = setInterval(() => {
        setAbandonSlide((prev) =>
          prev === abandonSlides.length - 1 ? 0 : prev + 1,
        );
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showAbandonPage, abandonSlides.length]);

  if (showAbandonPage) {
    return (
      <div className="fixed inset-0 bg-theme-bg text-white z-50 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center overflow-y-auto scrollbar-hide">
          <AbandonCartPage />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black text-white z-50 overflow-hidden">
        {/* <div className="flex justify-end mt-3 gap-3">
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
        <div className="relative w-full h-full">
          <div className="w-full h-full flex items-start justify-center pt-16">
            <div
              className="flex transition-transform duration-500 ease-in-out w-full h-full"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 h-full flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 pt-20"
                >
                  <div className="w-full max-w-7xl mx-auto flex flex-col items-center h-full overflow-hidden">
                    <div className="text-center mb-6 flex-shrink-0">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-400">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-base sm:text-lg md:text-xl font-semibold text-green-500">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 w-full min-h-0 overflow-y-auto scrollbar-hide">
                      {slide.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 bg-theme-bg2 hover:bg-gray-700 rounded-full p-3 lg:p-4 text-purple-400 hover:text-purple-300 transition-all duration-200 shadow-2xl border border-gray-700/50 z-20"
          >
            <svg
              className="w-6 h-6 lg:w-8 lg:h-8"
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
            onClick={handleNext}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-theme-bg2 hover:bg-gray-700 rounded-full p-3 lg:p-4 text-purple-400 hover:text-purple-300 transition-all duration-200 shadow-2xl border border-gray-700/50 z-20"
          >
            <svg
              className="w-6 h-6 lg:w-8 lg:h-8"
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

          {/* Slide Indicators */}
          {/* <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                current === index
                  ? "w-8 h-3 bg-gradient-to-r from-purple-500 to-blue-500"
                  : "w-3 h-3 bg-gray-600 hover:bg-gray-500"
              }`}
            />
          ))}
        </div> */}
        </div>
      </div>
    </>
  );
};

export default BillboardSlider;
