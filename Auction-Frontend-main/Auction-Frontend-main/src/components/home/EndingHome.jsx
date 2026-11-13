import { useDispatch, useSelector } from "react-redux";
import SingleAuction from "../SingleAuction";
import { getEndingAuctions } from "../../store/auction/auctionSlice";
import { useEffect, useState } from "react";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const EndingHome = () => {
  const dispatch = useDispatch();
  const { endingAuctions, isLoading, isError, message } = useSelector(
    (state) => state.auction,
  );

  const [endingAuctionsData, setEndingAuctionsData] = useState([]);
  const country = useSelector((state) => state.country.country);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (country) {
      dispatch(getEndingAuctions());
    }
  }, [country, dispatch]);

  useEffect(() => {
    setEndingAuctionsData(endingAuctions);
  }, [endingAuctions]);

  return (
    <div className="py-10 mb-20">
      <h2 className="text-2xl font-bold text-black mb-">Ended Auctions</h2>
      {isLoading && <p>Loading auctions...</p>}
      {isError && <p>Error: {message}</p>}
      {!isLoading && !isError && endingAuctionsData.length === 0 && (
        <p>No auctions available.</p>
      )}
      {!isLoading && !isError && endingAuctionsData.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            1280: { slidesPerView: 4, spaceBetween: 30 },
          }}
          className="ending-auctions-slider !pb-14"
        >
          {endingAuctionsData.map((item) => (
            <SwiperSlide key={item._id}>
              <SingleAuction
                name={item?.name}
                startingPrice={item?.startingPrice}
                image={
                  item?.images && item.images.length > 0
                    ? item.images[0]
                    : item?.image || ""
                }
                endTime={item?.endTime}
                startTime={item?.startTime}
                id={item?._id}
                status={item.status}
                sellerImage={item?.seller?.profilePicture}
                sellerName={item?.seller?.firstName || "Unknown"}
                sellerId={item?.seller?._id || "N/A"}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default EndingHome;
