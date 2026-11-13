// Dashboard.js ko update karein:
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAllAuctions, reset } from "../store/auction/auctionSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SingleAuction from "../components/SingleAuction";
import SingleProduct from "../components/SingleProducts";
import SearchLocationCategory from "../components/SearchLocationCategory";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import { useLocation, Link } from "react-router-dom";
import { getAllProducts } from "../store/product/ProductSlice";
import { searchFleetAuction } from "../store/fleetowner/fleetownerSlice"; // Import fleet action

const Dashboard = () => {
  const location = useLocation();
  const { updatedFilter, fleetSearchResults } = location.state || {};

  const dispatch = useDispatch();
  const [auctionData, setAuctionData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [fleetCampaignData, setFleetCampaignData] = useState([]); // New state for fleet campaigns

  const { auction, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auction,
  );
  const { product, isLoading: productLoading } = useSelector(
    (state) => state.product,
  );
  const { searchedCampaigns, isLoading: fleetLoading } = useSelector(
    (state) => state.fleetOwner,
  );

  // Initial fetch based on filter
  useEffect(() => {
    if (updatedFilter?.searchType === "product") {
      const filterPayload = {
        category: updatedFilter.category || "",
        zip: updatedFilter.zip || "",
        searchType: "product",
      };
      dispatch(getAllProducts(filterPayload));
      setAuctionData([]);
      setFleetCampaignData([]);
    } else if (updatedFilter?.searchType === "fleet") {
      // Handle fleet search
      const filterPayload = {
        campaignArea: updatedFilter.campaignArea || "",
        availability: updatedFilter.availability || "",
        vehicleType: updatedFilter.vehicleType || "",
        postCodes: updatedFilter.postCodes || [],
        searchType: "fleet",
      };
      dispatch(searchFleetAuction(filterPayload));
      setAuctionData([]);
      setProductData([]);
    } else {
      // Default to auction search
      const filterPayload = {
        itemName: updatedFilter?.itemName || "",
        zipCodes: updatedFilter?.zipCodes || [],
        searchType: "auction",
      };
      dispatch(getAllAuctions(filterPayload));
      setProductData([]);
      setFleetCampaignData([]);
    }
  }, [dispatch, updatedFilter]);

  // Handle auction data updates
  useEffect(() => {
    if (
      updatedFilter?.searchType !== "product" &&
      updatedFilter?.searchType !== "fleet" &&
      Array.isArray(auction)
    ) {
      setAuctionData(auction);
    }
  }, [auction, updatedFilter]);

  // Handle product data updates
  useEffect(() => {
    if (updatedFilter?.searchType === "product" && Array.isArray(product)) {
      setProductData(product);
    }
  }, [product, updatedFilter]);

  // Handle fleet campaign data updates
  useEffect(() => {
    if (
      updatedFilter?.searchType === "fleet" &&
      Array.isArray(searchedCampaigns)
    ) {
      setFleetCampaignData(searchedCampaigns);
    }
  }, [searchedCampaigns, updatedFilter]);

  // Handle errors
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentAuctionItems = auctionData?.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const currentProductItems = productData?.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const currentFleetItems = fleetCampaignData?.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    let totalItems;
    if (updatedFilter?.searchType === "product") {
      totalItems = productData.length;
    } else if (updatedFilter?.searchType === "fleet") {
      totalItems = fleetCampaignData.length;
    } else {
      totalItems = auctionData.length;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const searchType = updatedFilter?.searchType || "auction";

  // Helper function to normalize image field
  const getProductImage = (item) => {
    if (Array.isArray(item?.images) && item.images.length > 0) {
      return item.images[0];
    } else if (Array.isArray(item?.image) && item.image.length > 0) {
      return item.image[0];
    } else if (typeof item?.image === "string" && item.image) {
      return item.image;
    }
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  // Helper function for fleet campaign images
  const getFleetCampaignImage = (campaign) => {
    if (Array.isArray(campaign?.images) && campaign.images.length > 0) {
      const firstImage = campaign.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (firstImage && typeof firstImage === "object") {
        return firstImage.url || firstImage.imageUrl || firstImage.src;
      }
    }
    return "https://via.placeholder.com/300x300?text=Campaign";
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray text-[#7386a8]">
      <div>
        <SearchLocationCategory updatedFilter={updatedFilter} />
      </div>

      {productLoading || isLoading || fleetLoading ? (
        <Loading />
      ) : (
        <>
          {/* Auction Results */}
          {searchType === "auction" && auctionData?.length > 0 && (
            <>
              <h2 className="text-2xl font-bold p-4">Auction Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 max-w-[1400px] mx-auto">
                {currentAuctionItems.map((item, index) => (
                  <div key={item?._id || index}>
                    <SingleAuction
                      name={item?.name || "Unnamed Auction"}
                      startingPrice={item?.startingPrice || 0}
                      image={
                        Array.isArray(item?.images) && item.images.length > 0
                          ? item.images[0]
                          : "https://via.placeholder.com/300x300?text=No+Image"
                      }
                      endTime={item?.endTime}
                      startTime={item?.startTime}
                      id={item?._id}
                      status={item?.status}
                      sellerImage={item?.seller?.profilePicture}
                      sellerName={item?.seller?.firstName}
                      sellerId={item?.seller?._id}
                    />
                  </div>
                ))}
              </div>
              <Pagination
                totalPosts={auctionData.length}
                postsPerPage={itemsPerPage}
                paginate={paginate}
                currentPage={currentPage}
                nextPage={nextPage}
                prevPage={prevPage}
              />
            </>
          )}

          {/* Product Results */}
          {searchType === "product" && productData?.length > 0 && (
            <>
              <h2 className="text-2xl font-bold p-4">Product Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 max-w-[1400px] mx-auto">
                {currentProductItems.map((item, index) => (
                  <div key={item?._id || index}>
                    <SingleProduct
                      name={item?.name}
                      category={item?.category}
                      image={getProductImage(item)}
                      description={item?.description}
                      officeLocations={item?.officeLocations}
                      id={item?._id}
                      price={item?.price}
                      quantity={item?.quantity}
                    />
                  </div>
                ))}
              </div>
              <Pagination
                totalPosts={productData.length}
                postsPerPage={itemsPerPage}
                paginate={paginate}
                currentPage={currentPage}
                nextPage={nextPage}
                prevPage={prevPage}
              />
            </>
          )}

          {/* Fleet Campaign Results */}
          {searchType === "fleet" && fleetCampaignData?.length > 0 && (
            <>
              <h2 className="text-2xl font-bold p-4">
                Fleet Advertising Campaigns
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 max-w-[1400px] mx-auto">
                {currentFleetItems.map((campaign, index) => (
                  <div
                    key={campaign?._id || index}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <img
                      src={getFleetCampaignImage(campaign)}
                      alt={campaign?.company || "Campaign"}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Campaign";
                        e.target.onerror = null;
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800">
                        {campaign?.townOrCity || campaign?.campaignArea},{" "}
                        {campaign?.state}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Vehicle: {campaign?.vehicleType || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Company: {campaign?.company || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Availability:
                        {campaign?.vehicleAvailability ? (
                          <>
                            {campaign.vehicleAvailability.threeMonths ===
                              "Available" && " 3 Months"}
                            {campaign.vehicleAvailability.sixMonths ===
                              "Available" && " | 6 Months"}
                            {campaign.vehicleAvailability.twelveMonths ===
                              "Available" && " | 12 Months"}
                            {campaign.vehicleAvailability.twentyFourMonths ===
                              "Available" && " | 24 Months"}
                            {!campaign.vehicleAvailability.threeMonths &&
                              !campaign.vehicleAvailability.sixMonths &&
                              !campaign.vehicleAvailability.twelveMonths &&
                              !campaign.vehicleAvailability.twentyFourMonths &&
                              " N/A"}
                          </>
                        ) : (
                          " N/A"
                        )}
                      </p>

                      {/* <div className="mt-3">
                        {campaign?.vehicleWrapCpms?.fullWrap && (
                          <p className="text-sm font-semibold text-red-700">
                            Full Wrap: £{campaign.vehicleWrapCpms.fullWrap}
                          </p>
                        )}
                      </div> */}

                      <Link
                        to={`/single-fleet-auction-detail/${campaign._id}`}
                        className="block mt-4 bg-red-700 text-white text-center py-2 rounded-lg hover:bg-red-800 transition font-semibold"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination
                totalPosts={fleetCampaignData.length}
                postsPerPage={itemsPerPage}
                paginate={paginate}
                currentPage={currentPage}
                nextPage={nextPage}
                prevPage={prevPage}
              />
            </>
          )}

          {/* No Results Message */}
          {!productLoading &&
            !isLoading &&
            !fleetLoading &&
            ((searchType === "auction" && auctionData.length === 0) ||
              (searchType === "product" && productData.length === 0) ||
              (searchType === "fleet" && fleetCampaignData.length === 0)) && (
              <div className="text-center p-8 text-lg text-gray-600">
                No results found for your search.
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useState } from "react";
// import { getAllAuctions, reset } from "../store/auction/auctionSlice";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import SingleAuction from "../components/SingleAuction";
// import SingleProduct from "../components/SingleProducts";
// import SearchLocationCategory from "../components/SearchLocationCategory";
// import Loading from "../components/Loading";
// import Pagination from "../components/Pagination";
// import { useLocation } from "react-router-dom";
// import { getAllProducts } from "../store/product/ProductSlice";

// const Dashboard = () => {
//   const location = useLocation();
//   const { updatedFilter } = location.state || {};

//   const dispatch = useDispatch();
//   const [auctionData, setAuctionData] = useState([]);
//   const [productData, setProductData] = useState([]);

//   const { auction, isLoading, isError, isSuccess, message } = useSelector(
//     (state) => state.auction
//   );
//   const { product, isLoading: productLoading } = useSelector(
//     (state) => state.product
//   );

//   // Initial fetch based on filter
//   useEffect(() => {

//     if (updatedFilter?.searchType === "product") {
//       const filterPayload = {
//         category: updatedFilter.category || "",
//         //itemName: updatedFilter.itemName || "",
//       zip: updatedFilter.zip || "",
//         searchType: "product",
//       };

//       dispatch(getAllProducts(filterPayload));
//       setAuctionData([]);
//     } else {
//       const filterPayload = {
//         itemName: updatedFilter?.itemName || "",
//         zipCodes: updatedFilter?.zipCodes || [],
//         searchType: "auction",
//       };

//       dispatch(getAllAuctions(filterPayload));
//       setProductData([]);
//     }
//   }, [dispatch, updatedFilter]);

//   // Handle auction data updates
//   useEffect(() => {
//     if (updatedFilter?.searchType !== "product" && Array.isArray(auction)) {

//       setAuctionData(auction);
//     }
//   }, [auction, updatedFilter]);

//   // Handle product data updates
//   useEffect(() => {
//     if (updatedFilter?.searchType === "product" && Array.isArray(product)) {

//       setProductData(product);
//     }
//   }, [product, updatedFilter]);

//   // Handle errors
//   useEffect(() => {
//     if (isError) {
//       toast.error(message);
//     }
//   }, [isError, message]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(12);

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentAuctionItems = auctionData?.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const currentProductItems = productData?.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );

//   const paginate = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const prevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const nextPage = () => {
//     const totalItems = updatedFilter?.searchType === "product"
//       ? productData.length
//       : auctionData.length;
//     const totalPages = Math.ceil(totalItems / itemsPerPage);
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const isProductSearch = updatedFilter?.searchType === "product";

//   // Helper function to normalize image field
//   const getProductImage = (item) => {

//     if (Array.isArray(item?.images) && item.images.length > 0) {
//       return item.images[0];
//     } else if (Array.isArray(item?.image) && item.image.length > 0) {
//       return item.image[0];
//     } else if (typeof item?.image === "string" && item.image) {
//       return item.image;
//     }
//     return "https://via.placeholder.com/300x300?text=No+Image";
//   };

//   return (
//     <div className="flex flex-col min-h-screen w-full bg-gray text-[#7386a8]">
//       <div>
//         <SearchLocationCategory updatedFilter={updatedFilter} />
//       </div>

//       {productLoading || isLoading ? (
//         <Loading />
//       ) : (
//         <>
//           {!isProductSearch && (
//             <>
//               {auctionData?.length > 0 ? (
//                 <>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 max-w-[1400px] mx-auto">
//                     {currentAuctionItems.map((item, index) => {

//                       return (
//                         <div key={item?._id || index}>
//                           <SingleAuction
//                             name={item?.name || "Unnamed Auction"}
//                             startingPrice={item?.startingPrice || 0}
//                             image={
//                               Array.isArray(item?.images) && item.images.length > 0
//                                 ? item.images[0]
//                                 : "https://via.placeholder.com/300x300?text=No+Image"
//                             }
//                             endTime={item?.endTime}
//                             startTime={item?.startTime}
//                             id={item?._id}
//                             status={item?.status}
//                             sellerImage={item?.seller?.profilePicture}
//                             sellerName={item?.seller?.firstName}
//                             sellerId={item?.seller?._id}
//                             bidLength={Array.isArray(item?.bids) ? item.bids.length : 0}
//                             winnerfirstName={item?.winner?.bidder?.firstName}
//                             winnerProfilePicture={item?.winner?.bidder?.profilePicture}
//                             winnerBidAmount={item?.winner?.bidAmount}
//                             winnerBidTime={item?.winner?.bidTime}
//                           />
//                         </div>
//                       );
//                     })}
//                   </div>
//                   <Pagination
//                     totalPosts={auctionData.length}
//                     postsPerPage={itemsPerPage}
//                     paginate={paginate}
//                     currentPage={currentPage}
//                     nextPage={nextPage}
//                     prevPage={prevPage}
//                   />
//                 </>
//               ) : (
//                 <div className="text-center p-8">No auctions available.</div>
//               )}
//             </>
//           )}

//           {isProductSearch && (
//             <>
//               {productData?.length > 0 ? (
//                 <>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 max-w-[1400px] mx-auto">
//                     {currentProductItems.map((item, index) => (
//                       <div key={item?._id || index}>
//                         <SingleProduct
//                           name={item?.name}
//                           category={item?.category}
//                           image={getProductImage(item)}
//                           description={item?.description}
//                           officeLocations={item?.officeLocations}
//                           id={item?._id}
//                           price={item?.price}
//                           quantity={item?.quantity}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                   <Pagination
//                     totalPosts={productData.length}
//                     postsPerPage={itemsPerPage}
//                     paginate={paginate}
//                     currentPage={currentPage}
//                     nextPage={nextPage}
//                     prevPage={prevPage}
//                   />
//                 </>
//               ) : (
//                 <div className="text-center p-8">No products available.</div>
//               )}
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
