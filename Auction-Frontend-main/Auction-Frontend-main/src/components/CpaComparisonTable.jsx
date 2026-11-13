import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAllCpm } from "../store/cpm/cpmSlice";
import { useDispatch, useSelector } from "react-redux";

import { fetchUserCountry } from "../store/countary/countrySlice";

const CpaComparisonTable = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { country, currency } = useSelector((state) => state.country);

  const {
    cpm: cpmData,
    isLoading,
    isError,
    isSuccess,
    message,
  } = useSelector((state) => state.cpm);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    // Fetch only records with pageType "auction"
    dispatch(getAllCpm({ pageType: "auction" }));
  }, [dispatch]);

  // Filter data to ensure only auction pageType is shown (double safety)
  const auctionData = cpmData && Array.isArray(cpmData) 
    ? cpmData.filter(item => item.pageType === "auction")
    : [];

  if (isLoading || !cpmData) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-gray-50">
        <p className="text-gray-600">Loading CPM comparison...</p>
      </div>
    );
  }

  if (auctionData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-4 text-white text-center">
          <h2 className="text-xl font-bold">
            Comparison of Auction Advertising Cost vs Vehicle Wrap CPM
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          No auction advertising data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-4 text-white text-center">
        <h2 className="text-xl font-bold">
          Comparison of Google Advertising Cost vs Vehicle Wrap CPM
        </h2>
        <p className="text-sm mt-1 text-blue-100">
          Google Advertising Benchmarks by Industry
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-r border-gray-300">
                Industry
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-300">
                Google Advertising CPM Range
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-r border-gray-300">
                Vehicle Wrap CPM Cost
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                Measurable Saving (Up to)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {auctionData.map((item, idx) => (
              <tr
                key={item._id || idx}
                className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 font-semibold text-gray-700 bg-blue-50 border-r border-blue-200 rounded-l-lg">
                  {item.Industry}
                </td>
                <td className="px-6 py-4 text-center text-gray-800 font-semibold border-r border-gray-200">
                  {currency}&nbsp;{item.GoogleAdvertisingCPMRange}
                </td>
                <td className="px-6 py-4 text-center text-gray-800 font-semibold border-r border-gray-200">
                  {currency}&nbsp;{item.VehicleWrapCPMCost}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-green-600 text-lg">
                    {item.MeasurableSaving}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Optional: Show count of records */}
      {/* <div className="bg-gray-50 px-6 py-3 text-right text-sm text-gray-500 border-t border-gray-200">
        Showing {googleData.length} industries
      </div> */}
    </div>
  );
};

export default CpaComparisonTable;