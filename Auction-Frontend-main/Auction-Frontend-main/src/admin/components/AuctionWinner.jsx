import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAuctionWinners } from "../../store/auction/auctionSlice";
import { FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { fetchUserCountry } from "../../store/countary/countrySlice";
const AuctionWinnersTable = () => {
  const dispatch = useDispatch();
  const { auctionWinners, isLoading, isError } = useSelector(
    (state) => state.auction,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);
  const { country, currency } = useSelector((state) => state.country);
  const itemsPerPage = 5;
  const carouselRef = useRef(null);
  useEffect(() => {
    dispatch(getAllAuctionWinners());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);
  // Helper function to safely render location data
  const renderLocation = (location) => {
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    if (location.name) return location.name;
    return "Location available"; // fallback
  };
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === "next" ? 256 : -256; // Adjust based on image width (w-64 = 256px)
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle keyboard navigation for carousel
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      scrollCarousel("next");
    } else if (e.key === "ArrowLeft") {
      scrollCarousel("prev");
    }
  };
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-center text-lg text-gray-500">
          Loading auction winners...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-center text-red-500">{isError}</p>
      </div>
    );

  const winners = auctionWinners?.data || [];
  const totalPages = Math.ceil(winners.length / itemsPerPage);
  const currentWinners = winners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openModal = (winner) => setSelectedAuction(winner);
  const closeModal = () => setSelectedAuction(null);

  return (
    <div className="bg-theme-bg text-slate-300 rounded-xl p-4 md:p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
        Auction Winners
      </h1>

      <div className="overflow-x-auto rounded-xl">
        {/* Desktop Table */}
        <table className="hidden md:table min-w-full divide-y divide-gray-600 bg-theme-bg text-slate-200">
          <thead className="bg-theme-bg">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Profile
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Winner
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Bid Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Bid Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Bid Time
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Auction Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {currentWinners.map((winner) => (
              <tr key={winner.bidId}>
                <td className="px-4 py-4">
                  <img
                    src={
                      winner.buyer?.profilePicture ||
                      "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-gray-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg";
                    }}
                  />
                </td>
                <td className="px-4 py-4 text-sm">
                  <div>
                    <p className="font-medium">{winner.buyer?.name}</p>
                    <p className="text-xs text-gray-400">
                      {winner.buyer?.email}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-900/30 text-blue-300 rounded-full capitalize">
                    {winner.bidType ? winner.bidType : "Unknown"}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-green-400 font-medium">
                  {currency} {winner.bidAmount?.toLocaleString() || "0"}
                </td>
                <td className="px-4 py-4 text-sm">
                  {winner.bidTime
                    ? new Date(winner.bidTime).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="px-4 py-4 text-sm">
                  {winner.auction?.name || "N/A"}
                </td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => openModal(winner)}
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                    title="View Winner Details"
                  >
                    <FiEye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {currentWinners.map((winner) => (
            <div
              key={winner.bidId}
              className="bg-theme-bg2 rounded-lg p-4 shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      winner.buyer?.profilePicture ||
                      "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg"
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border border-gray-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg";
                    }}
                  />
                  <div>
                    <h3 className="font-medium">
                      {winner.buyer?.name || "Unknown Buyer"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {winner.buyer?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openModal(winner)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <FiEye size={20} />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Bid Amount</p>
                  <p className="text-green-400 font-medium">
                    {currency} {winner.bidAmount?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Bid Date</p>
                  <p>
                    {winner.bidTime
                      ? new Date(winner.bidTime).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Auction</p>
                  <p>{winner.auction?.name || "N/A"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {winners.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40 hover:bg-gray-600 transition-colors"
          >
            <FiChevronLeft className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-40 hover:bg-gray-600 transition-colors"
          >
            Next <FiChevronRight className="ml-1" />
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedAuction && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300">
          <div className="bg-theme-bg2 w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative text-slate-300 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition-colors duration-200"
              aria-label="Close Modal"
            >
              &times;
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 pb-3 border-b border-gray-700">
              Auction Winner Details
            </h2>

            {/* Modal Content */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Buyer Information Section */}
              <div className="bg-theme-bg p-5 rounded-xl shadow-inner">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">
                  Winner Information
                </h3>
                <div className="flex items-center gap-4 mb-5">
                  <img
                    src={
                      selectedAuction.buyer?.profilePicture ||
                      "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg"
                    }
                    alt="Buyer Profile"
                    className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover transition-transform duration-200 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg";
                    }}
                  />
                  <div>
                    <p className="font-bold text-lg">
                      {selectedAuction.buyer?.name || "N/A"}
                    </p>

                    <p className="text-sm text-gray-400">
                      {selectedAuction.buyer?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">
                      Bid Amount
                    </span>
                    <span className="text-green-400 font-semibold">
                      {currency}{" "}
                      {selectedAuction.bidAmount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">Bid Type</span>
                    <span className="text-green-400 font-semibold">
                      {selectedAuction.bidType || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">Bid Time</span>
                    <span>
                      {selectedAuction.bidTime
                        ? new Date(selectedAuction.bidTime).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">
                      Payment Status
                    </span>
                    <span
                      className={`font-semibold capitalize ${
                        selectedAuction.paymentStatus === "completed"
                          ? "text-green-400"
                          : selectedAuction.paymentStatus === "failed"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {selectedAuction.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">Company</span>
                    <span>{selectedAuction.buyer?.company || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">Position</span>
                    <span>{selectedAuction.buyer?.position || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">Suburb</span>
                    <span>{selectedAuction.buyer?.suburb || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">
                      Postal Code
                    </span>
                    <span>{selectedAuction.buyer?.postalCode || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-700">
                    <span className="font-medium text-gray-300">Location</span>
                    <span>
                      {selectedAuction.buyer?.city || "N/A"},{" "}
                      {selectedAuction.buyer?.state || "N/A"},{" "}
                      {selectedAuction.buyer?.country || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information Section */}
              <div className="bg-theme-bg p-5 rounded-xl shadow-inner">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">
                  Vehicle Information
                </h3>
                <div className="space-y-4">
                  {/* Auction Name and Description */}
                  <div>
                    <h4 className="font-bold text-lg">
                      {selectedAuction.auction?.name || "N/A"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {selectedAuction.auction?.description ||
                        "No description available"}
                    </p>
                  </div>

                  {/* Scrollable Image Carousel */}
                  {selectedAuction.auction?.images?.length > 0 ? (
                    <div className="relative">
                      {" "}
                      <button
                        onClick={() => scrollCarousel("prev")}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors z-10"
                        aria-label="Previous Image"
                      >
                        <FiChevronLeft size={24} />
                      </button>
                      <button
                        onClick={() => scrollCarousel("next")}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors z-10"
                        aria-label="Next Image"
                      >
                        <FiChevronRight size={24} />
                      </button>
                      <div
                        ref={carouselRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 scroll-smooth"
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                      >
                        {selectedAuction.auction.images.map((img, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 w-64 h-40 rounded-lg overflow-hidden snap-center cursor-pointer md:w-48 md:h-32 sm:w-40 sm:h-28"
                            onClick={() =>
                              setZoomedImage(
                                typeof img === "string" ? img : img.url,
                              )
                            }
                          >
                            <img
                              src={typeof img === "string" ? img : img.url}
                              alt={`Vehicle Image ${i + 1}`}
                              className={`w-full h-full object-contain bg-gray-700 p-2 transition-opacity duration-300 ${
                                loadedImages[`modal-${i}`]
                                  ? "opacity-100"
                                  : "opacity-0 animate-pulse"
                              }`}
                              onLoad={() =>
                                setLoadedImages((prev) => ({
                                  ...prev,
                                  [`modal-${i}`]: true,
                                }))
                              }
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-image.png";
                                e.target.className =
                                  "w-full h-full object-contain bg-gray-700 p-2";
                              }}
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-lg bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No images available</span>
                    </div>
                  )}
                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 font-medium">Vehicle Model</p>
                      <p>{selectedAuction.auction?.vehicleModel || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-medium">Status</p>
                      <p className="capitalize">
                        {selectedAuction.auction?.status || "Unknown"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 font-medium">
                        Auction Duration
                      </p>
                      <p>
                        {selectedAuction.auction?.startTime
                          ? new Date(
                              selectedAuction.auction.startTime,
                            ).toLocaleString()
                          : "N/A"}{" "}
                        -{" "}
                        {selectedAuction.auction?.endTime
                          ? new Date(
                              selectedAuction.auction.endTime,
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 font-medium">Location</p>
                      <p>{renderLocation(selectedAuction.auction?.location)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black bg-opacity-80 p-4 transition-opacity duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-full max-h-[90vh] transform transition-all duration-300 scale-100">
            <button
              className="absolute top- -2 right-2  text-red-500 text-3xl font-bold hover:text-gray-300 transition-colors duration-200"
              onClick={() => setZoomedImage(null)}
              aria-label="Close Zoomed Image"
            >
              &times;
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed Vehicle Image"
              className="w-full h-full object-contain max-h-[80vh] rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-image.png";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionWinnersTable;
