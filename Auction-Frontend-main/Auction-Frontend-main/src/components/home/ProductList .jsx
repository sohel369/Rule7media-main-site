// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { ShowAllProducts } from "../../store/product/ProductSlice";
// import Loading from "../Loading";
// import { getAllCategories } from "../../store/category/categorySlice";

// import LiveHome from "../../components/home/LiveHome";
// import UpcommingHome from "../../components/home/UpcommingHome";
// import { register } from "swiper/element/bundle";

// const ProductList = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [sortOrder, setSortOrder] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");

//   const user = useSelector((state) => state.auth.user);
//   const topRef = useRef(null);

//   const { isLoading: productLoading } = useSelector((state) => state.product);
//   const country = useSelector((state) => state.country.country);
//   const { categories, isLoading: categoryLoading } = useSelector(
//     (state) => state.category
//   );

//   const categoryList = categories?.data || [];

//   useEffect(() => {
//     dispatch(getAllCategories());
//   }, [dispatch]);

//   useEffect(() => {
//     let sortedProducts = [...products];

//     if (sortOrder === "newest") {
//       sortedProducts.sort(
//         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//       );
//     } else if (sortOrder === "oldest") {
//       sortedProducts.sort(
//         (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//       );
//     }

//     if (selectedCategory) {
//       sortedProducts = sortedProducts.filter(
//         (product) => product.category === selectedCategory
//       );
//     }

//     if (searchQuery) {
//       sortedProducts = sortedProducts.filter((product) =>
//         product.name.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredProducts(sortedProducts);
//   }, [selectedCategory, products, sortOrder, searchQuery]);

//   const loadProducts = useCallback(async () => {
//     if (!country) return;

//     setIsLoading(true);
//     const res = await dispatch(ShowAllProducts({ page: currentPage, limit: 10, country }));

//     if (!res.payload?.isError) {
//       setProducts(res.payload.products);
//       setTotalPages(res.payload.totalPages || 1);
//     }
//     setIsLoading(false);
//   }, [dispatch, currentPage, country,]);
//   const handleNextImage = (productId) => {
//         setCurrentImageIndex((prev) => {
//           const product = products.find((p) => p._id === productId);
//           if (!product || !product.image || product.image.length === 0) return prev;
//           const currentIndex = prev[productId] ?? 0;
//           return {
//             ...prev,
//             [productId]: (currentIndex + 1) % product.image.length,
//           };
//         });
//       };

//       const handlePrevImage = (productId) => {
//         setCurrentImageIndex((prev) => {
//           const product = products.find((p) => p._id === productId);
//           if (!product || !product.image || product.image.length === 0) return prev;
//           const currentIndex = prev[productId] ?? 0;
//           return {
//             ...prev,
//             [productId]:
//               (currentIndex - 1 + product.image.length) % product.image.length,
//           };
//         });
//       };

//   // Reset page when country changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [country]);

//   // Load products when user is buyer and country is available
//   useEffect(() => {
//     if (country) {
//       loadProducts();
//     }
//   }, [loadProducts, user, country, currentPage]);

//   useEffect(() => {
//     if (selectedCategory) {
//       const filtered = products.filter(
//         (product) => product.category === selectedCategory
//       );
//       setFilteredProducts(filtered);
//     } else {
//       setFilteredProducts(products);
//     }
//   }, [selectedCategory, products]);

//   const handleCategoryClick = (categoryId) => {
//     setSelectedCategory(categoryId);
//   };

//   useEffect(() => {
//     const initialIndexes = products.reduce((acc, product) => {
//       acc[product._id] = 0;
//       return acc;
//     }, {});
//     setCurrentImageIndex(initialIndexes);
//   }, [products]);

//   // ... (rest of your helper functions remain the same)

//   if (categoryLoading) {
//     return <Loading />;
//   }

//   // If user is not a buyer, show nothing or a message

//   const handleClearFilter = () => {
//     setSelectedCategory("");
//   };
//   return (
//     <div className="bg-white py-9 px-9 relative" ref={topRef}>
//       {/* Search Form */}
//       <form
//         className="max-w-lg mx-auto relative"
//         onSubmit={(e) => {
//           e.preventDefault();
//           setSearchQuery(searchQuery.trim());
//         }}
//       >
//         <div className="relative">
//           <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
//             <svg
//               className="w-5 h-5 text-gray-500"
//               fill="none"
//               viewBox="0 0 20 20"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M19 19l-4-4m0-7a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
//               />
//             </svg>
//           </div>

//           <input
//             type="text"
//             placeholder="Search by name..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full px-10 py-3 text-lg border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white backdrop-blur-lg transition-all"
//           />

//           <button
//             type="submit"
//             className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-5 py-2 transition-all shadow-md"
//           >
//             Search
//           </button>
//         </div>
//       </form>

//       {/* Category Navigation */}
//       <nav className="bg-white shadow-md dark:bg-gray-900 p-4 flex justify-between items-center">
//         <div className="flex space-x-6">
//           <button
//             onClick={handleClearFilter}
//             className={`px-4 py-2 text-lg font-medium transition duration-300 border-b-2 ${
//               selectedCategory === ""
//                 ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
//                 : "border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white"
//             }`}
//           >
//             All Categories
//           </button>
//           {categoryList.map((cat) => (
//             <button
//               key={cat._id}
//               onClick={() => handleCategoryClick(cat._id)}
//               className={`px-4 py-2 text-lg font-medium transition duration-300 border-b-2 ${
//                 selectedCategory === cat._id
//                   ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
//                   : "border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-900 dark:hover:border-white"
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}
//         </div>

//         {/* Sort By Dropdown */}
//         <div className="flex items-center">
//           <h2 className="text-lg font-semibold mr-2">Sort By:</h2>
//           <select
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             className="px-3 py-2 border rounded-md bg-white shadow"
//           >
//             <option value="all">All</option>
//             <option value="newest">Newest First</option>
//             <option value="oldest">Oldest First</option>
//           </select>
//         </div>
//       </nav>

//       {productLoading || isLoading ? (
//         <Loading />
//       ) : (
//         <>
//           <div className="grid grid-cols-5 gap-4">
//             {filteredProducts.map((product) => {
//               const categoryName =
//                 categoryList.find((cat) => cat._id === product.category)
//                   ?.name || "Unknown Category";
//               const currentIndex = currentImageIndex[product._id] || 0;

//               return (
//                 <div
//                   key={product._id}
//                   className="border bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
//                   onClick={() => navigate(`/ProductDetails/${product._id}`)}
//                 >
//                   {/* Main Image Carousel */}
//                   <div className="w-full h-40 flex justify-center items-center bg-gray-200 rounded-lg overflow-hidden relative group">
//                     <img
//                       src={product.image?.[currentIndex]}
//                       alt={product.name}
//                       className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
//                     />

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handlePrevImage(product._id);
//                       }}
//                       className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                     >
//                       &lt;
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleNextImage(product._id);
//                       }}
//                       className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                     >
//                       &gt;
//                     </button>
//                   </div>

//                   {/* Product Details */}
//                   <div className="mt-4 text-left">
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       {product.name}
//                     </h2>
//                     <p className="text-sm text-gray-600">
//                       <strong>Category:</strong> {categoryName}
//                     </p>
//                     <p className="text-sm text-red-600 mt-2">
//                       <strong>Price:</strong> ${product.price.toFixed(2)}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-2">
//                       {product.description.substring(0, 60)}...
//                     </p>
//                   </div>

//                   <div className="hidden group-hover:flex mt-2 space-x-2 overflow-x-auto">
//                     {product.image.map((img, index) => (
//                       <img
//                         key={index}
//                         src={img}
//                         alt={`${product.name} thumbnail ${index}`}
//                         className={`w-10 h-10 object-cover rounded-lg cursor-pointer ${
//                           currentIndex === index
//                             ? "border-2 border-blue-500"
//                             : ""
//                         }`}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setCurrentImageIndex((prev) => ({
//                             ...prev,
//                             [product._id]: index,
//                           }));
//                         }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//           <div className="flex justify-center mt-4">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 mx-2 border rounded"
//             >
//               Prev
//             </button>
//             <span className="px-4 py-2">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 mx-2 border rounded"
//             >
//               Next
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ProductList;
