import SingleAuction from "../SingleAuction";
import { useSelector, useDispatch } from "react-redux";
import { getLiveAuctions } from "../../store/auction/auctionSlice";
import { useEffect, useState } from "react";
import { fetchUserCountry } from "../../store/countary/countrySlice";

const LiveHome = (props) => {
  const dispatch = useDispatch();

  const { liveAuctions } = useSelector((state) => state.auction);
  const { country, currency } = useSelector((state) => state.country);
  const [liveAuctionsData, setLiveAuctionsData] = useState([]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  useEffect(() => {
    if (country) {
      dispatch(getLiveAuctions(country));
    }
  }, [dispatch, country]);

  useEffect(() => {
    setLiveAuctionsData(liveAuctions);
  }, [liveAuctions]);

  return (
    //   <div className="py-20 mb-20">
    //   <div className="flex gap-2 items-center mb-5 mt-[50px]">
    //     <div>
    //       <span className="absolute animate-ping flex rounded-full h-3 w-3 bg-sky-500"></span>
    //       <span className="relative flex rounded-full h-3 w-3 bg-sky-500"></span>
    //     </div>
    //     <h2 className="text-2xl font-bold text-black">
    //       {props.onlyAuction === "onlyAuction" ? "" : "Live Auctions"}
    //     </h2>
    //   </div>

    //   {/* Auction Grid */}
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    //     {liveAuctionsData?.map((item) => (
    //       <SingleAuction
    //         key={item._id}
    //         name={item?.name}
    //         startingPrice={item?.startingPrice}
    //         image={item?.image}
    //         endTime={item?.endTime}
    //         startTime={item?.startTime}
    //         id={item?._id}
    //         status={item?.status}
    //         sellerImage={item?.seller?.profilePicture}
    //         sellerName={item?.seller?.firstName}
    //         sellerId={item?.sellerId}
    //       />
    //     ))}
    //   </div>
    // </div>

    <div id="livehome py-20 mb-20">
      <div className="flex gap-2 items-center mb-5 mt-[50px]">
        <div>
          <span className="absolute animate-ping flex rounded-full h-3 w-3 bg-sky-500"></span>
          <span className="relative flex rounded-full h-3 w-3 bg-sky-500 "></span>
        </div>
        <h2 className="text-2xl font-bold">
          {props.onlyAuction === "onlyAuction" ? (
            ""
          ) : (
            <>
              Active <span className="text-blue-600">Auctions</span>
            </>
          )}
        </h2>
      </div>
      {liveAuctionsData && liveAuctionsData.length > 0 ? (
        <swiper-container
          breakpoints={JSON.stringify({
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          })}
          style={{
            "--swiper-navigation-color": "#c21300",
            "--swiper-navigation-size": "30px",
            "--swiper-navigation-font-weight": "600",
          }}
          navigation="true"
          slides-per-view="1"
          space-between="16"
        >
          {liveAuctionsData?.map((item) => (
            <swiper-slide key={item._id}>
              <SingleAuction
                name={item?.name}
                currentBids={item?.currentBids || {}}
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
                status={item?.status}
                sellerImage={item?.seller?.profilePicture}
                sellerName={item?.seller?.firstName}
                sellerId={item?.sellerId}
              />
            </swiper-slide>
          ))}
        </swiper-container>
      ) : (
        <div className="text-center py-8 text-gray-600 font-semibold">
          {country
            ? `No Live Auctions Available In ${country}.`
            : "No Live Auctions Available."}
        </div>
      )}
    </div>
  );
};
export default LiveHome;
