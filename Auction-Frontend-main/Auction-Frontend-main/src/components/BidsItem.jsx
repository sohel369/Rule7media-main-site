import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getBidsAuctionsByUser } from "../store/bid/bidSlice";
import { Link, useLocation } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Loading from "./Loading";
import Pagination from "./Pagination";

const BidsItem = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { bids, isLoading } = useSelector((state) => state.bid);
  const { user } = useSelector((state) => state.auth);
  const { country, currency } = useSelector((state) => state.country);
  useEffect(() => {
    dispatch(getBidsAuctionsByUser());
  }, [dispatch]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const itemsPerPage = 6;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bids?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const prevPage = () => setCurrentPage(currentPage - 1);
  const nextPage = () => setCurrentPage(currentPage + 1);

  useEffect(() => {
    if (location.state?.defaultFilter === "active") {
      setFilterStatus("active");
    }
  }, [location.state]);
  const getBidType = (bid) => {
    if (!bid?.auction?.minAuctionRates || !bid?.bidAmount) return "-";

    const rates = bid.auction.minAuctionRates;
    const amount = bid.bidAmount;

    if (amount >= rates.fullWrap) return "Full Wrap";
    if (amount >= rates.bothSides) return "Both Sides";
    if (amount >= rates.oneSide) return "One Side";
    if (amount >= rates.rearDoors) return "Rear Doors";

    return "Custom Bid";
  };
  const getBidDisplayData = (bid) => {
    if (bid.auction && typeof bid.auction === "object" && bid.auction._id) {
      return {
        name: bid.auction.name || "Unnamed Auction",
        vehicleType: bid.auction.vehicleType || "Unknown",
        status: bid.auction.status || "Unknown",
        startingPrice: bid.auction.startingPrice || 0,
        image:
          bid.auction.images?.find((img) => img?.isPrimary)?.url ||
          bid.auction.images?.[0]?.url ||
          null,
        link: `/single-auction-detail/${bid.auction._id}`,
      };
    } else if (
      bid.fleetOwner &&
      typeof bid.fleetOwner === "object" &&
      bid.fleetOwner._id
    ) {
      // Ensure fleetOwner is an object
      return {
        name:
          bid.fleetOwner.company ||
          bid.fleetOwner.vehicleModel ||
          "Fleet Vehicle",
        vehicleType: bid.fleetOwner.vehicleModel || "Unknown",
        status: bid.fleetOwner.status || "Unknown",
        startingPrice: bid.fleetOwner.minAuctionRates?.fullWrap || 0,
        image:
          bid.fleetOwner.images?.find((img) => img?.isPrimary)?.url ||
          bid.fleetOwner.images?.[0]?.url ||
          null,
        link: `/single-fleet-auction-detail/${bid.fleetOwner._id}`,
      };
    }
    return {
      name: "Unknown",
      vehicleType: "Unknown",
      status: "Unknown",
      startingPrice: 0,
      image: null,
      link: "#",
    };
  };

  return (
    <div className="overflow-auto px-7 py-4 w-full bg-theme-bg text-white rounded-2xl">
      <h2 className="text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5">
        Bids Items
      </h2>
      <div className="overflow-auto no-scrollbar px-4 bg-theme-bg2 rounded-2xl max-h-[750px] border border-border-info-color">
        <table className="relative text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4">
          <thead className="sticky top-0 table-header-group">
            <tr className="capitalize table-row bg-theme-color [&_th]:table-cell [&_th]:pl-5 [&_th]:pr-3 [&_th]:py-3">
              <th className="rounded-l-lg">Product</th>
              <th>Vehicle Type</th>
              <th>Status</th>
              {/* <th>Bid</th> */}
              <th>My Bid</th>
              <th className="rounded-r-lg">View</th>
            </tr>
          </thead>
          <tbody className="table-row-group">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <Loading width="sidebar" />
                </td>
              </tr>
            ) : !currentItems.length ? (
              <tr className="table-row bg-theme-bg">
                <td
                  colSpan="6"
                  className="text-center m-2 w-full p-10 h-[400px]"
                >
                  No Bids Made Yet.
                </td>
              </tr>
            ) : (
              currentItems.map((bid) => {
                const displayData = getBidDisplayData(bid);
                return (
                  <tr
                    className="table-row bg-theme-bg [&_td]:table-cell [&_td]:pl-5 [&_td]:pr-3 [&_td]:py-3"
                    key={bid?._id}
                  >
                    <td className="rounded-l-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {displayData.image ? (
                            <img
                              src={displayData.image}
                              alt={displayData.name}
                              className="w-[50px] h-[50px] rounded-full object-cover border-2 border-theme-bg2"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-image.jpg";
                                e.target.className =
                                  "w-[50px] h-[50px] rounded-full bg-gray-400 border-2 border-theme-bg2";
                              }}
                            />
                          ) : (
                            <div className="w-[50px] h-[50px] rounded-full bg-gray-400 border-2 border-theme-bg2 flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="pr-10">{displayData.name}</span>
                      </div>
                    </td>
                    <td>
                      <span>{displayData.vehicleType}</span>
                    </td>
                    <td className="capitalize">
                      <span className="px-3 py-1 rounded-full text-sm border bg-theme-bg2 border-border-info-color">
                        {displayData.status}
                      </span>
                    </td>
                    {/* <td>
                      <span>{displayData.startingPrice}</span>
                    </td> */}
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {currency}
                          {bid.bidAmount}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getBidType(bid)}
                        </span>
                      </div>
                    </td>
                    <td className="capitalize rounded-r-lg flex justify-center items-center">
                      <Link
                        className="text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color p-2 transition-all"
                        to={displayData.link}
                      >
                        <FaEye size={24} className="inline mt-[-2px]" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {currentItems.length > 0 && (
          <Pagination
            totalPosts={bids?.length || 0}
            postsPerPage={itemsPerPage}
            paginate={paginate}
            currentPage={currentPage}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        )}
      </div>
    </div>
  );
};

export default BidsItem;
