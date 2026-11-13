import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { FiMapPin, FiBriefcase, FiClock, FiMap } from "react-icons/fi";
import { gettopfleetauction } from "../../store/fleetowner/fleetownerSlice";
import GoogleMapComponent from "../../components/GoogleComponents";
import { useNavigate } from "react-router-dom";
import { fetchUserCountry } from "../../store/countary/countrySlice";
const TopFleetAuctions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { country, currency } = useSelector((state) => state.country);
  const { form, isLoading } = useSelector((state) => state.fleetOwner);

  useEffect(() => {
    dispatch(gettopfleetauction({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  return (
    <div className="min-h-screen bg-theme-bg rounded-2xl py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-white mb-10 tracking-tight">
        Top Fleet Auctions
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        </div>
      ) : !form?.topAuctions || form.topAuctions.length === 0 ? (
        <div className="text-center text-white text-lg">
          No auctions available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {form.topAuctions.map((auction) => (
            <div
              key={auction._id}
              className="bg-theme-bg2 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100"
            >
              {/* Auction Header */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 truncate">
                {auction.vehicleModel || "Unknown Vehicle"}
              </h2>

              {/* Auction Details */}
              <div className="space-y-3 text-white">
                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">Overall Highest Bid:</span>{" "}
                    {currency} {auction?.overallHighestBid || 0}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">Bids:</span> {currency}{" "}
                    {auction?.bidsCount || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-white">Highest Bids:</p>
                  <ul className="text-white text-sm ml-4 list-disc">
                    <li>
                      Full Wrap: {currency}
                      {auction?.highestBids?.fullWrap?.toLocaleString(
                        "en-IN",
                      ) || 0}
                    </li>
                    <li>
                      One Side: {currency}
                      {auction?.highestBids?.oneSide?.toLocaleString("en-IN") ||
                        0}
                    </li>
                    <li>
                      Both Sides: {currency}
                      {auction?.highestBids?.bothSides?.toLocaleString(
                        "en-IN",
                      ) || 0}
                    </li>
                    <li>
                      Rear Doors: {currency}
                      {auction?.highestBids?.rearDoors?.toLocaleString(
                        "en-IN",
                      ) || 0}
                    </li>
                  </ul>
                </div>

                {auction.interRoutes && auction.interRoutes.length > 0 && (
                  <div className="flex items-start gap-2 mb-2 text-white">
                    <FiMap className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <span className="font-medium">Routes:</span>
                      <ul className="text-sm ml-4 list-disc">
                        {auction.interRoutes.map((r, i) => (
                          <li key={i}>
                            {r.from || "?"} → {r.to || "?"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <FiBriefcase className="w-5 h-5 text-purple-500" />
                  <p>
                    <span className="font-medium">company:</span>{" "}
                    {auction.company || "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">Buy Now Price:</span>
                    <ul className="text-white text-sm ml-4 list-disc">
                      <li>
                        Full Wrap: {currency}
                        {auction?.buyNowRates?.fullWrap?.toLocaleString(
                          "en-IN",
                        ) || 0}
                      </li>
                      <li>
                        One Side: {currency}
                        {auction?.buyNowRates?.oneSide?.toLocaleString(
                          "en-IN",
                        ) || 0}
                      </li>
                      <li>
                        Both Sides: {currency}
                        {auction?.buyNowRates?.bothSides?.toLocaleString(
                          "en-IN",
                        ) || 0}
                      </li>
                      <li>
                        Rear Doors: {currency}
                        {auction?.buyNowRates?.rearDoors?.toLocaleString(
                          "en-IN",
                        ) || 0}
                      </li>
                    </ul>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-red-500" />
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {auction?.duration?.toFixed(2) || "0"} days
                  </p>
                </div>
              </div>

              {/* Locations Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Locations
                </h3>
                <div className="space-y-2">
                  {/* Primary Location */}
                  <div className="flex items-center gap-2 text-white">
                    <FiMapPin className="w-5 h-5 text-blue-500" />
                    <span className="text-base">
                      {auction.location?.name ||
                        auction.location?.zip ||
                        "Primary Location Not Specified"}
                    </span>
                  </div>
                  {/* Additional Locations */}
                  {auction.additionalLocations?.length > 0 && (
                    <div className="flex flex-col gap-2 pl-6">
                      {auction.additionalLocations.map((loc, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-white"
                        >
                          <FiMapPin className="w-4 h-4 text-red-500" />
                          <span className="text-base">
                            {loc.name || loc.zip || `Location ${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-2">Map</h3>
                <GoogleMapComponent
                  zipCode={auction.location?.zip}
                  location={auction.location?.name}
                  latitude={auction.location?.coordinates?.coordinates?.[1]}
                  longitude={auction.location?.coordinates?.coordinates?.[0]}
                  additionalLocations={auction.additionalLocations}
                />
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <button
                  onClick={() =>
                    navigate(`/single-fleet-auction-detail/${auction._id}`)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopFleetAuctions;
