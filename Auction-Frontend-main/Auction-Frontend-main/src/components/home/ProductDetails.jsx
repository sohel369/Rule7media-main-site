import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleProductById } from "../../store/product/ProductSlice";
import { addtoCart } from "../../store/cart/cartSlice";
import { getSoldQuantity } from "../../store/order/OrderSlice";
import { BsCartFill } from "react-icons/bs";
import { RiShoppingBagFill } from "react-icons/ri";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import { getAllCategories } from "../../store/category/categorySlice";
import { getCartItems, getWinningBid } from "../../store/cart/cartSlice";
import SEO from "../SEO";
const ProductDetails = () => {
  const { id } = useParams();
  const { country, currency } = useSelector((state) => state.country);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    singleProduct: product,
    isLoading: productLoading,
    error,
  } = useSelector((state) => state.product);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const { soldQuantity } = useSelector((state) => state.order);
  const availableQuantity = product?.quantity
    ? product.quantity - (soldQuantity || 0)
    : 0;
  const isOutOfStock = availableQuantity <= 0;

  const { categories } = useSelector((state) => state.category);
  const user = useSelector((state) => state.auth.user);
  const { country: productCountry, state, city } = product || {};

  const categoryList = categories?.data || [];
  const categoryName =
    categoryList.find((cat) => cat._id === product?.category)?.name ||
    "Unknown Category";

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (product?.image?.length > 0) {
      setSelectedImage(product.image[0]);
    }
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    dispatch(getSingleProductById(id));
    dispatch(getSoldQuantity(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  if (productLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Error: {error.message}</div>
    );
  }

  if (!product || Object.keys(product).length === 0) {
    return <div className="text-center">Product Not Found</div>;
  }

  // Add to Cart function mein yeh change karo (around line 130-150)

  const handleAddToCart = () => {
    if (!user || !user._id) {
      toast.error("Please login to add items to cart", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/login");
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      image: selectedImage,
      price: product.price,
      quantity: quantity,
      userId: user._id,
    };

    dispatch(addtoCart(cartItem))
      .unwrap()
      .then(() => {
        // ✅ Toast success
        toast.success("Product added to cart!", {
          position: "top-right",
          autoClose: 2000,
        });

        // ✅ Also dispatch custom event for header
        window.dispatchEvent(
          new CustomEvent("cartUpdated", {
            detail: { added: true, quantity: quantity },
          }),
        );
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`, {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };

  const handleQuantityChange = (change) => {
    let newQuantity = quantity + change;

    if (newQuantity < 1) return;

    if (newQuantity > availableQuantity) {
      toast.warn(`Only ${availableQuantity} items available`, {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    setQuantity(newQuantity);
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  const handleBuyNow = () => {
    navigate(
      `/checkout/${product._id}?name=${encodeURIComponent(product.name)}&price=${product.price}&quantity=${quantity}&image=${encodeURIComponent(selectedImage)}&description=${encodeURIComponent(product.description)}`,
    );
  };
  const seoData = {
    title: `${product.name} | Fleet Product Details ${product.year || 2026}`,
    description:
      product.description?.substring(0, 160) ||
      "View fleet product details and specifications",
    keywords: `${product.category || "fleet"}, ${product.brand || "product"}, fleet products, vehicle accessories`,
    ogImage: product.image || "/default-product.jpg",
    publishedTime: product.createdAt,
    modifiedTime: product.updatedAt,
  };
  return (
    <>
      <SEO {...seoData} />
      <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
        <div className="container mx-auto px-5 py-10 grid md:grid-cols-12 gap-6 bg-theme-bg rounded-3xl">
          {/* Left: Image Gallery */}
          <div className="md:col-span-5 flex items-center">
            <div className="flex flex-col gap-2 mr-4">
              {product.image?.map((img, index) => (
                <div
                  key={index}
                  className="w-36 h-36 bg-theme-bg border-2 rounded-md overflow-hidden flex justify-center items-center cursor-pointer transition-all"
                  style={{
                    borderColor: selectedImage === img ? "blue" : "gray",
                  }}
                  onMouseEnter={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`thumbnail-${index}`}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              ))}
            </div>

            <div className="w-full max-w-[400px] h-[400px] bg-theme-bg rounded-lg flex justify-center items-center overflow-hidden ml-auto">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Middle: Product Info */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold">{product.name}</h2>
              <p className="text-white mt-2">
                <strong>Category:</strong> {categoryName}
              </p>
              <p className="text-xl font-semibold text-red-600 mt-2">
                {currency} {totalPrice}
              </p>
            </div>
          </div>

          {/* Right: Purchase Section - Fixed UI */}
          <div className="md:col-span-3 p-6 border rounded-lg shadow-lg bg-theme-bg2 flex flex-col gap-6">
            {/* Stock Status */}
            <div className="space-y-3 text-center">
              <p
                className={`font-semibold text-xl ${isOutOfStock ? "text-red-500" : "text-green-500"}`}
              >
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </p>
              <p className="text-sm text-gray-300">Inclusive of all taxes</p>

              {availableQuantity > 3 ? (
                <p className="text-sm text-green-400 font-medium">In Stock</p>
              ) : availableQuantity > 0 ? (
                <p className="text-sm text-orange-400 font-bold">
                  Only {availableQuantity} left!
                </p>
              ) : (
                <p className="text-sm text-red-500 font-bold">Sold Out</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-6 py-6">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-14 h-14 rounded-full bg-theme-bg text-white text-3xl font-bold hover:bg-theme-color disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                −
              </button>

              <span className="text-3xl font-bold text-white min-w-20 text-center">
                {quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= availableQuantity || isOutOfStock}
                className="w-14 h-14 rounded-full bg-theme-bg text-white text-3xl font-bold hover:bg-theme-color disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                +
              </button>
            </div>

            {/* Buttons - Only for non-seller */}
            {user?.userType?.toLowerCase() !== "seller" && (
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-5 rounded-xl text-white font-bold text-xl transition-all shadow-xl ${
                    isOutOfStock
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-600 active:scale-95"
                  }`}
                >
                  <RiShoppingBagFill size={28} className="inline mr-3" />
                  Buy Now
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xl transition-all shadow-xl"
                >
                  <BsCartFill size={28} className="inline mr-3" />
                  Add to Cart
                </button>
              </div>
            )}

            {/* Message for Seller - अब दिखेगा */}
            {user?.userType?.toLowerCase() === "seller" && (
              <div className="text-center py-10 bg-theme-bg/50 rounded-xl border border-gray-700">
                <p className="text-gray-300 text-xl font-medium">
                  You are the seller of this product
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  You cannot purchase your own listing
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="container bg-theme-bg rounded-3xl mt-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Product Details
          </h3>

          <div className="bg-theme-bg2 rounded-3xl p-8 shadow-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Campaign Locations */}
              <div>
                <h4 className="text-xl font-bold text-white mb-5">
                  Campaign Active Areas ({product.locations?.length || 0})
                </h4>
                <div className="space-y-4 mt-4">
                  {product.locations?.length > 0 ? (
                    product.locations.map((loc, i) => (
                      <div
                        key={i}
                        className="bg-black/50 backdrop-blur-sm rounded-2xl p-5 border border-purple-600/40 hover:bg-theme-bg2 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-white">
                              {loc.name}
                            </div>
                            <div className="text-sm text-white mt-1">
                              Pincode:{" "}
                              <span className="text-green-400 font-medium">
                                {loc.zip}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full font-semibold">
                            Active
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white italic">
                      No campaign locations added
                    </p>
                  )}
                </div>
              </div>

              {/* Primary Location */}
              <div>
                <h4 className="text-xl font-bold text-white mb-5">
                  Primary Location
                </h4>
                <div className="bg-black/40 rounded-2xl p-6 border border-purple-600/30">
                  <div className="space-y-5 text-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Country</span>
                      <span className="font-bold text-white text-right">
                        {productCountry || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">State</span>
                      <span className="font-bold text-white text-right">
                        {state || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">City</span>
                      <span className="font-bold text-white text-right">
                        {city || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-700">
              <h4 className="text-2xl font-bold text-white mb-4">
                Description
              </h4>
              <div className="bg-black/30 rounded-2xl p-6 border border-gray-700">
                <p className="text-white leading-relaxed text-lg">
                  {product.description ||
                    "No description available for this product."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { getSingleProductById } from "../../store/product/ProductSlice";
// import { addtoCart } from "../../store/cart/cartSlice";
// import { getSoldQuantity } from "../../store/order/OrderSlice";
// import { BsCartFill } from "react-icons/bs";
// import { RiShoppingBagFill } from "react-icons/ri";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ReactImageMagnify from "react-image-magnify";
// import { fetchUserCountry } from "../../store/countary/countrySlice";
// import {
//   getAllCategories,
// } from "../../store/category/categorySlice";
// const ProductDetails = () => {
//   const { id } = useParams();
//   const { country, currency } = useSelector((state) => state.country);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [paymentMethod, setPaymentMethod] = useState("cod");
//   const {
//     singleProduct: product,
//     isLoading: productLoading,
//     error,
//   } = useSelector((state) => state.product);

//   const [quantity, setQuantity] = useState(1);
//   const [selectedImage, setSelectedImage] = useState("");
//   const { soldQuantity, error: orderError } = useSelector(
//     (state) => state.order
//   );
//   const availableQuantity = product?.quantity
//     ? product.quantity - (soldQuantity || 0)
//     : 0;
//   const isOutOfStock = availableQuantity <= 0;

//    const { categories, } = useSelector(
//       (state) => state.category
//     );

//   const cart = useSelector((state) => state.cart.cartItems);
//   const user = useSelector((state) => state.auth.user);
//   const { country: productCountry, state, city } = product || {};

//    useEffect(() => {
//       dispatch(getAllCategories());
//     }, []);
//   useEffect(() => {
//     if (product?.image?.length > 0) {
//       setSelectedImage(product.image[0]);
//     }
//     setQuantity(1);
//   }, [product]);

//   useEffect(() => {
//     dispatch(getSingleProductById(id));
//     dispatch(getSoldQuantity(id));
//   }, [dispatch, id]);

// useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);
// const categoryList = categories?.data || [];
//   const categoryName =
//   categoryList.find((cat) => cat._id === product?.category)?.
// name ||
//   "Unknown Category";

//   if (productLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-500">Error: {error.message}</div>
//     );
//   }

//   if (!product || Object.keys(product).length === 0) {
//     return <div className="text-center">Product Not Found</div>;
//   }

//   const handleAddToCart = () => {
//     if (!user || !user._id) {
//       toast.error("Please login to add items to cart", {
//         position: "top-right",
//         autoClose: 2000,
//       });
//       navigate("/login");
//       return;
//     }

//     const cartItem = {
//       productId: product._id,
//       name: product.name,
//       image: selectedImage,
//       price: product.price,
//       quantity: quantity,
//       paymentMethod: paymentMethod,
//       userId: user._id,
//     };

//     dispatch(addtoCart(cartItem))
//       .unwrap()
//       .then(() => {
//         toast.success("Product added to cart!", {
//           position: "top-right",
//           autoClose: 2000,
//         });
//       })
//       .catch((error) => {
//         toast.error(`Error: ${error.message}`, {
//           position: "top-right",
//           autoClose: 2000,
//         });
//       });
//   };
//   const handleQuantityChange = (change) => {
//     let newQuantity = quantity + change;

//     // Don't allow quantity less than 1
//     if (newQuantity < 1) return;

//     // Don't allow quantity more than available
//     if (newQuantity > availableQuantity) {
//       toast.warn(`Only ${availableQuantity} items available`, {
//         position: "top-right",
//         autoClose: 2000,
//       });
//       return;
//     }

//     setQuantity(newQuantity);
//   };
//   const totalPrice = (product.price * quantity).toFixed(2);
//   const handleBuyNow = () => {
//     navigate(
//       `/checkout/${product._id}?name=${encodeURIComponent(product.name)}&price=${product.price}&quantity=${quantity}&image=${encodeURIComponent(selectedImage)}&description=${encodeURIComponent(product.description)}&payment=${paymentMethod}`
//     );
//   };
//   return (
//     <>
//     <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
//     <div className="container mx-auto px-5 py-10 grid md:grid-cols-12 gap-6 bg-theme-bg rounded-3xl">
//       <div className="md:col-span-5 flex items-center">
//         <div className="flex flex-col gap-2 mr-4">
//           {product.image?.map((img, index) => (
//             <div
//               key={index}
//               className="w-36 h-66 bg-theme-bg border-2 rounded-md overflow-hidden flex justify-center items-center cursor-pointer transition-all"
//               style={{ borderColor: selectedImage === img ? "blue" : "gray" }}
//               onMouseEnter={() => setSelectedImage(img)}
//             >
//               <img
//                 src={img}
//                 alt={`thumbnail-${index}`}
//                 className="w-full h-full object-contain p-1"
//               />
//             </div>
//           ))}
//         </div>

//         <div className="w-full max-w-[400px] h-[400px] bg-theme-bg rounded-lg shadow-none flex justify-end items-center overflow-hidden ml-auto p-0 border-none">
//           <img
//             src={selectedImage}
//             alt={product.name}
//             className="w-full h-full object-contain bg-theme-bg"
//           />
//         </div>
//       </div>
//       <div className="md:col-span-4 flex flex-col justify-between h-full">
//         <div>
//           <h2 className="text-3xl font-bold">{product.name}</h2>
//           <p className="text-white mt-2">
//             <strong>Category:</strong> {categoryName}
//           </p>
//           <p className="text-xl font-semibold text-red-600 mt-2">
//            {currency} {totalPrice}
//           </p>

//         </div>
//         {/*
//         <div className="mt-4">
//           <label className="block text-gray-600 font-medium">
//             Select Payment Method
//           </label>
//           <select
//             value={paymentMethod}
//             onChange={(e) => setPaymentMethod(e.target.value)}
//             className="w-full border rounded px-3 py-2 mt-2"
//           >
//             <option value="cod">Cash on Delivery</option>
//             <option value="online"></option>
//             <option value="upi">UPI</option>
//           </select>
//         </div> */}
//       </div>

//       {/* Right Section (Purchase) */}
//       <div className="md:col-span-3 p-5 border rounded-lg shadow-lg min-h-[250px] flex flex-col justify-between bg-theme-bg2">
//         <p
//           className={`font-semibold ${isOutOfStock ? "text-red-600" : "text-green-600"}`}
//         >
//           {isOutOfStock ? "Out of Stock" : "In Stock"}
//         </p>
//         <p className="text-sm text-white">Inclusive of all taxes</p>
//         {availableQuantity > 3 ? (
//           <p className="text-sm text-green-500 font-medium">Available</p>
//         ) : availableQuantity > 0 ? (
//           <p className="text-sm text-white font-medium">
//             <strong>Only:</strong> {availableQuantity} Left
//           </p>
//         ) : (
//           <p className="text-sm text-red-500 font-semibold">Out of Stock</p>
//         )}

//         {/* Quantity Selector */}
//         <div className="flex items-center gap-4 mt-4">
//           <button
//             onClick={() => handleQuantityChange(-1)}
//             className={`px-3 py-2 text-white rounded-md ${quantity <= 1 ? "bg-theme-bg cursor-not-allowed" : "bg-theme-bg"}`}
//             disabled={quantity <= 1}
//           >
//             −
//           </button>
//           <span className="text-lg text-white font-semibold">{quantity}</span>
//           <button
//             onClick={() => handleQuantityChange(1)}
//             className={`px-3 py-2 text-white rounded-md ${quantity >= availableQuantity ? "bg-theme-bg cursor-not-allowed" : "bg-theme-bg"}`}
//             disabled={quantity >= availableQuantity}
//           >
//             +
//           </button>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col gap-4 mt-6">
//           <button
//             onClick={handleBuyNow}
//             disabled={isOutOfStock}
//             className={`px-6 py-3 rounded-lg w-full text-white ${
//               isOutOfStock ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500"
//             }`}
//           >
//             <RiShoppingBagFill size={20} className="inline" /> Buy Now
//           </button>

//           <button
//             onClick={handleAddToCart}
//             className="bg-orange-500 text-white px-6 py-3 rounded-lg w-full"
//           >
//             <BsCartFill size={20} className="inline" /> Add to Cart
//           </button>
//         </div>
//       </div>
//     </div>
// {/* ====== PRODUCT DETAILS SECTION - DARK THEME ====== */}
// <div className="container bg-theme-bg rounded-3xl  mt-8">
//   <h3 className="text-3xl font-bold text-white mb-8 text-center">
//     Product Details
//   </h3>

//   <div className="bg-theme-bg2 rounded-3xl p-8 shadow-2xl border border-purple-500/30 backdrop-blur-sm ">
//     <div className="grid lg:grid-cols-2 gap-8">

//       {/* Left: All Campaign Locations */}
//       <div>
//         <h4 className="text-xl font-bold text-white mb-5">
//           Campaign Active Areas ({product.locations?.length || 0})
//         </h4>
//         <div className="space-y-4 mt-4">
//           {product.locations?.length > 0 ? (
//             product.locations.map((loc, i) => (
//               <div
//                 key={i}
//                 className="bg-black/50 backdrop-blur-sm rounded-2xl p-5 border border-purple-600/40 hover:bg-theme-bg2 transition-all duration-300"
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-lg font-bold text-white">{loc.name}</div>
//                     <div className="text-sm text-white mt-1">
//                       Pincode: <span className="text-green-400 font-medium">{loc.zip}</span>
//                     </div>
//                   </div>
//                   <div className="text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full font-semibold">
//                     Active
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-white italic">No campaign locations added</p>
//           )}
//         </div>
//       </div>

//       {/* Right: Country, State, City */}
//       <div>
//         <h4 className="text-xl font-bold text-white mb-5">Primary Location</h4>
//         <div className="bg-black/40 rounded-2xl p-6 border border-purple-600/30">
//           <div className="space-y-5 text-lg">
//             <div className="flex justify-between items-center">
//               <span className="text-white">Country</span>
//               <span className="font-bold text-white text-right">{productCountry}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-white">State</span>
//               <span className="font-bold text-white text-right"> {state || "N/A"}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-white">City</span>
//               <span className="font-bold text-white text-right"> {city || "N/A"}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     <div className="mt-10 pt-8 border-t border-gray-700">
//       <h4 className="text-2xl font-bold text-white mb-4">Description</h4>
//       <div className="bg-black/30 rounded-2xl p-6 border border-gray-700">
//         <p className="text-white leading-relaxed text-lg">
//           {product.description || "No description available for this product."}
//         </p>
//       </div>
//     </div>

//   </div>
// </div>

//     </div>

//    </>
//   );
// };

// export default ProductDetails;
