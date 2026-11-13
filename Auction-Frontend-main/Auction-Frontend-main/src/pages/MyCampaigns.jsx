import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCampaignsbyuserid,
  deleteExistingCampaign,
} from "../store/campaign/campaignSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRupeeSign,
  FaEye,
} from "react-icons/fa";
import ImageSlider from "../components/ImageSlider";
import { FooterLeaderboard, HeaderLeaderboard } from "../components/AdSlots";

const MyCampaigns = () => {
  const dispatch = useDispatch();
  const { myCampaigns, isLoading, error } = useSelector(
    (state) => state.campaigns,
  );
  const { country, currency } = useSelector((state) => state.country);

  useEffect(() => {
    dispatch(fetchCampaignsbyuserid());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone.",
      )
    ) {
      try {
        await dispatch(deleteExistingCampaign(id)).unwrap();
        toast.success("Campaign deleted successfully!");
        dispatch(fetchCampaignsbyuserid());
      } catch (err) {
        toast.error(err.message || "Failed to delete campaign");
      }
    }
  };

  const [modalImage, setModalImage] = React.useState(null);

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen bg-gray-950">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto mb-4"></div>
  //         <p className="text-gray-400">Loading your campaigns...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button
            onClick={() => dispatch(fetchCampaignsbyuserid())}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          {/* LEFT SIDE */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-theme-bg bg-clip-text text-white">
              My Campaigns
            </h1>
            <p className="text-white mt-2">
              Total Campaigns:{" "}
              <span className="text-white font-bold">{myCampaigns.length}</span>
            </p>
          </div>

          {/* MIDDLE (Ad / Widget / Info) */}
          <div className="flex-1 flex justify-center">
            {/* Example: Ad or any component */}
            <HeaderLeaderboard />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex justify-end">
            <Link
              to="/user-profile/create-campaign"
              className="px-6 py-3 bg-theme-bg2 rounded-xl font-bold hover:shadow-2xl hover:bg-theme-bg transition-all"
            >
              + New Campaign
            </Link>
          </div>
        </div>

        {myCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                No campaigns yet
              </h3>
              <p className="text-white mb-8">
                Create your first campaign to get started with influencer
                marketing
              </p>
              <Link
                to="/user-profile/create-campaign"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-transform"
              >
                Create Your First Campaign
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-theme-bg2">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {myCampaigns.map((camp) => (
                    <tr
                      key={camp._id}
                      className="hover:bg-gray-800/30 transition-all duration-200"
                    >
                      {/* Image */}
                      <td className="px-6 py-5">
                        <ImageSlider
                          images={camp.image || []}
                          onImageClick={setModalImage}
                          compact={true}
                        />
                      </td>

                      {/* Title */}
                      <td className="px-6 py-5">
                        <h3 className="font-bold text-white whitespace-nowrap">
                          {camp.title}
                        </h3>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-400 line-clamp-2 max-w-xs">
                          {camp.description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl text-white">
                            {currency}{" "}
                            {camp.budget?.toLocaleString("en-IN") || "0"}
                          </span>
                        </div>
                        {camp.budgetType && (
                          <span className="text-xs text-gray-400 mt-1 block">
                            {camp.budgetType}
                          </span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-red-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-white whitespace-nowrap">
                              {camp.location?.city || "N/A"},{" "}
                              {camp.location?.state || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {camp.location?.country || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-white whitespace-nowrap">
                              {camp.startAt
                                ? new Date(camp.startAt).toLocaleDateString()
                                : "Not set"}
                            </p>
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              →{" "}
                              {camp.endAt
                                ? new Date(camp.endAt).toLocaleDateString()
                                : "Ongoing"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            camp.status === "active"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : camp.status === "paused"
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                : camp.status === "ended"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : camp.status === "draft"
                                    ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              camp.status === "active"
                                ? "bg-green-400 animate-pulse"
                                : camp.status === "paused"
                                  ? "bg-yellow-400"
                                  : camp.status === "ended"
                                    ? "bg-blue-400"
                                    : "bg-gray-400"
                            }`}
                          ></span>
                          {camp.status?.toUpperCase() || "DRAFT"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/campaign-details/${camp._id}`}
                            className="text-green-400 hover:text-green-300 transition p-2 hover:bg-green-500/10 rounded-lg"
                            title="View Campaign"
                          >
                            <FaEye size={18} />
                          </Link>
                          {camp.status !== "ended" && (
                            <Link
                              to={`/user-profile/create-campaign/${camp._id}`}
                              className="text-blue-400 hover:text-blue-300 transition p-2 hover:bg-blue-500/10 rounded-lg"
                              title="Edit Campaign"
                            >
                              <FaEdit size={18} />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(camp._id)}
                            className="text-red-400 hover:text-red-300 transition p-2 hover:bg-red-500/10 rounded-lg"
                            title="Delete Campaign"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {myCampaigns.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-theme-bg2 p-4 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400">Total Budget</div>
              <div className="text-2xl font-bold text-green-400">
                {currency}
                {myCampaigns
                  .reduce((sum, camp) => sum + (camp.budget || 0), 0)
                  .toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-theme-bg2 p-4 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400">Active</div>
              <div className="text-2xl font-bold text-green-400">
                {myCampaigns.filter((c) => c.status === "active").length}
              </div>
            </div>
            {/* <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400">Drafts</div>
              <div className="text-2xl font-bold text-yellow-400">
                {myCampaigns.filter(c => c.status === 'draft').length}
              </div>
            </div> */}
            <div className="bg-theme-bg2 p-4 rounded-xl border border-gray-800">
              <div className="text-sm text-gray-400">Completed</div>
              <div className="text-2xl font-bold text-blue-400">
                {myCampaigns.filter((c) => c.status === "ended").length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 z-10"
          >
            ×
          </button>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={modalImage}
              alt="Full view"
              className="max-w-full max-h-full rounded-xl shadow-2xl"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/800x600/1f2937/9ca3af?text=Image+Not+Found";
              }}
            />
          </div>
        </div>
      )}
      <div style={{ position: "relative", left: "40px" }}>
        <FooterLeaderboard />
      </div>
    </div>
  );
};

export default MyCampaigns;
