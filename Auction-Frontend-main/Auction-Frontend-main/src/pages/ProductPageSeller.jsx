// // src/pages/ProductPageSeller.jsx
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { FaPlusCircle } from "react-icons/fa";
// import { MdDeleteForever } from "react-icons/md";
// import {
//   getProductsBySellerId,
//   deleteSingleProductById,
// } from "../store/product/ProductSlice";
// import { getAllCategories } from "../store/category/categorySlice";

// const ProductPageSeller = () => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limit] = useState(10);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { user } = useSelector((state) => state.auth);
//   const { product, isLoading, totalPages } = useSelector((state) => state.product);
//   const { categories } = useSelector((state) => state.category);

//   useEffect(() => {
//     if (!categories?.data || categories.data.length === 0) {
//       dispatch(getAllCategories());
//     }
//   }, [dispatch, categories]);

//   useEffect(() => {
//     if (user?._id) {
//       dispatch(
//         getProductsBySellerId({
//           id: user._id,
//           page: currentPage,
//           limit,
//         })
//       );
//     }
//   }, [dispatch, user, currentPage, limit]);

//   const getCategoryName = (categoryId) => {
//     if (!categoryId) return "Unknown";

//     if (!categories?.data) return "Loading...";

//     const category = categories.data.find((cat) => cat._id === categoryId);
//     return category ? category.name : "Unknown";
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this product?"
//     );
//     if (!confirmDelete) return;

//     try {
//       await dispatch(deleteSingleProductById(id)).unwrap();
//       dispatch(
//         getProductsBySellerId({
//           id: user._id,
//           page: currentPage,
//           limit,
//         })
//       );
//     } catch (error) {
//       console.error("Error deleting product:", error);
//     }
//   };

//   const handleEdit = (id) => {
//     navigate(`/user-profile/edit-product/${id}`);
//   };

//   return (
//     <div className="p-5 min-h-screen bg-theme-bg">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
//           <Link
//             to="/user-profile/add-product/add"
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
//           >
//             <FaPlusCircle /> Add Product
//           </Link>
//         </div>

//         {isLoading ? (
//           <div className="text-center py-10">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             <p className="mt-4 text-gray-600">Loading products...</p>
//           </div>
//         ) : !product || product.length === 0 ? (
//           <div className="text-center py-16 bg-theme-bg2 rounded-xl shadow">
//             <p className="text-gray-500 text-lg mb-4">No products available.</p>
//             <Link
//               to="/user-profile/add-product/add"
//               className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
//             >
//               Add Your First Product
//             </Link>
//           </div>
//         ) : (
//           <div className="bg-theme-bg2 rounded-xl shadow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Image</th>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Name</th>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Category</th>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Price</th>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Quantity</th>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Office Locations</th>
//                     <th className="p-4 text-left text-gray-700 font-semibold">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Array.isArray(product) &&
//                     product.map((item) => (
//                       <tr key={item._id} className="border-b hover:bg-gray-50 transition duration-150">
//                         <td className="p-4">
//                           {item.images && item.images.length > 0 ? (
//                             <img
//                               src={item.images[0]}
//                               alt={item.name}
//                               className="w-16 h-16 object-cover rounded-lg border"
//                               onError={(e) => {
//                                 e.target.onerror = null;
//                                 e.target.src = "https://via.placeholder.com/100?text=No+Image";
//                               }}
//                             />
//                           ) : item.image && item.image.length > 0 ? (
//                             <img
//                               src={item.image[0]}
//                               alt={item.name}
//                               className="w-16 h-16 object-cover rounded-lg border"
//                               onError={(e) => {
//                                 e.target.onerror = null;
//                                 e.target.src = "https://via.placeholder.com/100?text=No+Image";
//                               }}
//                             />
//                           ) : (
//                             <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
//                               <span className="text-gray-500 text-xs">No image</span>
//                             </div>
//                           )}
//                         </td>
//                         <td className="p-4 font-medium text-gray-800">{item.name}</td>
//                         <td className="p-4 text-gray-600">
//                           {getCategoryName(item.category?._id || item.category)}
//                         </td>
//                         <td className="p-4 font-semibold text-green-600">${item.price}</td>
//                         <td className="p-4 text-gray-700">{item.quantity}</td>
//                         <td className="p-4">
//                           {item.officeLocations && item.officeLocations.length > 0 ? (
//                             <div className="max-w-xs">
//                               {item.officeLocations.map((office, index) => (
//                                 <div key={index} className="mb-1">
//                                   <div className="font-medium text-gray-800">{office.country}</div>
//                                   <div className="text-sm text-gray-600 truncate">{office.address}</div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <span className="text-gray-500 text-sm">No office locations</span>
//                           )}
//                         </td>
//                         <td className="p-4">
//                           <div className="flex gap-2">
//                             <button
//                               onClick={() => handleEdit(item._id)}
//                               className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1 transition duration-200"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               onClick={() => handleDelete(item._id)}
//                               className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-1 transition duration-200"
//                             >
//                               <MdDeleteForever /> Delete
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {totalPages > 1 && (
//           <div className="flex justify-center items-center mt-6 gap-4">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2 bg-white border text-gray-700 rounded-lg">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductPageSeller;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaTimes,
  FaSave,
  FaEye,
} from "react-icons/fa";
import { BiCurrentLocation } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { toast } from "react-toastify";
import axios from "axios";
import worldData from "../countries+states+cities.json";

import { getAllCategories } from "../store/category/categorySlice";
import {
  getProductsBySellerId,
  deleteSingleProductById,
  updateSingleProduct,
} from "../store/product/ProductSlice";
import { fetchUserCountry } from "../store/countary/countrySlice";

const ProductPageSeller = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { product, isLoading, totalPages } = useSelector(
    (state) => state.product,
  );
  const { categories } = useSelector((state) => state.category);
  const { country: userCountry } = useSelector((state) => state.country);

  const [currentPage] = useState(1);
  const [limit] = useState(10);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [zipInput, setZipInput] = useState("");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Location dropdown states
  const [countries] = useState(worldData);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    images: [],
    officeLocations: [],
    zipCodes: [],
    locations: [],
    city: "",
    state: "",
    country: "",
  });

  useEffect(() => {
    if (user?._id) {
      dispatch(
        getProductsBySellerId({ id: user._id, page: currentPage, limit }),
      );
    }
    dispatch(getAllCategories());
    if (!userCountry) dispatch(fetchUserCountry());
  }, [dispatch, user, currentPage, limit, userCountry]);

  const getCategoryName = (categoryId) => {
    return (
      categories?.data?.find((cat) => cat._id === categoryId)?.name || "Unknown"
    );
  };

  // Open Edit Modal
  const openEditModal = (prod) => {
    setEditingProduct({
      ...prod,
      country: prod.country || "",
      state: prod.state || "",
      city: prod.city || "",
      locations: prod.locations || [],
      zipCodes: prod.zipCodes || [],
    });
    setZipInput((prod.zipCodes || []).join(", "));
    // Set country/state for dropdown
    const countryObj = countries.find((c) => c.name === prod.country);
    setSelectedCountry(countryObj || "");
    setStates(countryObj?.states || []);

    const stateObj = countryObj?.states?.find((s) => s.name === prod.state);
    setSelectedState(stateObj || "");
    setCities(stateObj?.cities || []);

    setIsEditModalOpen(true);
  };

  // Close Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setQuery("");
    setSuggestions([]);
    setSelectedCountry("");
    setSelectedState("");
  };

  // Handle Edit Form Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Country/State/City Change
  const handleCountryChange = (countryName) => {
    const country = countries.find((c) => c.name === countryName);
    setSelectedCountry(country);
    setStates(country?.states || []);
    setSelectedState("");
    setCities([]);
    setEditingProduct((prev) => ({
      ...prev,
      country: countryName,
      state: "",
      city: "",
    }));
  };

  const handleStateChange = (stateName) => {
    const state = states.find((s) => s.name === stateName);
    setSelectedState(state);
    setCities(state?.cities || []);
    setEditingProduct((prev) => ({ ...prev, state: stateName, city: "" }));
  };

  const handleCityChange = (cityName) => {
    setEditingProduct((prev) => ({ ...prev, city: cityName }));
  };

  // Search Location (Nominatim)
  const debounceRef = useRef(
    _.debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        setLoadingLocation(true);
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`,
        );
        setSuggestions(res.data);
      } catch (err) {
        //toast.error("Location search failed");
      } finally {
        setLoadingLocation(false);
      }
    }, 600),
  );

  const handleLocationSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    debounceRef.current(val);
  };

  // Add Location from Search
  const addLocation = (location) => {
    const zip = location.address?.postcode || "N/A";
    const cleanName = [
      location.address?.village ||
        location.address?.town ||
        location.address?.city,
      location.address?.state_district,
      location.address?.state,
    ]
      .filter(Boolean)
      .join(", ");

    const newLoc = {
      name: cleanName || location.display_name,
      zip,
      location: {
        type: "Point",
        coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
      },
    };

    setEditingProduct((prev) => ({
      ...prev,
      locations: [...(prev.locations || []), newLoc],
    }));
    setQuery("");
    setSuggestions([]);
    //toast.success("Location added!");
  };

  // Remove Location
  const removeLocation = (index) => {
    setEditingProduct((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index),
    }));
  };

  // Save Updated Product
  const saveProduct = async () => {
    if (!editingProduct.price || editingProduct.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      await dispatch(
        updateSingleProduct({
          id: editingProduct._id,
          data: editingProduct,
        }),
      ).unwrap();

      toast.success("Product updated successfully!");
      closeEditModal();
      dispatch(
        getProductsBySellerId({ id: user._id, page: currentPage, limit }),
      );
    } catch (err) {
      toast.error("Update failed");
    }
  };
  const getCurrentLocation = async () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            );

            const data = response.data;
            const zip = data.address?.postcode || "N/A";

            const newLocation = {
              lat: latitude,
              lng: longitude,
              name: data.display_name,
              zip: zip,
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
            };

            setEditingProduct((prev) => ({
              ...prev,
              locations: [...(prev.locations || []), newLocation],
              zipCodes: [...new Set([...(prev.zipCodes || []), zip])],
              zip: zip,
            }));
            toast.success("Current location added!");
            setLoading(false);
          } catch (err) {
            toast.error("Failed to get address");
            setLoading(false);
          }
        },
        () => {
          toast.error("Location access denied");
          setLoading(false);
        },
      );
    } else {
      toast.error("Geolocation not supported");
      setLoading(false);
    }
  };
  // Delete Product
  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    dispatch(deleteSingleProductById(id))
      .unwrap()
      .then(() => {
        dispatch(
          getProductsBySellerId({ id: user._id, page: currentPage, limit }),
        );
        toast.success("Product deleted");
      });
  };

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Products</h1>
          <button
            onClick={() => navigate("/user-profile/add-product/add")}
            className="bg-theme-bg2 px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition"
          >
            <FaPlusCircle /> Add New Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-theme-bg2 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-900/50 to-pink-900/50">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Locations</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : product?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                product?.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-gray-800 hover:bg-theme-bg/50 transition"
                  >
                    <td className="p-4">
                      <img
                        src={p.image?.[0] || "/placeholder.jpg"}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </td>
                    <td className="p-4 font-semibold">{p.name}</td>
                    <td className="p-4">{getCategoryName(p.category)}</td>
                    <td className="p-4 text-green-400 font-bold">₹{p.price}</td>
                    <td className="p-4">{p.quantity}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        {p.locations?.length > 0 ? (
                          <span className="text-purple-300">
                            {p.locations.length} areas
                          </span>
                        ) : (
                          <span className="text-gray-500">No location</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => openEditModal(p)}
                          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/ProductDetails/${p._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition"
                        >
                          <FaEye size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="bg-red-600 hover:bg-red-700 p-3 rounded-xl transition"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== EDIT MODAL (Popup) ====== */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-theme-bg2 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-500/40">
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-3xl font-bold text-purple-300">
                Edit Product
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={28} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name || ""}
                  onChange={handleEditChange}
                  placeholder="Product Name"
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price || ""}
                  onChange={handleEditChange}
                  placeholder="Price"
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="number"
                  name="quantity"
                  value={editingProduct.quantity || ""}
                  onChange={handleEditChange}
                  placeholder="Quantity"
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <select
                  name="category"
                  value={editingProduct.category || ""}
                  onChange={handleEditChange}
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories?.data?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country/State/City Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <select
                  value={selectedCountry?.name || ""}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedState?.name || ""}
                  onChange={(e) => handleStateChange(e.target.value)}
                  disabled={!selectedCountry}
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={editingProduct.city || ""}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zip Code Search */}
              <div>
                <label className="block text-lg font-medium mb-3">
                  Add Campaign Location (Search)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={handleLocationSearch}
                    placeholder="Search city, area, zip..."
                    className="w-full px-5 py-4 pr-12 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <BiCurrentLocation
                    className="absolute right-4 top-5 text-blue-400 cursor-pointer"
                    size={24}
                    onClick={getCurrentLocation}
                  />
                </div>

                {suggestions.length > 0 && (
                  <div className="mt-3 max-h-60 overflow-y-auto bg-theme-bg border border-gray-700 rounded-xl">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => addLocation(s)}
                        className="p-4 hover:bg-purple-900/30 cursor-pointer border-b border-gray-800 last:border-0"
                      >
                        <div className="font-medium">
                          {s.display_name.split(",")[0]}
                        </div>
                        <div className="text-sm text-gray-400">
                          ZIP: {s.address?.postcode || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Current Locations */}
              {editingProduct.locations?.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-300 mb-4">
                    Campaign Locations
                  </h4>
                  <div className="space-y-3">
                    {editingProduct.locations.map((loc, i) => (
                      <div
                        key={i}
                        className="bg-black/40 p-4 rounded-xl border border-purple-600/40 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{loc.name}</div>
                          <div className="text-sm text-gray-400">
                            Pincode: {loc.zip}
                          </div>
                        </div>
                        <button
                          onClick={() => removeLocation(i)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTimes size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                name="description"
                value={editingProduct.description || ""}
                onChange={handleEditChange}
                placeholder="Product description"
                rows="4"
                className="w-full px-5 py-4 bg-theme-bg border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
              />

              <div className="flex gap-4 justify-end pt-6">
                <button
                  onClick={closeEditModal}
                  className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProduct}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg shadow-xl"
                >
                  <FaSave className="inline mr-2" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPageSeller;
