import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  // Redux state
  const { categories } = useSelector((state) => state.category);
  const { user } = useSelector((state) => state.auth);
  const { country: userCountry } = useSelector((state) => state.country);
  const { loading: searchLoading } = useSelector((state) => state.search);
  const vehiclesState = useSelector((state) => state.vehicles || {});
  const vehicles = vehiclesState.list || [];

  // Fallback to localStorage user if Redux user is initializing
  const authUser = useMemo(() => {
    if (user) return user;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, [user]);

  // Load previous search from location state or persistent localStorage
  const savedSearch = useMemo(() => {
    if (location.state?.previousSearch) {
      return location.state.previousSearch;
    }
    try {
      return JSON.parse(localStorage.getItem("lastMarketplaceSearch") || "null");
    } catch {
      return null;
    }
  }, [location.state]);

  // Check if wrapper
  const isWrapper = Boolean(
    authUser?.userType === "wrapper" ||
    authUser?.userType === "vehicle_wrapper" ||
    authUser?.role === "wrapper"
  );

  // Determine user role
  const resolvedRole = useMemo(() => {
    if (isWrapper) return "wrapper";
    if (authUser?.userType === "fleetOwner" || authUser?.userType === "seller" || authUser?.role === "fleetOwner") {
      return "fleetOwner";
    }
    if (authUser?.userType === "advertiser" || authUser?.userType === "buyer" || authUser?.role === "advertiser") {
      return "advertiser";
    }
    return savedSearch?.userType || "fleetOwner";
  }, [authUser, isWrapper, savedSearch]);

  // Form state initialized with persistent values or user defaults
  const [userType, setUserType] = useState(resolvedRole);
  const [searchType, setSearchType] = useState(() => {
    if (resolvedRole === "fleetOwner") return "campaign";
    if (resolvedRole === "advertiser") return "auction";
    return savedSearch?.searchType || "campaign";
  });

  const [firstName, setFirstName] = useState(() => {
    return (
      savedSearch?.firstName ||
      authUser?.firstName ||
      authUser?.firstname ||
      authUser?.first_name ||
      (authUser?.name ? authUser.name.split(" ")[0] : "") ||
      ""
    );
  });

  const [lastname, setlastname] = useState(() => {
    return (
      savedSearch?.lastname ||
      authUser?.lastname ||
      authUser?.lastName ||
      authUser?.last_name ||
      (authUser?.name ? authUser.name.split(" ").slice(1).join(" ") : "") ||
      ""
    );
  });

  const [email, setEmail] = useState(() => {
    return savedSearch?.email || authUser?.email || "";
  });

  const [country, setCountry] = useState(() => {
    return (
      savedSearch?.country ||
      authUser?.country ||
      authUser?.location?.country ||
      userCountry ||
      "Australia"
    );
  });

  const [state, setState] = useState(() => {
    return savedSearch?.state || authUser?.state || authUser?.location?.state || "";
  });

  const [postCode, setPostCode] = useState("");
  const [zipCodes, setZipCodes] = useState(() => {
    if (savedSearch?.postCodes && savedSearch.postCodes.length > 0) {
      return savedSearch.postCodes;
    }
    const defaultZip = authUser?.postalCode || authUser?.postCode || authUser?.zip || authUser?.location?.zip;
    return defaultZip ? [defaultZip.toString().trim().toUpperCase()] : [];
  });

  const [background, setBackground] = useState(() => {
    return savedSearch?.background || authUser?.background || authUser?.bio || authUser?.description || "";
  });

  // Dropdown states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState(savedSearch?.vehicleType || []);

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

  // Helpers
  const updateStatesForCountry = useCallback((countryName) => {
    if (worldData && countryName) {
      const c = worldData.find((item) => item.name === countryName);
      if (c?.states) {
        setStates(c.states.map((s) => s.name).sort());
      } else {
        setStates([]);
      }
    } else {
      setStates([]);
    }
  }, []);

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

  // Pre-populate form and update states when country changes or user/savedSearch is ready
  useEffect(() => {
    const activeCountry = country || savedSearch?.country || authUser?.country || authUser?.location?.country || userCountry || "Australia";
    if (activeCountry) {
      setCountry(activeCountry);
      updateStatesForCountry(activeCountry);
    }
  }, [country, savedSearch, authUser, userCountry, updateStatesForCountry]);

  // Keep form fields synced with user profile or saved previous search
  useEffect(() => {
    if (savedSearch) {
      if (savedSearch.firstName) setFirstName(savedSearch.firstName);
      if (savedSearch.lastname) setlastname(savedSearch.lastname);
      if (savedSearch.email) setEmail(savedSearch.email);
      if (savedSearch.state) setState(savedSearch.state);
      if (savedSearch.postCodes && savedSearch.postCodes.length > 0) setZipCodes(savedSearch.postCodes);
      if (savedSearch.background) setBackground(savedSearch.background);
      if (savedSearch.vehicleType && savedSearch.vehicleType.length > 0) setSelectedVehicles(savedSearch.vehicleType);
    }

    if (authUser) {
      const uFirst = authUser.firstName || authUser.firstname || authUser.first_name || (authUser.name ? authUser.name.split(" ")[0] : "");
      const uLast = authUser.lastname || authUser.lastName || authUser.last_name || (authUser.name ? authUser.name.split(" ").slice(1).join(" ") : "");
      const uEmail = authUser.email || "";
      const uState = authUser.state || authUser.location?.state || "";
      const uZip = authUser.postalCode || authUser.postCode || authUser.zip || authUser.location?.zip || "";

      setFirstName((prev) => prev || uFirst);
      setlastname((prev) => prev || uLast);
      setEmail((prev) => prev || uEmail);
      if (!state && uState) setState(uState);
      if ((!zipCodes || zipCodes.length === 0) && uZip) {
        setZipCodes([uZip.toString().trim().toUpperCase()]);
      }
      if (!background && (authUser.background || authUser.bio || authUser.description)) {
        setBackground(authUser.background || authUser.bio || authUser.description);
      }
    }
  }, [authUser, savedSearch]);

  // Strict role lock enforcement:
  // Fleet Manager/Owner ONLY searches Buyer/Marketing Executive Campaigns
  // Advertiser/Buyer ONLY searches Fleet Owner Vehicle Listings
  useEffect(() => {
    if (resolvedRole === "fleetOwner") {
      setUserType("fleetOwner");
      setSearchType("campaign");
    } else if (resolvedRole === "advertiser") {
      setUserType("advertiser");
      setSearchType("auction");
    } else if (isWrapper) {
      setUserType("wrapper");
    }
  }, [resolvedRole, isWrapper]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowVehicleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (value === "ALL") {
      if (selectedVehicles.includes("ALL")) {
        setSelectedVehicles([]);
      } else {
        const allValues = vehicleOptionsList
          .filter((item) => item.value !== "ALL")
          .map((item) => item.value);
        setSelectedVehicles(["ALL", ...allValues]);
      }
      return;
    }

    setSelectedVehicles((prev) => {
      let filtered = prev.filter((v) => v !== "ALL");
      if (filtered.includes(value)) {
        filtered = filtered.filter((v) => v !== value);
      } else {
        filtered = [...filtered, value];
      }
      const allValues = vehicleOptionsList
        .filter((item) => item.value !== "ALL")
        .map((item) => item.value);
      if (filtered.length === allValues.length && allValues.every((v) => filtered.includes(v))) {
        return ["ALL", ...filtered];
      }
      return filtered;
    });
  };

  const isVehicleSelected = (value) => {
    if (value === "ALL") {
      return selectedVehicles.includes("ALL");
    }
    return selectedVehicles.includes(value);
  };

  // ✅ Submit handler with persistence in localStorage and auto-adding current typed zip
  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (userCountry && country && country.toLowerCase() !== userCountry.toLowerCase()) {
      toast.error(`Searches are only available within your country (${userCountry})`);
      return;
    }

    // Auto-include any entered postcode that wasn't clicked "Add"
    const activeZipCodes = [...zipCodes];
    const trimmedInputZip = postCode.trim().toUpperCase();
    if (trimmedInputZip && !activeZipCodes.includes(trimmedInputZip)) {
      activeZipCodes.push(trimmedInputZip);
      setZipCodes(activeZipCodes);
      setPostCode("");
    }

    const resolvedVehicleTypes =
      searchType === "campaign"
        ? selectedVehicles
            .filter((id) => id !== "ALL")
            .map((id) => categoryList.find((c) => c._id === id)?.name?.trim() || id)
            .filter(Boolean)
        : selectedVehicles.filter((v) => v !== "ALL");

    const hasAnyFilter =
      country.trim() || state.trim() || activeZipCodes.length > 0 || resolvedVehicleTypes.length > 0;

    if (!hasAnyFilter) {
      toast.error("Please fill at least one search field (location, postcode, or vehicle type).");
      return;
    }

    let mappedUserType = userType;
    if (isWrapper) {
      mappedUserType = "wrapper";
    }

    const payload = {
      firstName: firstName.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      userType: mappedUserType,
      searchType,
      country: country.trim(),
      state: state.trim(),
      postCodes: activeZipCodes,
      vehicleType: resolvedVehicleTypes,
      background: background.trim(),
    };

    try {
      // Save for persistence across back-navigation and refreshed sessions
      try {
        localStorage.setItem("lastMarketplaceSearch", JSON.stringify(payload));
      } catch (storageErr) {
        console.warn("Could not save search to localStorage", storageErr);
      }

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
    if (resolvedRole === "fleetOwner") return "Fleet Owner";
    if (resolvedRole === "advertiser") return "Buyer / Marketing Executive (Advertiser)";
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
          <h1 className="text-5xl font-bold tracking-tighter text-white mb-3">Search Marketplace</h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            {resolvedRole === "fleetOwner"
              ? "Discover active advertising campaigns from Buyers & Marketing Executives looking for vehicle fleets."
              : "Discover verified vehicle fleet auctions and mobile billboard opportunities."}
          </p>
        </div>

        {/* SEARCH COMPONENT */}
        <div className="bg-black/40 p-10 rounded-3xl border border-white/5 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="space-y-8">
            
            {/* Row 1: I am a / Search For - Strict Role Separation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>I am a</label>
                {authUser ? (
                  <input
                    type="text"
                    readOnly
                    value={getUserTypeDisplay()}
                    className={fieldClass + " cursor-default bg-slate-800/70 font-semibold"}
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
                    <option value="advertiser">Buyer / Marketing Executive</option>
                  </select>
                )}
              </div>

              <div>
                <label className={labelClass}>Search For</label>
                {authUser && !isWrapper ? (
                  <div>
                    <input
                      type="text"
                      readOnly
                      value={
                        resolvedRole === "fleetOwner"
                          ? "Advertising Campaigns"
                          : "Vehicle Auctions / Fleet"
                      }
                      className={fieldClass + " cursor-default bg-slate-800/70 font-semibold"}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {resolvedRole === "fleetOwner"
                        ? "Fleet Owners search for Buyer & Marketing Executive Campaigns"
                        : "Advertisers search for Fleet Owner Vehicle Listings"}
                    </p>
                  </div>
                ) : (
                  <select
                    value={searchType}
                    onChange={(e) => {
                      setSearchType(e.target.value);
                      setSelectedVehicles([]);
                    }}
                    className={fieldClass + " cursor-pointer"}
                  >
                    <option value="campaign">Advertising Campaigns</option>
                    <option value="auction">Vehicle Auctions / Fleet</option>
                  </select>
                )}
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
              placeholder="e.g. Multi Vehicle Operator Covering Local and Interstate (or tell us about your background, desired territory, or any specific requirements...)"
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