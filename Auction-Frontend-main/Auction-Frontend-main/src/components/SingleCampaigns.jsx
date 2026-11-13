import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearMessages } from "../store/campaign/campaignSlice";
import { Currency } from "lucide-react";

const CampaignSearchResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { searchData } = location.state || {};

  const { searchResults, searchLoading, error } = useSelector(
    (state) => state.campaigns,
  );
  const { country, currency } = useSelector((state) => state.country);

  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  useEffect(() => {
    if (!searchData) {
      navigate("/dashboard");
    }
  }, [searchData, navigate]);

  const handleViewDetails = (campaignId) => {
    navigate(`/campaign-details/${campaignId}`);
  };

  if (searchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Campaign Search Results
              </h1>
              <p className="text-gray-600">
                Found {searchResults.length} campaigns matching your criteria
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Campaigns</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {searchResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No Campaigns Found
            </h3>
            <p className="text-gray-600 mb-6">
              No advertising campaigns match your search criteria. Try
              broadening your search.
            </p>
            {/* <button 
              onClick={() => navigate('/dashboard')}
              className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800"
            >
              Modify Search
            </button> */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
              >
                {/* Campaign Image */}
                {campaign.image && campaign.image[0] && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={campaign.image[0]}
                      alt={campaign.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-2">
                    {campaign.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {campaign.description || "No description provided."}
                  </p>

                  {/* Location Info */}
                  <div className="mb-4">
                    <div className="flex items-center text-gray-500 mb-2">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">
                        {campaign.location?.city &&
                          `${campaign.location.city}, `}
                        {campaign.location?.state &&
                          `${campaign.location.state}, `}
                        {campaign.location?.country}
                      </span>
                    </div>
                    {campaign.location?.zipCodes &&
                      campaign.location.zipCodes.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Covering {campaign.location.zipCodes.length} post code
                          {campaign.location.zipCodes.length !== 1 ? "s" : ""}
                        </div>
                      )}
                  </div>

                  {/* Target Vehicle Types */}
                  {campaign.targetVehicleTypes &&
                    campaign.targetVehicleTypes.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">
                          Looking for these vehicle types:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {campaign.targetVehicleTypes
                            .slice(0, 3)
                            .map((type, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100"
                              >
                                {type}
                              </span>
                            ))}
                          {campaign.targetVehicleTypes.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{campaign.targetVehicleTypes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Budget */}
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">Budget</div>
                        <div className="font-bold text-green-700 text-lg">
                          {currency} {campaign.budget.toLocaleString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(campaign._id)}
                          className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignSearchResults;
