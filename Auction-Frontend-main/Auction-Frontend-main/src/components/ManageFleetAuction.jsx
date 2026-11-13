import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  getAuctionsByFleetOwner,
  deleteSingleFleetAuctionById,
} from "../store/fleetowner/fleetownerSlice";
import { FaEye, FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import Pagination from "./Pagination";
import { HeaderLeaderboard } from "./AdSlots";

const ManageFleetAuction = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { country, currency } = useSelector((state) => state.country);
  const {
    fleetauction: fleetAuctions,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.fleetOwner);

  const user = useSelector((state) => state.auth.user);
  const userId = user ? user._id : null;
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedWrapType, setSelectedWrapType] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get("status") || "ALL";
  useEffect(() => {
    if (userId) {
      dispatch(getAuctionsByFleetOwner(userId));
    }
  }, [dispatch, userId]);

  const getAuctionsData = () => {
    if (!fleetAuctions) return [];
    if (Array.isArray(fleetAuctions)) return fleetAuctions;
    if (Array.isArray(fleetAuctions.data)) return fleetAuctions.data;
    return [];
  };

  const auctionsData = getAuctionsData();

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage] = useState(6);

  const filteredAuctions = useMemo(() => {
    let data = [...getAuctionsData()];

    data.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    if (filterStatus === "ALL") return data;
    if (filterStatus === "AWAITING_ADMIN_APPROVAL") {
      return data.filter((a) => a?.isApprovedByAdmin === false);
    }
    if (filterStatus === "active") {
      return data.filter((a) => a?.status === "active");
    }
    if (filterStatus === "over") {
      return data.filter((a) => a?.status === "over" || a?.status === "ended");
    }
    return data;
  }, [filterStatus, fleetAuctions]);
  // FIXED

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAuctions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const nextPage = () => {
    if (currentPage < Math.ceil(auctionsData.length / itemsPerPage)) {
      setCurrentPage((p) => p + 1);
    }
  };
  const totalItems = filteredAuctions.length;
  const handleDeleteFleetAuction = async (id) => {
    try {
      await dispatch(deleteSingleFleetAuctionById(id)).unwrap();
      toast.success("Auction deleted successfully", { autoClose: 500 });
      dispatch(getAuctionsByFleetOwner(userId)); // Refresh auctions after deletion
    } catch (error) {
      toast.error(error.message || "Failed to delete auction");
    }
  };
  const openWinnerDetails = (winnerData, wrapType) => {
    if (!winnerData || !winnerData.bidder) return;

    setSelectedWinner(winnerData);
    setSelectedWrapType(wrapType.replace(/([A-Z])/g, " $1"));
    setShowWinnerModal(true);
  };

  // Function to close modal
  const closeWinnerModal = () => {
    setSelectedWinner(null);
    setSelectedWrapType("");
    setShowWinnerModal(false);
  };

  // Render auction images (unchanged)
  const renderAuctionImages = (auction) => {
    if (!auction) {
      return (
        <div className="w-[50px] h-[50px] rounded-full bg-gray-400 border-2 border-theme-bg2 flex items-center justify-center">
          <span className="text-xs text-gray-600">No Image</span>
        </div>
      );
    }

    let image = null;

    if (Array.isArray(auction.images) && auction.images.length > 0) {
      const firstValid = auction.images.find((img) => {
        const src = typeof img === "string" ? img : img?.url || img?.path;
        return src && src.trim() !== "";
      });
      image =
        typeof firstValid === "string"
          ? firstValid
          : firstValid?.url || firstValid?.path;
    } else if (typeof auction.image === "string" && auction.image.trim()) {
      image = auction.image;
    }

    if (!image) {
      return (
        <div className="w-[50px] h-[50px] rounded-full bg-gray-400 border-2 border-theme-bg2 flex items-center justify-center">
          <span className="text-xs text-gray-600">No Image</span>
        </div>
      );
    }

    return (
      <img
        src={image}
        alt="Auction"
        className="w-[50px] h-[50px] rounded-full object-cover border-2 border-theme-bg2"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/placeholder-image.jpg";
          e.target.className =
            "w-[50px] h-[50px] rounded-full bg-gray-400 border-2 border-theme-bg2";
        }}
      />
    );
  };
  const getEmptyMessage = () => {
    if (filterStatus === "ALL") return "No Auctions Found";
    if (filterStatus === "active") return "No Active Auctions";
    if (filterStatus === "over") return "No Over Auctions";
    if (filterStatus === "AWAITING_ADMIN_APPROVAL")
      return "No Auctions Awaiting Admin Approval";
    return "No Auctions Found";
  };
  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Your Fleet Auctions
      </h2>
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        {["ALL", "active", "AWAITING_ADMIN_APPROVAL", "over"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setSearchParams({ status });
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all leading-none ${
              filterStatus === status
                ? "bg-theme-color text-white shadow-lg"
                : "bg-theme-bg2 text-gray-300 hover:bg-theme-bg"
            }`}
          >
            {status === "ALL"
              ? "All Auctions"
              : status === "AWAITING_ADMIN_APPROVAL"
                ? "Pending Admin Approval"
                : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}

        <HeaderLeaderboard />
      </div>
      <div className="overflow-auto px-4 bg-theme-bg2 rounded-2xl border border-border-info-color">
        <table className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4">
          <thead className="table-header-group">
            <tr className="table-row bg-theme-color [&_th]:table-cell [&_th]:pl-5 [&_th]:pr-3 [&_th]:py-3">
              <th className="rounded-l-lg">Vehicle Image</th>
              <th>Vehicle</th>
              <th>Manufacturer</th>
              <th>Registration Plate</th>
              <th>Bids</th>
              <th>Status</th>
              <th>Current Bid</th>
              <th>Location</th>
              <th>Winners</th>
              <th className="rounded-r-lg">Action</th>
            </tr>
          </thead>

          <tbody className="table-row-group">
            {isError ? (
              <tr>
                <td colSpan="7" className="text-center text-white">
                  {message}
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan="7" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : filteredAuctions.length === 0 ? (
              <tr className="table-row bg-theme-bg">
                <td
                  colSpan="10"
                  className="text-center m-2 w-full p-10 h-[300px] text-gray-300"
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
                      {renderAuctionImages(auction)}
                    </div>
                  </td>
                  <td>
                    {" "}
                    <div>
                      <div
                        className={`font-medium text-sm leading-snug max-w-[150px] ${
                          auction?.vehicleModel?.length > 2
                            ? "whitespace-normal break-words"
                            : "whitespace-nowrap"
                        }`}
                      >
                        {auction?.vehicleModel}
                      </div>
                      <div className="text-xs text-gray-400">
                        {auction?.yearofmanufacturer}
                      </div>
                    </div>
                  </td>
                  <td>{auction?.vehicleManufacturer}</td>
                  <td>
                    <span className="font-bold text-theme-color bg-theme-bg2 px-3 py-1 rounded-md text-sm">
                      {auction?.registrationPlate || "---"}
                    </span>
                  </td>
                  <td>{auction?.bids?.length || 0}</td>
                  <td>
                    <div className="flex flex-col gap-2">
                      <span className="capitalize px-3 py-1 rounded-full text-sm border bg-theme-bg2 border-border-info-color w-fit">
                        {auction?.status}
                      </span>

                      {auction?.isApprovedByAdmin === false && (
                        <span className="capitalize px-2 py-1 rounded-full text-sm border bg-theme-bg2 border-border-info-color w-fit ">
                          In Review
                        </span>
                      )}
                    </div>

                    {auction?.status === "rejected" && (
                      <p className="text-xs text-red-500 mt-1 whitespace-normal break-words max-w-[200px] leading-snug">
                        This auction has been rejected by the admin and will not
                        be applicable.
                      </p>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span>
                        Full Wrap:{" "}
                        {auction?.currentBids?.fullWrap?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "fullWrap")
                            ?.bidAmount ||
                          "---"}
                      </span>

                      <span>
                        One Side:{" "}
                        {auction?.currentBids?.oneSide?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "oneSide")
                            ?.bidAmount ||
                          "---"}
                      </span>

                      <span>
                        Both Sides:{" "}
                        {auction?.currentBids?.bothSides?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "bothSides")
                            ?.bidAmount ||
                          "---"}
                      </span>

                      <span>
                        Rear Doors:{" "}
                        {auction?.currentBids?.rearDoors?.bidAmount ||
                          auction?.bids?.find((b) => b.bidType === "rearDoors")
                            ?.bidAmount ||
                          "---"}
                      </span>
                    </div>
                  </td>

                  <td>{auction?.location?.name?.split(",")[0] || "---"}</td>
                  <td>
                    <div className="flex flex-col gap-1 text-xs">
                      {auction?.winners ? (
                        <>
                          {/* Full Wrap Winner */}
                          {auction.winners.fullWrap?.bidder && (
                            <div className="group">
                              <button
                                onClick={() =>
                                  openWinnerDetails(
                                    auction.winners.fullWrap,
                                    "fullWrap",
                                  )
                                }
                                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors text-left"
                                title="Click to view winner details"
                              >
                                <strong>Full Wrap:</strong>{" "}
                                {auction.winners.fullWrap.bidder.firstName ||
                                  "Unknown"}
                              </button>
                              <span className="text-gray-400 ml-1">
                                {" "}
                                {currency}
                                {auction.winners.fullWrap.bidAmount}
                              </span>
                            </div>
                          )}

                          {/* One Side Winner */}
                          {auction.winners.oneSide?.bidder && (
                            <div className="group">
                              <button
                                onClick={() =>
                                  openWinnerDetails(
                                    auction.winners.oneSide,
                                    "oneSide",
                                  )
                                }
                                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors text-left"
                                title="Click to view winner details"
                              >
                                <strong>One Side:</strong>{" "}
                                {auction.winners.oneSide.bidder.firstName ||
                                  "Unknown"}
                              </button>
                              <span className="text-gray-400 ml-1">
                                {" "}
                                {currency}
                                {auction.winners.oneSide.bidAmount}
                              </span>
                            </div>
                          )}

                          {/* Both Sides Winner */}
                          {auction.winners.bothSides?.bidder && (
                            <div className="group">
                              <button
                                onClick={() =>
                                  openWinnerDetails(
                                    auction.winners.bothSides,
                                    "bothSides",
                                  )
                                }
                                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors text-left"
                                title="Click to view winner details"
                              >
                                <strong>Both Sides:</strong>{" "}
                                {auction.winners.bothSides.bidder.firstName ||
                                  "Unknown"}
                              </button>
                              <span className="text-gray-400 ml-1">
                                {" "}
                                {currency}
                                {auction.winners.bothSides.bidAmount}
                              </span>
                            </div>
                          )}

                          {/* Rear Doors Winner */}
                          {auction.winners.rearDoors?.bidder && (
                            <div className="group">
                              <button
                                onClick={() =>
                                  openWinnerDetails(
                                    auction.winners.rearDoors,
                                    "rearDoors",
                                  )
                                }
                                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors text-left"
                                title="Click to view winner details"
                              >
                                <strong>Rear Doors:</strong>{" "}
                                {auction.winners.rearDoors.bidder.firstName ||
                                  "Unknown"}
                              </button>
                              <span className="text-gray-400 ml-1">
                                {" "}
                                {currency}
                                {auction.winners.rearDoors.bidAmount}
                              </span>
                            </div>
                          )}

                          {!auction.winners.fullWrap?.bidder &&
                            !auction.winners.oneSide?.bidder &&
                            !auction.winners.bothSides?.bidder &&
                            !auction.winners.rearDoors?.bidder && (
                              <span className="text-gray-500">
                                No winners yet
                              </span>
                            )}
                        </>
                      ) : (
                        <span className="text-gray-500">No winners data</span>
                      )}
                    </div>
                  </td>
                  <td className="link:mr-2 capitalize rounded-r-lg">
                    <Link
                      className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
                      to={`/single-fleet-auction-detail/${auction?._id}`}
                    >
                      <FaEye size={16} className="inline mt-[-2px]" />
                    </Link>
                    {auction?.status === "upcoming" && (
                      <Link
                        className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all ml-2"
                        to={`/edit-fleet-auction/${auction?._id}`}
                      >
                        <FaRegEdit size={16} className="inline mt-[-3px]" />
                      </Link>
                    )}
                    <button
                      className="text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger px-[6px] py-[3px] transition-all ml-2"
                      onClick={() => {
                        if (window.confirm("Delete this auction?")) {
                          handleDeleteFleetAuction(auction._id);
                        }
                      }}
                    >
                      <MdDeleteForever size={20} className="inline mt-[-3px]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {showWinnerModal && selectedWinner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
              <div className="bg-theme-bg2 rounded-2xl shadow-2xl w-full max-w-md border border-border-info-color">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-info-color">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedWrapType} Winner Details
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
                              {selectedWinner.bidder?.firstName?.charAt(0) ||
                                "W"}
                            </span>
                          </div>
                        )}
                        <div>
                          <h5 className="text-white font-bold text-lg">
                            {selectedWinner.bidder?.firstName || "N/A"}{" "}
                            {selectedWinner.bidder?.lastName || ""}
                          </h5>
                          <p className="text-gray-400 text-sm">
                            Winner • {selectedWrapType}
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
                          <p className="text-sm text-gray-400 mb-1">
                            Bid Amount
                          </p>
                          <p className="text-green-400 font-bold text-lg">
                            {currency}
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
        </table>
      </div>

      {auctionsData.length > 0 && (
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

export default ManageFleetAuction;
