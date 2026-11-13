import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaCalculator, FaSyncAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const RevenueCalculator = ({
  showCalculator,
  setShowCalculator,
  userType = "seller",
}) => {
  const { currency } = useSelector((state) => state.country);

  const { list: allVehiclesList, fleetvehclelist } = useSelector(
    (state) => state.vehicles || { vehicles: [] },
  );

  const isFleetManager = userType === "fleetOwner";
  const isAdvertiser = userType === "seller";

  const defaultInputs = useMemo(
    () => ({
      rearDoorsArea: 3.44,
      oneSideArea: 12.29,
      twoSidesArea: 24.58,
      fullWrapArea: 29.12,

      // Auction rates per m²
      rearDoorsAuctionRate: 120,
      oneSideAuctionRate: 110,
      twoSidesAuctionRate: 100,
      fullWrapAuctionRate: 90,

      // Buy Now rates per m²
      rearDoorsBuyNowRate: 150,
      oneSideBuyNowRate: 130,
      twoSidesBuyNowRate: 120,
      fullWrapBuyNowRate: 110,

      campaignLength: 12,
      discount3Month: 10,
discount6Month: 15,
discount12Month: 25,
discount24Month: 0,
      vehicleCount: 1,

      dailyMileage: 50,
      impressionsPerMile: 1000,

      estimatedRevenue: 450000,
    }),
    [],
  );

  // Multipliers for impressions based on user feedback
  const impressionMultipliers = useMemo(
    () => ({
      rearDoors: 0.8,
      oneSide: 1,
      twoSides: 2,
      fullWrap: 3.3,
    }),
    [],
  );

  // State for calculator
  const [calculatorInputs, setCalculatorInputs] = useState(defaultInputs);
  const [selectedWrapType, setSelectedWrapType] = useState("fullWrap");
  const [selectedVehicleFromDB, setSelectedVehicleFromDB] = useState(null);

  const [calculatorResults, setCalculatorResults] = useState({
    monthlyAuctionValue: 0,
    monthlyBuyNowValue: 0,
    annualAuctionValue: 0,
    annualBuyNowValue: 0,
    totalRevenueAuction: 0,
    totalRevenueBuyNow: 0,
    campaignImpressions: 0,
    costPerImpression: 0,
    roi: 0,
    avgSurfaceArea: 0,
  });

  // Calculate areas based on vehicle dimensions (matches backend formula)
  const calculateAreas = useCallback((vehicle) => {
    if (!vehicle || !vehicle.dimensions) {
      console.warn("No vehicle or dimensions found:", vehicle);
      return null;
    }

    const dim = vehicle.dimensions;

    const calculateOneSideArea = () => {
      // One side area: length × height (in cm) / 10000 = m²
      const sideArea = ((dim.length || 0) * (dim.height || 0)) / 10000;
      const rounded = Math.round(sideArea * 100) / 100;

      return rounded;
    };

    const calculateTwoSidesArea = () => {
      const oneSide = calculateOneSideArea();
      const twoSides = Math.round(oneSide * 2 * 100) / 100;

      return twoSides;
    };

    const calculateRearDoorsArea = () => {
      // Rear doors: width × height (in cm) / 10000 = m²
      const rearArea = ((dim.width || 0) * (dim.height || 0)) / 10000;
      const rounded = Math.round(rearArea * 100) / 100;

      return rounded;
    };

    const calculateFullWrapArea = () => {
      const oneSideArea = calculateOneSideArea();
      const twoSidesArea = oneSideArea * 2; // Use direct calculation
      const rearDoorsArea = calculateRearDoorsArea();
      const fullWrap =
        Math.round((oneSideArea + twoSidesArea + rearDoorsArea) * 100) / 100;

      return fullWrap;
    };

    const areas = {
      fullWrapArea: calculateFullWrapArea(),
      oneSideArea: calculateOneSideArea(),
      twoSidesArea: calculateTwoSidesArea(),
      rearDoorsArea: calculateRearDoorsArea(),
    };

    return areas;
  }, []);
  const handleVehicleSelect = (vehicleId) => {
    let vehicle;

    if (isFleetManager) {
      vehicle = fleetvehclelist.find((v) => v._id === vehicleId);
    } else {
      vehicle = allVehiclesList.find((v) => v._id === vehicleId);
    }

    if (vehicle) {
      setSelectedVehicleFromDB(vehicle);

      const areas = calculateAreas(vehicle);
      if (areas) {
        setCalculatorInputs((prev) => ({
          ...prev,
          fullWrapArea: areas.fullWrapArea,
          oneSideArea: areas.oneSideArea,
          twoSidesArea: areas.twoSidesArea,
          rearDoorsArea: areas.rearDoorsArea,
        }));

        toast.success(
          `Areas calculated for ${vehicle.manufacturer} ${vehicle.model}`,
        );
      } else {
        toast.warning(
          "Vehicle dimensions not available. Please enter areas manually.",
        );
      }
    }
  };

  const handleCalculatorInputChange = (field, value) => {
    const num = parseFloat(value) || 0;
    if (num > 99999) {
      toast.error(`Price per m² cannot exceed ${currency}99,999`);
      return;
    }
    setCalculatorInputs((prev) => ({ ...prev, [field]: num }));
  };

  const KM_TO_MILES = 1.61;
  const calculateRevenue = useCallback(() => {
   const {
  campaignLength,
  vehicleCount,
  dailyMileage,
  impressionsPerMile,
  estimatedRevenue,
} = calculatorInputs;

// Use the discount for the selected campaign length
const discount =
  calculatorInputs[`discount${campaignLength}Month`] || 0;

    const dailyMiles = dailyMileage / KM_TO_MILES;

    const area = calculatorInputs[`${selectedWrapType}Area`];
    const auctionRate = calculatorInputs[`${selectedWrapType}AuctionRate`];
    const buyNowRate = calculatorInputs[`${selectedWrapType}BuyNowRate`];

    const monthlyAuctionValue = area * auctionRate;
    const monthlyBuyNowValue = area * buyNowRate;

    const annualAuctionValue = monthlyAuctionValue * campaignLength;
    const annualBuyNowValue = monthlyBuyNowValue * campaignLength;

    const totalRevenueAuction = annualAuctionValue * (1 - discount / 100);
    const totalRevenueBuyNow = annualBuyNowValue * (1 - discount / 100);

    let campaignImpressions = 0;
    let costPerImpression = 0;
    let cpm = 0; // Cost Per Mile
    const multiplier = impressionMultipliers[selectedWrapType];

    if (!isFleetManager) {
      // ✅ CORRECT: km to miles conversion before impression calculation
      const dailyImpressions =
        dailyMiles * impressionsPerMile * vehicleCount * multiplier;
      const monthlyImpressions = dailyImpressions * 30;
      campaignImpressions = Math.round(monthlyImpressions * campaignLength);
      costPerImpression =
        campaignImpressions > 0 ? totalRevenueAuction / campaignImpressions : 0;

      // ✅ CPM CALCULATION (for advertiser perspective)
      const totalMiles = dailyMiles * 30 * campaignLength;
      cpm = totalMiles > 0 ? (totalRevenueAuction / totalMiles) * 1000 : 0;
    }

    const roi =
      totalRevenueAuction > 0
        ? ((estimatedRevenue - totalRevenueAuction) / totalRevenueAuction) * 100
        : 0;

 const avgSurfaceArea =
  calculatorInputs[`${selectedWrapType}Area`] || 0;

    setCalculatorResults({
      monthlyAuctionValue: parseFloat(monthlyAuctionValue.toFixed(2)),
      monthlyBuyNowValue: parseFloat(monthlyBuyNowValue.toFixed(2)),
      annualAuctionValue: parseFloat(annualAuctionValue.toFixed(2)),
      annualBuyNowValue: parseFloat(annualBuyNowValue.toFixed(2)),
      totalRevenueAuction: parseFloat(totalRevenueAuction.toFixed(2)),
      totalRevenueBuyNow: parseFloat(totalRevenueBuyNow.toFixed(2)),
      campaignImpressions,
      costPerImpression: parseFloat(costPerImpression.toFixed(4)),
      roi: parseFloat(roi.toFixed(1)),
      avgSurfaceArea: parseFloat(avgSurfaceArea.toFixed(2)),
      dailyMiles: parseFloat(dailyMiles.toFixed(1)), // ✅ For display
      cpm: parseFloat(cpm.toFixed(2)), // ✅ CPM value
    });
  }, [
    calculatorInputs,
    selectedWrapType,
    isFleetManager,
    impressionMultipliers,
  ]);

  useEffect(() => {
    if (showCalculator) {
      calculateRevenue();
    }
  }, [showCalculator, calculateRevenue]);

  useEffect(() => {
    if (showCalculator) {
      calculateRevenue();
    }
  }, [calculatorInputs, selectedWrapType, showCalculator]);

  const handleAutoFill = () => {
    setCalculatorInputs(defaultInputs);
    setSelectedVehicleFromDB(null);
    toast.success("Reset to default values");
  };

  if (!showCalculator) return null;

  const getVehicleList = () => {
    if (isFleetManager) {
      return fleetvehclelist || [];
    } else {
      return allVehiclesList || [];
    }
  };

  const vehicleList = getVehicleList();
  const hasVehicles = vehicleList && vehicleList.length > 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-theme-bg rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-theme-bg border-b px-8 py-5 flex justify-between items-center rounded-t-3xl">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaCalculator className="text-purple-600 text-4xl" />
            Revenue Calculator
          </h2>
          <button
            onClick={() => setShowCalculator(false)}
            className="text-gray-500 hover:text-red-600 text-4xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-8">
          <p className="text-white text-lg mb-8">
            <strong>
              Revenue Calculator for{" "}
              {isFleetManager ? "Fleet Managers" : "Sellers"}
            </strong>
            <br />
            {isFleetManager
              ? "Select one of your vehicles below to see estimated revenue based on wrap type and campaign duration."
              : "Select a vehicle below to see estimated campaign Revenue  based on wrap type and campaign duration."}
          </p>

          {!hasVehicles && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">
                ❌ No vehicles found.
                {isFleetManager
                  ? " Please add vehicles to your fleet first."
                  : " Please ensure vehicles are available in the system."}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-10">
            {/* LEFT: Inputs */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">
                Pricing & Campaign
              </h3>

              {/* Vehicle Selection - DIFFERENT FOR EACH USER TYPE */}
              <div className="bg-theme-bg2 p-4 rounded-lg">
                <label className="block text-sm font-medium text-white mb-2">
                  {isFleetManager
                    ? "Select Your Vehicle to Calculate Revenue"
                    : "Select Vehicle for Campaign"}
                </label>
                <select
                  value={selectedVehicleFromDB?._id || ""}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-theme-bg text-white"
                  disabled={!hasVehicles}
                >
                  <option value="">
                    {hasVehicles
                      ? isFleetManager
                        ? "-- Select one of your vehicles --"
                        : "-- Select a vehicle for campaign --"
                      : "-- No vehicles available --"}
                  </option>
                  {hasVehicles &&
                    vehicleList.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.manufacturer} {v.model} - {v.badge || v.vehicle} (
                        {v.yearOfManufacture})
                      </option>
                    ))}
                </select>

                {selectedVehicleFromDB && (
                  <div className="mt-3 p-3 bg-theme-bg rounded border border-white">
                    <p className="text-sm text-gray-300">
                      <strong className="white">
                        ✓ {selectedVehicleFromDB.manufacturer}{" "}
                        {selectedVehicleFromDB.model}
                      </strong>
                      {selectedVehicleFromDB.badge &&
                        ` - ${selectedVehicleFromDB.badge}`}
                      <br />
                      <span className="text-xs text-white">
                        Year: {selectedVehicleFromDB.yearOfManufacture} | Reg:{" "}
                        {selectedVehicleFromDB.registrationPlate}
                      </span>
                      <br />
                      <span className="text-xs text-white mt-1 block">
                        ✓ Surface areas calculated: Full Wrap (
                        {calculatorInputs.fullWrapArea.toFixed(2)} m²)
                      </span>
                    </p>
                  </div>
                )}

                {/* Show which list is being used */}
                {/* <div className="mt-2 text-xs text-gray-400">
                  {isFleetManager 
                    ? `Showing ${fleetvehclelist?.length || 0} of your fleet vehicles` 
                    : `Showing ${allVehiclesList?.length || 0} available vehicles`}
                </div> */}
              </div>

              {/* Wrap Type Select */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Wrap Type
                </label>
                <select
                  value={selectedWrapType}
                  onChange={(e) => setSelectedWrapType(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-theme-bg2 text-white"
                >
                  <option value="fullWrap">Full Wrap</option>
                  <option value="twoSides">Two Sides</option>
                  <option value="oneSide">One Side</option>
                  <option value="rearDoors">Rear Doors</option>
                </select>
              </div>

              {/* Surface Area - READ ONLY, auto-calculated */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {selectedWrapType.charAt(0).toUpperCase() +
                    selectedWrapType.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                  Area
                </label>
                <div className="w-full px-4 py-3 border rounded-lg bg-gray-700 text-gray-300 cursor-not-allowed">
                  {calculatorInputs[`${selectedWrapType}Area`]?.toFixed(2) ||
                    "0.00"}{" "}
                  m²
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Calculated automatically from vehicle dimensions
                </p>
                {selectedVehicleFromDB && selectedVehicleFromDB.dimensions && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                    <p className="text-gray-400">
                      Vehicle Dimensions: L=
                      {selectedVehicleFromDB.dimensions.length}cm × W=
                      {selectedVehicleFromDB.dimensions.width}cm × H=
                      {selectedVehicleFromDB.dimensions.height}cm
                    </p>
                  </div>
                )}
              </div>

              {/* Auction Rate for selected type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Auction Rate (per m²)
                </label>
                <input
                  type="number"
                  value={calculatorInputs[`${selectedWrapType}AuctionRate`]}
                  onChange={(e) =>
                    handleCalculatorInputChange(
                      `${selectedWrapType}AuctionRate`,
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-theme-bg2 text-white"
                />
              </div>

              {/* Buy Now Rate for selected type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Buy Now Rate (per m²)
                </label>
                <input
                  type="number"
                  value={calculatorInputs[`${selectedWrapType}BuyNowRate`]}
                  onChange={(e) =>
                    handleCalculatorInputChange(
                      `${selectedWrapType}BuyNowRate`,
                      e.target.value,
                    )
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-theme-bg2 text-white"
                />
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Campaign Length (Months)
                  </label>
                  <select
                    value={calculatorInputs.campaignLength}
                    onChange={(e) =>
                      handleCalculatorInputChange(
                        "campaignLength",
                        e.target.value,
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-theme-bg2 text-white"
                  >
               <option value="3">3 Months</option>
<option value="6">6 Months</option>
<option value="12">12 Months</option>
<option value="24">24 Months</option>
                  </select>
                </div>
               <div>
  <label className="block text-sm font-medium text-white mb-2">
    Offered Discount (%)
  </label>

  <input
    type="number"
    min="0"
    max="100"
    step="0.01"
    value={
      calculatorInputs[
        `discount${calculatorInputs.campaignLength}Month`
      ] ?? 0
    }
    onChange={(e) =>
      handleCalculatorInputChange(
        `discount${calculatorInputs.campaignLength}Month`,
        e.target.value
      )
    }
    className="w-full px-4 py-3 border rounded-lg bg-theme-bg2 text-white"
  />

  <p className="text-xs text-gray-400 mt-1">
    Discount for {calculatorInputs.campaignLength} month campaign
  </p>
</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Vehicles
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calculatorInputs.vehicleCount}
                    onChange={(e) =>
                      handleCalculatorInputChange(
                        "vehicleCount",
                        e.target.value,
                      )
                    }
                    className="w-full px-4 py-3 border rounded-lg bg-theme-bg2 text-white"
                  />
                </div>

                {isAdvertiser && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Your Potential Revenue
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        {currency}
                      </span>
                      <input
                        type="number"
                        value={calculatorInputs.estimatedRevenue}
                        onChange={(e) =>
                          handleCalculatorInputChange(
                            "estimatedRevenue",
                            e.target.value,
                          )
                        }
                        className="w-full pl-10 px-4 py-3 border rounded-lg bg-theme-bg2 text-white"
                      />
                    </div>
                  </div>
                )}

                {isFleetManager && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Daily Mileage (km/day)
                      {/* <span className="text-xs text-yellow-400 ml-2">
        Important: Affects CPM calculation
      </span> */}
                    </label>
                    <input
                      type="number"
                      value={calculatorInputs.dailyMileage}
                      onChange={(e) =>
                        handleCalculatorInputChange(
                          "dailyMileage",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 border rounded-lg bg-theme-bg2 text-white"
                      placeholder="Enter daily kilometers"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>
                        {/* {(calculatorInputs.dailyMileage / KM_TO_MILES).toFixed(1)} miles/day */}
                        NB: 1 miles equals 1.61 kilometres
                      </span>
                      {/* <span className="text-yellow-400">
        Miles are {((KM_TO_MILES - 1) * 100).toFixed(0)}% greater than km
      </span> */}
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-fill button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  <FaSyncAlt /> Reset to Default Values
                </button>
              </div>
            </div>

            {/* RIGHT: Results */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">
                Projected Results
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-theme-bg2 text-white p-6 rounded-2xl text-center border border-gray-700">
                  <div className="text-3xl font-bold text-purple-400">
                    {currency}
                    {calculatorResults.totalRevenueAuction.toLocaleString()}
                  </div>
                  <div className="text-sm mt-2 text-gray-300">
                    {isFleetManager
                      ? "Your Revenue (Auction)"
                      : "Total Campaign Revenue  (Auction)"}
                  </div>
                </div>
                <div className="bg-theme-bg2 text-white p-6 rounded-2xl text-center border border-gray-700">
                  <div className="text-3xl font-bold text-green-400">
                    {currency}
                    {calculatorResults.totalRevenueBuyNow.toLocaleString()}
                  </div>
                  <div className="text-sm mt-2 text-gray-300">
                    {isFleetManager
                      ? "Your Revenue (Buy Now)"
                      : "Total Campaign Revenue  (Buy Now)"}
                  </div>
                </div>
              </div>

              {isAdvertiser && (
                <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-700">
                  <div className="text-3xl font-bold text-white text-center">
                    {currency}
                    {calculatorInputs.estimatedRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-300 text-center mt-2">
                    Estimated Revenue
                  </div>
                </div>
              )}

              <div className="bg-theme-bg2 rounded-2xl p-6 space-y-6 border border-gray-700">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Monthly Auction Value:</span>
                    <span className="font-bold text-white text-lg">
                      {currency}
                      {calculatorResults.monthlyAuctionValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Monthly Buy Now Value:</span>
                    <span className="font-bold text-white text-lg">
                      {currency}
                      {calculatorResults.monthlyBuyNowValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Annual Auction Value:</span>
                    <span className="font-bold text-white text-lg">
                      {currency}
                      {calculatorResults.annualAuctionValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Annual Buy Now Value:</span>
                    <span className="font-bold text-white text-lg">
                      {currency}
                      {calculatorResults.annualBuyNowValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white">Avg Surface Area:</span>
                    <span className="font-bold text-white text-lg">
                      {calculatorResults.avgSurfaceArea.toFixed(2)} m²
                    </span>
                  </div>

                  {!isFleetManager &&
                    calculatorResults.campaignImpressions > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-white">Daily Mileage:</span>
                          <span className="font-bold text-white text-lg">
                            {calculatorInputs.dailyMileage} km
                            <span className="text-sm text-gray-400 ml-2">
                              ({calculatorResults.dailyMiles} miles)
                            </span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-white">
                            Campaign Impressions:
                          </span>
                          <span className="font-bold text-white text-lg">
                            {calculatorResults.campaignImpressions.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-white">
                            Cost per Impression:
                          </span>
                          <span className="font-bold text-white text-lg">
                            {currency}
                            {calculatorResults.costPerImpression.toFixed(4)}
                          </span>
                        </div>

                        {/* ✅ NEW: CPM DISPLAY */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                          <span className="text-white font-semibold">
                            CPM (Cost Per Mile):
                          </span>
                          <span className="font-bold text-xl text-blue-400">
                            {currency}
                            {calculatorResults.cpm.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                </div>

                {isAdvertiser && calculatorInputs.estimatedRevenue > 0 && (
                  <div className="pt-6 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">
                        Projected ROI (Auction):
                      </span>
                      <span
                        className={`text-2xl font-bold ${
                          calculatorResults.roi > 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {calculatorResults.roi > 0 ? "+" : ""}
                        {calculatorResults.roi.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-theme-bg2 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Monthly Income </p>
                  <p className="text-xl font-bold text-white">
                    {currency}
                    {calculatorResults.monthlyAuctionValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-theme-bg2 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Area</p>
                  <p className="text-xl font-bold text-white">
                    {calculatorInputs[`${selectedWrapType}Area`]?.toFixed(2) ||
                      "0.00"}{" "}
                    m²
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setShowCalculator(false)}
                className="px-8 py-3 border-2 bg-theme-bg2 border-gray-300 rounded-xl text-white hover:bg-theme-bg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCalculator;
