import React, { useEffect, useState } from "react";
import {
  Eye,
  Search,
  Heart,
  BarChart3,
  User,
  XCircle,
  ShoppingCart,
  UserCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MediaKitDownloadModal from "../components/MediaKitDownloadModal";
import {
  getStatisticsByCountry,
  reset,
} from "../store/statistic/statisticSlice";
const PricingMethodology = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMediaKitModalOpen, setIsMediaKitModalOpen] = useState(false);
  const { country, isLoading: countryLoading } = useSelector(
    (state) => state.country,
  );
  const { statistics } = useSelector((state) => state.statistic);

  const videos =
    statistics
      ?.filter((stat) => stat.videoType === "pricingMethodology")
      ?.flatMap((stat) => stat.sources || []) || [];

  const handleStartCampaign = () => {
    if (!isLoggedIn) {
      navigate("/subscriberonly"); // ya login page
      return;
    }

    const role = user?.userType;

    if (role === "advertiser") {
      navigate("/user-profile/create-campaign");
    } else if (role === "seller") {
      navigate("/user-profile/create-auction");
    } else if (role === "fleetOwner") {
      navigate("/user-profile/add-auction");
    } else if (role === "wrapper") {
      navigate("/user-profile/add-ad_gif");
    } else {
      navigate("/user-profile/profile"); // fallback
    }
  };
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;

  const logInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (country) {
      dispatch(getStatisticsByCountry(country));
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, country]);

  const onGetStartedClick = () => {
if (!logInUser) {
    window.open(
      "https://digital-ocean-production-01ee.up.railway.app/login",
      "_blank"
    );
    return;
  }

    const role = logInUser.userType?.toLowerCase();

    if (role === "advertiser") {
      navigate("/user-profile/create-campaign");
    } else if (role === "fleetowner") {
      navigate("/user-profile/add-auction");
    } else if (role === "seller") {
      navigate("/user-profile/create-auction");
    } else if (role === "wrapper") {
      navigate("/user-profile/profile");
    } else {
      // fallback
      navigate("/user-profile/profile");
    }
  };

  const handleDownloadKit = (e) => {
    e.preventDefault();
    setIsMediaKitModalOpen(true);
  };
  return (
    <>
      {!isLoggedIn && <Header />}
      <MediaKitDownloadModal
        isOpen={isMediaKitModalOpen}
        onClose={() => setIsMediaKitModalOpen(false)}
      />
      <div className="bg-white text-slate-900 antialiased">
        {/* Hero Header */}
        <header
          className="relative pt-32 pb-24 text-white overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at top right, #112240 0%, #0a192f 100%)",
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  ></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wider uppercase mb-6">
                The Science of Conversion
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
                Pricing Methodology
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
                Before a consumer ever clicks{" "}
                <span className="text-white font-semibold">"Buy Now,"</span>{" "}
                they move through a precise psychological journey shaped by the{" "}
                <span className="text-emerald-400 font-semibold underline decoration-2 underline-offset-4">
                  Rule of 7 Marketing Theory
                </span>
                .
              </p>
            </div>
          </div>
        </header>

        {/* The 7 Stages Section */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ color: "#0a192f" }}
                >
                  The Psychological Journey
                </h2>
                <p className="text-slate-600 text-lg">
                  It takes an average of seven meaningful touches with your
                  brand before a prospect feels confident enough to decide. Here
                  is how Rule 7 Media engineers that path.
                </p>
              </div>
              <div className="hidden lg:block h-px flex-1 bg-slate-200 mx-10 mb-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Stage 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group">
                <div className="step-number w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-emerald-500/20">
                  1
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "#0a192f" }}
                >
                  Unaware
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  First exposure. Random ads on social media are forgotten
                  instantly. We plant the first seed of recognition.
                </p>
                <Eye
                  className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500 transition-colors"
                  size={24}
                />
              </div>

              {/* Stage 2-3 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group">
                <div className="step-number w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-emerald-500/20">
                  2-3
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "#0a192f" }}
                >
                  Awareness
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Curiosity begins. They start to notice your name, but trust is
                  still zero. We maintain presence to build recall.
                </p>
                <Search
                  className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500 transition-colors"
                  size={24}
                />
              </div>

              {/* Stage 4-5 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group">
                <div className="step-number w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-emerald-500/20">
                  4-5
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "#0a192f" }}
                >
                  Interest
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Consideration phase. Consistent messaging becomes critical to
                  reduce skepticism without auction competition.
                </p>
                <Heart
                  className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500 transition-colors"
                  size={24}
                />
              </div>

              {/* Stage 6 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group lg:col-span-1">
                <div className="step-number w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-emerald-500/20">
                  6
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "#0a192f" }}
                >
                  Evaluation
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Preference forms. Controlled sequencing creates mental
                  ownership of the offer in the prospect's mind.
                </p>
                <BarChart3
                  className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500 transition-colors"
                  size={24}
                />
              </div>

              {/* Stage 7+ */}
              <div
                className="lg:col-span-4 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 text-white shadow-2xl"
                style={{ backgroundColor: "#0a192f" }}
              >
                <div className="w-24 h-24 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-4xl font-black shadow-2xl shadow-emerald-500/40">
                  7+
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    Purchase Decision &amp; Loyalty
                  </h3>
                  <p className="text-slate-300 text-lg">
                    Only after the seventh impression does a consumer move from{" "}
                    <span className="text-emerald-400 italic font-medium">
                      "maybe"
                    </span>{" "}
                    to{" "}
                    <span className="text-white font-bold uppercase tracking-widest">
                      "yes."
                    </span>{" "}
                    Rule 7 Media is engineered to hit this exact cadence at a
                    fraction of typical market costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Repeated Impressions Win */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2
                className="text-4xl font-bold mb-6"
                style={{ color: "#0a192f" }}
              >
                Why Repeated Impressions Win
              </h2>
              <p className="text-slate-600 text-lg">
                Traditional ads are scatter-shot. Rule 7 Media is a precision
                sequence targeting the same person until they convert.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Infographic Side */}
              <div className="space-y-8">
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 relative">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                    Traditional Ad Flow (Google/Meta)
                  </h4>
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <User size={24} />
                    </div>
                    <div className="flex-1 h-1 bg-slate-200 rounded-full relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">
                        Random Frequency
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <XCircle size={24} />
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-slate-500 italic">
                    "Algorithms optimize for clicks, not psychological
                    conversion. Impressions are spread thinly across millions."
                  </p>
                </div>

                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 relative shadow-xl shadow-emerald-500/5">
                  <h4 className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-6">
                    Rule 7 Dedicated Flow
                  </h4>
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <UserCheck size={24} />
                    </div>
                    <div className="flex-1 flex justify-between px-4">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <ShoppingCart size={24} />
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-emerald-700 font-medium">
                    "Controlled, dedicated delivery to the same high-intent
                    audience until the Rule of 7 is reached."
                  </p>
                </div>
              </div>

              {/* Text Side */}
              <div className="lg:pl-10">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 text-emerald-500 mt-1">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4
                        className="text-xl font-bold mb-2"
                        style={{ color: "#0a192f" }}
                      >
                        Algorithm Comparison
                      </h4>
                      <p className="text-slate-600">
                        Google and Meta use real-time auctions that penalize
                        frequency. If you try to reach the same user 7 times,
                        your costs skyrocket.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 text-emerald-500 mt-1">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4
                        className="text-xl font-bold mb-2"
                        style={{ color: "#0a192f" }}
                      >
                        Owned Audience Control
                      </h4>
                      <p className="text-slate-600">
                        Rule 7 Media allows you to own the journey. You aren't
                        competing with cat videos or political ads; you're
                        nurturing a dedicated channel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section
          className="py-24 text-white"
          style={{ backgroundColor: "#0a192f" }}
        >
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              The Comparison:{" "}
              <span className="text-emerald-400">Platforms vs. Rule 7</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-6 px-4 text-slate-400 font-medium uppercase tracking-widest text-xs">
                      Capability
                    </th>
                    <th className="py-6 px-4 font-bold text-lg">
                      Social/Google Ads
                    </th>
                    <th className="py-6 px-4 font-bold text-lg text-emerald-400">
                      Rule 7 Media
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-6 px-4 font-semibold text-slate-300">
                      Targeting Strategy
                    </td>
                    <td className="py-6 px-4 text-slate-400">
                      Broad look-alikes &amp; broad keywords
                    </td>
                    <td className="py-6 px-4 text-emerald-300 font-medium italic">
                      High-intent sequence targeting
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6 px-4 font-semibold text-slate-300">
                      Frequency Control
                    </td>
                    <td className="py-6 px-4 text-red-400">
                      <X size={16} className="inline" /> Random/Low
                    </td>
                    <td className="py-6 px-4 text-emerald-400">
                      <Check size={16} className="inline" /> Perfect 7-Sequence
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6 px-4 font-semibold text-slate-300">
                      Cost Efficiency
                    </td>
                    <td className="py-6 px-4 text-slate-400">
                      Auction-based inflation
                    </td>
                    <td className="py-6 px-4 text-emerald-400">
                      Flat-rate predictable delivery
                    </td>
                  </tr>
                  <tr>
                    <td className="py-6 px-4 font-semibold text-slate-300">
                      Conversion Impact
                    </td>
                    <td className="py-6 px-4 text-slate-400">
                      Single impression "Luck"
                    </td>
                    <td className="py-6 px-4 text-emerald-400 font-bold underline underline-offset-4">
                      300-700% Higher ROI
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Benefits & Savings Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2
                  className="text-4xl font-bold mb-6"
                  style={{ color: "#0a192f" }}
                >
                  Benefits &amp; Savings of Rule 7 Media
                </h2>
                <p className="text-slate-600 text-lg">
                  Our dedicated model removes the "Auction Tax" and focuses
                  solely on the tipping point of the purchase decision.
                </p>
              </div>

              {/* Savings Highlight Card */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-emerald-500 rounded-[2rem] p-10 text-white text-center">
                  <div className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-80">
                    Estimated Savings
                  </div>
                  <div className="text-6xl font-black mb-2">60–80%</div>
                  <p className="text-emerald-100 font-medium">
                    Lower Effective Ad Cost
                  </p>
                </div>
                <div
                  className="p-10 text-white text-center rounded-[2rem]"
                  style={{ backgroundColor: "#0a192f" }}
                >
                  <div className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-60">
                    Resulting ROI
                  </div>
                  <div className="text-6xl font-black mb-2 text-emerald-400">
                    300–700%
                  </div>
                  <p className="text-slate-400 font-medium">
                    Average Campaign Increase
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-10 border-b md:border-b-0 md:border-r border-slate-200">
                    <h4
                      className="font-bold mb-6 flex items-center gap-2"
                      style={{ color: "#0a192f" }}
                    >
                      <AlertCircle className="text-red-500 w-5 h-5" />{" "}
                      Traditional Limitations
                    </h4>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 text-slate-500 text-sm">
                        <XCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />{" "}
                        Wasted one-off impressions that never convert.
                      </li>
                      <li className="flex items-start gap-3 text-slate-500 text-sm">
                        <XCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />{" "}
                        CPM inflation caused by competing with massive budgets.
                      </li>
                      <li className="flex items-start gap-3 text-slate-500 text-sm">
                        <XCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />{" "}
                        Algorithms prioritize platforms' profits over your CAC.
                      </li>
                    </ul>
                  </div>
                  <div className="p-10 bg-emerald-50/30">
                    <h4
                      className="font-bold mb-6 flex items-center gap-2"
                      style={{ color: "#0a192f" }}
                    >
                      <CheckCircle2 className="text-emerald-500 w-5 h-5" /> Rule
                      7 Advantages
                    </h4>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                        <Check className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />{" "}
                        No wasted "junk" impressions.
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                        <Check className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />{" "}
                        Predictable subscriber/sequence rates.
                      </li>
                      <li className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                        <Check className="text-emerald-500 w-5 h-5 shrink-0 mt-0.5" />{" "}
                        Maximum psychological frequency impact.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Panels */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12">
              {videos && videos.length > 0 ? (
                videos.map((video, index) => {
                  // URL extract
                  const videoUrl =
                    typeof video === "string"
                      ? video
                      : Array.isArray(video?.url)
                        ? video.url[0]
                        : video?.url;

                  // YouTube check
                  const isYouTube =
                    typeof videoUrl === "string" &&
                    (videoUrl.includes("youtube.com") ||
                      videoUrl.includes("youtu.be"));

                  // Better YouTube ID extractor
                  const getYoutubeId = (url) => {
                    if (!url) return null;

                    const regExp =
                      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

                    const match = url.match(regExp);

                    return match && match[2].length === 11 ? match[2] : null;
                  };

                  const youtubeId = isYouTube ? getYoutubeId(videoUrl) : null;

                  const embedUrl = youtubeId
                    ? `https://www.youtube.com/embed/${youtubeId}`
                    : null;

                  return (
                    <div key={index} className="space-y-6">
                      <h3 className="text-2xl font-bold text-[#0a192f]">
                        {video?.description || `Video ${index + 1}`}
                      </h3>

                      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                        {isYouTube && embedUrl ? (
                          <iframe
                            className="w-full h-full"
                            src={embedUrl}
                            title={`youtube-video-${index}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : videoUrl ? (
                          <video
                            controls
                            className="w-full h-full object-cover"
                          >
                            <source src={videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500">
                            No Video Available
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500">
                  No videos found
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 text-center">
            <div
              className="max-w-3xl mx-auto rounded-[3rem] p-12 md:p-20 text-white shadow-3xl relative overflow-hidden"
              style={{ backgroundColor: "#0a192f" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px]"></div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">
                Ready to achieve superior ROI?
              </h2>
              <p className="text-slate-400 text-lg mb-10">
                Stop paying the "Auction Tax" and start building a dedicated
                customer journey that actually converts.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={onGetStartedClick}
                  className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-navy-900 font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  Get Started Today
                </button>
                <button
                  onClick={handleDownloadKit}
                  className="px-10 py-5 border border-white/20 hover:bg-white/10 font-bold rounded-2xl transition-all"
                >
                  Download Media Kit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Custom CSS for gradients and animations */}
        <style>{`
        .step-number {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }
        @keyframes pulse {
          50% { opacity: .5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      </div>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default PricingMethodology;
