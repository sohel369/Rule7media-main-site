import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  deleteSingleAuctionById,
  getSellerAuction,
} from "../store/auction/auctionSlice";
import { FaEye, FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import Loading from "./Loading";
import Pagination from "./Pagination";
import { Currency } from "lucide-react";

const ManageItems = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { country, currency } = useSelector((state) => state.country);
  const { sellerAuction, isLoading } = useSelector((state) => state.auction);
  const auctions = sellerAuction?.auctions || [];

  useEffect(() => {
    dispatch(getSellerAuction());
  }, [dispatch]);

  // Filter from dashboard
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (location.state?.defaultFilter) {
      setFilterStatus(location.state.defaultFilter);
      setCurrentPage(1);
    }
  }, [location.state]);

  // Filter auctions
  const filteredAuctions = useMemo(() => {
    if (filterStatus === "ALL") return auctions;
    if (filterStatus === "active") {
      return auctions.filter((a) => a?.status === "active");
    }
    return auctions;
  }, [auctions, filterStatus]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAuctions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredAuctions.length / itemsPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };

  const openWinnerDetails = (winnerData, wrapType) => {
    setSelectedWinner({
      ...winnerData,
      wrapType: wrapType.replace(/([A-Z])/g, " $1"),
    });
    setShowWinnerModal(true);
  };

  // Function to close modal
  const closeWinnerModal = () => {
    setSelectedWinner(null);
    setShowWinnerModal(false);
  };

  const handleDeleteAuction = async (id) => {
    if (!window.confirm("Delete this auction?")) return;
    try {
      await dispatch(deleteSingleAuctionById(id)).unwrap();
      toast.success("Campaign deleted!");
      dispatch(getSellerAuction());
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Empty message
  const getEmptyMessage = () => {
    if (filterStatus === "active") return "No Active Auctions";
    return "No Auctions Found";
  };

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        My Campaign
      </h2>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["ALL", "active"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status
                ? "bg-theme-color text-white shadow-lg"
                : "bg-theme-bg2 text-gray-300 hover:bg-theme-bg"
            }`}
          >
            {status === "ALL" ? "All Campaign" : "Active Campaign"}
          </button>
        ))}
      </div>

      <div className="overflow-auto px-4 bg-theme-bg2 rounded-2xl border border-border-info-color">
        <table className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4">
          <thead className="table-header-group">
            <tr className="table-row bg-theme-color [&_th]:table-cell [&_th]:pl-5 [&_th]:pr-3 [&_th]:py-3">
              <th className="rounded-l-lg">Product</th>
              <th>Vehicle Type</th>
              <th>Bids</th>
              <th>Status</th>
              <th>Your Bid</th>
              <th>Winner</th>
              <th className="rounded-r-lg">Action</th>
            </tr>
          </thead>

          <tbody className="table-row-group">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <Loading width="sidebar" />
                </td>
              </tr>
            ) : filteredAuctions.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-20 text-gray-400 text-xl font-medium"
                >
                  {getEmptyMessage()}
                </td>
              </tr>
            ) : (
              currentItems.map((auction) => (
                <tr
                  key={auction?._id}
                  className="table-row bg-theme-bg [&_td]:table-cell [&_td]:pl-5 [&_td]:pr-3 [&_td]:py-3"
                >
                  <td className="rounded-l-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {(() => {
                          // Get first valid image URL
                          let imageUrl = null;

                          // Check images array first
                          if (
                            Array.isArray(auction?.images) &&
                            auction.images.length > 0
                          ) {
                            const firstImage = auction.images[0];

                            if (typeof firstImage === "string") {
                              imageUrl = firstImage;
                            } else if (
                              firstImage &&
                              typeof firstImage === "object"
                            ) {
                              // Try to get URL from object
                              imageUrl =
                                firstImage.url ||
                                firstImage.imageUrl ||
                                firstImage.src;
                            }
                          }

                          // Fallback to single image property
                          if (
                            !imageUrl &&
                            auction?.image &&
                            typeof auction.image === "string"
                          ) {
                            imageUrl = auction.image;
                          }

                          if (!imageUrl) {
                            return (
                              <div className="w-[50px] h-[50px] rounded-full bg-gray-400 border-2 border-theme-bg2 flex items-center justify-center">
                                <span className="text-xs text-gray-600">
                                  No Image
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt="Auction"
                                className="w-[50px] h-[50px] rounded-full object-cover border-2 border-theme-bg2"
                                onError={(e) => {
                                  console.error(
                                    `Image failed to load: ${imageUrl}`,
                                  );
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/50x50?text=IMG";
                                }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <span className="pr-10">{auction?.name}</span>
                    </div>
                  </td>

                  <td>
                    <span>{auction?.vehicleType || "---"}</span>
                  </td>

                  <td>
                    <span>{auction?.bids?.length}</span>
                  </td>

                  <td className="capitalize">
                    <span className="px-3 py-1 rounded-full text-sm border bg-theme-bg2 border-border-info-color">
                      {auction?.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex flex-col gap-1 ">
                      <span className="font-normal capitalize text-sm">
                        Full Wrap:{" "}
                        {auction?.currentBids?.fullWrap?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "fullWrap")
                            ?.bidAmount ||
                          "---"}
                      </span>

                      <span className="font-normal capitalize text-sm">
                        One Side:{" "}
                        {auction?.currentBids?.oneSide?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "oneSide")
                            ?.bidAmount ||
                          "---"}
                      </span>

                      <span className="font-normal capitalize text-sm">
                        Both Sides:{" "}
                        {auction?.currentBids?.bothSides?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "bothSides")
                            ?.bidAmount ||
                          "---"}
                      </span>

                      <span className="font-normal capitalize text-sm">
                        Rear Doors:{" "}
                        {auction?.currentBids?.rearDoors?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "rearDoors")
                            ?.bidAmount ||
                          "---"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className="flex flex-col gap-1 ">
                      {["fullWrap", "oneSide", "bothSides", "rearDoors"].map(
                        (wrapType) => {
                          const winner = auction?.winners?.[wrapType];
                          const displayName = wrapType
                            .replace(/([A-Z])/g, " $1")
                            .toLowerCase();

                          return (
                            <div key={wrapType} className="text-sm">
                              <span className="font-normal capitalize">
                                {displayName}:{" "}
                              </span>
                              {winner?.bidder ? (
                                <button
                                  onClick={() =>
                                    openWinnerDetails(winner, wrapType)
                                  }
                                  className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                                  title="Click to view winner details"
                                >
                                  {winner.bidder.firstName || "Winner"}
                                </button>
                              ) : (
                                <span className="text-gray-400">---</span>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </td>

                  <td className="link:mr-2 capitalize rounded-r-lg">
                    <Link
                      className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
                      to={`/single-auction-detail/${auction?._id}`}
                    >
                      <FaEye size={16} className="inline mt-[-2px]" />
                    </Link>
                    {auction?.status === "upcoming" && (
                      <>
                        <Link
                          className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all ml-2"
                          to={`/edit-auction/${auction?._id}`}
                        >
                          <FaRegEdit size={16} className="inline mt-[-3px]" />
                        </Link>
                      </>
                    )}
                    <button
                      className="text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger px-[6px] py-[3px] transition-all ml-2"
                      onClick={() => handleDeleteAuction(auction?._id)}
                    >
                      <MdDeleteForever size={20} className="inline mt-[-3px]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Winner Details Modal */}
      {showWinnerModal && selectedWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-theme-bg2 rounded-2xl shadow-2xl w-full max-w-md border border-border-info-color">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-info-color">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedWinner.wrapType} Winner Details
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Auction Winner Information
                </p>
              </div>
              <button
                onClick={closeWinnerModal}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-red-900/30 transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Winner Info */}
              <div className="bg-theme-bg rounded-xl p-4 border border-border-info-color">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Winner Information
                </h4>

                <div className="space-y-3">
                  {/* Profile Picture and Name */}
                  <div className="flex items-center gap-3">
                    {selectedWinner.bidder?.profilePicture ? (
                      <img
                        src={selectedWinner.bidder.profilePicture}
                        alt={selectedWinner.bidder.firstName}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-blue-900/30 border-2 border-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {selectedWinner.bidder?.firstName?.charAt(0) || "W"}
                        </span>
                      </div>
                    )}
                    <div>
                      <h5 className="text-white font-bold text-lg">
                        {selectedWinner.bidder?.firstName || "N/A"}{" "}
                        {selectedWinner.bidder?.lastName || ""}
                      </h5>
                      <p className="text-gray-400 text-sm">
                        Winner • {selectedWinner.wrapType}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Email */}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {selectedWinner.bidder?.email || "Not available"}
                      </p>
                    </div>

                    {/* Phone */}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                      <p className="text-white font-medium flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {selectedWinner.bidder?.telephoneNumber ||
                          "Not available"}
                      </p>
                    </div>

                    {/* Bid Amount */}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Bid Amount</p>
                      <p className="text-green-400 font-bold text-lg">
                        {currency}{" "}
                        {selectedWinner.bidAmount?.toLocaleString() || "0"}
                      </p>
                    </div>

                    {/* Bid Time */}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Bid Time</p>
                      <p className="text-white font-medium">
                        {selectedWinner.bidTime
                          ? new Date(selectedWinner.bidTime).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Not available"}
                      </p>
                    </div>
                  </div>

                  {/* Bid ID if available */}
                  {selectedWinner.bidId && (
                    <div className="mt-4 pt-4 border-t border-border-info-color">
                      <p className="text-sm text-gray-400 mb-1">Bid ID</p>
                      <p className="text-gray-300 font-mono text-sm break-all">
                        {selectedWinner.bidId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeWinnerModal}
                  className="flex-1 py-3 bg-theme-bg text-white rounded-lg border border-border-info-color hover:bg-theme-color transition-colors font-medium"
                >
                  Close
                </button>
                {selectedWinner.bidder?.email && (
                  <a
                    href={`mailto:${selectedWinner.bidder.email}`}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                  >
                    Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredAuctions.length > 0 && (
        <Pagination
          totalPosts={filteredAuctions.length}
          postsPerPage={itemsPerPage}
          paginate={paginate}
          currentPage={currentPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      )}
    </div>
  );
};

export default ManageItems;
