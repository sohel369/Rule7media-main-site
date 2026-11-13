import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAdminBudgetRequests,
  manageBudgetRequest,
  setSelectedRequest,
} from "../../store/adminbudgetrequest/adminbudgetSlice";
import { FaEye } from "react-icons/fa";

const AdminBudgetRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    requests = [],
    stats = {},
    loading,
  } = useSelector((state) => state.adminbudget);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    dispatch(
      getAdminBudgetRequests({
        status: selectedStatus,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
      }),
    );
  }, [dispatch, selectedStatus, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((stats.total || requests.length) / itemsPerPage);
  const currentItems = requests; // Rely on backend pagination

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleDirectUpdate = (request, newStatus) => {
    dispatch(
      manageBudgetRequest({
        budgetRequestId: request._id,
        formData: {
          action: newStatus,
          adminNotes: "",
          showBuyerDetails: false,
          showSellerDetails: false,
        },
      }),
    ).then(() => {
      dispatch(
        getAdminBudgetRequests({
          status: selectedStatus,
          page: 1,
          limit: itemsPerPage,
          sortBy: "createdAt",
        }),
      );
      setCurrentPage(1);
    });
  };

  const handleStatusChange = (request, newStatus) => {
    if (newStatus === "view") {
      dispatch(setSelectedRequest(request));
      navigate(`/admin/singlebudgetrequest/${request._id}`);
    } else {
      handleDirectUpdate(request, newStatus);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-theme-bg rounded-2xl min-h-screen transition-all duration-300 ease-in-out">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 animate-fade-in">
        Budget Requests Management
      </h2>

      <div className=" grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        <div
          key="all"
          className={`bg-theme-bg2 text-white shadow-lg p-5 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 hover:bg-theme-bg border border-teal-100 cursor-pointer ${
            selectedStatus === null ? "bg-theme-bg" : ""
          }`}
          onClick={() => handleStatusFilter(null)}
        >
          <div className="text-3xl font-bold text-white">
            {stats.total || 0}
          </div>
          <div className="text-sm text-white capitalize mt-2">All Requests</div>
        </div>
        {Object.entries(stats)
          .filter(([status]) => status !== "total")
          .map(([status, count]) => (
            <div
              key={status}
              className={`bg-theme-bg2 shadow-lg p-5 rounded-xl text-center transform hover:scale-105 transition-transform duration-300 hover:bg-theme-bg border border-teal-100 cursor-pointer ${
                selectedStatus === status ? "bg-teal-100" : ""
              }`}
              onClick={() => handleStatusFilter(status)}
            >
              <div className="text-3xl font-bold text-white">{count}</div>
              <div className="text-sm text-white capitalize mt-2">
                {status.replace(/_/g, " ")}
              </div>
            </div>
          ))}
      </div>

      <div className="overflow-x-auto bg-theme-bg2 shadow-lg rounded-xl border border-gray-200">
        <table className="w-full text-left text-white">
          <thead className="bg-teal-50  bg-theme-bg2 text-white">
            <tr>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Buyer</th>
              <th className="p-4 font-semibold">Company</th>
              <th className="p-4 font-semibold">Vehicle</th>
              <th className="p-4 font-semibold">Model</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Created</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  {selectedStatus
                    ? `No ${selectedStatus.replace(/_/g, " ")} requests found`
                    : "No budget requests found"}
                </td>
              </tr>
            ) : (
              currentItems.map((req) => (
                <tr
                  key={req._id}
                  className="border-t hover:bg-theme-bg text-white transition-colors duration-200 animate-fade-in"
                >
                  <td className="p-4">{req._id}</td>
                  <td className="p-4">{req.user?.email || "Anonymous"}</td>
                  <td className="p-4">
                    {req.fleetOwnerId?.company ||
                      req.fleetAuctionId?.company ||
                      "N/A"}
                  </td>
                  <td className="p-4">
                    {req.fleetAuctionId?.vehicleManufacturer || "N/A"}
                  </td>
                  <td className="p-4">
                    {req.fleetAuctionId?.vehicleModel || "N/A"}
                  </td>
                  <td className="p-4 capitalize">
                    {req.status === "review_pending" ? (
                      <select
                        className="appearance-none border border-teal-500 bg-theme-bg2 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 cursor-pointer"
                        onChange={(e) =>
                          handleStatusChange(req, e.target.value)
                        }
                        defaultValue=""
                      >
                        <option
                          value=""
                          disabled
                          className="text-gray-400 bg-theme-bg2"
                        >
                          Update Status
                        </option>
                        <option
                          value="approve"
                          className="text-green-400 bg-theme-bg2"
                        >
                          Approve
                        </option>
                        <option
                          value="reject"
                          className="text-red-400 bg-theme-bg2"
                        >
                          Reject
                        </option>
                        <option
                          value="info_requested"
                          className="text-yellow-400 bg-theme-bg2"
                        >
                          Request Info
                        </option>
                      </select>
                    ) : (
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-white 
                          ${
                            req.status === "approved"
                              ? "bg-green-500"
                              : req.status === "rejected"
                                ? "bg-red-500"
                                : req.status === "info_requested"
                                  ? "bg-yellow-500"
                                  : "bg-teal-500"
                          }`}
                      >
                        {req.status?.replace(/_/g, " ")}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleStatusChange(req, "view")}
                      className="text-teal-600 hover:text-teal-800 text-xl transition-colors duration-200"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-theme-bg2 text-white rounded-lg disabled:opacity-50 hover:bg-theme-bg transition-all duration-200"
            >
              Previous
            </button>
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page + 1
                    ? "bg-theme-bg2 text-white"
                    : "bg-theme-bg2 text-white hover:bg-theme-bg"
                } transition-all duration-200`}
              >
                {page + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-theme-bg2 text-white rounded-lg disabled:opacity-50 hover:bg-theme-bg transition-all duration-200"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdminBudgetRequests;
