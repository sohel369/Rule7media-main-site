import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCampaigns } from "../../store/campaign/campaignSlice";
import {
  FaRupeeSign,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
  FaEye,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const MyCampaignsSwiper = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const { campaigns, isLoading, error } = useSelector(
    (state) => state.campaigns,
  );
  const { country, currency } = useSelector((state) => state.country);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, []);

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          No campaigns yet
        </h3>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleShowDetails = (campaignId) => {
    navigate(`/campaign-details/${campaignId}`);
  };

  // Sabhi active campaigns (country filter se pehle)
  const allActiveCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active",
  );

  // Sirf selected country ke active campaigns
  const countryCampaigns = allActiveCampaigns.filter(
    (campaign) => campaign.location?.country === country,
  );

  // Check if we need navigation buttons
  const needsNavigation = countryCampaigns.length > 4;

  return (
    <div className="py-10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex gap-2 items-center mb-5 mt-[50px]">
            <div>
              <span className="absolute animate-ping flex rounded-full h-3 w-3 bg-sky-500"></span>
              <span className="relative flex rounded-full h-3 w-3 bg-sky-500"></span>
            </div>
            <h2 className="text-2xl font-bold">
              Active <span className="text-blue-600">Campaigns</span>
            </h2>
          </div>
        </div>
      </div>

      {countryCampaigns.length === 0 ? (
        <div className="py-12 text-center">
          <h3 className="text-center text-gray-600 text-lg font-semibold">
            No active campaigns in {country}
          </h3>
        </div>
      ) : (
        <div className="relative">
          {/* Navigation Buttons */}
          {needsNavigation && (
            <>
              <div className="swiper-button-prev-custom absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                <svg
                  className="w-6 h-6"
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
              </div>
              <div className="swiper-button-next-custom absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                <svg
                  className="w-6 h-6"
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
              </div>
            </>
          )}

          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={1}
            navigation={
              needsNavigation
                ? {
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                  }
                : false
            }
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
            }}
            className="mySwiper"
            initialSlide={0}
          >
            {countryCampaigns.map((campaign) => (
              <SwiperSlide key={campaign._id}>
                {/* Main div - exactly as you wanted */}
                <div className="bg-black rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300 group relative overflow-hidden flex flex-col h-full">
                  {/* Sab kuch is div ke andar - image bhi yahin */}
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Image Container - ab p-4 div ke andar */}
                    <div className="relative w-full h-48 overflow-hidden flex-shrink-0 mb-3">
                      {campaign.image && campaign.image.length > 0 ? (
                        <img
                          src={campaign.image[0]}
                          alt={campaign.title}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 rounded-lg transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/400x200/e5e7eb/6b7280?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}

                      {/* Status Badge - positioned absolute within image container */}
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}
                        >
                          {campaign.status || "draft"}
                        </span>
                      </div>
                    </div>

                    {/* Title - ab image ke neeche properly */}
                    <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 cursor-pointer hover:text-indigo-600 transition min-h-[40px]">
                      {campaign.title || "Untitled Campaign"}
                    </h3>

                    {/* Category */}
                    {campaign.category && (
                      <div className="mb-3 min-h-[24px]">
                        <span className="text-xs px-2 py-1 bg-indigo-50 text-white rounded border border-indigo-100">
                          {campaign.category}
                        </span>
                      </div>
                    )}

                    {/* Info Section */}
                    <div className="space-y-3 mb-4 flex-1">
                      {/* Budget */}
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="text-sm font-bold text-white block">
                            {currency}{" "}
                            {campaign.budget?.toLocaleString("en-IN") || "0"}
                          </span>
                          {campaign.budgetType && (
                            <span className="text-xs text-white">
                              {campaign.budgetType}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-red-500 text-sm mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-white line-clamp-1">
                          {campaign.location?.city || "N/A"}
                          {campaign.location?.state &&
                            `, ${campaign.location.state}`}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleShowDetails(campaign._id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md"
                      >
                        <FaExternalLinkAlt className="text-sm" />
                        Show Details
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default MyCampaignsSwiper;
