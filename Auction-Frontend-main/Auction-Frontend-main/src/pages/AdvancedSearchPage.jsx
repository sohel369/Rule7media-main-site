import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllCategories } from "../store/category/categorySlice.js";
import { fetchVehicles } from "../store/vehicle/vehicleSlice";
import { searchMarketplace, clearSearchResults } from "../store/Search/Searchslice";
import worldData from "../countries+states+cities.json";

/**
 * ADVANCED SEARCH PAGE - FULLY WORKING
 * ------------------------------------------------------
 * With "All Vehicle Types" select/deselect functionality
 * Wrapper users see "Vehicle Wrapping Business" instead of "Regular User"
 * Form auto-populates with logged-in user data
 */

const AdvancedSearchPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  // Redux state
  const { categories } = useSelector((state) => state.category);
  const { user } = useSelector((state) => state.auth);
  const { country: userCountry } = useSelector((state) => state.country);
  const { loading: searchLoading } = useSelector((state) => state.search);
  const vehiclesState = useSelector((state) => state.vehicles || {});
  const vehicles = vehiclesState.list || [];

  // Form state
  const [userType, setUserType] = useState("fleetOwner");
  const [searchType, setSearchType] = useState("campaign");
  const [firstName, setFirstName] = useState("");
  const [lastname, setlastname] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState(userCountry || "");
  const [state, setState] = useState("");
  const [postCode, setPostCode] = useState("");
  const [zipCodes, setZipCodes] = useState([]);
  const [background, setBackground] = useState("");

  // Dropdown states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // ✅ WRAPPER CHECK
  const isWrapper = user?.userType === "wrapper" || user?.userType === "vehicle_wrapper" || user?.role === "wrapper";

  // Compute dynamic options
  const categoryList = useMemo(() => {
    return Array.isArray(categories?.data) 
      ? categories.data 
      : Array.isArray(categories) 
        ? categories 
        : [];
  }, [categories]);

  const dynamicVehicleTypes = useMemo(() => {
    return Array.from(
      new Set(
        vehicles
          .filter((v) => {
            const isApproved = 
              v.isApproved === true || 
              v.isApproved === "true" || 
              v.approved === true || 
              v.approved === "true" || 
              v.adminstatus === "approved" || 
              v.status === "approved";
            return isApproved;
          })
          .map((v) => v.vehicle || v.vehicleType || v.type || v.model || v.name || "Unknown")
      )
    ).filter(Boolean);
  }, [vehicles]);

  // Vehicle options with "All" option at top
  const vehicleOptionsList = useMemo(() => {
    const options = searchType === "campaign"
      ? categoryList.map((c) => ({ value: c._id, label: c.name }))
      : dynamicVehicleTypes.map((t) => ({ value: t, label: t }));
    
    return [{ value: "ALL", label: "All Vehicle Types" }, ...options];
  }, [searchType, categoryList, dynamicVehicleTypes]);

  // Effects
  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(fetchVehicles());
    return () => dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    if (worldData && Array.isArray(worldData)) {
      const uniqueCountries = worldData
        .map((c) => c.name)
        .filter((n, i, s) => s.indexOf(n) === i)
        .sort();
      setCountries(uniqueCountries);
    }
  }, []);

  useEffect(() => {
    if (userCountry) {
      setCountry(userCountry);
      updateStatesForCountry(userCountry);
    }
  }, [userCountry]);

  // ✅ PRE-POPULATE FORM WITH USER DATA
  useEffect(() => {
    if (user) {
      // Set user type - WRAPPER gets special treatment
      let resolvedUserType = "regular";
      
      if (isWrapper) {
        resolvedUserType = "wrapper"; // Special type for wrapper
      } else if (user.userType === "fleetOwner" || user.role === "fleetOwner") {
        resolvedUserType = "fleetOwner";
      } else if (user.userType === "advertiser" || user.role === "advertiser") {
        resolvedUserType = "advertiser";
      }
      
      setUserType(resolvedUserType);
      
      // Set search type based on user type
      if (isWrapper) {
        // Wrappers should search for campaigns (vehicles to wrap)
        setSearchType("campaign");
      } else if (resolvedUserType === "fleetOwner") {
        setSearchType("campaign");
      } else {
        setSearchType("auction");
      }
      
      // ✅ Pre-populate user details
      setFirstName(user.firstName || user.name?.split(" ")[0] || "");
      setlastname(user.lastname || user.name?.split(" ").slice(1).join(" ") || "");
      setEmail(user.email || "");
      
      // If user has country info
      if (user.country || user.location?.country) {
        setCountry(user.country || user.location?.country || userCountry || "");
      }
      
      // If user has state info
      if (user.state || user.location?.state) {
        setState(user.state || user.location?.state || "");
      }
      
      // If user has background info
      if (user.background || user.bio || user.description) {
        setBackground(user.background || user.bio || user.description || "");
      }
    }
  }, [user, userCountry, isWrapper]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowVehicleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helpers
  const updateStatesForCountry = useCallback((countryName) => {
    if (worldData && countryName) {
      const c = worldData.find((c) => c.name === countryName);
      if (c?.states) {
        setStates(c.states.map((s) => s.name).sort());
      } else {
        setStates([]);
      }
    } else {
      setStates([]);
    }
  }, []);

  const handleCountryChange = (e) => {
    const selected = e.target.value;
    if (userCountry && selected && selected.toLowerCase() !== userCountry.toLowerCase()) {
      toast.error(`You can only search within ${userCountry}.`);
      setCountry(userCountry);
      updateStatesForCountry(userCountry);
      return;
    }
    setCountry(selected);
    setState("");
    updateStatesForCountry(selected);
  };

  const addZipCode = () => {
    const value = postCode.trim().toUpperCase();
    if (value && !zipCodes.includes(value)) {
      setZipCodes((prev) => [...prev, value]);
      setPostCode("");
    }
  };

  const removeZipCode = (zip) => {
    setZipCodes((prev) => prev.filter((z) => z !== zip));
  };

  // ✅ CORRECT TOGGLE VEHICLE FUNCTION
  const toggleVehicle = (value) => {
    // If "All" is clicked
    if (value === "ALL") {
      // If already selected, deselect all
      if (selectedVehicles.includes("ALL")) {
        setSelectedVehicles([]);
      } else {
        // Select all vehicles
        const allValues = vehicleOptionsList
          .filter(item => item.value !== "ALL")
          .map(item => item.value);
        setSelectedVehicles(["ALL", ...allValues]);
      }
      return;
    }

    // If a specific vehicle is clicked
    setSelectedVehicles((prev) => {
      // Remove "ALL" if it was selected
      let filtered = prev.filter((v) => v !== "ALL");
      
      // Toggle the vehicle
      if (filtered.includes(value)) {
        filtered = filtered.filter((v) => v !== value);
      } else {
        filtered = [...filtered, value];
      }
      
      // If all vehicles are selected, add "ALL"
      const allValues = vehicleOptionsList
        .filter(item => item.value !== "ALL")
        .map(item => item.value);
      
      if (filtered.length === allValues.length && allValues.every(v => filtered.includes(v))) {
        return ["ALL", ...filtered];
      }
      
      return filtered;
    });
  };

  // Check if a vehicle is selected
  const isVehicleSelected = (value) => {
    if (value === "ALL") {
      return selectedVehicles.includes("ALL");
    }
    return selectedVehicles.includes(value);
  };

  // ✅ Submit handler with proper userType mapping
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (userCountry && country && country.toLowerCase() !== userCountry.toLowerCase()) {
      toast.error(`Searches are only available within your country (${userCountry})`);
      return;
    }

    const resolvedVehicleTypes =
      searchType === "campaign"
        ? selectedVehicles
            .filter((id) => id !== "ALL")
            .map((id) => categoryList.find((c) => c._id === id)?.name?.trim())
            .filter(Boolean)
        : selectedVehicles.filter((v) => v !== "ALL");

    const hasAnyFilter =
      country.trim() || state.trim() || zipCodes.length > 0 || resolvedVehicleTypes.length > 0;

    if (!hasAnyFilter) {
      toast.error("Please fill at least one search field (location, postcode, or vehicle type).");
      return;
    }

    // ✅ Map userType to what backend expects
    let mappedUserType = userType;
    if (isWrapper) {
      mappedUserType = "wrapper"; // Send "wrapper" to backend
    }

    const payload = {
      firstName: firstName.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      userType: mappedUserType,
      searchType,
      country: country.trim(),
      state: state.trim(),
      postCodes: zipCodes,
      vehicleType: resolvedVehicleTypes,
      background: background.trim(),
    };

    try {
      const result = await dispatch(searchMarketplace(payload)).unwrap();
      navigate("/search-results", {
        state: {
          searchData: payload,
          results: result?.data?.results || [],
          resultType: result?.data?.resultType || "",
          count: result?.data?.count || 0,
        },
      });
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Search failed. Please try again.");
    }
  };

  // ✅ Get user display label
  const getUserTypeDisplay = () => {
    if (isWrapper) return "Vehicle Wrapping Business";
    if (userType === "fleetOwner") return "Fleet Owner";
    if (userType === "advertiser") return "Advertiser";
    return "Regular User";
  };

  // Shared styles
  const fieldClass =
    "w-full rounded-lg px-4 py-3 bg-[#1F2937] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2";

  return (
    <div style={{ background: "#02040a", color: "#e2e8f0" }} className="min-h-screen py-12">
      <div className="max-w-screen-2xl mx-auto px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tighter text-white mb-3">Advanced Search</h1>
          <p className="text-xl text-slate-400 max-w-2xl">Discover premium advertising opportunities, fleet campaigns, and vehicle auctions tailored to your territory.</p>
        </div>

        {/* SEARCH COMPONENT */}
        <div className="bg-black/40 p-10 rounded-3xl border border-white/5 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="space-y-8">
            
            {/* Row 1: I am a / Search For */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>I am a</label>
                {user ? (
                  <input
                    type="text"
                    readOnly
                    value={getUserTypeDisplay()}
                    className={fieldClass + " cursor-default"}
                  />
                ) : (
                  <select
                    value={userType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserType(val);
                      setSearchType(val === "fleetOwner" ? "campaign" : "auction");
                      setSelectedVehicles([]);
                    }}
                    className={fieldClass + " cursor-pointer"}
                  >
                    <option value="fleetOwner">Fleet Owner</option>
                    <option value="advertiser">Advertiser</option>
                    <option value="regular">Regular User</option>
                  </select>
                )}
              </div>

              <div>
                <label className={labelClass}>Search For</label>
                <select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    setSelectedVehicles([]);
                  }}
                  className={fieldClass + " cursor-pointer"}
                >
                  <option value="campaign">Advertising Campaigns</option>
                  <option value="auction">Vehicle Auctions</option>
                </select>
              </div>
            </div>

            {/* Row 2: First/Last Name - PRE-POPULATED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={fieldClass}
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={lastname}
                onChange={(e) => setlastname(e.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Email - PRE-POPULATED */}
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />

            {/* Row 3: Country / State / Post Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Country</label>
                <select 
                  value={country} 
                  onChange={handleCountryChange} 
                  className={fieldClass + " cursor-pointer"}
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>State / Region</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={!country}
                  className={fieldClass + " cursor-pointer disabled:opacity-50"}
                >
                  <option value="">All States</option>
                  {states.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Post Code</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter postcode"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addZipCode();
                      }
                    }}
                    className={fieldClass + " flex-1"}
                  />
                  <button
                    type="button"
                    onClick={addZipCode}
                    className="px-8 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-medium transition-all text-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Post Codes */}
            {zipCodes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {zipCodes.map((z) => (
                  <span
                    key={z}
                    className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    {z}
                    <button
                      type="button"
                      onClick={() => removeZipCode(z)}
                      className="text-rose-400 hover:text-rose-200 leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Vehicle / Category - DYNAMIC DROPDOWN WITH "ALL" */}
            <div>
              <label className={labelClass}>Vehicle Type / Category</label>
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setShowVehicleDropdown((p) => !p)}
                  className={fieldClass + " cursor-pointer flex justify-between items-center"}
                >
                  <span className="text-slate-300">
                    {selectedVehicles.includes("ALL")
                      ? "All Vehicle Types"
                      : selectedVehicles.length > 0
                        ? `${selectedVehicles.length} Selected`
                        : "Select Vehicle Types"}
                  </span>
                  <span className="text-xl leading-none">▼</span>
                </div>

                {showVehicleDropdown && (
                  <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-white/10 rounded-3xl shadow-2xl max-h-80 overflow-auto p-4">
                    {vehicleOptionsList.length > 0 ? (
                      vehicleOptionsList.map((item) => (
                        <label
                          key={item.value}
                          className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-2xl cursor-pointer ${
                            item.value === "ALL" ? "border-b border-white/5 pb-3 mb-1" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isVehicleSelected(item.value)}
                            onChange={() => toggleVehicle(item.value)}
                            className="w-5 h-5 accent-rose-500"
                          />
                          <span className={`text-slate-200 ${item.value === "ALL" ? "font-bold text-rose-400" : ""}`}>
                            {item.label}
                          </span>
                          {item.value === "ALL" && (
                            <span className="ml-auto text-xs text-slate-500">
                              {selectedVehicles.includes("ALL") ? "✓ Selected" : "Select All"}
                            </span>
                          )}
                        </label>
                      ))
                    ) : (
                      <p className="p-3 text-sm text-slate-500">No options available</p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Vehicles Tags */}
              {selectedVehicles.length > 0 && !selectedVehicles.includes("ALL") && (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {selectedVehicles.map((val) => {
                    const item = vehicleOptionsList.find((v) => v.value === val);
                    if (!item || val === "ALL") return null;
                    return (
                      <span
                        key={val}
                        className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-xl"
                      >
                        {item?.label || val}
                        <button
                          type="button"
                          onClick={() => toggleVehicle(val)}
                          className="hover:text-white transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSelectedVehicles([])}
                    className="text-xs text-slate-500 hover:text-rose-400 font-semibold"
                  >
                    Clear All
                  </button>
                </div>
              )}
              
              {/* Show "All Vehicle Types" tag when ALL is selected */}
              {selectedVehicles.includes("ALL") && (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <span className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl">
                    All Vehicle Types Selected
                    <button
                      type="button"
                      onClick={() => setSelectedVehicles([])}
                      className="hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Background - PRE-POPULATED */}
            <textarea
              rows={5}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Tell us about your background, desired territory, or any specific requirements..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-slate-200 focus:outline-none focus:border-rose-500/50 transition-all resize-none"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={searchLoading}
              className="w-full py-6 rounded-3xl font-bold text-xl text-white shadow-2xl flex items-center justify-center gap-3 group transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e11d48 0%, #881337 100%)" }}
            >
              <span>{searchLoading ? "SEARCHING..." : "SEARCH THE MARKETPLACE"}</span>
              {!searchLoading && (
                <svg
                  className="w-5 h-5 group-active:translate-x-2 transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Results hint */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          Your search will instantly match against live campaigns and auctions. Results appear in your dashboard.
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;