import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCampaignById } from "../store/campaign/campaignSlice";
import {
  FaArrowLeft,
  FaArrowRight,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTruck,
} from "react-icons/fa";
import {
  MapPin,
  Image as ImageIcon,
  Target,
  Calendar,
  Truck,
  ArrowRight,
} from "lucide-react";
import SEO from "../components/SEO";
import {
  HeaderLeaderboard,
  FooterLeaderboard,
  RightSkyscraper,
  MobileStickyLeaderboard,
} from "../components/AdSlots";
const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCampaign, isLoading, error } = useSelector(
    (state) => state.campaigns,
  );
  const { country, currency } = useSelector((state) => state.country);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchCampaignById(id));
  }, [dispatch, id]);

  // CampaignCountdown Component
  const CampaignCountdown = ({ endAt }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      if (!endAt) {
        setTimeLeft("Ongoing");
        return;
      }

      const calculateTimeLeft = () => {
        const difference = new Date(endAt) - new Date();

        if (difference <= 0) {
          setTimeLeft("Ended");
          return;
        }

        let days = Math.floor(difference / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((difference % (1000 * 60)) / 1000);

        let result = [];

        if (days > 0) result.push(`${days}d`);
        if (hours > 0) result.push(`${hours}h`);
        if (minutes > 0) result.push(`${minutes}m`);
        if (seconds > 0 || result.length === 0) result.push(`${seconds}s`);

        setTimeLeft(result.join(" "));
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }, [endAt]);

    const isUrgent =
      timeLeft.includes("s") &&
      !timeLeft.includes("d") &&
      !timeLeft.includes("h");
    const isEnded = timeLeft === "Ended";

    return (
      <span
        className={`px-3 py-2 rounded-full text-xs md:text-sm font-bold transition-all block text-center whitespace-nowrap md:whitespace-normal ${
          isEnded
            ? "bg-slate-800 text-slate-400"
            : isUrgent
              ? "bg-blue-900/50 text-blue-300 animate-pulse"
              : "bg-slate-800 text-slate-300"
        }`}
      >
        {isEnded ? "Campaign Ended" : `${timeLeft}`}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !currentCampaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-300">
        <p className="text-2xl mb-6">Campaign not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const images = currentCampaign.image || [];
  const totalImages = images.length || 1;
  const seoData = {
    title: currentCampaign?.title
      ? `${currentCampaign.title} | Campaign Details`
      : "Campaign Details | Fleet Marketing",
    description:
      currentCampaign?.description?.substring(0, 160) ||
      "View campaign details and performance metrics",
    keywords: `campaign, marketing, ${currentCampaign?.type || "fleet"}, advertising`,
  };
  const nextImage = () => {
    setCurrentImgIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImgIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  return (
    <>
      <SEO {...seoData} />
      <div className="min-h-screen bg-slate-950 text-slate-300 antialiased">
        <main className="pt-12 pb-20">
          {/* Back Button */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <FaArrowLeft size={14} />
              Back to Campaigns
            </button>
          </div>

          {/* HERO SECTION */}
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold tracking-wider mb-4 uppercase border border-blue-800/50">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  {currentCampaign.status === "active"
                    ? "Active Campaign"
                    : currentCampaign.status?.toUpperCase()}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  {currentCampaign.title}
                </h1>
                <div className="flex items-center gap-2 mt-4 text-slate-400">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>
                    {currentCampaign.location?.city},{" "}
                    {currentCampaign.location?.state},{" "}
                    {currentCampaign.location?.country}
                  </span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Total Budget
                </p>
                <p className="text-4xl font-mono font-bold text-white">
                  {currency}{" "}
                  {currentCampaign.budget?.toLocaleString("en-IN") || "N/A"}
                </p>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px_180px] gap-8">
              {/* MAIN PREVIEW & DESCRIPTION */}
              <div className="space-y-8">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                  <div className="aspect-video w-full bg-slate-900 flex items-center justify-center relative border-b border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    {images.length > 0 ? (
                      <img
                        src={images[currentImgIndex]}
                        alt={currentCampaign.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center gap-3 z-10">
                        <ImageIcon className="w-12 h-12 opacity-20" />
                        <span className="text-xs uppercase tracking-widest font-bold">
                          Campaign Creative Preview
                        </span>
                      </div>
                    )}

                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition border border-white/10"
                        >
                          <FaArrowLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition border border-white/10"
                        >
                          <FaArrowRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {totalImages > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {currentImgIndex + 1} / {totalImages}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {totalImages > 1 && (
                    <div className="flex gap-3 p-6 bg-slate-900/80 border-t border-slate-800">
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`thumb ${idx + 1}`}
                          onClick={() => setCurrentImgIndex(idx)}
                          className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                            idx === currentImgIndex
                              ? "border-blue-500 shadow-lg opacity-100"
                              : "border-transparent opacity-50 hover:opacity-80"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">
                      Description
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-lg">
                      {currentCampaign.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                {/* GEOGRAPHIC TARGETING */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                      Targeted Locations
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                          Region
                        </p>
                        <p className="text-white font-medium">
                          {currentCampaign.location?.state},{" "}
                          {currentCampaign.location?.country}
                        </p>
                      </div>
                      <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                          Specific Area
                        </p>
                        <p className="text-white font-medium">
                          {currentCampaign.location?.city || "N/A"}
                        </p>
                      </div>
                    </div>
                    {currentCampaign.location?.geoLocations?.length > 0 && (
                      <div className="bg-slate-900/40 p-6 rounded-xl border border-white/5">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">
                          ZIP Codes
                        </p>
                        <ul className="space-y-3">
                          {currentCampaign.location.geoLocations.map(
                            (loc, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-3 text-sm text-slate-300"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {loc.name}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SIDEBAR SPECS */}
              <div className="space-y-8">
                {/* TIMELINE */}
                {/* TIMELINE */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800/50">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white uppercase tracking-tight">
                      Timeline
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {/* Start Date - Full info */}
                    <div className="group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <span className="text-slate-400 text-sm font-medium">
                            Start Date
                          </span>
                        </div>
                        <span className="text-white font-semibold text-sm">
                          {currentCampaign.startAt
                            ? new Date(currentCampaign.startAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* End Date - Full info */}
                    <div className="group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <span className="text-slate-400 text-sm font-medium">
                            End Date
                          </span>
                        </div>
                        <span className="text-white font-semibold text-sm">
                          {currentCampaign.endAt
                            ? new Date(currentCampaign.endAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Divider with icon */}
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800/50"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-slate-900/40 px-3 py-0.5 rounded-full text-[10px] text-slate-500 uppercase tracking-wider">
                          Current Status
                        </span>
                      </div>
                    </div>

                    {/* Remaining Time - Highlighted */}
                    <div className="bg-slate-900/60 rounded-xl p-4 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold mb-2">
                        Time Remaining
                      </p>
                      <CampaignCountdown endAt={currentCampaign.endAt} />
                    </div>
                  </div>
                </div>

                {/* TARGET ASSETS */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white uppercase tracking-tight">
                      Target Assets
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentCampaign.targetVehicleTypes &&
                    currentCampaign.targetVehicleTypes.length > 0 ? (
                      currentCampaign.targetVehicleTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 border border-white/5"
                        >
                          {type}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">
                        No vehicles specified
                      </span>
                    )}
                  </div>
                </div>

                {/* <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 group">
                VIEW FULL ANALYTICS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button> */}
              </div>
              <div className="flex justify-end">
                <div className="sticky top-24 w-full lg:w-[160px]">
                  <RightSkyscraper />
                </div>
              </div>
            </div>
          </div>
          <FooterLeaderboard />
        </main>
      </div>
    </>
  );
};

export default CampaignDetailsPage;
