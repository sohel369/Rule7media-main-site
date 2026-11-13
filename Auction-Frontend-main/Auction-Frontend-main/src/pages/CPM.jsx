// File: CPM.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ChevronDown,
  BellRing,
  ArrowRight,
  Zap,
  X,
  Youtube,
  Instagram,
  BarChart3,
  Play,
  Info,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getStatisticsByCountry } from "../store/statistic/statisticSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";
import { getAllCpm } from "../store/cpm/cpmSlice";

const CPM = () => {
  const dispatch = useDispatch();

  const { statistics, isLoading: statisticsLoading } = useSelector((state) => state.statistic);
  const { cpm: cpmData, isLoading: cpmLoading } = useSelector((state) => state.cpm);
  
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { country } = useSelector((state) => state.country);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchUserCountry());
  }, [dispatch]);

  useEffect(() => {
    if (country) {
      dispatch(getStatisticsByCountry(country));
    }
  }, [dispatch, country]);

  // Fetch ALL CPM data at once instead of separate calls
  useEffect(() => {
    // Fetch all data without filtering
    const fetchAllData = async () => {
      await dispatch(getAllCpm({ pageType: null }));
      setDataLoaded(true);
    };
    fetchAllData();
  }, [dispatch]);


  const cpmVideos =
    statistics
      ?.filter((item) => item.videoType === "cpm")
      ?.flatMap((item) => item.sources || []) || [];

  // Filter data by pageType - using useMemo for performance
  const traditionalData = React.useMemo(() => {
    if (!cpmData || !Array.isArray(cpmData)) return [];
    return cpmData.filter(item => item.pageType === "traditional");
  }, [cpmData]);

  const googleData = React.useMemo(() => {
    if (!cpmData || !Array.isArray(cpmData)) return [];
    return cpmData.filter(item => item.pageType === "google");
  }, [cpmData]);

  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  const extractVideoId = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const [currentLang, setCurrentLang] = useState({
    code: "en",
    name: "English",
    flag: "🇺🇸",
    icon: "https://cdn-icons-png.flaticon.com/128/197/197374.png",
  });

  // Fallback data if API returns empty
  const fallbackTraditionalData = [
    { Industry: "Radio", GoogleAdvertisingCPMRange: "$10-$20", VehicleWrapCPMCost: 1.25, MeasurableSaving: 94 },
    { Industry: "Network TV", GoogleAdvertisingCPMRange: "$20-$30", VehicleWrapCPMCost: 1.25, MeasurableSaving: 96 },
    { Industry: "Billboard", GoogleAdvertisingCPMRange: "$13-$22", VehicleWrapCPMCost: 1.25, MeasurableSaving: 94 },
    { Industry: "Newspaper", GoogleAdvertisingCPMRange: "$10-$45", VehicleWrapCPMCost: 1.25, MeasurableSaving: 97 },
    { Industry: "Direct Mail", GoogleAdvertisingCPMRange: "$500-$1000", VehicleWrapCPMCost: 1.25, MeasurableSaving: 99 },
    { Industry: "Superbowl", GoogleAdvertisingCPMRange: "$36", VehicleWrapCPMCost: 1.25, MeasurableSaving: 97 },
  ];

  const fallbackGoogleData = [
    { Industry: "Real Estate", GoogleAdvertisingCPMRange: "$2.00-$15.00", VehicleWrapCPMCost: 1.25, MeasurableSaving: 92 },
    { Industry: "Legal", GoogleAdvertisingCPMRange: "$6.00-$15.00", VehicleWrapCPMCost: 1.25, MeasurableSaving: 92 },
    { Industry: "Finance/Insurance", GoogleAdvertisingCPMRange: "$5.00-$12.00", VehicleWrapCPMCost: 1.25, MeasurableSaving: 90 },
    { Industry: "Education", GoogleAdvertisingCPMRange: "$1.00-$8.00", VehicleWrapCPMCost: 1.25, MeasurableSaving: 84 },
    { Industry: "Healthcare", GoogleAdvertisingCPMRange: "$2.50-$6.50", VehicleWrapCPMCost: 1.25, MeasurableSaving: 81 },
    { Industry: "Travel", GoogleAdvertisingCPMRange: "$1.50-$4.00", VehicleWrapCPMCost: 1.25, MeasurableSaving: 69 },
  ];

  // Use API data if available, otherwise use fallback
  const displayTraditionalData = traditionalData.length > 0 ? traditionalData : fallbackTraditionalData;
  const displayGoogleData = googleData.length > 0 ? googleData : fallbackGoogleData;

  // Show loading only on initial load
  if (cpmLoading && !dataLoaded) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <p className="text-center text-white">Loading CPM data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] text-slate-200 antialiased">
      {/* Header - same as original */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Rule 7 <span className="text-blue-500">Media</span>
            </span>
          </div>
          <nav className="hidden space-x-6 lg:flex items-center">
            <Link
              to={"/"}
              className="text-sm font-medium text-slate-400 hover:text-white"
            >
              Home
            </Link>
            <Link
              to={"/how-it-works"}
              className="text-sm font-medium text-slate-400 hover:text-white"
            >
              How it Works
            </Link>
            <Link
              to={"#"}
              className="text-sm font-medium text-slate-400 hover:text-white"
            >
              Exclusivity
            </Link>
            <Link
              to={"/franchise"}
              className="text-sm font-medium text-slate-400 hover:text-white"
            >
              Market Expansion
            </Link>
            <Link
              to={"/AncillaryAdvertisers"}
              className="text-sm font-bold text-blue-400"
            >
              Advertise with Us
            </Link>
            <a
              href="https://scanthemall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              Viral Engine
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              CPM & Market Intelligence 2026
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Access real-time performance benchmarks across traditional,
              digital, and mobile billboard ecosystems
            </p>
            <Link
              to={"/BuyerMarketingExecutive"}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <span>Register to Receive Valuable Free Updates</span>
              <BellRing className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
            className="w-full h-full object-cover grayscale opacity-50"
            alt="Data background"
          />
        </div>
      </section>

      {/* CPM Analysis */}
      <section className="py-16 bg-[#0b1221]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="text-blue-500" />
                <span>How is CPM measured?</span>
              </h2>
              <p className="text-slate-400 text-lg">
                CPM is measured by dividing the total cost of an ad campaign by
                the number of impressions received, then multiplying by 1,000.
                This metric is particularly useful for evaluating
                cost-effectiveness across different media channels.
              </p>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-slate-300">
                Social media went through a monumental shift in 2024.
                AI-generated content flooded feeds, and algorithms started
                favoring interactions over reach. In 2026, the shift is even
                bigger.
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden border border-white/10 group">
              <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                  alt="Video background"
                />
                
                {cpmVideos[0] && !isVideoPlaying ? (
                  <div className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setIsVideoPlaying(true)}>
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl mb-4 group-hover:bg-blue-500 group-hover:scale-110 transition-all">
                      <Play className="w-8 h-8 fill-current text-white ml-1" />
                    </div>
                    <h3 className="text-white font-bold text-xl">
                      Gamifying Mobile Marketing
                    </h3>
                  </div>
                ) : cpmVideos[0] && isVideoPlaying ? (
                  <div className="relative z-10 w-full h-full">
                    {cpmVideos[0]?.url?.includes("youtube") ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${cpmVideos[0]?.url?.split("v=")[1]?.split("&")[0]}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={cpmVideos[0]?.url} className="w-full h-full object-cover" controls autoPlay />
                    )}
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Play className="w-8 h-8 text-slate-500 ml-1" />
                    </div>
                    <h3 className="text-white font-bold text-xl">Loading...</h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Tables - Traditional Media vs Mobile Billboards */}
      <section className="py-24 space-y-32">
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-extrabold text-white mb-4">
              Traditional Media vs Mobile Billboards
            </h3>
            <p className="text-slate-500">
              *Industry statistics source Nestscale.com
            </p>
            {/* {traditionalData.length > 0 && (
              <p className="text-green-400 text-sm mt-2">
                ✓ Showing {traditionalData.length} records from database
              </p>
            )} */}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/80 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 text-blue-400">Industry</th>
                  <th className="p-6 text-slate-300">Traditional Media CPM</th>
                  <th className="p-6 text-slate-300">Vehicle Wrap CPM</th>
                  <th className="p-6 text-emerald-400 text-right">
                    Measurable Saving
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayTraditionalData.length > 0 ? (
                  displayTraditionalData.map((row, i) => (
                    <tr key={row._id || i} className="hover:bg-white/5">
                      <td className="p-6 font-medium text-white">
                        {row.Industry}
                      </td>
                      <td className="p-6 text-slate-400">
                        ${row.GoogleAdvertisingCPMRange}
                      </td>
                      <td className="p-6 text-blue-300">
                        ${row.VehicleWrapCPMCost}
                      </td>
                      <td className="p-6 font-bold text-emerald-400 text-right">
                        {row.MeasurableSaving}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">
                      No traditional media data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Table - Google Advertising Benchmarks by Industry */}
        <div className="container mx-auto px-6">
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-extrabold text-white mb-4">
              Google Advertising Benchmarks by Industry
            </h3>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 text-sm">
              <Info className="w-4 h-4" /> Median industry rates shown
            </div>
            {/* {googleData.length > 0 && (
              <p className="text-green-400 text-sm mt-2">
                ✓ Showing {googleData.length} records from database
              </p>
            )} */}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/50 to-slate-900/80 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 text-blue-400">Industry</th>
                  <th className="p-6 text-slate-300">Google Ads CPM</th>
                  <th className="p-6 text-slate-300">Vehicle Wrap CPM</th>
                  <th className="p-6 text-emerald-400 text-right">
                    Measurable Saving
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayGoogleData.length > 0 ? (
                  displayGoogleData.map((row, i) => (
                    <tr key={row._id || i} className="hover:bg-white/5">
                      <td className="p-6 font-medium text-white">
                        {row.Industry}
                      </td>
                      <td className="p-6 text-slate-400">
                        ${row.GoogleAdvertisingCPMRange}
                      </td>
                      <td className="p-6 text-blue-300">
                        ${row.VehicleWrapCPMCost}
                      </td>
                      <td className="p-6 font-bold text-emerald-400 text-right">
                        {row.MeasurableSaving}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">
                      No Google advertising data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-12 text-center">
            <Link
              to={"/BuyerMarketingExecutive"}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-blue-500/20"
            >
              <span>Register to Receive Valuable Free Updates</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#0b1221] border-y border-white/10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-5xl font-extrabold text-white mb-6">
                Insights & FAQ
              </h2>
              <p className="text-xl text-slate-400">
                Market intelligence, performance benchmarks, and answers to
                common questions.
              </p>
            </div>
            <img
              src={currentLang.icon}
              className="w-24 h-24 object-contain opacity-80"
              alt={currentLang.name}
            />
          </div>
          <div className="bg-[rgba(30,41,59,0.7)] backdrop-blur-md border border-white/10 p-10 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl group-hover:bg-blue-600/20"></div>
            <h3 className="text-2xl font-bold text-white mb-6 relative z-10">
              Why are major brands dedicating more budget to offline
              advertising?
            </h3>
            <div className="text-slate-400 text-lg relative z-10">
              <p>
                Recent benchmarks from triplewhale.com highlight that the
                average cost per mille (CPM) for online platforms such as Google
                Ads has risen noticeably, with sector averages reported at
                $14.29.
              </p>
              <p className="mt-3">
                Major brands are responding by allocating budget to outdoor
                placements which offer CPM rates in the range of $1.25 to $2.88,
                providing premium exposure at a fraction of the cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Double Video Panel */}
      <section className="py-24 bg-[#0f172a]">
        <div className="container mx-auto px-6 text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Advanced Analysis Media
          </h2>
        </div>

        {statisticsLoading ? (
          <div className="text-center text-white">Loading videos...</div>
        ) : cpmVideos.length > 0 ? (
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8">
            {cpmVideos.slice(0, 2).map((video, index) => {
              const videoUrl = Array.isArray(video.url)
                ? video.url[0]?.trim()
                : video.url?.trim();

              const isYoutube = isYouTubeUrl(videoUrl);
              const videoId = isYoutube ? extractVideoId(videoUrl) : null;

              return (
                <div
                  key={index}
                  className="rounded-3xl overflow-hidden border border-white/10 group shadow-2xl"
                >
                  <div className="aspect-video bg-slate-900 relative overflow-hidden">
                    {isYoutube && videoId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={video.description || `Video ${index + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video controls className="w-full h-full object-cover">
                        <source src={videoUrl} type="video/mp4" />
                      </video>
                    )}
                  </div>
                  <div className="p-5 bg-slate-900">
                    <h4 className="text-white font-bold text-lg">
                      {video.description || `CPM Video ${index + 1}`}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-400">
            No CPM videos available
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to={"/BuyerMarketingExecutive"}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-12 rounded-full shadow-xl shadow-blue-500/30"
          >
            <span>Register to Receive Valuable Free Updates</span>
            <Zap className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0b1221] py-12">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-white">
                  Rule 7 <span className="text-blue-500">Media</span>
                </span>
              </div>
              <p className="text-sm text-slate-500">
                The premier automotive professional and supplier network.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link to={"/Statistics"} className="hover:text-blue-400">
                    Explainers
                  </Link>
                </li>
                <li>
                  <Link to={"/affiliate"} className="hover:text-blue-400">
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link to={"/blog"} className="hover:text-blue-400">
                    Industry News
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Partners</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link
                    to={"/AncillaryAdvertisers"}
                    className="hover:text-blue-400 font-bold text-blue-400"
                  >
                    Advertise with Us
                  </Link>
                </li>
                <li>
                  <Link to={"/about-us"} className="hover:text-blue-400">
                    Meet the Team
                  </Link>
                </li>
                <li>
                  <Link to={"/about-us"} className="hover:text-blue-400">
                    Global Offices
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <Link to={"/contact-us"} className="hover:text-blue-400">
                    Help Centre
                  </Link>
                </li>
                <li>
                  <Link to={"/terms-conditions"} className="hover:text-blue-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to={"/privacy-policy"} className="hover:text-blue-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={"/contact-us"} className="hover:text-blue-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © 2026 Rule 7 Media. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-slate-500">
              <a
                href="https://x.com/Rule7Media"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400"
              >
                <X className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/@Rule7Media"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/rule.7media"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CPM;