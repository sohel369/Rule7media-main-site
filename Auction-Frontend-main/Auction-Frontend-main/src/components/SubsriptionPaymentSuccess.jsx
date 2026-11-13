import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaArrowDown } from "react-icons/fa";
import { checkverifySubscription } from "../store/subscription/subscriptionSlice";
import {
  getStatisticsByCountry,
  reset,
} from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";

const LANGUAGE_MAP = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic",
  hi: "Hindi",
  Unknown: "Other Languages",
};

const SubsriptionPaymentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { subscriptionPlanes } = useSelector((state) => state.subscription);
  const { statistics, isLoading: statsLoading } = useSelector(
    (state) => state.statistic,
  );
  const { country, isLoading: countryLoading } = useSelector(
    (state) => state.country,
  );

  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideoHint, setShowVideoHint] = useState(true);

  const query = new URLSearchParams(location.search);
  const sessionId = query.get("session_id");

  useEffect(() => {
    if (!country && !countryLoading) dispatch(fetchUserCountry());
  }, [dispatch, country, countryLoading]);

  useEffect(() => {
    if (country) dispatch(getStatisticsByCountry(country));
    return () => dispatch(reset());
  }, [country, dispatch]);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setLoading(false);
        return;
      }
      try {
        const response = await dispatch(
          checkverifySubscription({ sessionId }),
        ).unwrap();
        setSubscriptionDetails(response);
      } catch (err) {
        setError(err.message || "Failed to verify subscription");
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [dispatch, sessionId, user]);

  const plan = subscriptionDetails
    ? subscriptionPlanes.find((p) => p.id === subscriptionDetails.campaignId)
    : null;

  const isYouTubeUrl = (url) =>
    url && (url.includes("youtube.com") || url.includes("youtu.be"));
  const extractVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const getEmbedUrl = (videoId) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=0`;

 const allVideoSources =
    statistics?.filter((stat) => stat.videoType?.toLowerCase() === "global")
    .flatMap((stat) => stat.sources || []) || [];
  const videosByLanguage = allVideoSources.reduce((acc, source) => {
    const lang = LANGUAGE_MAP[source.language] || LANGUAGE_MAP.Unknown;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(source);
    return acc;
  }, {});

  const scrollToVideos = () => {
    const videoSection = document.getElementById("videos-section");
    if (videoSection) {
      videoSection.scrollIntoView({ behavior: "smooth" });
      setShowVideoHint(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-white relative">
      {/* Full Screen Verification Overlay - Blocks all interactions */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-theme-bg2 rounded-2xl p-8 max-w-md mx-4 border border-purple-500/30 shadow-2xl"
          >
            <div className="flex flex-col items-center">
              {/* Animated Spinner */}
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="animate-pulse bg-purple-500/20 rounded-full h-12 w-12"></div>
                </div>
              </div>

              {/* Verification Text */}
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                Verifying Payment
              </h2>
              <p className="text-gray-300 text-center mb-2">
                Please wait while we confirm your subscription...
              </p>
              <p className="text-gray-500 text-sm text-center">
                Do not refresh or close this page
              </p>

              {/* Animated dots */}
              <div className="flex gap-2 mt-6">
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content - Only accessible after verification */}
      <div
        className={`max-w-5xl mx-auto px-4 py-8 md:py-12 ${loading ? "pointer-events-none opacity-50" : ""}`}
      >
        {/* Compact Success Popup */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative bg-theme-bg2 backdrop-blur-xl rounded-xl shadow-xl px-4 py-8 max-w-md mx-auto mb-8 border border-purple-500/20"
        >
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-green-400 text-5xl mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
              Payment Successful!
            </h1>
            <p className="text-gray-300 text-center mt-2 text-sm md:text-base">
              Your subscription is now active
            </p>

            {error && (
              <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
            )}

            {subscriptionDetails && plan && (
              <div className="bg-gray-800/50 rounded-xl p-4 mt-4 w-full">
                <p className="text-sm">
                  <span className="text-gray-400">Plan:</span>{" "}
                  <strong className="text-purple-300">{plan.name}</strong>
                </p>
                <p className="text-sm mt-1">
                  <span className="text-gray-400">Status:</span>{" "}
                  <span className="text-green-400 font-semibold">Active</span>
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
              <button
                onClick={() => navigate("/user-profile/profile")}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Go to Dashboard
              </button>
              <button
                onClick={scrollToVideos}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <FaArrowDown className="text-sm" />
                Watch Tutorials
              </button>
            </div>
          </div>

          {/* Animated scroll hint */}
          {showVideoHint && allVideoSources.length > 0 && !loading && (
            <motion.div
              animate={{
                y: [0, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-xs text-purple-300"
            ></motion.div>
          )}
        </motion.div>

        {/* Videos Section */}
        <div id="videos-section" className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-gray-400 max-w-2xl mx-auto mt-2">
              Get started with these helpful explainer videos in your preferred
              language
            </p>
          </motion.div>

          {statsLoading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 mx-auto"></div>
            </div>
          )}

          {Object.entries(videosByLanguage).map(([language, sources]) => (
            <motion.div
              key={language}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-100">
                  {language}
                </h3>
                <span className="text-xs px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                  {sources.length} video{sources.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sources.map((source, idx) => {
                  const url = Array.isArray(source.url)
                    ? source.url[0]
                    : source.url;
                  const secureUrl = url?.startsWith("https://")
                    ? url
                    : url?.replace("http://", "https://");
                  const videoId =
                    source.type !== "uploaded" && isYouTubeUrl(secureUrl)
                      ? extractVideoId(secureUrl)
                      : null;

                  return (
                    <div
                      key={idx}
                      className="bg-theme-bg2 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-800"
                    >
                      <div className="aspect-video">
                        {source.type === "uploaded" && secureUrl ? (
                          <video
                            controls
                            muted
                            loop
                            className="w-full h-full object-cover"
                          >
                            <source src={secureUrl} type="video/mp4" />
                            Your browser does not support the video.
                          </video>
                        ) : videoId ? (
                          <iframe
                            src={getEmbedUrl(videoId)}
                            title="Explainer Video"
                            className="w-full h-full"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gray-800 text-gray-500 p-4">
                            <span className="text-center">
                              Video not available
                            </span>
                          </div>
                        )}
                      </div>
                      {source.description && (
                        <p className="p-4 text-sm text-gray-300 leading-relaxed border-t border-gray-800">
                          {source.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {allVideoSources.length === 0 && !statsLoading && (
            <div className="text-center py-10 bg-gray-800/30 rounded-xl border border-gray-700">
              <p className="text-gray-400 text-lg">
                No tutorial videos available yet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Check back later for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubsriptionPaymentSuccess;

// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { FaCheckCircle } from "react-icons/fa";
// import { checkverifySubscription } from "../store/subscription/subscriptionSlice";
// import {
//   getStatisticsByCountry,
//   reset,
// } from "../store/statistic/statisticSlice";
// import { fetchUserCountry } from "../store/countary/countrySlice";

// const LANGUAGE_MAP = {
//   en: "English",
//   es: "Spanish",
//   fr: "French",
//   de: "German",
//   zh: "Chinese",
//   ja: "Japanese",
//   ar: "Arabic",
//   hi: "Hindi",
//   Unknown: "Other Languages",
// };

// const SubsriptionPaymentSuccess = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { user } = useSelector((state) => state.auth);
//   const { subscriptionPlanes } = useSelector((state) => state.subscription);
//   const { statistics, isLoading: statsLoading } = useSelector(
//     (state) => state.statistic
//   );
//   const { country, isLoading: countryLoading } = useSelector(
//     (state) => state.country
//   );

//   const [subscriptionDetails, setSubscriptionDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const query = new URLSearchParams(location.search);
//   const sessionId = query.get("session_id");

//   useEffect(() => {
//     if (!country && !countryLoading) dispatch(fetchUserCountry());
//   }, [dispatch, country, countryLoading]);

//   useEffect(() => {
//     if (country) dispatch(getStatisticsByCountry(country));
//     return () => dispatch(reset());
//   }, [country, dispatch]);

//   useEffect(() => {
//     const verifyPayment = async () => {
//       if (!sessionId || !user) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await dispatch(
//           checkverifySubscription({ sessionId })
//         ).unwrap();
//         setSubscriptionDetails(response);
//       } catch (err) {
//         setError(err.message || "Failed to verify subscription");
//       } finally {
//         setLoading(false);
//       }
//     };
//     verifyPayment();
//   }, [dispatch, sessionId, user]);

//   const plan = subscriptionDetails
//     ? subscriptionPlanes.find((p) => p.id === subscriptionDetails.campaignId)
//     : null;

//   const isYouTubeUrl = (url) =>
//     url && (url.includes("youtube.com") || url.includes("youtu.be"));
//   const extractVideoId = (url) => {
//     const regExp =
//       /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//     const match = url.match(regExp);
//     return match && match[2].length === 11 ? match[2] : null;
//   };
//   const getEmbedUrl = (videoId) =>
//     `https://www.youtube.com/embed/${videoId}?autoplay=0`;

//   const allVideoSources =
//     statistics?.flatMap((stat) => stat.sources || []) || [];
//   const videosByLanguage = allVideoSources.reduce((acc, source) => {
//     const lang = LANGUAGE_MAP[source.language] || LANGUAGE_MAP.Unknown;
//     if (!acc[lang]) acc[lang] = [];
//     acc[lang].push(source);
//     return acc;
//   }, {});

//   return (
//     <div className="min-h-screen bg-theme-bg text-white">
//       <div className="max-w-5xl mx-auto px-6 py-20 text-center">
//         {/* Clean & Professional Success Card */}
//        <motion.div
//   initial={{ scale: 0.9, opacity: 0 }}
//   animate={{ scale: 1, opacity: 1 }}
//   transition={{ duration: 0.6 }}
//   className="
//     bg-theme-bg2 backdrop-blur-xl
//     rounded-xl shadow-lg
//     px-6 py-6
//     max-w-sm mx-auto
//   "
// >
//   <FaCheckCircle className="text-green-400 text-6xl mx-auto mb-5" />
//           <p className="text-4xl md:text-5xl  bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//             Payment Successful!
//           </p>
//           <p className="text-xl text-gray-300 mb-8">
//             Congratulations! Your subscription is now active and ready to use.
//           </p>

//           {loading && (
//             <p className="text-gray-400">Verifying your subscription...</p>
//           )}
//           {error && <p className="text-red-400 text-lg mt-4">{error}</p>}

//           {subscriptionDetails && plan && (
//             <div className="bg-gray-800/50 rounded-2xl p-6 mt-8 text-left max-w-md mx-auto">
//               <p className="text-lg mb-2">
//                 <span className="text-gray-400">Plan:</span>{" "}
//                 <strong className="text-purple-300">{plan.name}</strong>
//               </p>
//               <p className="text-lg">
//                 <span className="text-gray-400">Status:</span>{" "}
//                 <span className="text-green-400 font-bold">Active</span>
//               </p>
//             </div>
//           )}
//           <button
//             onClick={() => navigate("/user-profile/profile")}
//             className="mt-0 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-xl font-bold transition transform hover:scale-105 shadow-xl"
//           >
//             Go to Dashboard
//           </button>
//         </motion.div>

//         {/* Clean Explainer Videos Section */}
//         <div className="mt-20">
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-3xl md:text-4xl font-bold text-purple-400 mb-12"
//           >
//             Quick Explainer Videos
//           </motion.h2>

//           {statsLoading && (
//             <div className="text-center py-10">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 mx-auto"></div>
//             </div>
//           )}

//           {Object.entries(videosByLanguage).map(([language, sources]) => (
//             <motion.div
//               key={language}
//               initial={{ opacity: 0 }}
//               whileInView={{ opacity: 1 }}
//               viewport={{ once: true }}
//               className="mb-14"
//             >
//               <h3 className="text-2xl font-semibold mb-6 text-left border-l-4 border-purple-500 pl-4">
//                 {language}
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {sources.map((source, idx) => {
//                   const url = Array.isArray(source.url)
//                     ? source.url[0]
//                     : source.url;
//                   const secureUrl = url?.startsWith("https://")
//                     ? url
//                     : url?.replace("http://", "https://");
//                   const videoId =
//                     source.type !== "uploaded" && isYouTubeUrl(secureUrl)
//                       ? extractVideoId(secureUrl)
//                       : null;

//                   return (
//                     <div
//                       key={idx}
//                       className="bg-theme-bg2 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300"
//                     >
//                       <div className="aspect-video">
//                         {source.type === "uploaded" && secureUrl ? (
//                           <video
//                             controls
//                             muted
//                             loop
//                             className="w-full h-full object-cover"
//                           >
//                             <source src={secureUrl} type="video/mp4" />
//                             Your browser does not support the video.
//                           </video>
//                         ) : videoId ? (
//                           <iframe
//                             src={getEmbedUrl(videoId)}
//                             title="Explainer Video"
//                             className="w-full h-full"
//                             allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                             allowFullScreen
//                             loading="lazy"
//                           />
//                         ) : (
//                           <div className="flex items-center justify-center h-full bg-gray-800 text-gray-500">
//                             Video not available
//                           </div>
//                         )}
//                       </div>
//                       {source.description && (
//                         <p className="p-4 text-sm text-gray-300 leading-relaxed">
//                           {source.description}
//                         </p>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </motion.div>
//           ))}

//           {allVideoSources.length === 0 && !statsLoading && (
//             <p className="text-gray-400 text-lg mt-10">
//               No explainer videos available at the moment.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubsriptionPaymentSuccess;

// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import { FaCheckCircle } from "react-icons/fa";
// import { checkverifySubscription } from "../store/subscription/subscriptionSlice";
// const SubsriptionPaymentSuccess = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useSelector((state) => state.auth);
//   const { subscriptionPlanes } = useSelector((state) => state.subscription);
//   const [subscriptionDetails, setSubscriptionDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Extract session_id and email from query parameters
//   const query = new URLSearchParams(location.search);
//   const sessionId = query.get("session_id");
//   const email = query.get("email");

//   useEffect(() => {
//     const verifyPaymentSession = async () => {
//       if (!sessionId || !user) {
//         // setError("Missing session ID or user information");
//         setLoading(false);
//         return;
//       }

//       try {
//         // Dispatch the verifySession action
//         const response = await dispatch(checkverifySubscription({ sessionId })).unwrap();
//         setSubscriptionDetails(response);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error verifying session:", err);
//         setError(err.message || "Failed to verify subscription");
//         setLoading(false);
//       }
//     };

//     verifyPaymentSession();
//   }, [dispatch, sessionId, user]);

//   // Find the plan based on campaignId
//   const plan = subscriptionDetails
//     ? subscriptionPlanes.find((p) => p.id === subscriptionDetails.campaignId)
//     : null;

//   return (
//     <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
//       <div className="max-w-lg w-full bg-gray-800 rounded-xl shadow-xl p-8 text-white text-center">
//         <div className="flex justify-center mb-6">
//           <FaCheckCircle className="text-green-500 text-6xl animate-bounce" />
//         </div>
//         <h1 className="text-3xl font-bold text-purple-400 mb-4">Payment Successful!</h1>
//         <p className="text-gray-300 mb-6">
//           Congratulations! Your subscription has been activated successfully.
//         </p>

//         {loading && <p className="text-gray-400">Loading subscription details...</p>}
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         {subscriptionDetails && plan && (
//           <div className="bg-gray-700 rounded-lg p-4 mb-6">
//             <h2 className="text-xl font-semibold text-white">Subscription Details</h2>
//             <p className="text-gray-300 mt-2">
//               <strong>Plan:</strong> {plan.name}
//             </p>
//             <p className="text-gray-300">
//               <strong>Campaign ID:</strong> {subscriptionDetails.campaignId}
//             </p>
//             <p className="text-gray-300">
//               <strong>Subscribed At:</strong>{" "}
//               {new Date(subscriptionDetails.subscribedAt).toLocaleDateString()}
//             </p>
//             <p className="text-gray-300">
//               <strong>Status:</strong> {subscriptionDetails.status}
//             </p>
//             <p className="text-gray-300">
//               <strong>Session ID:</strong> {sessionId}
//             </p>
//           </div>
//         )}

//         <div className="flex flex-col sm:flex-row justify-center gap-4">
//           <button
//             onClick={() => navigate("/user-profile/profile")}
//             className="bg-purple-700 hover:bg-purple-600 px-6 py-2 rounded-full font-bold transition-colors"
//           >
//             Go to Dashboard
//           </button>
//           {/* <button
//             onClick={() => navigate("/pricing")}
//             className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-full font-bold transition-colors"
//           >
//             View Plans
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubsriptionPaymentSuccess;
