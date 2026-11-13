import { useDispatch, useSelector } from "react-redux";
import SingleAuction from "../SingleAuction";
import { getUpcomingAuctions } from "../../store/auction/auctionSlice";
import { useEffect, useState } from "react";
import { fetchUserCountry } from "../../store/countary/countrySlice";

const UpcommingHome = () => {
  const dispatch = useDispatch();
  const { upComingAuctions } = useSelector((state) => state.auction);

  const [upComingAuctionsData, setUpComingAuctionsData] = useState([]);
  const country = useSelector((state) => state.country.country);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (country) {
      dispatch(getUpcomingAuctions());
    }
  }, [country]);

  useEffect(() => {
    setUpComingAuctionsData(upComingAuctions);
  }, [upComingAuctions]);

  return (
    // <>
    //   <div className="">
    //     <h2 className="text-2xl font-bold text-black mb-5">Upcoming </h2>

    //     <swiper-container
    //       breakpoints={JSON.stringify({
    //         768: {
    //           slidesPerView: 3,
    //         },
    //         1024: {
    //           slidesPerView: 4,
    //         },
    //       })}
    //       style={{
    //         "--swiper-navigation-color": "#00A3FF",
    //       }}
    //       navigation="true"
    //       slides-per-view="1"
    //       space-between="16"
    //     >
    //       {upComingAuctionsData.map((item) => (
    //         <swiper-slide key={item._id}>
    //           <SingleAuction
    //             name={item?.name}
    //             startingPrice={item?.startingPrice}
    //             image={item?.image}
    //             endTime={item?.endTime}
    //             startTime={item?.startTime}
    //             id={item?._id}
    //             status={item.status}
    //             sellerImage={item?.seller?.profilePicture}
    //             sellerName={item?.seller?.firstName}
    //             sellerId={item?.sellerId}
    //           />
    //         </swiper-slide>
    //       ))}
    //     </swiper-container>
    //   </div>
    // </>

    <div className="py-10 mb-20">
      <h2 className="text-2xl font-bold text-black mb-5">Upcoming Auctions</h2>

      {/* Auction Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {upComingAuctionsData &&
          upComingAuctionsData.map((item) => (
            <SingleAuction
              key={item._id}
              name={item?.name}
              startingPrice={item?.startingPrice}
              image={
                item?.images && item.images.length > 0
                  ? item.images[0]
                  : item?.image
                    ? item.image
                    : ""
              }
              endTime={item?.endTime}
              startTime={item?.startTime}
              id={item?._id}
              status={item.status}
              sellerImage={item?.seller?.profilePicture}
              sellerName={item?.seller?.firstName}
              sellerId={item?.sellerId}
            />
          ))}
      </div>
    </div>
  );
};

export default UpcommingHome;
