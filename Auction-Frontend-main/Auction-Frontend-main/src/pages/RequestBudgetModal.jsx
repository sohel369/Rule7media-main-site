import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { submitBudgetRequest } from "../store/fleetbudgetrequest/fleetbudgetslice";

const RequestBudgetModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const { loading, success, error } = useSelector((state) => state.budget);
  const [accountNumber, setaccountNumber] = useState("");
  const [query, setQuery] = useState("");
  const [pricing, setPricing] = useState({
    fullWrap: "",
    oneSide: "",
    bothSides: "",
    rearDoors: "",
  });

  const { user } = useSelector((state) => state.auth);
  if (!user || !user._id) {
    toast.error("You must be logged in to submit a budget request.");
    return;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPricing((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate accountNumber and numeric values
    if (
      !accountNumber ||
      Object.values(pricing).some((v) => v === "" || isNaN(v))
    ) {
      toast.error("Please fill out all fields with valid numbers.");
      return;
    }
    const formattedData = {
      accountNumber,
      fullWrap: Number(pricing.fullWrap),
      oneSide: Number(pricing.oneSide),
      bothSides: Number(pricing.bothSides),
      rearDoors: Number(pricing.rearDoors),
      user: user._id,
      FleetAuctionId: params.id,
      query,
    };

    // Close modal immediately
    onClose();

    // Show success toast immediately
    toast.success("Your budget request has been submitted");

    // Dispatch the action
    dispatch(submitBudgetRequest(formattedData));
  };

  // Handle API errors after submission
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Request Budget</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(pricing).map(([key, value]) => (
                <div key={key} className="sm:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium capitalize mb-1 text-left">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-md px-3 py-2 text-sm sm:text-base text-left"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 text-left">
                Your Account Number
              </label>
              <input
                type="accountNumber"
                required
                value={accountNumber}
                onChange={(e) => setaccountNumber(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm sm:text-base"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 text-left">
                Query / Message
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm sm:text-base"
                placeholder="Any specific query or note..."
                rows="3"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-black rounded-md text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white text-sm sm:text-base ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestBudgetModal;
