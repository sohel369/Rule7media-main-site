// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { getAllProducts } from "../store/product/ProductSlice";
// import { getAllAuctions } from "../store/auction/auctionSlice";
// import { searchFleetAuction } from "../store/fleetowner/fleetownerSlice";
// import { searchCampaigns } from "../store/campaign/campaignSlice";
// import { getAllCategories } from "../store/category/categorySlice.js";
// import { toast } from "react-toastify";
// import { fetchVehicles } from "../store/vehicle/vehicleSlice";
// import worldData from "../countries+states+cities.json";


// const SearchLocationCategory = ({ updatedFilter }) => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const dropdownRef = useRef(null);
//   const zipInputRef = useRef(null);

//   // Redux States
//   const { categories } = useSelector((state) => state.category);
//   const { user } = useSelector((state) => state.auth);
//   const { searchLoading: auctionSearchLoading } = useSelector(
//     (state) => state.fleetOwner,
//   );
//   const { searchLoading: campaignSearchLoading } = useSelector(
//     (state) => state.campaigns,
//   );
//   const { country: userCountry } = useSelector((state) => state.country);
//   const vehiclesState = useSelector((state) => state.vehicles || {});
//   const vehicles = vehiclesState.list || [];

//   // Determine user type
//   const isFleetOwner =
//     user?.userType === "fleetOwner" || user?.role === "fleetOwner";
//   const isAdvertiser =
//     user?.userType === "advertiser" || user?.role === "advertiser";

//   // Component States
//   const [searchType, setSearchType] = useState("auction");
//   const [zipCodes, setZipCodes] = useState([]);
//   const [currentZip, setCurrentZip] = useState("");
//   const [error, setError] = useState("");
//   const [isSearching, setIsSearching] = useState(false);
//   const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [loadingLocation, setLoadingLocation] = useState(false);
//   const [advertiserVehicleTypes, setAdvertiserVehicleTypes] = useState([]);

//   // Filters
//   const [normalFilter, setNormalFilter] = useState({
//     category: "",
//     itemName: "",
//   });

//   // Fleet Owner Filters (for searching Campaigns)
//   const [fleetFilter, setFleetFilter] = useState({
//     country: userCountry || "",
//     state: "",
//     vehicleType: [],
//     categories: [],
//   });

//   // Advertiser Filters (for searching Auctions)
//   const [advertiserFilter, setAdvertiserFilter] = useState({
//     country: userCountry || "",
//     state: "",
//     vehicleType: [],
//   });
//   const categoryList = Array.isArray(categories?.data)
//     ? categories.data
//     : Array.isArray(categories)
//       ? categories
//       : [];

//   useEffect(() => {
//     if (worldData && Array.isArray(worldData)) {
//       const uniqueCountries = worldData
//         .map((country) => country.name)
//         .filter((name, index, self) => self.indexOf(name) === index)
//         .sort();
//       setCountries(uniqueCountries);
//     }
//   }, []);

//   // Initialize data
//   useEffect(() => {
//     dispatch(getAllCategories());
//     dispatch(fetchVehicles());

//     if (updatedFilter && updatedFilter !== "empty") {
//       setNormalFilter({
//         category: updatedFilter.category || "",
//         itemName: updatedFilter.itemName || "",
//       });
//       if (updatedFilter.searchType) {
//         setSearchType(updatedFilter.searchType);
//       }
//       if (updatedFilter.zip) {
//         setCurrentZip(updatedFilter.zip);
//       }
//     }

//     // Set country in filters based on userCountry
//     if (userCountry) {
//       if (isFleetOwner) {
//         setFleetFilter((prev) => ({ ...prev, country: userCountry }));
//       } else if (isAdvertiser) {
//         setAdvertiserFilter((prev) => ({ ...prev, country: userCountry }));
//       }
//       updateStatesForCountry(userCountry);
//     }
//   }, [dispatch, userCountry, isFleetOwner, isAdvertiser, updatedFilter]);

//   // Extract vehicle types for advertisers from Redux store
//   useEffect(() => {
//     if (isAdvertiser && vehicles.length > 0) {
//       // Extract unique vehicle types from approved vehicles
//       const types = vehicles
//         .filter((vehicle) => {
//           // Check various approval statuses
//           const isApproved =
//             vehicle.isApproved === true ||
//             vehicle.isApproved === "true" ||
//             vehicle.approved === true ||
//             vehicle.approved === "true" ||
//             vehicle.adminstatus === "approved" ||
//             vehicle.status === "approved";

//           return isApproved;
//         })
//         .map((vehicle) => {
//           return (
//             vehicle.vehicle ||
//             vehicle.vehicleType ||
//             vehicle.type ||
//             vehicle.model ||
//             vehicle.name ||
//             "Unknown"
//           );
//         })
//         .filter((type) => type && type.trim() !== "")
//         .filter((type, index, self) => self.indexOf(type) === index)
//         .sort();

//       setAdvertiserVehicleTypes(types);
//     }
//   }, [vehicles, isAdvertiser]);

//   // Auto-detect user's country
//   useEffect(() => {
//     const detectUserCountry = () => {
//       if (!userCountry && navigator.geolocation) {
//         setLoadingLocation(true);
//         navigator.geolocation.getCurrentPosition(
//           async (position) => {
//             try {
//               const { latitude, longitude } = position.coords;
//               const response = await fetch(
//                 `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
//               );
//               const data = await response.json();
//               const country = data.address?.country;

//               if (country) {
//                 const foundCountry = countries.find(
//                   (c) =>
//                     c.toLowerCase() === country.toLowerCase() ||
//                     c.toLowerCase().includes(country.toLowerCase()),
//                 );

//                 if (foundCountry) {
//                   if (isFleetOwner) {
//                     setFleetFilter((prev) => ({
//                       ...prev,
//                       country: foundCountry,
//                     }));
//                   } else if (isAdvertiser) {
//                     setAdvertiserFilter((prev) => ({
//                       ...prev,
//                       country: foundCountry,
//                     }));
//                   }
//                   updateStatesForCountry(foundCountry);
//                 }
//               }
//             } catch (error) {
//               console.error("Error detecting location:", error);
//             } finally {
//               setLoadingLocation(false);
//             }
//           },
//           (error) => {
//             console.error("Geolocation error:", error);
//             setLoadingLocation(false);
//           },
//         );
//       }
//     };

//     detectUserCountry();
//   }, [userCountry, countries, isFleetOwner, isAdvertiser]);

//   // Update states when country changes
//   const updateStatesForCountry = (countryName) => {
//     if (worldData && countryName) {
//       const country = worldData.find((c) => c.name === countryName);
//       if (country && country.states) {
//         const stateNames = country.states.map((state) => state.name).sort();
//         setStates(stateNames);
//       } else {
//         setStates([]);
//       }
//     }
//   };

//   // Handle country change for Fleet Owners
//   const handleFleetCountryChange = (e) => {
//     const selectedCountry = e.target.value;
//     if (
//       userCountry &&
//       selectedCountry &&
//       selectedCountry.toLowerCase() !== userCountry.toLowerCase()
//     ) {
//       toast.error(
//         `You can only search within ${userCountry}. Changing to ${userCountry}.`,
//       );

//       // Auto-select user's country
//       const foundCountry = countries.find(
//         (c) => c.toLowerCase() === userCountry.toLowerCase(),
//       );

//       if (foundCountry) {
//         setFleetFilter((prev) => ({
//           ...prev,
//           country: foundCountry,
//           state: "",
//         }));
//         updateStatesForCountry(foundCountry);
//       }
//       return;
//     }
//     setFleetFilter((prev) => ({
//       ...prev,
//       country: selectedCountry,
//       state: "",
//     }));
//     updateStatesForCountry(selectedCountry);
//   };

//   const handleAdvertiserCountryChange = (e) => {
//     const selectedCountry = e.target.value;
//     if (
//       userCountry &&
//       selectedCountry &&
//       selectedCountry.toLowerCase() !== userCountry.toLowerCase()
//     ) {
//       toast.error(
//         `You can only search within ${userCountry}. Changing to ${userCountry}.`,
//       );

//       const foundCountry = countries.find(
//         (c) => c.toLowerCase() === userCountry.toLowerCase(),
//       );

//       if (foundCountry) {
//         setAdvertiserFilter((prev) => ({
//           ...prev,
//           country: foundCountry,
//           state: "",
//         }));
//         updateStatesForCountry(foundCountry);
//       }
//       return;
//     }
//     setAdvertiserFilter((prev) => ({
//       ...prev,
//       country: selectedCountry,
//       state: "",
//     }));
//     updateStatesForCountry(selectedCountry);
//   };

//   // Handle state change for Fleet Owners
//   const handleFleetStateChange = (e) => {
//     setFleetFilter((prev) => ({
//       ...prev,
//       state: e.target.value,
//     }));
//   };

//   // Handle state change for Advertisers
//   const handleAdvertiserStateChange = (e) => {
//     setAdvertiserFilter((prev) => ({
//       ...prev,
//       state: e.target.value,
//     }));
//   };

//   // Multi-choice logic for vehicle types (Fleet Owner)
//   const handleFleetVehicleTypeToggle = (type) => {
//     setFleetFilter((prev) => {
//       const isSelected = prev.vehicleType.includes(type);
//       const newTypes = isSelected
//         ? prev.vehicleType.filter((t) => t !== type)
//         : [...prev.vehicleType, type];
//       return { ...prev, vehicleType: newTypes };
//     });
//   };

//   const handleAdvertiserVehicleTypeToggle = (type) => {
//     setAdvertiserFilter((prev) => {
//       const isSelected = prev.vehicleType.includes(type);
//       const newTypes = isSelected
//         ? prev.vehicleType.filter((t) => t !== type)
//         : [...prev.vehicleType, type];
//       return { ...prev, vehicleType: newTypes };
//     });
//   };

//   // Handle zip code changes
//   const handleZipChange = (e) => {
//     const value = e.target.value
//       .toUpperCase()
//       .replace(/[^A-Z0-9 ]/g, "")
//       .slice(0, 10);

//     setCurrentZip(value);
//   };

//   const addZipCode = () => {
//     if (currentZip.trim() && !zipCodes.includes(currentZip.trim())) {
//       setZipCodes((prev) => [...prev, currentZip.trim()]);
//       setCurrentZip("");
//       zipInputRef.current?.focus();
//     }
//   };

//   const removeZipCode = (zipToRemove) => {
//     setZipCodes((prev) => prev.filter((zip) => zip !== zipToRemove));
//   };

//   const clearAllZipCodes = () => {
//     setZipCodes([]);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       addZipCode();
//     }
//   };

//   // Validate Fleet Owner Search
//   const validateFleetSearch = () => {
//     if (
//       userCountry &&
//       fleetFilter.country.toLowerCase() !== userCountry?.toLowerCase()
//     ) {
//       toast.error(
//         `Searches are only available within your own country (${userCountry})`,
//       );
//       return false;
//     }
//     return true;
//   };

//   // Validate Advertiser Search
//   const validateAdvertiserSearch = () => {
//     if (
//       userCountry &&
//       advertiserFilter.country.toLowerCase() !== userCountry?.toLowerCase()
//     ) {
//       toast.error(
//         `Searches are only available within your own country (${userCountry})`,
//       );
//       return false;
//     }
//     return true;
//   };

//   const handleFleetSearch = () => {
//     if (!validateFleetSearch()) return;

//     // categoryList se _id → name convert karo
//     const selectedCategoryNames = fleetFilter.vehicleType
//       .map((catId) => {
//         const cat = categoryList.find((c) => c._id === catId);
//         return cat ? cat.name.trim() : null;
//       })
//       .filter(Boolean); // remove null/empty

//     const payload = {
//       country: fleetFilter.country || "",
//       state: fleetFilter.state || "",
//       vehicleType:
//         selectedCategoryNames.length > 0 ? selectedCategoryNames : [],
//       postCodes: zipCodes.length > 0 ? zipCodes : [],
//     };

//     dispatch(searchCampaigns(payload))
//       .unwrap()
//       .then(() => {
//         navigate("/campaigns-search-results", {
//           state: { searchData: payload },
//         });
//       })
//       .catch((err) => {
//         console.error("Campaign search failed:", err);
//         toast.error(err?.message || "Campaign search failed – check console");
//         setError(err?.message || "Search failed");
//       });
//   };

//   // Handle Advertiser Search (Search Auctions)
//   const handleAdvertiserSearch = () => {
//     if (!validateAdvertiserSearch()) return;

//     const payload = {
//       country: advertiserFilter.country,
//       state: advertiserFilter.state,
//       vehicleType:
//         advertiserFilter.vehicleType.length > 0
//           ? advertiserFilter.vehicleType
//           : undefined,
//       postCodes: zipCodes.length > 0 ? zipCodes : undefined,
//       searchType: "fleet",
//     };

//     dispatch(searchFleetAuction(payload))
//       .unwrap()
//       .then((response) => {
//         navigate("/dashboard", { state: { updatedFilter: payload } });
//       })
//       .catch((err) => {
//         console.error("Advertiser search error:", err);
//         setError(err?.message || "Search failed");
//         toast.error(err?.message || "Search failed");
//       });
//   };
//   // Handle normal search (for regular users)
//   // const handleNormalSearch = () => {
//   //   if (isSearching) return;
//   //   setIsSearching(true);
//   //   const payload = {
//   //     ...(searchType === "product" && { category: normalFilter.category }),
//   //     ...(searchType === "auction" && { itemName: normalFilter.itemName }),
//   //     searchType,
//   //     postCodes: zipCodes,
//   //   };
//   //   if (searchType === "product") dispatch(getAllProducts(payload));
//   //   else dispatch(getAllAuctions(payload));
//   //   setIsSearching(false);
//   //   navigate("/dashboard", { state: { updatedFilter: payload } });
//   // };
// const handleNormalSearch = () => {
//   if (isSearching) return;

//   setIsSearching(true);

//   const payload = {
//     itemName: normalFilter.itemName,
//     searchType: "auction",
//     postCodes: zipCodes,
//   };

//   dispatch(getAllAuctions(payload));

//   setIsSearching(false);

//   navigate("/dashboard", {
//     state: { updatedFilter: payload },
//   });
// };
//   if (isFleetOwner) {
//     const searchLoading = campaignSearchLoading;
//     const categoryList = Array.isArray(categories?.data)
//       ? categories.data
//       : Array.isArray(categories)
//         ? categories
//         : [];
//     return (
//       <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 backdrop-blur-md">
//         {error && (
//           <div className="bg-red-100 text-red-700 p-2 rounded-md mb-3 text-sm">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
//           {/* 1. Country Dropdown */}
//           <div>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Country{" "}
//               {loadingLocation && (
//                 <span className="text-xs text-gray-500">(Detecting...)</span>
//               )}
//             </label>
//             <select
//               value={fleetFilter.country}
//               onChange={handleFleetCountryChange}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
//               disabled={loadingLocation}
//             >
//               <option value="">Select Country</option>
//               {countries.map((country) => (
//                 <option key={country} value={country}>
//                   {country}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 2. State Dropdown */}
//           <div>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Campaign Area
//             </label>
//             <select
//               value={fleetFilter.state}
//               onChange={handleFleetStateChange}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
//               disabled={!fleetFilter.country}
//             >
//               <option value="">Select State (All)</option>
//               {states.map((state) => (
//                 <option key={state} value={state}>
//                   {state}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 3. Post Code Input */}
//           <div>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider ">
//               Post Code
//             </label>
//             <div className="flex gap-2">
//               <input
//                 ref={zipInputRef}
//                 type="text"
//                 value={currentZip}
//                 onChange={handleZipChange}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter code"
//                 className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
//               />
//               <button
//                 onClick={addZipCode}
//                 className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition "
//               >
//                 Add
//               </button>
//             </div>
//           </div>

//           <div className="relative" ref={dropdownRef}>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Vehicle Type
//             </label>
//             <div
//               onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer flex justify-between items-center flex justify-between items-center"
//             >
//               <span className="truncate">
//                 {fleetFilter.vehicleType.length > 0
//                   ? `${fleetFilter.vehicleType.length} Selected`
//                   : "Vehicle Type"}
//               </span>
//               <span className="text-xs">▼</span>
//             </div>

//             {showVehicleDropdown && (
//               <div className="absolute z-[100] mt-1 w-full bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2">
//                 {categoryList.length > 0 ? (
//                   <>
//                   <label className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded cursor-pointer border-b border-gray-700">
//   <input
//     type="checkbox"
//     checked={fleetFilter.vehicleType.length === categoryList.length}
//     onChange={(e) =>
//       setFleetFilter((prev) => ({
//         ...prev,
//         vehicleType: e.target.checked
//           ? categoryList.map((cat) => cat._id)
//           : [],
//       }))
//     }
//     className="w-4 h-4 accent-blue-500"
//   />
//   <span className="text-sm text-white font-bold">Select All</span>
// </label>
//                     {categoryList.map((cat) => (
//                       <label
//                         key={cat._id}
//                         className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded cursor-pointer"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={fleetFilter.vehicleType.includes(cat._id)}
//                           onChange={() => handleFleetVehicleTypeToggle(cat._id)}
//                           className="w-4 h-4 accent-blue-500"
//                         />
//                         <span className="text-sm text-gray-200">
//                           {cat.name}
//                         </span>{" "}
//                         {/* ← sirf name */}
//                       </label>
//                     ))}
//                   </>
//                 ) : (
//                   <div className="p-2 text-sm text-gray-500">
//                     {categoryList.length === 0
//                       ? "Koi category nahi mili"
//                       : "Loading..."}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div>
//             <button
//               onClick={handleFleetSearch}
//               disabled={searchLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-xs disabled:bg-gray-400 h-[46px]"
//             >
//               {searchLoading ? "SEARCHING..." : "SEARCH CAMPAIGNS"}
//             </button>
//           </div>
//         </div>

//         {/* Upper Box: Selected Post Codes */}
//         {zipCodes.length > 0 && (
//           <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-gray-200">
//             <div className="flex justify-between items-center mb-2">
//               <label className="block text-sm font-bold text-white">
//                 Selected Post Codes:
//               </label>
//               <button
//                 onClick={clearAllZipCodes}
//                 className="text-xs text-red-600 hover:text-red-800"
//               >
//                 Clear All
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {zipCodes.map((z) => (
//                 <span
//                   key={z}
//                   className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center"
//                 >
//                   {z}
//                   <button
//                     onClick={() => removeZipCode(z)}
//                     className="ml-2 text-red-500 hover:text-red-700 text-sm"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Selected Vehicle Types Display */}
//         {fleetFilter.vehicleType.length > 0 && (
//           <div className="mt-3 flex flex-wrap gap-2 items-center">
//             <div className="text-sm font-bold text-white">
//               Selected Vehicle Types:
//             </div>
//             {fleetFilter.vehicleType.map((catId) => {
//               // categoryList se _id match karke name nikaalo
//               const cat = categoryList.find((c) => c._id === catId);

//               return cat ? (
//                 <span
//                   key={catId}
//                   className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-lg border border-green-200 flex items-center"
//                 >
//                   {cat.name}
//                   <button
//                     onClick={() => handleFleetVehicleTypeToggle(catId)}
//                     className="ml-2 text-green-500 hover:text-green-700"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ) : null;
//             })}
//             <button
//               onClick={() =>
//                 setFleetFilter((prev) => ({ ...prev, vehicleType: [] }))
//               }
//               className="text-xs text-red-600 hover:text-red-800"
//             >
//               Clear All
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // 2. For ADVERTISERS (searching Auctions)
//   if (isAdvertiser) {
//     const searchLoading = auctionSearchLoading;

//     // Extract vehicle types for advertiser (using advertiserFilter, not fleetFilter)
//     const uniqueVehicleTypes =
//       advertiserVehicleTypes.length > 0
//         ? advertiserVehicleTypes
//         : Array.from(
//             new Set(vehicles.filter((v) => v.isApproved).map((v) => v.vehicle)),
//           ).filter(Boolean);

//     return (
//       <div className=" glass-card p-8 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 backdrop-blur-md">
//         {error && (
//           <div className="bg-red-100 text-red-700 p-2 rounded-md mb-3 text-sm">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
//           {/* 1. Country Dropdown - FIXED: using advertiserFilter, not fleetFilter */}
//           <div>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Country{" "}
//               {loadingLocation && (
//                 <span className="text-xs text-gray-500">(Detecting...)</span>
//               )}
//             </label>
//             <select
//               value={advertiserFilter.country}
//               onChange={handleAdvertiserCountryChange}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
//               disabled={loadingLocation}
//             >
//               <option value="">Select Country</option>
//               {countries.map((country) => (
//                 <option key={country} value={country}>
//                   {country}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 2. State Dropdown - FIXED: using advertiserFilter, not fleetFilter */}
//           <div>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Campaign Area
//             </label>
//             <select
//               value={advertiserFilter.state}
//               onChange={handleAdvertiserStateChange}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
//               disabled={!advertiserFilter.country}
//             >
//               <option value="">Select State (All)</option>
//               {states.map((state) => (
//                 <option key={state} value={state}>
//                   {state}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* 3. Post Code Input */}
//           <div>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Post Code
//             </label>
//             <div className="flex gap-2">
//               <input
//                 ref={zipInputRef}
//                 type="text"
//                 value={currentZip}
//                 onChange={handleZipChange}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter code"
//                 className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
//               />
//               <button
//                 onClick={addZipCode}
//                 className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
//               >
//                 Add
//               </button>
//             </div>
//           </div>

//           {/* 4. Vehicle Type Dropdown - FIXED: using advertiserFilter, not fleetFilter */}
//           <div className="relative" ref={dropdownRef}>
//             <label className="text-xs font-bold uppercase text-slate-200 tracking-wider">
//               Vehicle Type
//             </label>
//             <div
//               onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
//               className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer flex justify-between items-center flex justify-between items-center"
//             >
//               <span className="truncate">
//                 {advertiserFilter.vehicleType.length > 0
//                   ? `${advertiserFilter.vehicleType.length} Selected`
//                   : "All Types"}
//               </span>
//               <span className="text-xs">▼</span>
//             </div>

//             {showVehicleDropdown && (
//               <div className="absolute z-[100] mt-1 w-full bg-black border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2">
//                 {uniqueVehicleTypes.length > 0 ? (
//                   <>
//                     <div className="mb-2 p-1 text-xs text-gray-200">
//                       Select one or more vehicle types:
//                     </div>
//                     <label className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded cursor-pointer border-b border-gray-700">
//   <input
//     type="checkbox"
//     checked={
//       advertiserFilter.vehicleType.length === uniqueVehicleTypes.length
//     }
//     onChange={(e) =>
//       setAdvertiserFilter((prev) => ({
//         ...prev,
//         vehicleType: e.target.checked ? uniqueVehicleTypes : [],
//       }))
//     }
//     className="w-4 h-4 accent-blue-500"
//   />
//   <span className="text-sm text-white font-bold">Select All</span>
// </label>
//                     {uniqueVehicleTypes.map((type) => (
//                       <label
//                         key={type}
//                         className="flex items-center space-x-3 p-2 hover:bg-slate-700 rounded cursor-pointer"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={advertiserFilter.vehicleType.includes(type)}
//                           onChange={() =>
//                             handleAdvertiserVehicleTypeToggle(type)
//                           }
//                           className="w-4 h-4 accent-blue-500"
//                         />
//                         <span className="text-sm text-white">{type}</span>
//                       </label>
//                     ))}
//                   </>
//                 ) : (
//                   <div className="p-2 text-sm text-white">
//                     {vehicles.length === 0
//                       ? "No vehicles found in system"
//                       : "No approved vehicles found"}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* 5. Search Button */}
//           <div>
//             <button
//               onClick={handleAdvertiserSearch}
//               disabled={searchLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-widest text-xs disabled:bg-gray-400 h-[46px]"
//             >
//               {searchLoading ? "SEARCHING..." : "SEARCH AUCTIONS"}
//             </button>
//           </div>
//         </div>

//         {zipCodes.length > 0 && (
//           <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-gray-200">
//             <div className="flex justify-between items-center mb-2">
//               <label className="block text-sm font-bold text-white">
//                 Selected Post Codes:
//               </label>
//               <button
//                 onClick={clearAllZipCodes}
//                 className="text-xs text-red-600 hover:text-red-800"
//               >
//                 Clear All
//               </button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {zipCodes.map((z) => (
//                 <span
//                   key={z}
//                   className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center"
//                 >
//                   {z}
//                   <button
//                     onClick={() => removeZipCode(z)}
//                     className="ml-2 text-red-500 hover:text-red-700 text-sm"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Selected Vehicle Types Display - FIXED: using advertiserFilter */}
//         {advertiserFilter.vehicleType.length > 0 && (
//           <div className="mt-3 flex flex-wrap gap-2 items-center">
//             <div className="text-sm font-bold text-white">
//               Selected Vehicle Types:
//             </div>
//             {advertiserFilter.vehicleType.map((type) => (
//               <span
//                 key={type}
//                 className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-lg border border-red-200 flex items-center"
//               >
//                 {type}
//                 <button
//                   onClick={() => handleAdvertiserVehicleTypeToggle(type)}
//                   className="ml-2 text-red-500 hover:text-red-700"
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}
//             <button
//               onClick={() =>
//                 setAdvertiserFilter((prev) => ({ ...prev, vehicleType: [] }))
//               }
//               className="text-xs text-red-600 hover:text-red-800"
//             >
//               Clear All
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="container-xl lg:container mx-auto p-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 shadow-md rounded-lg">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
// <div>
//   <label className="block text-sm font-bold mb-1 text-white">
//     Search Type
//   </label>

//   <input
//     type="text"
//     value="Auction"
//     readOnly
//     className="w-full px-3 py-2.5 rounded-lg bg-black border border-gray-300 text-white"
//   />
// </div>
//         {searchType === "product" ? (
//           <div>
//             <label className="block text-sm font-bold mb-1 text-white">
//               Category
//             </label>
//             <select
//               value={normalFilter.category}
//               onChange={(e) =>
//                 setNormalFilter({ ...normalFilter, category: e.target.value })
//               }
//               className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-black text-white placeholder:text-gray-500"
//             >
//               <option value="">All Categories</option>
//               {categories.data?.map((cat) => (
//                 <option key={cat._id} value={cat._id}>
//                   {cat.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         ) : (
//           <div>
//             <label className="block text-sm font-bold mb-1 text-white">
//               Item Name
//             </label>
//             <input
//               type="text"
//               value={normalFilter.itemName}
//               onChange={(e) =>
//                 setNormalFilter({ ...normalFilter, itemName: e.target.value })
//               }
//               className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-black text-white placeholder:text-gray-500"
//               placeholder="Search..."
//             />
//           </div>
//         )}

//         <div>
//           <label className="block text-sm font-bold mb-1 text-white">
//             Post Code
//           </label>
//           <input
//             type="text"
//             value={currentZip}
//             onChange={(e) => {
//               const newZip = e.target.value.replace(/\D/g, "").slice(0, 8);
//               setCurrentZip(newZip);
//               setZipCodes(newZip.trim() ? [newZip.trim()] : []);
//             }}
//             className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-black text-white placeholder:text-gray-500"
//             placeholder="ZIP Code"
//           />
//         </div>

//         <button
//           onClick={handleNormalSearch}
//           className="bg-red-700 text-white font-bold py-2.5 rounded-lg hover:bg-red-800"
//         >
//           {isSearching ? "..." : "SEARCH"}
//         </button>
//       </div>

//       {/* Show selected post codes for regular users too */}
//       {zipCodes.length > 0 && (
//         <div className="mt-3 flex flex-wrap gap-2">
//           {zipCodes.map((z) => (
//             <span
//               key={z}
//               className="bg-slate-700 text-white text-xs font-semibold px-2 py-1 rounded border border-gray-200 flex items-center"
//             >
//               {z}
//               <button
//                 onClick={() => setZipCodes([])}
//                 className="ml-2 text-red-500"
//               >
//                 ×
//               </button>
//             </span>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchLocationCategory;


import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { searchMarketplace, clearSearchResults } from "../store/Search/Searchslice";

/**
 * SEARCH RESULTS PAGE - WITH IMAGES FOR ALL CARD TYPES
 * ------------------------------------------------------
 * Displays search results with proper image rendering
 * Supports campaigns, fleet auctions, and general auctions
 */

const SearchResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const searchData = location.state?.searchData;
  const [imageErrors, setImageErrors] = useState({});

 const { loading, results, resultType, count, error } = useSelector((state) => state.search);

useEffect(() => {
  if (!searchData) {
    navigate("/search");
    return;
  }
  dispatch(searchMarketplace(searchData));
  return () => dispatch(clearSearchResults());
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // Handle image error
  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Get image URL from various possible locations
  const getImageUrl = (item) => {
    // Check for images array (campaigns)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (typeof firstImage === 'string') return firstImage;
      if (firstImage?.url) return firstImage.url;
      if (firstImage?.secure_url) return firstImage.secure_url;
    }
    
    // Check for image field (campaigns)
    if (item.image) {
      if (typeof item.image === 'string') return item.image;
      if (Array.isArray(item.image) && item.image.length > 0) {
        const firstImage = item.image[0];
        if (typeof firstImage === 'string') return firstImage;
        if (firstImage?.url) return firstImage.url;
        if (firstImage?.secure_url) return firstImage.secure_url;
      }
      if (item.image?.url) return item.image.url;
      if (item.image?.secure_url) return item.image.secure_url;
    }
    
    // Check for vehicle images
    if (item.vehicleImages && Array.isArray(item.vehicleImages) && item.vehicleImages.length > 0) {
      const firstImage = item.vehicleImages[0];
      if (typeof firstImage === 'string') return firstImage;
      if (firstImage?.url) return firstImage.url;
      if (firstImage?.secure_url) return firstImage.secure_url;
    }
    
    // Check for cover image
    if (item.coverImage) {
      if (typeof item.coverImage === 'string') return item.coverImage;
      if (item.coverImage?.url) return item.coverImage.url;
      if (item.coverImage?.secure_url) return item.coverImage.secure_url;
    }
    
    return null;
  };

  // Get multiple images
  const getImages = (item) => {
    const images = [];
    
    // Check for images array
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach(img => {
        if (typeof img === 'string') images.push(img);
        else if (img?.url) images.push(img.url);
        else if (img?.secure_url) images.push(img.secure_url);
      });
    }
    
    // Check for image field
    if (item.image) {
      if (typeof item.image === 'string') images.push(item.image);
      else if (Array.isArray(item.image)) {
        item.image.forEach(img => {
          if (typeof img === 'string') images.push(img);
          else if (img?.url) images.push(img.url);
          else if (img?.secure_url) images.push(img.secure_url);
        });
      }
      else if (item.image?.url) images.push(item.image.url);
      else if (item.image?.secure_url) images.push(item.image.secure_url);
    }
    
    return images;
  };

  // Get display name
  const getDisplayName = (item) => {
    if (item.title) return item.title;
    if (item.name) return item.name;
    if (item.vehicleModel) return item.vehicleModel;
    if (item.company) return item.company;
    if (item.brand && item.model) return `${item.brand} ${item.model}`;
    return "Untitled";
  };

  // Get description
  const getDescription = (item) => {
    if (item.description) return item.description;
    if (item.details) return item.details;
    if (item.about) return item.about;
    return "No description available.";
  };

  // Get location
  const getLocation = (item) => {
    const loc = item.location || {};
    const parts = [];
    if (loc.country) parts.push(loc.country);
    if (loc.state) parts.push(loc.state);
    if (loc.city) parts.push(loc.city);
    if (loc.zip) parts.push(loc.zip);
    if (loc.name) parts.push(loc.name);
    if (loc.zipCodes && loc.zipCodes.length > 0) {
      parts.push(loc.zipCodes.join(', '));
    }
    return parts.join(' · ') || "Location not specified";
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active' || s === 'live') return 'bg-emerald-500/10 text-emerald-400';
    if (s === 'pending') return 'bg-yellow-500/10 text-yellow-400';
    if (s === 'completed' || s === 'ended' || s === 'over') return 'bg-slate-500/10 text-slate-400';
    if (s === 'cancelled') return 'bg-rose-500/10 text-rose-400';
    return 'bg-blue-500/10 text-blue-400';
  };

  const cardClass = "p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-rose-500/30 transition-all hover:bg-white/10";

  // Render Campaign Card WITH IMAGE
  const renderCampaignCard = (item) => {
    const imageUrl = getImageUrl(item);
    const hasError = imageErrors[item._id];
    const allImages = getImages(item);

    return (
      <div key={item._id} className={cardClass}>
        {/* Image */}
        {imageUrl && !hasError ? (
          <div className="relative w-full h-48 rounded-2xl mb-4 overflow-hidden bg-slate-800 group">
            <img
              src={imageUrl}
              alt={getDisplayName(item)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(item._id)}
              loading="lazy"
            />
            {/* Image count badge */}
            {allImages.length > 1 && (
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                📸 {allImages.length} images
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                Campaign
              </span>
            </div>
            {/* Status badge */}
            <div className="absolute bottom-2 left-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm ${getStatusColor(item.status)}`}>
                {item.status || "Active"}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-48 rounded-2xl mb-4 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📢</div>
              <span className="text-slate-500 text-sm">No Image Available</span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                Campaign
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-white flex-1">{getDisplayName(item)}</h3>
        </div>
        
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {getDescription(item)}
        </p>
        
        {/* Target Vehicle Types */}
        {(item.targetVehicleTypes || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(item.targetVehicleTypes || []).slice(0, 4).map((v, i) => (
              <span
                key={i}
                className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg"
              >
                {v.trim()}
              </span>
            ))}
            {(item.targetVehicleTypes || []).length > 4 && (
              <span className="text-xs font-semibold text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                +{(item.targetVehicleTypes || []).length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Location */}
        <div className="text-xs text-slate-500">
          📍 {getLocation(item)}
        </div>

        {/* Budget */}
        {item.budget && (
          <div className="mt-2 text-xs text-emerald-400">
            💰 Budget: ₹{item.budget.toLocaleString()}
          </div>
        )}

        {/* Timeline */}
        {item.startAt && item.endAt && (
          <div className="mt-2 text-xs text-slate-500">
            📅 {new Date(item.startAt).toLocaleDateString()} - {new Date(item.endAt).toLocaleDateString()}
          </div>
        )}

        {item.createdBy && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 text-[10px] font-bold">
              {item.createdBy.firstName?.[0]}{item.createdBy.lastName?.[0]}
            </span>
            By {item.createdBy.companyName || `${item.createdBy.firstName || ''} ${item.createdBy.lastName || ''}`.trim() || "Advertiser"}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => navigate(`/campaign-details/${item._id}`)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-sm font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
        >
          <span>👁️</span> View Campaign Details
        </button>
      </div>
    );
  };

  // Render Fleet Auction Card
  const renderFleetAuctionCard = (item) => {
    const imageUrl = getImageUrl(item);
    const hasError = imageErrors[item._id];

    return (
      <div key={item._id} className={cardClass}>
        {/* Image */}
        {imageUrl && !hasError ? (
          <div className="relative w-full h-48 rounded-2xl mb-4 overflow-hidden bg-slate-800 group">
            <img
              src={imageUrl}
              alt={getDisplayName(item)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(item._id)}
              loading="lazy"
            />
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                Fleet Auction
              </span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-48 rounded-2xl mb-4 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🚛</div>
              <span className="text-slate-500 text-sm">No Image Available</span>
            </div>
            <div className="absolute top-2 right-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                Fleet Auction
              </span>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-white mb-2">{getDisplayName(item)}</h3>
        
        {/* Vehicle Details */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {item.year && (
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">Year:</span> {item.year}
            </div>
          )}
          {item.mileage && (
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">Mileage:</span> {item.mileage.toLocaleString()} km
            </div>
          )}
        </div>

        {/* Price */}
        {item.minAuctionRates && (
          <div className="text-sm font-bold text-emerald-400 mb-2">
            Starting: ₹{item.minAuctionRates.fullWrap?.toLocaleString() || 0}
          </div>
        )}

        {/* Location */}
        <div className="text-xs text-slate-500">
          📍 {getLocation(item)}
        </div>

        {item.user && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-[10px] font-bold">
              {item.user.firstName?.[0]}
            </span>
            Owner: {item.user.firstName || "Fleet Owner"}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => navigate(`/single-fleet-auction-detail/${item._id}`)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
        >
          <span>🚛</span> View Fleet Auction Details
        </button>
      </div>
    );
  };

  // Render General Auction Card
  const renderAuctionCard = (item) => {
    const imageUrl = getImageUrl(item);
    const hasError = imageErrors[item._id];

    return (
      <div key={item._id} className={cardClass}>
        {/* Image */}
        {imageUrl && !hasError ? (
          <div className="relative w-full h-48 rounded-2xl mb-4 overflow-hidden bg-slate-800 group">
            <img
              src={imageUrl}
              alt={getDisplayName(item)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => handleImageError(item._id)}
              loading="lazy"
            />
            <div className="absolute top-2 right-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm ${getStatusColor(item.status)}`}>
                {item.status || "Active"}
              </span>
            </div>
            {item.bidCount > 0 && (
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                🏷️ {item.bidCount} bids
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-48 rounded-2xl mb-4 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🚗</div>
              <span className="text-slate-500 text-sm">No Image Available</span>
            </div>
            <div className="absolute top-2 right-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm ${getStatusColor(item.status)}`}>
                {item.status || "Active"}
              </span>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-white mb-2">{getDisplayName(item)}</h3>
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{getDescription(item)}</p>

        {/* Price Info */}
        <div className="flex items-center gap-4 mb-3">
          {item.startingPrice && (
            <div className="text-sm font-bold text-emerald-400">
              ₹{item.startingPrice.toLocaleString()}
            </div>
          )}
          {item.currentPrice && item.currentPrice !== item.startingPrice && (
            <div className="text-xs text-slate-400">
              Current: ₹{item.currentPrice.toLocaleString()}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="text-xs text-slate-500">
          📍 {getLocation(item)}
        </div>

        {/* End Time */}
        {item.endDate && (
          <div className="mt-2 text-xs text-rose-400">
            ⏰ Ends: {new Date(item.endDate).toLocaleDateString()}
          </div>
        )}

        {item.seller && (
          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-[10px] font-bold">
              {item.seller.firstName?.[0]}
            </span>
            Seller: {item.seller.firstName || "Unknown"}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() => navigate(`/single-auction-detail/${item._id}`)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <span>🏷️</span> View Auction Details
        </button>
      </div>
    );
  };

const renderCard = (item) => {
  // Based on resultType, render different card
  if (resultType === "campaigns") {
    return renderCampaignCard(item);
  }
  if (resultType === "fleetAuctions") {
    return renderFleetAuctionCard(item);
  }
  // Default: auctions
  return renderAuctionCard(item);
};

  return (
    <div className="pt-8 pb-16 min-h-screen" style={{ background: "#02040a" }}>
      <div className="max-w-screen-xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
              Search Results
            </h1>
            <p className="text-slate-400">
              {loading
                ? "Searching the marketplace..."
                : `${count} result${count === 1 ? "" : "s"} found`}
            </p>
            {searchData && (
              <p className="text-xs text-slate-500 mt-1">
                {searchData.country && `📍 ${searchData.country}`}
                {searchData.state && ` · ${searchData.state}`}
                {searchData.vehicleType?.length > 0 && ` · 🚗 ${searchData.vehicleType.length} vehicle type(s)`}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate("/user-profile/search")}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold text-slate-200 transition-all hover:border-rose-500/30"
          >
            ← Refine Search
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-3xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && results.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg mb-2">No results found.</p>
            <p className="text-slate-600 text-sm">
              Try adjusting your filters or broadening your search criteria.
            </p>
            <button
              onClick={() => navigate("/search")}
              className="mt-6 px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all"
            >
              Back to Search
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => renderCard(item))}
          </div>
        )}

        {/* Result Count Footer */}
        {!loading && results.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500 border-t border-white/5 pt-8">
            Showing {results.length} result{results.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;