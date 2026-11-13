import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { logout } from "../store/auth/authSlice";
import { toast } from "react-toastify";
const WrapperSubscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  return (
    <div className="bg-black text-white min-h-screen">
      {/* <div className="flex justify-end gap-3 p-1 mt-5">
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
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 md:p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              Claim your Listing Now
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              LIST YOUR BUSINESS WITH THE MOST TARGETED GLOBAL DATABASE FOR YOUR
              INDUSTRY.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="w-full max-w-5xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Benefit 1 */}
              <div className="bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Access to a broader, targeted client base{" "}
                  </h3>
                </div>
                <p className="text-gray-300">
                  Opens a whole new cohort of clients matching advertisers with
                  vehicle owners.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Qualified Leads
                  </h3>
                </div>
                <p className="text-gray-300">
                  Platforms filter and direct inquiries from clients who have a
                  real intent to launch impactful campaigns.
                </p>
              </div>
              <div className="bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Variety Of Clients
                  </h3>
                </div>
                <p className="text-gray-300">
                  Access spans from large multinational fleet operators to
                  dynamic local advertisers.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Geographic Focus
                  </h3>
                </div>
                <p className="text-gray-300">
                  Enquiries are sorted by location, ensuring businesses only
                  receive relevant opportunities in their region.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Increased Revenue Opportunities
                  </h3>
                </div>
                <p className="text-gray-300">
                  By leveraging targeted campaigns and connecting with qualified
                  clients, businesses can maximize their revenue potential and
                  secure more profitable projects consistently.
                </p>
              </div>
              <div className="bg-slate-800 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-4">
                  <div className="flex items-start mr-4">
                    <div className="bg-yellow-500/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-yellow-400">
                    Higher Job Volume
                  </h3>
                </div>
                <p className="text-gray-300">
                  More inquiries mean more contracts and frequent projects,
                  leading to higher revenue potential.
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Opportunities Section */}
          <div className="w-full max-w-5xl mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white ">
              Maximize Your Revenue Potential
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 md:mb-8">
              <div className="bg-slate-800 rounded-xl p-6 text-center border border-blue-700/50">
                <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-4H7l5-5 5 5h-4v4z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Global Network Advantage
                </h3>
                <p className="text-gray-300 text-sm whitespace-pre-line">
                  By aligning with a global network, vehicle wrapping businesses
                  elevate credibility, open new paths for growth, reinforce
                  their position in the market, and offer even more value to
                  clients.
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 text-center border border-blue-700/50">
                <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Larger Projects
                </h3>
                <p className="text-gray-300 text-sm">
                  Fleet managers may require wrapping for numerous vehicles,
                  leading to sizable contracts.
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 text-center border border-blue-700/50">
                <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Premium Campaigns
                </h3>
                <p className="text-gray-300 text-sm">
                  Advertisers prepared to invest more for standout campaigns
                  value quality design and execution.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-3xl text-center border border-purple-700/50 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-yellow-400">
              Ready to Grow Your Business?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of businesses already benefiting from our targeted
              platform. Claim your listing today and start receiving qualified
              leads.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
              {/* {user?.subscription?.status === "active" ? (

  <button
    onClick={() => navigate("/user-profile/profile")}
    className="bg-green-700 hover:bg-green-600 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300 flex items-center justify-center shadow-md"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
        clipRule="evenodd"
      />
    </svg>
    Dashboard
  </button>
) : (
 
  <button
  onClick={() => navigate("/subscriberonly")}
    className="bg-transparent border border-red-500 text-red-400 hover:bg-red-900/30 px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center"
  >
   
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-2"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
        clipRule="evenodd"
      />
    </svg>
    Dashboard
  </button>
)} */}

              {user ? (
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  Continue to Checkout
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-8 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  Login To Continue
                </button>
              )}
            </div>
          </div>

          {/* Terms and Policies */}
          <div className="text-center mt-6 max-w-3xl">
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
        </div>
      )}
    </div>
  );
};

export default WrapperSubscription;
