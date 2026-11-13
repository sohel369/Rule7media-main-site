import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { checkverifySubscription } from "../store/subscription/subscriptionSlice";
import {
  getStatisticsByCountry,
  reset,
} from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import {
  CheckCircle2,
  LayoutDashboard,
  BookOpen,
  Play,
  User,
  PlusSquare,
  HelpCircle,
  Globe,
  Cookie,
} from "lucide-react";
const LANGUAGE_MAP = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic",
  hi: "Hindi",
  th: "Thai",
  id: "Indonesian",
  it: "Italian",
  pt: "Portuguese",
  vi: "Vietnamese",
  tl: "Philippines",
  Unknown: "Other Languages",
};
const ADVERTISER_TYPES = ["advertiser", "buyer"];

const isYouTubeUrl = (url) =>
  url && (url.includes("youtube.com") || url.includes("youtu.be"));
const extractVideoId = (url) => {
  const m = url?.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  );
  return m && m[2].length === 11 ? m[2] : null;
};
const getEmbedUrl = (id) => `https://www.youtube.com/embed/${id}?autoplay=0`;

/* ─── Icons ── */
const IconCheck = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22c55e"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const IconDashboard = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);
const IconPlay = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
  </svg>
);
const IconUser = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M8 12h8M12 8v8" />
  </svg>
);
const IconHelp = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);
const IconGlobe = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e11d48"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);
const IconChevronDown = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e11d48"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════════ */
const BuyerMarketSubsriptionPaymentSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((s) => s.auth);
  const { subscriptionPlanes } = useSelector((s) => s.subscription);
  const { statistics, isLoading: statsLoading } = useSelector(
    (s) => s.statistic,
  );
  const { country, isLoading: countryLoading } = useSelector((s) => s.country);

  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVideoHint, setShowVideoHint] = useState(true);

  const query = new URLSearchParams(location.search);
  const sessionId = query.get("session_id");

  const userType = user?.userType?.toLowerCase();
  const isAdvertiser = ADVERTISER_TYPES.includes(userType);

  /* ── Country → Statistics ── */
  useEffect(() => {
    if (!country && !countryLoading) dispatch(fetchUserCountry());
  }, [dispatch, country, countryLoading]);

  useEffect(() => {
    if (country) dispatch(getStatisticsByCountry(country));
    return () => dispatch(reset());
  }, [country, dispatch]);

  /* ── Verify Payment ──────────────────────────────────────────────
     KEY FIX 1: We write a sessionStorage flag BEFORE any state
     update so that route guards checking subscription status won't
     redirect us away while we're still on this success page.

     KEY FIX 2: Token is read from cookie and passed to thunk — this
     is what verifySubscriptionSession() in the service expects.
  ── */
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setLoading(false);
        return;
      }
      if (!isAdvertiser) {
        setLoading(false);
        return;
      }
      sessionStorage.setItem(`verified_${sessionId}`, "pending");

      try {
        const token = Cookies.get("JwtToken");
        const response = await dispatch(
          checkverifySubscription({ sessionId, token }),
        ).unwrap();
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            subscription: {
              ...(storedUser.subscription || {}),
              status: "active",
              ...(response.subscription || {}),
            },
          }),
        );
        /* Mark as fully verified — route guard can read this */
        sessionStorage.setItem(`verified_${sessionId}`, "done");
        setSubscriptionDetails(response);
      } catch (err) {
        console.warn("Verify session warning:", err?.message);
        /* Even on error, subscription was likely created by Stripe.
           Keep user on success page, just show soft error. */
        sessionStorage.setItem(`verified_${sessionId}`, "done");
        setError(err?.message || null);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [dispatch, sessionId, user, isAdvertiser]);

  /* ── Derived ── */
  const plan = subscriptionDetails
    ? subscriptionPlanes.find((p) => p.id === subscriptionDetails.campaignId)
    : null;

const allVideoSources = statistics
  ?.filter((s) => s.videoType?.toLowerCase() === "global")
  .flatMap((s) => s.sources || []) || [];
  const videosByLanguage = allVideoSources.reduce((acc, src) => {
    const lang = LANGUAGE_MAP[src.language] || LANGUAGE_MAP.Unknown;
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(src);
    return acc;
  }, {});

  const scrollToVideos = () => {
    document
      .getElementById("r7-videos-section")
      ?.scrollIntoView({ behavior: "smooth" });
    setShowVideoHint(false);
  };

  /* ── MAIN RENDER ── */
  return (
    <div className="min-h-screen bg-[#07080b] text-white">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-sm w-[90%] text-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin mx-auto mb-6"
                style={{ width: 72, height: 72 }}
              />
              <h2 className="font-black text-2xl mb-2 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Verifying Payment
              </h2>
              <p className="text-slate-400 text-sm mb-1">
                Please wait while we confirm your subscription…
              </p>
              <p className="text-slate-600 text-xs mb-6">
                Do not refresh or close this page
              </p>
              <div className="flex justify-center gap-2">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-rose-500"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <main className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(225,29,72,0.18)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          {/* Check icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_0_40px_rgba(34,197,94,0.08)]"
          >
            <IconCheck />
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-black tracking-tight leading-tight mb-2"
            style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="block text-slate-100 [text-shadow:0_0_60px_rgba(225,29,72,0.25)]">
              Payment Successful!
            </span>
            <span
              className="italic bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 bg-clip-text text-transparent"
              style={{ fontSize: "clamp(1.4rem,3vw,2.4rem)" }}
            >
              Your subscription is now active.
            </span>
          </motion.h1>

          <motion.p
            className="text-slate-500 max-w-xl mx-auto mt-4 text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Welcome to the Rule 7 ecosystem. Your account has been upgraded and
            you are ready to start your first campaign.
          </motion.p>

          {/* Soft error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 max-w-sm mx-auto"
            >
              Note: {error}
            </motion.p>
          )}

          {/* Plan details */}
          {subscriptionDetails && (
            <motion.div
              className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 max-w-xs mx-auto mt-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <p className="text-sm mb-1">
                <span className="text-slate-500">Plan: </span>
                <strong className="text-violet-300">
                  {plan?.name ||
                    subscriptionDetails.subscription?.planName ||
                    "Premium Plan"}
                </strong>
              </p>
              <p className="text-sm">
                <span className="text-slate-500">Status: </span>
                <span className="text-green-400 font-bold">Active</span>
              </p>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center mt-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate("/user-profile/profile")}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-900 text-white font-bold text-sm shadow-[0_4px_24px_rgba(225,29,72,0.25)] hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-w-[180px] justify-center"
            >
              <IconDashboard /> Go to Dashboard
            </button>
            <button
              onClick={scrollToVideos}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-w-[180px] justify-center"
            >
              <IconPlay /> Watch Tutorials
            </button>
          </motion.div>

          {/* Scroll hint */}
          {showVideoHint && allVideoSources.length > 0 && !loading && (
            <motion.div
              className="mt-10 flex flex-col items-center gap-1 text-rose-500/70 animate-bounce"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Tutorials below
              </span>
              <IconChevronDown />
            </motion.div>
          )}
        </div>
      </main>

      {/* Content Section: Video Onboarding - Exact match from image */}
      {/* Content Section: Video Onboarding */}
      {/* Content Section: Video Onboarding */}
      <section
        id="r7-videos-section"
        className="py-24 bg-[#050608] border-y border-white/5"
      >
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-200">
                Platform Onboarding
              </h2>
              <p className="text-slate-500 mt-2">
                Get started with these helpful explainer videos.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Globe className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                English Edition
              </span>
            </div>
          </div>

          {/* Stats spinner */}
          {statsLoading && (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
            </div>
          )}

          {/* Main Content - Video Grid + Quick Actions Side by Side */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Grid - Takes 2 columns */}
            <div className="lg:col-span-2">
              {Object.entries(videosByLanguage).map(
                ([language, sources], index) => (
                  <div
                    key={language}
                    className={
                      index !== Object.entries(videosByLanguage).length - 1
                        ? "mb-14"
                        : ""
                    }
                  >
                    {/* Language Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 rounded-full bg-gradient-to-b from-rose-500 to-rose-900" />
                      <span className="font-black text-xl text-slate-300 tracking-tight">
                        {language}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-400">
                        {sources.length} video{sources.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Video Cards Grid - 2 columns per row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sources.map((source, idx) => {
                        const rawUrl = Array.isArray(source.url)
                          ? source.url[0]
                          : source.url;
                        const secureUrl = rawUrl?.startsWith("https://")
                          ? rawUrl
                          : rawUrl?.replace("http://", "https://");
                        const videoId =
                          source.type !== "uploaded" && isYouTubeUrl(secureUrl)
                            ? extractVideoId(secureUrl)
                            : null;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
                          >
                            <div className="aspect-video bg-[#0d0f12] relative">
                              {/* Play button overlay - only show if video available */}
                              {source.type === "uploaded" || videoId ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all z-10">
                                  <div className="w-12 h-12 glass rounded-full flex items-center justify-center border-rose-500/30 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 text-white fill-white" />
                                  </div>
                                </div>
                              ) : null}

                              {/* Video Player or Coming Soon */}
                              {source.type === "uploaded" && secureUrl ? (
                                <video
                                  controls
                                  muted
                                  loop
                                  className="w-full h-full object-cover"
                                >
                                  <source src={secureUrl} type="video/mp4" />
                                </video>
                              ) : videoId ? (
                                <iframe
                                  src={getEmbedUrl(videoId)}
                                  title={
                                    source.description || "Explainer Video"
                                  }
                                  className="w-full h-full border-0"
                                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-black uppercase tracking-widest">
                                  COMING SOON
                                </div>
                              )}
                            </div>

                            {/* Video Description */}
                            {source.description && (
                              <p className="px-4 py-3 text-xs text-slate-400 leading-relaxed border-t border-white/[0.05]">
                                {source.description}
                              </p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}

              {/* Empty State */}
              {allVideoSources.length === 0 && !statsLoading && (
                <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                  <p className="text-slate-500 text-lg mb-6">
                    No tutorial videos available yet.
                  </p>
                  <div className="max-w-md mx-auto space-y-3">
                    {[
                      "Revolutionizing Advertising - The Power of Collaborative Campaigns",
                      "A Paradigm shift in marketing - Increasing Impressions & Budget Savings",
                      "Comparing CPM: Mobile Billboards vs Traditional Media Platforms",
                      "The Evolution of Advertising Trends",
                      "The Multiple Benefits and Rewards to Vehicle Operators",
                    ].map((title, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]"
                      >
                        <span className="text-sm text-slate-400 text-left">
                          {title}
                        </span>
                        <span className="text-[10px] font-black text-rose-500/70 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                          COMING SOON
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Sidebar - Sticky on Right */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-6">
                {/* Quick Actions Card */}
                <div className="glass p-8 rounded-[32px] border border-rose-500/10">
                  <h4 className="text-sm font-black text-rose-500 uppercase tracking-[0.2em] mb-6">
                    Quick Actions
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate("/user-profile/account-settings")}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-slate-700/80 transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                        Update Profile
                      </span>
                    </button>

                    <button
                      onClick={() => navigate("/user-profile/create-campaign")}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-slate-700/80 transition-all">
                        <PlusSquare className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                        Create Campaign
                      </span>
                    </button>

                    <button
                      onClick={() => (window.location.href = "/contact-us")}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-rose-500 group-hover:bg-slate-700/80 transition-all">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-300 group-hover:text-white transition-colors">
                        Help Center
                      </span>
                    </button>
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="glass p-8 rounded-[32px] bg-gradient-to-br from-rose-600/20 to-rose-900/20 border border-rose-500/20">
                  <h4 className="text-white font-bold mb-2">
                    Need Assistance?
                  </h4>
                  <p className="text-rose-100/70 text-sm mb-5 leading-relaxed">
                    Our support team is available 24/7 to help with your first
                    setup.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/contact-us")}
                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-white transition-all duration-300 backdrop-blur-sm"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyerMarketSubsriptionPaymentSuccess;
