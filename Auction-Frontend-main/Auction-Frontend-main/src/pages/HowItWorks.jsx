// pages/HowItWorks.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getStatisticsByCountry } from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import {
  Clapperboard,
  ChevronDown,
  Zap,
  Settings,
  Eye,
  HelpCircle,
  Globe,
  TrendingDown,
  Megaphone,
  Gavel,
  Play,
  ShoppingCart,
  Package,
  Users,
  Cpu,
  Truck,
  TrendingUp,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  QrCode,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || { user: null });
  const { country } = useSelector((state) => state.country);
  const [playingIndex, setPlayingIndex] = useState(null);
  const { statistics, isLoading } = useSelector((state) => state.statistic);
  const isLoggedIn = !!user;
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
  const allVideoSources =
    statistics
      ?.filter((stat) => stat.videoType === "howItWork")
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
  return (
    <>
      {!isLoggedIn && <Header />}
      <div className="bg-[#0B0F19] text-slate-300">
        <header className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">
              The Viral <span className="text-red-600">Engine</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium">
              A revolutionary approach to marketing through auction-style
              campaigns and high-impact mobile advertising on commercial
              vehicles.
            </p>

            {/* Video Panel */}
            <div
              className={`gap-8 ${
                allVideoSources.length === 1
                  ? "flex justify-center"
                  : "grid grid-cols-1 md:grid-cols-2"
              }`}
            >
              {allVideoSources.map((source, index) => {
                const videoUrl = (
                  Array.isArray(source.url) ? source.url[0] : source.url
                )?.trim();

                // Better YouTube Check
                const isYouTube =
                  videoUrl?.includes("youtube.com") ||
                  videoUrl?.includes("youtu.be");

                // Fixed YouTube ID Extractor
                const getYouTubeId = (url) => {
                  try {
                    const urlObj = new URL(url);

                    // youtu.be/xxxx
                    if (urlObj.hostname.includes("youtu.be")) {
                      return urlObj.pathname.slice(1);
                    }

                    // youtube.com/watch?v=xxxx
                    return urlObj.searchParams.get("v");
                  } catch (err) {
                    return null;
                  }
                };

                const videoId = isYouTube ? getYouTubeId(videoUrl) : null;

                return (
                  <div
                    key={index}
                    className={`relative group rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl bg-black aspect-video ${
                      allVideoSources.length === 1
                        ? "max-w-5xl w-full"
                        : "w-full"
                    }`}
                  >
                    {/* Thumbnail */}
                    {playingIndex !== index && (
                      <img
                        src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200"
                        alt="Video Thumbnail"
                        className="absolute inset-0 w-full h-full object-cover z-10"
                      />
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent z-20"></div>

                    {/* YouTube Video */}
                    {isYouTube && videoId ? (
                      <>
                        {playingIndex !== index ? (
                          <div
                            className="absolute inset-0 z-30 cursor-pointer flex items-center justify-center"
                            onClick={() => setPlayingIndex(index)}
                          >
                            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl">
                              <Play className="w-10 h-10 fill-current ml-1" />
                            </div>
                          </div>
                        ) : (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title={source.description || "Video"}
                            className="absolute inset-0 w-full h-full z-30"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </>
                    ) : videoUrl ? (
                      // Uploaded / Cloudinary Video
                      <video
                        controls
                        poster="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200"
                        className="absolute inset-0 w-full h-full object-cover z-30"
                        onPlay={() => setPlayingIndex(index)}
                      >
                        <source src={videoUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-30 text-white">
                        Video unavailable
                      </div>
                    )}

                    {/* Overlay Image */}
                    {playingIndex !== index && (
                      <img
                        src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200"
                        alt="Overlay"
                        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay z-20"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="py-24 px-6 bg-[#0F172A]/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal active">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                Proven Auction Success
              </h2>
              <p className="text-slate-400">
                The same model driving the world's largest marketplaces is now
                powering mobile media.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="stat-card p-10 rounded-3xl reveal active">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    eBay GMV 2025
                  </h3>
                </div>
                <div className="text-5xl font-black text-white mb-4">
                  $79.57 <span className="text-xl text-blue-500">Billion</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Reflecting a 7% increase year-over-year. The auction model
                  continues to dominate global commerce, proving that dynamic
                  price discovery is the gold standard for value.
                </p>
              </div>

              <div
                className="stat-card p-10 rounded-3xl reveal active"
                style={{ transitionDelay: "100ms" }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-500">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Amazon GMV 2025
                  </h3>
                </div>
                <div className="text-5xl font-black text-white mb-4">
                  $830 <span className="text-xl text-amber-500">Billion</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Tripling its volume in just seven years. With $575 billion
                  coming from 3rd party marketplace sellers, the decentralized
                  marketplace is the future of every industry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Evolution Timeline */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal active">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                The Evolution of Bartering
              </h2>
              <p className="text-slate-400">
                From ancient trade to the high-frequency digital marketplace.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden lg:block"></div>
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="relative z-10 text-center reveal active">
                  <div className="w-20 h-20 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <Users className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Ancient Roots
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Since time began, the bartering system has fulfilled the
                    needs of buyers and sellers through mutually acceptable
                    arrangements.
                  </p>
                </div>
                <div
                  className="relative z-10 text-center reveal active"
                  style={{ transitionDelay: "100ms" }}
                >
                  <div className="w-20 h-20 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <Cpu className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    The AI Content Deluge
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Modern marketers face rising costs and a flood of AI
                    content, making digital clicks increasingly expensive and
                    less effective.
                  </p>
                </div>
                <div
                  className="relative z-10 text-center reveal active"
                  style={{ transitionDelay: "200ms" }}
                >
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-red-600/20">
                    <Truck className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    The Rule7 Marketplace
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Unlocking the potential of 160 million commercial vehicles
                    worldwide to reduce budgets while maximizing visual
                    impressions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Benefits Split */}
        <section className="py-24 px-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-px bg-slate-800 rounded-[3rem] overflow-hidden border border-slate-800">
              {/* Marketers */}
              <div className="p-12 md:p-20 bg-[#0B0F19] hover:bg-[#0B0F19]/80 transition-all">
                <div className="w-14 h-14 bg-red-600/10 text-red-600 rounded-2xl flex items-center justify-center mb-8">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-extrabold text-white mb-6">
                  For Marketers
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 text-emerald-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      Slash budgets without sacrificing impact or impressions.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 text-emerald-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      Access untapped mobile space on a potential 160M
                      commercial vehicles.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 text-emerald-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      Compete with dynamic bids to secure the best advertising
                      real estate.
                    </span>
                  </li>
                </ul>
              </div>
              {/* Vehicle Owners */}
              <div className="p-12 md:p-20 bg-[#0B0F19] hover:bg-[#0B0F19]/80 transition-all">
                <div className="w-14 h-14 bg-amber-600/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8">
                  <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-extrabold text-white mb-6">
                  For Fleet Owners
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 text-emerald-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      Turn idle trailer/vehicle space into a new revenue stream.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 text-emerald-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      Combat rising costs and competition from Fuel Increases
                      and drone deliveries.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 text-emerald-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      Flexible participation—you choose the campaigns you
                      support.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Auctions Explained */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2 reveal active">
                <h2 className="text-4xl font-extrabold text-white mb-6">
                  Dynamic Bidding Explained
                </h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Every user's financial position is unique. Our platform lets
                  both Marketing Managers and Vehicle Owners find the "sweet
                  spot" by bidding on square metre rates.
                </p>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center">
                      <ArrowDownRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">
                        Decreasing Bids (Owners)
                      </h4>
                      <p className="text-slate-500 text-sm">
                        Vehicle owners bid down to attract the most lucrative
                        advertising budgets.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-emerald-600/20 text-emerald-500 rounded-xl flex items-center justify-center">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">
                        Increasing Bids (Marketers)
                      </h4>
                      <p className="text-slate-500 text-sm">
                        Marketing Managers ramp up offers to secure prime,
                        high-traffic vehicle real estate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="md:w-1/2 relative reveal active"
                style={{ transitionDelay: "200ms" }}
              >
                <div className="bg-slate-800/30 p-8 rounded-[3rem] border border-slate-800">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border-l-4 border-red-500">
                      <span className="text-xs font-bold uppercase text-slate-500">
                        Vehicle Bid
                      </span>
                      <span className="text-red-500 font-bold">$14.50/sqm</span>
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <RefreshCw className="w-6 h-6 text-slate-700 animate-spin-slow" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border-l-4 border-emerald-500">
                      <span className="text-xs font-bold uppercase text-slate-500">
                        Marketer Bid
                      </span>
                      <span className="text-emerald-500 font-bold">
                        $18.20/sqm
                      </span>
                    </div>
                  </div>
                  <div className="mt-8 text-center bg-red-600 p-4 rounded-2xl text-white font-bold">
                    MARKET MATCH FOUND
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map/Reach */}
        <section className="py-24 px-6 bg-[#0F172A]/50 rounded-[4rem] mx-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">
              Accessible Anywhere
            </h2>
            <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
              From local neighborhood blocks to statewide transport routes and
              national logistics networks—the platform scale is entirely in your
              hands.
            </p>
            <div className="relative bg-slate-900/80 p-4 rounded-[3rem] border border-slate-800 aspect-[21/9] flex items-center justify-center overflow-hidden">
              <Globe className="absolute w-96 h-96 text-slate-800/40 -z-0" />
              <div className="relative z-10 grid grid-cols-3 gap-8 w-full">
                <div className="p-6">
                  <div className="text-red-600 font-black text-4xl mb-2">
                    LOCAL
                  </div>
                  <div className="h-1 bg-red-600/30 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 w-1/3"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-white font-black text-4xl mb-2">
                    STATE
                  </div>
                  <div className="h-1 bg-white/20 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/3"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-amber-500 font-black text-4xl mb-2">
                    NATIONAL
                  </div>
                  <div className="h-1 bg-amber-500/20 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Viral Promotion */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 flex items-center justify-center">
                <QrCode className="w-96 h-96" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6">
                  Viral Potential Unlocked
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                  Gotta Scan Them All!
                </h2>
                <p className="text-white/90 text-xl leading-relaxed mb-10">
                  Don't ditch social media—amplify it. Our campaigns drive
                  explosive reach through viral sharing. When friends and family
                  see it on the road, they share it in the feed.
                </p>
                <button
                  onClick={handleStartCampaign}
                  className="px-10 py-5 bg-white text-red-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform inline-block"
                >
                  START YOUR VIRAL CAMPAIGN
                </button>
              </div>
            </div>
          </div>
        </section>

        <style>{`
       
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
        .stat-card {
          background: linear-gradient(145deg, rgba(31, 41, 55, 0.4), rgba(17, 24, 39, 0.8));
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
       
      `}</style>
      </div>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default HowItWorks;
