import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  getAllCpm,
  updateCpm,
  deleteCpm,
  createCpm,
  clearMessage,
} from "../../store/cpm/cpmSlice";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 animate-in slide-in-from-top-2`}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200 text-xl">
          ×
        </button>
      </div>
    </div>
  );
};

const CpmTable = () => {
  const dispatch = useDispatch();
  const {
    cpm: cpmData,
    isLoading,
    isError,
    isSuccess,
    message,
  } = useSelector((state) => state.cpm);
  const { country, currency } = useSelector((state) => state.country);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedPageType, setSelectedPageType] = useState("all");
  const [isCreating, setIsCreating] = useState(false); // Separate loading for create button
  const [isSavingEdit, setIsSavingEdit] = useState(false); // Separate loading for edit save

  const [newFormData, setNewFormData] = useState({
    Industry: "",
    GoogleAdvertisingCPMRange: "",
    VehicleWrapCPMCost: "",
    MeasurableSaving: "",
    pageType: "traditional",
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    dispatch(getAllCpm({ pageType: null }));
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Handle success/error messages
  useEffect(() => {
    if (isSuccess || isError) {
      setToastMessage(message);
      setToastType(isError ? "error" : "success");
      setShowToast(true);

      setTimeout(() => {
        dispatch(clearMessage());
      }, 100);
    }
  }, [isSuccess, isError, message, dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await dispatch(deleteCpm(id)).unwrap();
        setToastMessage("Entry deleted successfully");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        setToastMessage("Delete failed: " + error);
        setToastType("error");
        setShowToast(true);
        console.error("Delete failed:", error);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditFormData({ ...item });
  };

  const validateForm = (formData, isEdit = false) => {
    const data = isEdit ? formData : newFormData;
    const {
      Industry,
      GoogleAdvertisingCPMRange,
      VehicleWrapCPMCost,
      MeasurableSaving,
      pageType,
    } = data;

    // Required field validations
    if (!Industry || !Industry.trim()) {
      setToastMessage("Industry field is required");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (!/^[A-Za-z\s]+$/.test(Industry.trim())) {
      setToastMessage("Industry field should contain only letters and spaces");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (!pageType) {
      setToastMessage("Please select a form type");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (!GoogleAdvertisingCPMRange || !GoogleAdvertisingCPMRange.trim()) {
      setToastMessage("CPM Range field is required");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (!/^[\d\s.,\-]+$/.test(GoogleAdvertisingCPMRange)) {
      setToastMessage("CPM Range can only contain numbers, dash, dot, comma and spaces");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (!VehicleWrapCPMCost && VehicleWrapCPMCost !== 0) {
      setToastMessage("Wrap CPM field is required");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (isNaN(VehicleWrapCPMCost) || VehicleWrapCPMCost < 0) {
      setToastMessage("Wrap CPM should be a valid positive number");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (!MeasurableSaving && MeasurableSaving !== 0) {
      setToastMessage("Saving field is required");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    if (isNaN(MeasurableSaving) || MeasurableSaving < 0) {
      setToastMessage("Saving should be a valid positive number");
      setToastType("error");
      setShowToast(true);
      return false;
    }

    return true;
  };

  const handleSave = async (id) => {
    if (!validateForm(editFormData, true)) return;
    
    setIsSavingEdit(true);
    try {
      await dispatch(updateCpm({ id, ...editFormData })).unwrap();
      setEditingId(null);
      setEditFormData({});
      setToastMessage("Entry updated successfully");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Update failed: " + (error.message || "Unknown error"));
      setToastType("error");
      setShowToast(true);
      console.error("Update failed:", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "MeasurableSaving") {
      const cleanedValue = parseFloat(value.replace("%", "")) || "";
      setEditFormData({ ...editFormData, [name]: cleanedValue });
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue =
      name === "MeasurableSaving"
        ? parseFloat(value.replace("%", "")) || ""
        : value;
    setNewFormData({ ...newFormData, [name]: cleanedValue });
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsCreating(true);
    try {
      const createData = {
        ...newFormData,
        MeasurableSaving: parseFloat(newFormData.MeasurableSaving) || 0,
        VehicleWrapCPMCost: parseFloat(newFormData.VehicleWrapCPMCost) || 0,
      };

      await dispatch(createCpm(createData)).unwrap();
      setNewFormData({
        Industry: "",
        GoogleAdvertisingCPMRange: "",
        VehicleWrapCPMCost: "",
        MeasurableSaving: "",
        pageType: "traditional",
      });
      setToastMessage("Entry created successfully");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Create failed: " + (error.message || "Unknown error"));
      setToastType("error");
      setShowToast(true);
      console.error("Create failed:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const closeToast = () => {
    setShowToast(false);
  };

  const filteredData = useMemo(() => {
    if (!cpmData || !Array.isArray(cpmData)) return [];
    if (selectedPageType === "all") return cpmData;
    return cpmData.filter(item => item.pageType === selectedPageType);
  }, [cpmData, selectedPageType]);

  const traditionalCount = cpmData?.filter(item => item.pageType === "traditional").length || 0;
  const googleCount = cpmData?.filter(item => item.pageType === "google").length || 0;
  const auctionCount = cpmData?.filter(item => item.pageType === "auction").length || 0;

  if (isLoading && !cpmData) return <p className="text-center text-white">Loading...</p>;

  return (
    <>
      {showToast && (
        <Toast message={toastMessage} type={toastType} onClose={closeToast} />
      )}

      <div className="container mx-auto p-6 bg-theme-bg rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          CPM Comparison Data Management
        </h2>

        {/* Filter Dropdown with counts */}
        <div className="mb-6 p-4 bg-theme-bg2 rounded-lg shadow">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-white font-medium">Filter by Form Type:</label>
            <select
              value={selectedPageType}
              onChange={(e) => setSelectedPageType(e.target.value)}
              className="p-2 border rounded bg-theme-bg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types ({cpmData?.length || 0})</option>
              <option value="traditional">Traditional Media ({traditionalCount})</option>
              <option value="google">Google Advertising ({googleCount})</option>
              <option value="auction">Auction Details ({auctionCount})</option>
            </select>
            
            <div className="flex gap-2 ml-auto">
              {traditionalCount > 0 && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Traditional: {traditionalCount}
                </span>
              )}
              {googleCount > 0 && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                  Google: {googleCount}
                </span>
              )}
              {auctionCount > 0 && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  Auction: {auctionCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Create Form */}
        <div className="mb-6 p-4 bg-theme-bg2 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white mb-4">
            Add New Entry
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Form Type <span className="text-red-400">*</span>
              </label>
              <select
                name="pageType"
                value={newFormData.pageType}
                onChange={handleNewChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                required
              >
                <option value="traditional">Traditional Media</option>
                <option value="google">Google Advertising</option>
                <option value="auction">Auction Details</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Industry <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="Industry"
                value={newFormData.Industry}
                onChange={handleNewChange}
                placeholder="Industry Name"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                CPM Range <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="GoogleAdvertisingCPMRange"
                value={newFormData.GoogleAdvertisingCPMRange}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[\d\s.,\-]*$/.test(value)) {
                    handleNewChange(e);
                  }
                }}
                placeholder="e.g., 18-12, 12.5, 15,000"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Wrap CPM <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="VehicleWrapCPMCost"
                value={newFormData.VehicleWrapCPMCost}
                onChange={handleNewChange}
                placeholder="Enter number"
                step="0.01"
                min="0"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Saving (%) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="MeasurableSaving"
                  value={newFormData.MeasurableSaving}
                  onChange={handleNewChange}
                  placeholder="e.g., 15.5"
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white pr-10"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-400">%</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-theme-bg2 text-white">
                <th className="p-3 text-left border-b">Form Type</th>
                <th className="p-3 text-left border-b">Industry</th>
                <th className="p-3 text-left border-b">CPM Range</th>
                <th className="p-3 text-left border-b">Vehicle Wrap CPM</th>
                <th className="p-3 text-left border-b">Saving (Up to) %</th>
                <th className="p-3 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-theme-bg2 text-white">
              {filteredData && filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item._id} className="hover:bg-theme-bg">
                    {editingId === item._id ? (
                      <>
                        <td className="p-3 border-b">
                          <select
                            name="pageType"
                            value={editFormData.pageType || ""}
                            onChange={handleChange}
                            className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                          >
                            <option value="traditional">Traditional Media</option>
                            <option value="google">Google Advertising</option>
                            <option value="auction">Auction Details</option>
                          </select>
                        </td>
                        <td className="p-3 border-b">
                          <input
                            name="Industry"
                            value={editFormData.Industry || ""}
                            onChange={handleChange}
                            className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                            required
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            name="GoogleAdvertisingCPMRange"
                            value={editFormData.GoogleAdvertisingCPMRange || ""}
                            onChange={handleChange}
                            className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                            required
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            name="VehicleWrapCPMCost"
                            value={editFormData.VehicleWrapCPMCost || ""}
                            onChange={handleChange}
                            className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                            required
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            name="MeasurableSaving"
                            value={editFormData.MeasurableSaving || ""}
                            onChange={handleChange}
                            placeholder="Saving (%)"
                            className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-theme-bg text-white"
                            required
                          />
                        </td>
                        <td className="p-3 border-b">
                          <button
                            onClick={() => handleSave(item._id)}
                            disabled={isSavingEdit}
                            className="mr-3 flex items-center gap-1 text-green-400 hover:text-green-600 disabled:opacity-50"
                          >
                            {isSavingEdit ? (
                              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <FaSave />
                            )} Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center gap-1 text-red-400 hover:text-red-600"
                          >
                            <FaTimes /> Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.pageType === "traditional" ? "bg-blue-500/20 text-blue-400" :
                            item.pageType === "google" ? "bg-green-500/20 text-green-400" :
                            "bg-purple-500/20 text-purple-400"
                          }`}>
                            {item.pageType === "traditional" && "Traditional"}
                            {item.pageType === "google" && "Google"}
                            {item.pageType === "auction" && "Auction"}
                          </span>
                        </td>
                        <td className="p-3 border-b">{item.Industry}</td>
                        <td className="p-3 border-b">
                          {currency}{item.GoogleAdvertisingCPMRange}
                        </td>
                        <td className="p-3 border-b">
                          {currency}{item.VehicleWrapCPMCost}
                        </td>
                        <td className="p-3 border-b">
                          {item.MeasurableSaving}%
                        </td>
                        <td className="p-3 border-b">
                          <button
                            onClick={() => handleEdit(item)}
                            className="mr-3 flex items-center gap-1 text-white hover:text-blue-600"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 text-white hover:text-red-600 disabled:opacity-50"
                          >
                            <FaTrash /> Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-white">
                    No CPM data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CpmTable;