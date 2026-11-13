import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShowAllProducts } from "../store/product/ProductSlice";
import Loading from "../components/Loading";
import { getAllCategories } from "../store/category/categorySlice";
import { fetchUserCountry } from "../store/countary/countrySlice";

const OurProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const topRef = useRef(null);
  const categoryScrollRef = useRef(null);

  const { isLoading: productLoading } = useSelector((state) => state.product);
  const { country, currency } = useSelector((state) => state.country);
  const { categories, isLoading: categoryLoading } = useSelector(
    (state) => state.category,
  );

  const categoryList = categories?.data || [];

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    let sortedProducts = [...products];

    if (sortOrder === "newest") {
      sortedProducts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    } else if (sortOrder === "oldest") {
      sortedProducts.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    }

    if (selectedCategory) {
      sortedProducts = sortedProducts.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (searchQuery) {
      sortedProducts = sortedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredProducts(sortedProducts);
  }, [selectedCategory, products, sortOrder, searchQuery]);

  const loadProducts = useCallback(async () => {
    if (!country) return;

    setIsLoading(true);
    const res = await dispatch(
      ShowAllProducts({ page: currentPage, limit: 10, country }),
    );

    if (!res.payload?.isError) {
      setProducts(res.payload.products);
      setTotalPages(res.payload.totalPages || 1);
    }
    setIsLoading(false);
  }, [dispatch, currentPage, country]);

  const handleNextImage = (productId) => {
    setCurrentImageIndex((prev) => {
      const product = products.find((p) => p._id === productId);
      if (!product || !product.image || product.image.length === 0) return prev;
      const currentIndex = prev[productId] ?? 0;
      return {
        ...prev,
        [productId]: (currentIndex + 1) % product.image.length,
      };
    });
  };

  const handlePrevImage = (productId) => {
    setCurrentImageIndex((prev) => {
      const product = products.find((p) => p._id === productId);
      if (!product || !product.image || product.image.length === 0) return prev;
      const currentIndex = prev[productId] ?? 0;
      return {
        ...prev,
        [productId]:
          (currentIndex - 1 + product.image.length) % product.image.length,
      };
    });
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [country]);

  useEffect(() => {
    if (country) {
      loadProducts();
    }
  }, [loadProducts, user, country, currentPage]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(
        (product) => product.category === selectedCategory,
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsCategoryMenuOpen(false);
  };

  useEffect(() => {
    const initialIndexes = products.reduce((acc, product) => {
      acc[product._id] = 0;
      return acc;
    }, {});
    setCurrentImageIndex(initialIndexes);
  }, [products]);

  const handleClearFilter = () => {
    setSelectedCategory("");
    setIsCategoryMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchQuery.trim());
  };

  if (categoryLoading) {
    return <Loading />;
  }

  return (
    <div
      className="bg-white py-4 md:py-6 lg:py-9 px-4 md:px-6 lg:px-9 relative"
      ref={topRef}
    >
      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <div className="bg-theme-bg rounded-2xl shadow-md p-4">
          {/* Top Row - Search Center, Sort Right */}
          <div className="flex items-center justify-between mb-4">
            {/* Center Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 20 20"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 19l-4-4m0-7a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-24 py-3 text-base border border-gray-600 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-bg2 text-white"
                  />

                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-5 py-2 text-sm transition-all shadow-md"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Right Sort Dropdown */}
            <div className="ml-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-white whitespace-nowrap">
                  Sort By:
                </h2>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-3 text-base border border-gray-600 rounded-lg bg-theme-bg2 text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                >
                  <option value="all">All Products</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Row - Categories */}
          <div className="flex gap-4">
            {/* Fixed All Categories Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleClearFilter}
                className={`px-5 py-2.5 text-base font-medium transition-all duration-300 rounded-lg whitespace-nowrap ${
                  selectedCategory === ""
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "text-white hover:bg-gray-700 bg-gray-800"
                }`}
              >
                All Categories
              </button>
            </div>

            {/* Scrollable Categories Container */}
            <div className="relative flex-1 min-w-0">
              {/* Left Scroll Button */}
              <button
                onClick={() => scrollCategories("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Scroll left"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Scrollable Categories */}
              <div
                ref={categoryScrollRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth px-12"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex gap-4 py-2 min-w-max">
                  {categoryList.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryClick(cat._id)}
                      className={`px-5 py-2.5 text-base font-medium transition-all duration-300 rounded-lg whitespace-nowrap ${
                        selectedCategory === cat._id
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "text-white hover:bg-gray-700 bg-gray-800"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={() => scrollCategories("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800 bg-opacity-90 hover:bg-opacity-100 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Scroll right"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden mb-6 space-y-4">
        {/* Search Bar - Center */}
        <div className="w-full">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 20 20"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 19l-4-4m0-7a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                  />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2.5 text-sm border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-3 py-1.5 text-xs transition-all shadow-md"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Category and Sort Row */}
        <div className="flex justify-between items-center gap-3">
          {/* Category Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg shadow-sm border border-gray-300 transition-colors"
            >
              <span className="truncate text-sm font-medium">
                {selectedCategory
                  ? categoryList.find((cat) => cat._id === selectedCategory)
                      ?.name || "Category"
                  : "All Categories"}
              </span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform flex-shrink-0 ${isCategoryMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isCategoryMenuOpen && (
              <div className="absolute mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-20 w-full max-h-60 overflow-y-auto">
                <button
                  onClick={handleClearFilter}
                  className={`block w-full text-left px-3 py-2 text-sm rounded ${
                    selectedCategory === ""
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {categoryList.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat._id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded ${
                      selectedCategory === cat._id
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">
              Sort:
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              <option value="all">All</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {productLoading || isLoading ? (
        <Loading />
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const categoryName =
                  categoryList.find((cat) => cat._id === product.category)
                    ?.name || "Unknown Category";
                const currentIndex = currentImageIndex[product._id] || 0;

                return (
                  <div
                    key={product._id}
                    className="border border-gray-700 bg-theme-bg text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => navigate(`/ProductDetails/${product._id}`)}
                  >
                    {/* Image Carousel */}
                    <div className="w-full h-40 md:h-48 flex justify-center items-center bg-gray-800 rounded-lg overflow-hidden relative group">
                      {product.image && product.image.length > 0 ? (
                        <>
                          <img
                            src={product.image[currentIndex]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* Navigation Buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrevImage(product._id);
                            }}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextImage(product._id);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>

                          {/* Image Counter */}
                          {product.image.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              {currentIndex + 1}/{product.image.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="mt-4 space-y-2">
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {categoryName}
                        </span>
                        <span className="text-lg font-bold text-blue-400">
                          {currency} {product.price?.toFixed(2) || "0.00"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                        {product.description || "No description available"}
                      </p>

                      {/* Thumbnails - Hidden on mobile, visible on hover for desktop */}
                      {product.image && product.image.length > 1 && (
                        <div className="hidden md:group-hover:flex mt-3 space-x-2 overflow-x-auto pb-1">
                          {product.image.map((img, index) => (
                            <div
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex((prev) => ({
                                  ...prev,
                                  [product._id]: index,
                                }));
                              }}
                              className={`flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                                currentIndex === index
                                  ? "border-blue-500"
                                  : "border-transparent hover:border-gray-500"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-xl">
                  {searchQuery || selectedCategory
                    ? "No products found matching your criteria"
                    : "No products available"}
                </div>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-2 bg-gray-100 rounded-lg font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OurProducts;
