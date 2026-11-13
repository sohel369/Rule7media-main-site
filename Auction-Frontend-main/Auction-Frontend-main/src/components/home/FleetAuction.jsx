import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import { getfleetauctiondata } from "../../store/fleetowner/fleetownerSlice";
import { useNavigate, useParams } from "react-router-dom";
import CountDownTimer from "../CountDownTimer";
import { trackClickAsync } from "../../store/click/clickSlice";
import { getUserById, reset } from "../../store/user/userSlice";
const FleetAuction = ({ onlyAuction }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { singleUser } = useSelector((state) => state.user);
  const { country, currency } = useSelector((state) => state.country);
  const {
    form: fleetAuctions,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.fleetOwner);
  const [filterType, setFilterType] = useState("live");

  const [noCountryAuctions, setNoCountryAuctions] = useState(false);

  // Fetch user data
  useEffect(() => {
    if (id) {
      dispatch(getUserById(id));
    }
    return () => dispatch(reset());
  }, [id, dispatch]);

  // Fetch country if not available
  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  // Fetch fleet auction data
  useEffect(() => {
    if (country) {
      dispatch(getfleetauctiondata());
    }
  }, [dispatch, country]);

  // Filter auctions based on status and country
  const getAuctionStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "upcoming";
    if (now >= start && now < end) return "live";
    return "ending";
  };

  const fleetAuctionsData = useMemo(() => {
    if (!fleetAuctions?.success || !Array.isArray(fleetAuctions?.data)) {
      setNoCountryAuctions(false);
      return [];
    }

    const filtered = fleetAuctions.data.filter(
      (item) =>
        getAuctionStatus(item.startTime, item.endTime) === filterType &&
        item.status !== "rejected" &&
        item.isApprovedByAdmin &&
        (!country || item.country === country),
    );

    setNoCountryAuctions(filtered.length === 0 && country);
    return filtered;
  }, [fleetAuctions, filterType, country]);

  const handleClick = (auction) => {
    const fleetOwnerId = auction.user?._id;
    const userId = singleUser?._id;

    const clickPayload = {
      auctionId: auction._id,
      fleetOwnerId,
      userId,
      referrer: window.location.href,
      userAgent: navigator.userAgent,
      country,
      currency,
    };

    if (userId) {
      clickPayload.userId = userId;
    }

    dispatch(trackClickAsync(clickPayload));
    navigate(`/single-fleet-auction-detail/${auction._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading fleet auctions...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-2xl font-bold mb-2">Error Loading Auctions</div>
          <div className="text-gray-600">{message}</div>
        </div>
      </div>
    );
  }

  return (
    <div id="livehome">
      <div className="flex gap-2 items-center mb-5 mt-[50px]">
        <div>
          <span className="absolute animate-ping flex rounded-full h-3 w-3 bg-sky-500"></span>
          <span className="relative flex rounded-full h-3 w-3 bg-sky-500"></span>
        </div>
        <h2 className="text-2xl font-bold">
          Active Fleet{" "}
          <span className="text-blue-600">
            {onlyAuction === "onlyAuction" ? "Auctions" : " Auctions"}
          </span>
        </h2>
      </div>

      {/* Filter Buttons Top */}
      <ul
        className="portfolio-filters isotope-filters aos-init aos-animate flex justify-end mb-4"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {["live", "upcoming", "ending"].map((type) => (
          <li
            key={type}
            data-filter={`.${type}`}
            className={`cursor-pointer inline-block p-0 mx-2 my-1 text-[15px] lg:text-[18px] font-semibold transition-all ease-in-out duration-300 hover:text-red-500 ${
              filterType === type
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-[#999]"
            }`}
            onClick={() => setFilterType(type)}
            role="button"
            aria-label={`Filter by ${type} auctions`}
          >
            {type === "live" && "Live Auctions"}
            {type === "upcoming" && "Upcoming"}
            {type === "ending" && "Ended"}
          </li>
        ))}
      </ul>

      {/* Auction Cards */}
      <swiper-container
        breakpoints={JSON.stringify({
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 4, spaceBetween: 16 },
        })}
        navigation="true"
        slides-per-view="1"
        space-between="16"
        style={{
          "--swiper-navigation-color": "#c21300",
          "--swiper-navigation-size": "30px",
          "--swiper-navigation-font-weight": "600",
        }}
      >
        {fleetAuctionsData.length > 0 ? (
          fleetAuctionsData.map((item) => (
            <swiper-slide key={item._id}>
              <div className="p-4 bg-black rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300 group relative overflow-hidden">
                <div className="relative h-80 rounded-lg overflow-hidden">
                  <img
                    src={
                      item?.images?.[0]?.url || "/path/to/placeholder/image.jpg"
                    }
                    alt={`${item?.company || "Fleet Auction"} image`}
                    className="w-full h-full  object-cover transform group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.src = "/path/to/placeholder/image.jpg";
                    }}
                  />
                  <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded">
                    {item?.minAuctionRates?.wrapType || "Full Wrap"}
                  </span>
                  <div className="absolute bottom-3 right-3 border border-color-primary rounded-full px-3 py-1 text-sm bg-gray-950 bg-opacity-[0.8] text-white flex items-center">
                    <CountDownTimer
                      startTime={item?.startTime}
                      endTime={item?.endTime}
                      status={item?.status}
                    />
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-white">
                  {item?.company || "Fleet Auction"}
                </h3>

                <p className="text-sm text-white">
                  {item?.townOrCity || "Unknown City"}
                  {item?.state ? `, ${item.state}` : ""}
                  {item?.country ? `, ${item.country}` : ""}
                </p>

                <p className="mt-1 text-md font-bold text-green-700">
                  Starting at {currency}
                  {item?.minAuctionRates?.fullWrap || "N/A"}
                </p>

                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => handleClick(item)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition"
                    aria-label={`View details for ${item?.company || "Fleet Auction"}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </swiper-slide>
          ))
        ) : (
          <div className="flex items-center justify-center min-h-[60vh] w-full">
            <p className="text-center text-gray-600 text-lg font-semibold">
              {noCountryAuctions
                ? `No ${filterType} Fleet Auctions Available In ${country}.`
                : `No ${filterType} Fleet Auctions Available.`}
            </p>
          </div>
        )}
      </swiper-container>
    </div>
  );
};

export default FleetAuction;

// import { useSelector, useDispatch } from "react-redux";
// import { useEffect, useState } from "react";
// import { fetchUserCountry } from "../../store/countary/countrySlice";
// import { getfleetauctiondata } from "../../store/fleetowner/fleetownerSlice";
// import { useNavigate } from "react-router-dom";
// import CountDownTimer from "../CountDownTimer";
// import { trackClickAsync } from "../../store/click/clickSlice";

// const FleetAuction = (props) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const user = useSelector((state) => state.auth.user); // Get current user
//   const [filterType, setFilterType] = useState("upcoming");
//   const { form: fleetAuctions, isLoading, isError, message } = useSelector((state) => state.fleetOwner);
//   const country = useSelector((state) => state.country.country);
//   const [fleetAuctionsData, setFleetAuctionsData] = useState([]);

//  const handleClick = (auction) => {

//    const fleetOwnerId = auction.user?._id;
//   const userId = user?._id;

//   if (!fleetOwnerId) {
//     console.warn("No fleet owner ID available for click tracking for auction:", auction._id);
//   }

//   dispatch(trackClickAsync({
//     auctionId: auction._id,
//     fleetOwnerId,
//     userId,
//     referrer: window.location.href,
//     userAgent: navigator.userAgent
//   }));
//   navigate(`/single-fleet-auction-detail/${auction._id}`);
// };

//   useEffect(() => {
//     if (!country) {
//       dispatch(fetchUserCountry());
//     }
//   }, [dispatch, country]);

//  const isAuctionOver = (startTime, endTime) => {
//   const now = new Date();
//   const start = new Date(startTime);
//   const end = new Date(endTime);
//   return now >= end;
// };

// useEffect(() => {
//   if (fleetAuctions?.success && Array.isArray(fleetAuctions?.data)) {
//     const filteredAuctions = fleetAuctions.data.filter((item) => {
//       const over = isAuctionOver(item.startTime, item.endTime);
//       return filterType === "upcoming" ? !over : over;
//     });
//     setFleetAuctionsData(filteredAuctions);
//   } else {
//     setFleetAuctionsData([]);
//   }
// }, [fleetAuctions, filterType]);

//   useEffect(() => {
//     if (country) {
//       dispatch(getfleetauctiondata());
//     }
//   }, [dispatch, country]);

//   if (isLoading) return <div>Loading fleet auctions...</div>;
//   if (isError) return <div>Error: {message}</div>;

//   return (
//     <div id="livehome" className="py-20 mb-20">
//       <div className="flex gap-2 items-center mb-5 mt-[50px]">
//         <div>
//           <span className="absolute animate-ping flex rounded-full h-3 w-3 bg-sky-500"></span>
//           <span className="relative flex rounded-full h-3 w-3 bg-sky-500"></span>
//         </div>
//         <h2 className="text-2xl font-bold text-black">
//           {props.onlyAuction === "onlyAuction" ? "" : "Fleet Auctions"}
//         </h2>
//       </div>

//       <swiper-container
//         breakpoints={JSON.stringify({
//           768: { slidesPerView: 3 },
//           1024: { slidesPerView: 4 },
//         })}
//         style={{
//           "--swiper-navigation-color": "#c21300",
//           "--swiper-navigation-size": "30px",
//           "--swiper-navigation-font-weight": "600",
//         }}
//         navigation="true"
//         slides-per-view="1"
//         space-between="16"
//       >
//         {fleetAuctionsData.length > 0 ? (
//           fleetAuctionsData.map((item) => (
//             <swiper-slide key={item._id}>
//               <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition duration-300 group relative overflow-hidden">
//                 <div className="relative h-40 rounded-lg overflow-hidden">
//                   <img
//                     src={item?.images?.[0]?.url}
//                     alt="Auction"
//                     className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
//                   />
//                   <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded">
//                     {item?.minAuctionRates?.wrapType || "Fleet Auction"}
//                   </span>

//                   <div className="absolute bottom-3 right-3 border border-color-primary border-solid rounded-full px-3 py-1 text-sm bg-gray-950 bg-opacity-[0.8] text-white whitespace-nowrap flex items-center">
//                     <CountDownTimer
//                       startTime={item?.startTime}
//                       endTime={item?.endTime}
//                       status={item?.status}
//                     />
//                   </div>
//                 </div>

//                 <h3 className="mt-3 text-lg font-semibold text-gray-900">
//                   {item?.company}
//                 </h3>

//                 <p className="text-sm text-gray-500">
//                   {item?.city || "Unknown City"}, {item?.state || ""}
//                 </p>

//                 <p className="mt-1 text-md font-bold text-green-700">
//                   Starting at ₹{item?.minAuctionRates?.fullWrap || "N/A"}
//                 </p>

//                 <div className="flex justify-center mt-3">
//                   <button
//                     onClick={() => handleClick(item)}
//                     className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition"
//                   >
//                     View Details
//                   </button>
//                 </div>
//               </div>
//             </swiper-slide>
//           ))
//         ) : (
//           <p className="text-center py-8 text-gray-600">No fleet auctions available.</p>
//         )}
//       </swiper-container>
//     </div>
//   );
// };

// export default FleetAuction;
