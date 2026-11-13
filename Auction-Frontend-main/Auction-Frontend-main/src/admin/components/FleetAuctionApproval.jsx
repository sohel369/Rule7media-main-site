import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getfleetauctiondata,
  approveFleetAuction,
  rejectFleetAuction,
} from "../../store/fleetowner/fleetownerSlice";
import { toast } from "react-toastify";
import { FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const FleetAuctionApproval = () => {
  const dispatch = useDispatch();
  const {
    form: fleetAuctions,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.fleetOwner);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    dispatch(getfleetauctiondata({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleApprove = (id) => {
    dispatch(approveFleetAuction(id))
      .unwrap()
      .then((response) => {
        toast.success(response.message || "Auction approved successfully!");
        dispatch(
          getfleetauctiondata({ page: currentPage, limit: itemsPerPage }),
        );
      })
      .catch((error) => {
        const errorMessage = error?.message || "Failed to approve auction";
        toast.error(errorMessage);
      });
  };

  const handleRejected = (id) => {
    dispatch(rejectFleetAuction(id))
      .unwrap()
      .then((response) => {
        toast.success(response.message || "Auction rejected successfully!");
        dispatch(
          getfleetauctiondata({ page: currentPage, limit: itemsPerPage }),
        );
      })
      .catch((error) => {
        const errorMessage = error?.message || "Failed to reject auction";
        toast.error(errorMessage);
      });
  };

  const handleView = (id) => {
    window.location.href = `/single-fleet-auction-detail/${id}`;
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-lg">Loading auctions...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {message || "Failed to load auctions"}
        </div>
      </div>
    );
  }

  const auctionData = Array.isArray(fleetAuctions?.data)
    ? fleetAuctions.data
    : [];
  const totalItems = fleetAuctions?.totalItems || 0;
  const totalPages = fleetAuctions?.totalPages || 1;
  const currentPageFromApi = fleetAuctions?.currentPage || 1;

  // Calculate statistics
  const approvedCount = auctionData.filter(
    (auction) => auction.isApprovedByAdmin && auction.status !== "rejected",
  ).length;
  const pendingCount = auctionData.filter(
    (auction) => !auction.isApprovedByAdmin && auction.status !== "rejected",
  ).length;
  const rejectedCount = auctionData.filter(
    (auction) => auction.status === "rejected",
  ).length;

  const filteredAuctions = auctionData.filter((auction) => {
    if (filterStatus === "approved")
      return auction.isApprovedByAdmin && auction.status !== "rejected";
    if (filterStatus === "pending")
      return !auction.isApprovedByAdmin && auction.status !== "rejected";
    if (filterStatus === "rejected") return auction.status === "rejected";
    return true; // all
  });

  if (auctionData.length === 0) {
    return (
      <div className="p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Fleet Auction Approvals
        </h2>
        <div className="bg-gray-100 border border-gray-300 text-white px-4 py-3 rounded">
          No auctions found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-theme-bg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Fleet Auction Approvals
      </h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8 w-full">
        {/* All */}
        <div
          className={`bg-theme-bg2 shadow-lg p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 hover:shadow-xl border border-teal-100 cursor-pointer ${
            filterStatus === "all" ? "bg-teal-100" : ""
          }`}
          onClick={() => setFilterStatus("all")}
        >
          <div className="text-4xl font-bold text-white">{totalItems}</div>
          <div className="text-base text-white mt-2 font-medium">All</div>
        </div>

        {/* Approved */}
        <div
          className={`bg-theme-bg2 shadow-lg p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 hover:shadow-xl border border-green-100 cursor-pointer ${
            filterStatus === "approved" ? "bg-green-100" : ""
          }`}
          onClick={() => setFilterStatus("approved")}
        >
          <div className="text-4xl font-bold text-green-600">
            {approvedCount}
          </div>
          <div className="text-base text-white mt-2 font-medium">Approved</div>
        </div>

        {/* Pending */}
        <div
          className={`bg-theme-bg2 shadow-lg p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 hover:shadow-xl border border-yellow-100 cursor-pointer ${
            filterStatus === "pending" ? "bg-theme-bg2" : ""
          }`}
          onClick={() => setFilterStatus("pending")}
        >
          <div className="text-4xl font-bold text-yellow-600">
            {pendingCount}
          </div>
          <div className="text-base text-white mt-2 font-medium">Pending</div>
        </div>

        {/* Rejected */}
        <div
          className={`bg-theme-bg2 shadow-lg p-6 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 hover:shadow-xl border border-red-100 cursor-pointer ${
            filterStatus === "rejected" ? "bg-red-100" : ""
          }`}
          onClick={() => setFilterStatus("rejected")}
        >
          <div className="text-4xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-base text-white mt-2 font-medium">Rejected</div>
        </div>
      </div>

      {/* Items per page selector + info */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <label
            htmlFor="itemsPerPage"
            className="text-sm font-medium text-white"
          >
            Auctions Per Page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-theme-bg2 text-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="text-sm text-white">
          Showing{" "}
          <span className="font-semibold">
            {(currentPageFromApi - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {Math.min(currentPageFromApi * itemsPerPage, totalItems)}
          </span>{" "}
          of <span className="font-semibold">{totalItems}</span> entries
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-theme-bg2 shadow-lg rounded-xl border ">
        <table className="w-full text-left text-base">
          <thead className="bg-theme-bg2 text-white">
            <tr>
              <th className="p-3 border text-left">Company</th>
              <th className="p-3 border text-left">Model</th>
              <th className="p-3 border text-left">Account No</th>
              <th className="p-3 border text-center">Status</th>
              <th className="p-3 border text-center">Actions</th>
              <th className="p-3 border text-center">View</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuctions.map((auction) => (
              <tr
                key={auction._id}
                className="border-t hover:bg-theme-bg transition-colors duration-200 animate-fade-in text-white"
              >
                <td className="p-3 border">{auction.company || "N/A"}</td>
                <td className="p-3 border">{auction.vehicleModel || "N/A"}</td>
                <td className="p-3 border">{auction.accountNumber || "N/A"}</td>
                <td className="p-3 border text-center">
                  {auction.status === "rejected" ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Rejected ❌
                    </span>
                  ) : auction.isApprovedByAdmin ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Approved ✅
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending ⏳
                    </span>
                  )}
                </td>

                <td className="p-3 border text-center text-white">
                  {/* Show actions only for pending auctions */}
                  {!auction.isApprovedByAdmin &&
                  auction.status !== "rejected" ? (
                    <>
                      <button
                        onClick={() => handleApprove(auction._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejected(auction._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-white ">-</span>
                  )}
                </td>

                <td className="p-3 border text-center">
                  <button
                    onClick={() => handleView(auction._id)}
                    className="text-white hover:bg-theme-bg2 p-2 rounded hover:bg-theme-bg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="View Details"
                  >
                    <FiEye className="text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPageFromApi - 1)}
            disabled={currentPageFromApi <= 1}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              currentPageFromApi <= 1
                ? "bg-theme-bg2 text-white cursor-not-allowed"
                : "bg-theme-bg2 text-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FiChevronLeft className="mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              const isCurrentPage = pageNum === currentPageFromApi;

              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPageFromApi - 1 &&
                  pageNum <= currentPageFromApi + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isCurrentPage
                        ? "bg-theme-bg2 text-white"
                        : "bg-theme-bg text-white border border-gray-300 hover:bg-theme-bg2"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }

              if (
                pageNum === currentPageFromApi - 2 ||
                pageNum === currentPageFromApi + 2
              ) {
                return (
                  <span key={pageNum} className="px-3 py-2 text-white">
                    ...
                  </span>
                );
              }

              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPageFromApi + 1)}
            disabled={currentPageFromApi >= totalPages}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              currentPageFromApi >= totalPages
                ? "bg-theme-bg2-100 text-gray-400 cursor-not-allowed"
                : "bg-theme-bg text-white border border-gray-300 hover:bg-theme-bg2"
            }`}
          >
            Next
            <FiChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FleetAuctionApproval;
