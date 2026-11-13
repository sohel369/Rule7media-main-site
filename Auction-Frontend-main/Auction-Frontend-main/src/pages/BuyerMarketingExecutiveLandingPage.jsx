import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  X,
  Play,
  Users,
  TrendingDown,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Headers from "../components/Header";
import Footer from "../components/Footer";
import { getStatisticsByCountry } from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import {
  submitEnquiryAsync,
  resetEnquiryState,
} from "../store/enquiry/enquirySlice";
const BuyerMarketingExecutiveLandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(1);
  const dispatch = useDispatch();
  const [showVideo, setShowVideo] = useState(false);
  const { country } = useSelector((state) => state.country);
  const { statistics, isLoading } = useSelector((state) => state.statistic);
  const { loading, success, error, enquiryResponse } = useSelector(
    (state) => state.enquiry,
  );

  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    company: "",
    industry: "",
    email: "",
    country: "",
    state: "",
  });
  const [selectedVideo, setSelectedVideo] = useState(null);
  const getVideoId = (url) => {
    if (typeof url !== "string") return null;
    if (url.includes("youtu.be")) {
      return url.split("/").pop()?.split("?")[0];
    }
    if (url.includes("watch?v=")) {
      return url.split("watch?v=")[1]?.split("&")[0];
    }
    if (url.includes("embed/")) {
      return url.split("embed/")[1]?.split("?")[0];
    }
    return null;
  };
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (country) {
      dispatch(getStatisticsByCountry(country));
    }
  }, [dispatch, country]);
  useEffect(() => {
    if (success) {
      toast.success(
        "Your enquiry has been submitted successfully! Our team will be in touch soon.!",
      );

      setFormData({
        firstName: "",
        surname: "",
        company: "",
        industry: "",
        email: "",
        country: "",
        state: "",
      });

      dispatch(resetEnquiryState());
    }
    if (error) {
      toast.error(error.message || error);
    }
  }, [success, error, dispatch]);
  const allVideoSources =
    statistics
      ?.filter((stat) => stat.videoType === "buyerMarket")
      ?.flatMap((stat) => stat.sources || []) || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(submitEnquiryAsync(formData));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .accent-gradient {
          background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
        }

        .glow-hover:hover {
          box-shadow: 0 0 30px rgba(244, 63, 94, 0.5);
        }

        .floodlight-text {
          background: linear-gradient(to bottom, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ruby-shine {
          background: linear-gradient(
            135deg,
            #f43f5e 0%,
            #fb7185 50%,
            #f43f5e 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: shine 3s linear infinite;
        }

        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* <nav className="fixed w-full z-50 top-4 px-4">
        <div className="glass max-w-6xl mx-auto rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 accent-gradient rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-rose-900/20">
              R7
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">
              RULE 7 MEDIA
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
            <Link
  to="/how-it-works"
  className="hover:text-rose-500 transition-colors"
>
  How it Works
</Link>

<Link
  to="/#benefits"
  className="hover:text-rose-500 transition-colors"
>
  Advertiser Perks
</Link>

<Link
  to="/liveauction"
  className="hover:text-rose-500 transition-colors"
>
  Live Auctions
</Link>
          </div>

          <div className="flex items-center gap-4">
           <Link to="/login"
              className="hidden sm:block text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors"
            >
              Sign In
            </Link>
            <Link to="/register?role=advertiser">
              <button className="accent-gradient px-6 py-2.5 rounded-xl text-sm font-bold text-white glow-hover transition-all">
                Register Now
              </button>
            </Link>
            <button
              className="md:hidden text-slate-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass max-w-6xl mx-auto mt-2 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-slate-400 hover:text-rose-500 py-2"
              >
                How it Works
              </a>
              <a
                href="#benefits"
                className="text-sm font-semibold text-slate-400 hover:text-rose-500 py-2"
              >
                Advertiser Perks
              </a>
              <Link to="/liveauction"
               
                className="text-sm font-semibold text-slate-400 hover:text-rose-500 py-2"
              >
                Live Auctions
              </Link>
            </div>
          </div>
        )}
      </nav> */}
      <Headers />
      {/* Hero Section */}
      <header className="relative pt-10 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-900/40 via-transparent to-transparent blur-[120px] rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8">
            The New Standard in Global Advertising
          </span>

          <h1 className="text-5xl md:text-8xl font-extrabold mb-8 leading-[1.05] tracking-tighter">
            <span className="floodlight-text block mb-2">
              Revolutionise Your Marketing
            </span>
            <span className="ruby-shine italic">Through Collaboration.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Shift from competition to strategic creative storytelling. Our
            decreasing-bid auction platform gives you total control over budget
            while dominating both the physical and on-line landscape.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register?role=advertiser"
              className="w-full sm:w-auto px-10 py-4 accent-gradient rounded-2xl font-bold text-lg text-white glow-hover transition-all flex items-center justify-center gap-3"
            >
              Join the Auction Platform
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/Statistics">
              <button className="w-full sm:w-auto px-10 py-4 glass rounded-2xl font-bold text-lg text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                Watch Explainer Videos
              </button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-24 relative group">
            <div className="absolute inset-0 accent-gradient opacity-10 blur-[100px] group-hover:opacity-20 transition-opacity"></div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              </div>
            ) : allVideoSources.length > 0 ? (
              <>
                {/* Single Video - Centered */}
                {allVideoSources.length === 1 && (
                  <div className="max-w-4xl mx-auto">
                    {(() => {
                      const source = allVideoSources[0];
                      const videoUrl = (
                        Array.isArray(source.url) ? source.url[0] : source.url
                      )?.trim();
                      const isYouTube =
                        videoUrl?.includes("youtube.com") ||
                        videoUrl?.includes("youtu.be");

                      const getYouTubeId = (url) => {
                        const regExp =
                          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                        const match = url?.match(regExp);
                        return match && match[2].length === 11
                          ? match[2]
                          : null;
                      };

                      const videoId = isYouTube ? getYouTubeId(videoUrl) : null;

                      return (
                        <div>
                          <div className="relative w-full pb-[56.25%] h-0 mb-6 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-gray-900">
                            {isYouTube && videoId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={source.description || `Video`}
                                className="absolute top-0 left-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : source.type === "uploaded" ? (
                              <video
                                controls
                                className="absolute top-0 left-0 w-full h-full object-cover"
                              >
                                <source src={videoUrl} type="video/mp4" />
                              </video>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500">
                                  Video unavailable
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-amber-500 px-2 italic uppercase tracking-tight text-center">
                            {source.description || `Video Title`}
                          </h3>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Two or More Videos - Grid Layout */}
                {allVideoSources.length >= 2 && (
                  <div className="grid lg:grid-cols-2 gap-12">
                    {allVideoSources.slice(0, 4).map((source, index) => {
                      const videoUrl = (
                        Array.isArray(source.url) ? source.url[0] : source.url
                      )?.trim();
                      const isYouTube =
                        videoUrl?.includes("youtube.com") ||
                        videoUrl?.includes("youtu.be");

                      const getYouTubeId = (url) => {
                        const regExp =
                          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                        const match = url?.match(regExp);
                        return match && match[2].length === 11
                          ? match[2]
                          : null;
                      };

                      const videoId = isYouTube ? getYouTubeId(videoUrl) : null;

                      return (
                        <div key={index}>
                          <div className="relative w-full pb-[56.25%] h-0 mb-6 shadow-2xl shadow-amber-900/10 rounded-2xl overflow-hidden bg-gray-900">
                            {isYouTube && videoId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={
                                  source.description || `Video ${index + 1}`
                                }
                                className="absolute top-0 left-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : source.type === "uploaded" ? (
                              <video
                                controls
                                className="absolute top-0 left-0 w-full h-full object-cover"
                              >
                                <source src={videoUrl} type="video/mp4" />
                              </video>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-500">
                                  Video unavailable
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-amber-500 px-2 italic uppercase tracking-tight">
                            {source.description || `Video Title ${index + 1}`}
                          </h3>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show "More Videos" message if more than 4 */}
                {allVideoSources.length > 4 && (
                  <div className="text-center mt-12">
                    <p className="text-amber-500/70 text-sm">
                      +{allVideoSources.length - 4} more videos available
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400">
                  No videos available in your region yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Value Proposition */}
      <section className="py-24 bg-[#050608] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl font-extrabold mb-8 text-slate-200 leading-tight">
                A Smarter Way to <span className="ruby-shine">Scale.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Traditional media is fragmented. We offer the only form of
                marketing where vehicle owners compete for <strong>your</strong>{" "}
                business by progressively lowering their bids.
              </p>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-14 h-14 shrink-0 glass rounded-2xl flex items-center justify-center text-rose-500 border-rose-500/20 shadow-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-slate-200">
                      Corporate Collaboration
                    </h4>
                    <p className="text-slate-400">
                      Partner with non-competing brands to share campaign costs
                      and achieve total streetscape dominance.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-14 h-14 shrink-0 glass rounded-2xl flex items-center justify-center text-rose-500 border-rose-500/20 shadow-xl">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-slate-200">
                      Efficiency-Driven Costing
                    </h4>
                    <p className="text-slate-400">
                      Bypass the digital saturation. Get authentic real-world
                      impact for a fraction of traditional OOH prices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="glass p-10 rounded-[32px] space-y-4 animate-float shadow-xl">
                <div className="text-4xl font-extrabold text-rose-500">
                  $1.25
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Min. Target CPM
                </div>
              </div>
              <div className="glass p-10 rounded-[32px] space-y-4 mt-12 shadow-xl">
                <div className="text-4xl font-extrabold text-slate-200">
                  100%
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Directly Managed
                </div>
              </div>
              <div className="glass p-10 rounded-[32px] space-y-4 -mt-6 shadow-xl">
                <div className="text-4xl font-extrabold text-slate-200 uppercase tracking-tighter">
                  Global
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Scaleable Reach
                </div>
              </div>
              <div className="glass p-10 rounded-[32px] space-y-4 mt-6 shadow-xl">
                <div className="text-4xl font-extrabold text-rose-500">
                  24/7
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Asset Presence
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-black">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-200 mb-4 tracking-tight">
              Platform Intelligence
            </h2>
            <p className="text-slate-500 font-medium">
              Clear answers for professional partners.
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="glass rounded-3xl border border-white/5 transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === 1 ? 0 : 1)}
                className="w-full px-8 py-7 flex justify-between items-center text-left group"
              >
                <span className="font-bold text-lg text-slate-300 group-hover:text-rose-500 transition-colors">
                  How does the decreasing bid model work?
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeFaq === 1
                      ? "rotate-180 text-rose-500"
                      : "text-slate-600"
                  }`}
                />
              </button>
              {activeFaq === 1 && (
                <div className="px-8 pb-8 text-slate-400 leading-relaxed font-medium">
                  Instead of you bidding against other advertisers, vehicle
                  owners compete for your campaign. They submit progressively
                  lower prices until you find a partner that fits your budget
                  and brand requirements perfectly.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="glass rounded-3xl border border-white/5 transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === 2 ? 0 : 2)}
                className="w-full px-8 py-7 flex justify-between items-center text-left group"
              >
                <span className="font-bold text-lg text-slate-300 group-hover:text-rose-500 transition-colors">
                  Is there a management fee for the campaign?
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeFaq === 2
                      ? "rotate-180 text-rose-500"
                      : "text-slate-600"
                  }`}
                />
              </button>
              {activeFaq === 2 && (
                <div className="px-8 pb-8 text-slate-400 leading-relaxed font-medium">
                  Yes, the relatively inexpensive platform fees are shared
                  between the Advertiser and Vehicle Owner. Rule 7 Media manages
                  the setup, installation, and ongoing monitoring at no extra
                  cost beyond the platform fee.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="glass rounded-3xl border border-white/5 transition-all duration-300">
              <button
                onClick={() => setActiveFaq(activeFaq === 3 ? 0 : 3)}
                className="w-full px-8 py-7 flex justify-between items-center text-left group"
              >
                <span className="font-bold text-lg text-slate-300 group-hover:text-rose-500 transition-colors">
                  Can I collaborate with other brands?
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    activeFaq === 3
                      ? "rotate-180 text-rose-500"
                      : "text-slate-600"
                  }`}
                />
              </button>
              {activeFaq === 3 && (
                <div className="px-8 pb-8 text-slate-400 leading-relaxed font-medium">
                  Absolutely, our Mission statement is Collaboration over
                  Competition, leading to significant savings and improved
                  reach. Our platform facilitates connections between
                  non-competing brands to maximize asset utilization.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-32 bg-[#050608] border-t border-white/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass p-10 md:p-16 rounded-[48px] border-rose-500/10 shadow-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-200 mb-4">
                Want to know more?
              </h2>
              <p className="text-slate-400">
                Complete the form below and our team will be in touch.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName" // Added name attribute
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  Surname
                </label>
                <input
                  type="text"
                  name="surname" // Added name attribute
                  required
                  value={formData.surname}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company" // Fixed: name should be "company", not "country"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="Company Ltd"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry" // Fixed: name should be "industry", not "state"
                  required
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="Advertising"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email" // Added name attribute
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country" // Added name attribute
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="United Kingdom"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">
                  State or Region
                </label>
                <input
                  type="text"
                  name="state" // Added name attribute
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500/50"
                  placeholder="London"
                />
              </div>

              <div className="md:col-span-2 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 accent-gradient rounded-2xl font-bold text-xl text-white glow-hover shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative text-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto glass p-16 md:p-24 rounded-[64px] border-rose-500/10 shadow-3xl">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter text-slate-200">
              Elevate Your Brand <br />
              <span className="ruby-shine uppercase tracking-widest text-3xl">
                Legacy
              </span>
            </h2>
            <p className="text-xl text-slate-400 mb-12 font-medium">
              Join the ranks of innovative market leaders reclaiming their
              physical presence.
            </p>
            <Link to="/register?role=advertiser">
              <button className="px-12 py-5 accent-gradient rounded-2xl font-bold text-xl text-white glow-hover shadow-2xl">
                List your Business Today
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 accent-gradient rounded flex items-center justify-center font-bold text-white">
                R7
              </div>
              <span className="font-bold text-slate-200 uppercase tracking-tighter">
                RULE 7 MEDIA
              </span>
            </div>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
              <Link
  to="/privacy-policy"
  className="hover:text-rose-500 transition-colors"
>
  Privacy
</Link>

<Link
  to="/terms-conditions"
  className="hover:text-rose-500 transition-colors"
>
  Terms
</Link>

<Link
  to="/franchise"
  className="hover:text-rose-500 transition-colors"
>
  Marketplace
</Link>

<Link
  to="/contact-us"
  className="hover:text-rose-500 transition-colors"
>
  Support
</Link>
            </div>
            <p className="text-xs font-bold text-slate-600">
              © 2026 RULE 7 MEDIA. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer> */}
      <Footer />
    </div>
  );
};

export default BuyerMarketingExecutiveLandingPage;
