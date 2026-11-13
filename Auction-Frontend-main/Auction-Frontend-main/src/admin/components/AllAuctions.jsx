import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllUsers } from "../../store/user/userSlice";
import { useTable, useSortBy, usePagination, useFilters } from "react-table";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteAuctionByAdminById,
  getAllAuctions,
  getAllAuctionscombined,
  updateCampingStatus,
} from "../../store/auction/auctionSlice";
import { MdSkipPrevious, MdSkipNext, MdDeleteForever } from "react-icons/md";
import {
  FaCaretUp,
  FaCaretDown,
  FaCaretRight,
  FaCaretLeft,
  FaEye,
  FaRegEdit,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { BiRefresh } from "react-icons/bi";
import { fetchUserCountry } from "../../store/countary/countrySlice";
import { HeaderLeaderboard } from "../../components/AdSlots";

const AllAuctions = () => {
  const dispatch = useDispatch();
  const tableContainerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [filterInput, setFilterInput] = useState("");
  const [filterField, setFilterField] = useState("name");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const { auction, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auction,
  );
  const { country, currency } = useSelector((state) => state.country);

  const COUNTRIES = [
    "United States",
    "Canada",
    "Australia",
    "China",
    "Japan",
    "India",
    "Thailand",
    "Indonesia",
    "Spain",
    "France",
    "United Kingdom",
  ];

  const extractCountry = (locationString) => {
    if (!locationString) return "Unknown";
    const parts = locationString.split(",");
    const country = parts[parts.length - 1].trim() || "Unknown";
    return COUNTRIES.includes(country) ? country : "Unknown";
  };

  const formatLocation = (locationString) => {
    if (!locationString) return "Unknown";
    const parts = locationString.split(",");
    const city = parts[0]?.trim() || "Unknown";
    const country = parts[parts.length - 1]?.trim() || "Unknown";
    return `${city}, ${country}`;
  };

  const uniqueCountries = useMemo(() => {
    if (!auction || !Array.isArray(auction)) {
      return [];
    }

    const countries = new Set();
    auction?.forEach((item) => {
      if (item && item.location && item.location.name) {
        countries.add(extractCountry(item.location.name));
      }
    });
    return Array.from(countries).sort();
  }, [auction]);

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    setFilter(filterField, value);
    setFilterInput(value);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this auction?")) {
      dispatch(deleteAuctionByAdminById(id)).then(() => {
        dispatch(getAllAuctionscombined());
      });
    }
  };

  const handleRefresh = () => {
    dispatch(getAllAuctionscombined());
  };

  const columns = useMemo(
    () => [
      {
        Header: "Picture",
        accessor: "picture",
        Cell: ({ value }) => (
          <div className="flex justify-center">
            {value && value !== "https://via.placeholder.com/56x56?text=IMG" ? (
              <img
                src={value}
                alt="Auction"
                className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border-2 border-gray-600"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/56x56?text=IMG";
                  e.target.alt = "No Image Available";
                }}
              />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-gray-700 rounded-lg border-2 border-gray-600 text-gray-300 text-xs font-medium">
                No Image Available
              </div>
            )}
          </div>
        ),
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Vehicle Type",
        accessor: "vehicleType",
      },
      {
        Header: "Auction Type",
        accessor: "auctionType",
        Cell: ({ value }) => (
          <span className="px-2 py-1 bg-indigo-900/30 text-indigo-300 rounded-full text-sm whitespace-nowrap">
            {value}
          </span>
        ),
      },
      {
        Header: "Seller Email",
        accessor: "sellerEmail",
      },
      {
        Header: "Location",
        accessor: "location",
        Cell: ({ value }) => (
          <span className="truncate block max-w-[150px]" title={value}>
            {value}
          </span>
        ),
      },
      {
        Header: "Country",
        accessor: "country",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`py-1 px-3 capitalize rounded-full text-sm font-medium whitespace-nowrap ${
              value === "upcoming"
                ? "text-orange-300 bg-orange-900/30 border border-orange-600"
                : value === "active"
                  ? "text-green-300 bg-green-900/30 border border-green-600"
                  : "text-red-300 bg-red-900/30 border border-red-600"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Min Rates",
        accessor: "minAuctionRates", // Direct object access
        Cell: ({ value }) => {
          const rates = value || {};

          if (!rates || Object.keys(rates).length === 0) {
            return <span className="text-gray-400">---</span>;
          }

          return (
            <div className="min-w-[150px]">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Full Wrap:</span>
                  <span className="text-green-300 font-medium">
                    {currency} {rates.fullWrap || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">One Side:</span>
                  <span className="text-green-300 font-medium">
                    {currency} {rates.oneSide || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Both Sides:</span>
                  <span className="text-green-300 font-medium">
                    {currency} {rates.bothSides || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rear Doors:</span>
                  <span className="text-green-300 font-medium">
                    {currency} {rates.rearDoors || 0}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        Header: "Approval Status",
        accessor: "adminstatus",
        Cell: ({ row: { original } }) => {
          const status = original.adminstatus;

          const handleApprove = () => {
            dispatch(
              updateCampingStatus({
                id: original.actions,
                adminstatus: "approved",
              }),
            )
              .unwrap()
              .then((res) => {
                toast.success("Auction Approved!");
                dispatch(getAllAuctionscombined());
              })
              .catch(() => toast.error("Failed to approve"));
          };

          const handleReject = () => {
            dispatch(
              updateCampingStatus({
                id: original.actions,
                adminstatus: "rejected",
              }),
            )
              .unwrap()
              .then((res) => {
                toast.success("Auction rejected!");
                dispatch(getAllAuctionscombined());
              })
              .catch(() => toast.error("Failed to reject"));
          };

          if (status === "approved" || status === "rejected") {
            return (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  status === "approved"
                    ? "bg-green-900/30 text-green-300 border border-green-600"
                    : "bg-red-900/30 text-red-300 border border-red-600"
                }`}
              >
                {status}
              </span>
            );
          }

          // 🔥 If still pending → show buttons
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
              >
                Approve
              </button>

              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          );
        },
      },

      // {
      //   Header: "Start Time",
      //   accessor: "startTime",
      // },
      // {
      //   Header: "End Time",
      //   accessor: "endTime",
      // },
      {
        Header: "Payment",
        accessor: "paymentStatus",
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row: { original } }) => (
          <div className="flex gap-1 md:gap-2 justify-center">
            <Link
              to={
                original.auctionType === "Fleet Auction"
                  ? `/single-fleet-auction-detail/${original.actions}`
                  : `/admin/auctions/view/${original.actions}`
              }
            >
              <button
                className="p-2 text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-600 transition-all duration-200 group"
                aria-label="View Auction"
              >
                <FaEye className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => handleDeleteUser(original.actions)}
              className="p-2 text-red-400 hover:text-white hover:bg-red-600 rounded-lg border border-red-600 transition-all duration-200"
              aria-label="Delete Auction"
            >
              <MdDeleteForever className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllAuctionscombined());
  }, [dispatch]);

  useEffect(() => {
    if (!country) {
      dispatch(fetchUserCountry());
    }
  }, [dispatch, country]);

  const countryFilteredData = useMemo(() => {
    if (selectedCountry === "All") return auction;
    return auction.filter(
      (item) => extractCountry(item?.location?.name) === selectedCountry,
    );
  }, [auction, selectedCountry]);

  const updateScrollerPosition = () => {
    if (tableContainerRef.current && scrollContainerRef.current) {
      const tableContainer = tableContainerRef.current;
      const scrollContainer = scrollContainerRef.current;

      const scrollPercentage =
        tableContainer.scrollLeft /
        (tableContainer.scrollWidth - tableContainer.clientWidth);
      const thumbWidth = Math.max(50, scrollContainer.clientWidth * 0.5); // Minimum 30px width

      const thumb = scrollContainer.querySelector(".scroller-thumb");
      if (thumb) {
        const availableWidth = scrollContainer.clientWidth - thumbWidth;
        thumb.style.left = `${scrollPercentage * availableWidth}px`;
      }
    }
  };
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", updateScrollerPosition);
      return () =>
        tableContainer.removeEventListener("scroll", updateScrollerPosition);
    }
  }, []);
  const data = useMemo(
    () =>
      Array.isArray(countryFilteredData)
        ? countryFilteredData.map((auc) => {
            // Extract image URL - handle both array of objects and array of strings
            let imageUrl = "https://via.placeholder.com/56x56?text=IMG";

            if (Array.isArray(auc?.images) && auc.images.length > 0) {
              // Check if first item is an object with url property
              if (
                auc.images[0] &&
                typeof auc.images[0] === "object" &&
                auc.images[0].url
              ) {
                imageUrl = auc.images[0].url;
              } else if (typeof auc.images[0] === "string") {
                imageUrl = auc.images[0];
              }
            } else if (auc?.image && typeof auc.image === "string") {
              imageUrl = auc.image;
            }
            const rates = auc?.minAuctionRates || {};

            return {
              picture: imageUrl,
              name: auc?.name,
              vehicleType: auc?.vehicleType || "---",
              sellerEmail: auc?.seller?.email || "---",
              location: formatLocation(auc?.location?.name),
              country: extractCountry(auc?.location?.name),
              status: auc?.status,
              minAuctionRates: rates,
              minRatesDisplay: `Full Wrap:${rates.fullWrap || 0}\nOne Side:${rates.oneSide || 0}\nBoth Sides:${rates.bothSides || 0}\nRear Doors:${rates.rearDoors || 0}`,
              paymentStatus: auc?.paid === false ? "Unpaid" : "Paid",
              statusClass:
                auc?.paid === false
                  ? "text-red-400 px-2 py-1 border border-red-600 rounded-full bg-red-900/20"
                  : "text-green-400 px-2 py-1 border border-green-600 rounded-full bg-green-900/20",
              auctionType:
                auc?.type === "FleetOwner" ? "Fleet Auction" : "Auction",
              adminstatus: auc?.adminstatus || "pending",
              actions: auc?._id,
            };
          })
        : [],
    [countryFilteredData],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    state: { pageIndex, pageSize },
    pageCount,
    gotoPage,
    setPageSize,
    setFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 8 },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full bg-theme-bg text-slate-300 rounded-2xl min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            All Auctions
          </h1>
          <div className="text-slate-400 text-sm md:text-base">
            {selectedCountry === "All" ? (
              <p>
                Showing all auctions from all countries ({auction?.length}{" "}
                records)
              </p>
            ) : (
              <p>
                Showing auctions from {selectedCountry} (
                {countryFilteredData.length} records)
              </p>
            )}
          </div>
        </div>
        {/* <HeaderLeaderboard/> */}
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
            aria-label="Refresh Auctions"
          >
            <BiRefresh className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 md:hidden"
            aria-label="Toggle Filters"
          >
            <FaFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={`${showFilters ? "block" : "hidden"} md:block mb-6`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            className="outline-none bg-theme-bg2 rounded-xl px-4 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all text-white"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="All">All Countries</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className="outline-none bg-theme-bg2 rounded-xl px-4 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all text-white"
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="">Filter By</option>
            <option value="name">Name</option>
            <option value="vehicleType">Vehicle Type</option>
            <option value="sellerEmail">Seller</option>
            <option value="location">Location</option>
            <option value="status">Status</option>
            <option value="startingPrice">Starting Bid</option>
            <option value="startTime">Start Time</option>
            <option value="endTime">End Time</option>
            <option value="paymentStatus">Payment Status</option>
          </select>
          <div className="relative sm:col-span-2 lg:col-span-2">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="outline-none w-full bg-theme-bg2 rounded-xl pl-12 pr-4 py-3 border border-border-info-color focus:border-theme-color transition-all text-white placeholder-gray-400"
              value={filterInput}
              onChange={handleFilterChange}
              placeholder={`Search by ${filterField}...`}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-theme-bg2 rounded-2xl border border-border-info-color overflow-hidden">
        <div
          className="overflow-x-auto"
          ref={tableContainerRef}
          style={{ scrollbarWidth: "thin" }}
        >
          <table
            {...getTableProps()}
            className="w-full min-w-[1200px] border-separate border-spacing-0"
          >
            <thead className="bg-gray-800/50">
              {headerGroups.map((headerGroup, headerGroupIndex) => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  key={headerGroupIndex}
                >
                  {headerGroup?.headers.map((column, columnIndex) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={columnIndex}
                      className="p-4 text-left select-none border-b border-border-info-color hover:bg-gray-700/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm md:text-base">
                          {column.render("Header")}
                        </span>
                        <span className="ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaCaretDown className="w-4 h-4 text-blue-400" />
                            ) : (
                              <FaCaretUp className="w-4 h-4 text-blue-400" />
                            )
                          ) : (
                            <div className="w-4 h-4"></div>
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page &&
                page.map((row, rowIndex) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={row.id}
                      className="hover:bg-gray-800/30 transition-all duration-200 group"
                    >
                      {row.cells.map((cell, cellIndex) => (
                        <td
                          {...cell.getCellProps()}
                          key={cellIndex}
                          className="p-4 border-b border-gray-700/50 text-sm"
                        >
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* No Data State */}
        {(!page || page.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 text-lg mb-2">No auctions found</div>
          </div>
        )}
      </div>

      {page && page.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-slate-400 text-sm">
            Showing {pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length}{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => gotoPage(0)}
              disabled={pageIndex === 0}
              className={`p-2 rounded-lg transition-all ${
                pageIndex === 0
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              aria-label="Go to First Page"
            >
              <MdSkipPrevious className="w-4 h-4" />
            </button>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className={`p-2 rounded-lg transition-all ${
                !canPreviousPage
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              aria-label="Previous Page"
            >
              <FaCaretLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                const pageNumber =
                  Math.max(0, Math.min(pageCount - 5, pageIndex - 2)) + i;
                if (pageNumber >= pageCount) return null;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => gotoPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      pageIndex === pageNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                    aria-label={`Go to Page ${pageNumber + 1}`}
                  >
                    {pageNumber + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className={`p-2 rounded-lg transition-all ${
                !canNextPage
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              aria-label="Next Page"
            >
              <FaCaretRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={pageIndex === pageCount - 1}
              className={`p-2 rounded-lg transition-all ${
                pageIndex === pageCount - 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              aria-label="Go to Last Page"
            >
              <MdSkipNext className="w-4 h-4" />
            </button>
          </div>
          <select
            className="outline-none bg-theme-bg2 rounded-lg px-3 py-2 cursor-pointer border border-border-info-color focus:border-theme-color transition-all text-white text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[8, 12, 16, 20, 24, 28, 32, 36, 40].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default AllAuctions;

// import React, { useEffect, useState, useMemo } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { getAllUsers } from "../../store/user/userSlice";
// import { useTable, useSortBy, usePagination, useFilters } from "react-table";
// import { Link } from "react-router-dom";
// import {
//   deleteAuctionByAdminById,
//   getAllAuctions,
// } from "../../store/auction/auctionSlice";
// import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
// import {
//   FaCaretUp,
//   FaCaretDown,
//   FaCaretRight,
//   FaCaretLeft,
//   FaEye,
//   FaRegEdit,
// } from "react-icons/fa";
// import { MdDeleteForever } from "react-icons/md";

// const AllAuctions = () => {
//   const dispatch = useDispatch();
//   const [filterInput, setFilterInput] = useState("");
//   const [filterField, setFilterField] = useState("name");
//   const [selectedCountry, setSelectedCountry] = useState("All");
//   const { auction, isLoading, isError, isSuccess, message } = useSelector(
//     (state) => state.auction
//   );

//  const COUNTRIES = [
//   "United States",
//   "Canada",
//   "Australia",
//   "China",
//   "Japan",
//   "India",
//   "Thailand",
//   "Indonesia",
//   "Spain",
//   "France",
//   "United Kingdom",
// ];
//  const extractCountry = (locationString) => {
//     if (!locationString) return "Unknown";
//     const parts = locationString.split(",");
//     const country = parts[parts.length - 1].trim() || "Unknown";
//     // Ensure the extracted country is in the static list, else return "Unknown"
//     return COUNTRIES.includes(country) ? country : "Unknown";
//   };

//   // Get unique countries for filter dropdown
//   const uniqueCountries = useMemo(() => {
//     const countries = new Set();
//     auction.forEach((item) =>
//       countries.add(extractCountry(item?.location?.name))
//     );
//     return Array.from(countries).sort();
//   }, [auction]);

//   const handleFilterChange = (e) => {
//     const value = e.target.value || undefined;
//     setFilter(filterField, value);
//     setFilterInput(value);
//   };

//   const handleDeleteUser = (id) => {
//     dispatch(deleteAuctionByAdminById(id)).then(() => {
//       dispatch(getAllAuctions());
//     });
//   };

//   const columns = useMemo(
//     () => [
//       {
//         Header: "Picture",
//         accessor: "picture",
//         Cell: ({ value }) => (
//           <img
//             src={value}
//             alt="Profile"
//             style={{ width: "50px", height: "50px" }}
//           />
//         ),
//       },
//       {
//         Header: "Name",
//         accessor: "name",
//       },
//       {
//         Header: "Category",
//         accessor: "category",
//       },
//       {
//         Header: "Seller",
//         accessor: "seller",
//       },
//       {
//         Header: "Location",
//         accessor: "location",
//       },
//       {
//         Header: "Country",
//         accessor: "country",
//       },
//       {
//         Header: "Status",
//         accessor: "status",
//         Cell: ({ value }) => (
//           <span
//             className={`py-1 px-2 border capitalize rounded-lg ${
//               value === "upcoming"
//                 ? "text-orange-500 border-orange-500"
//                 : value === "active"
//                   ? "text-green-500 border-green-500"
//                   : ""
//             }`}
//           >
//             {value}
//           </span>
//         ),
//       },
//       {
//         Header: "Bid",
//         accessor: "startingPrice",
//       },
//       {
//         Header: "Start Time",
//         accessor: "startTime",
//       },
//       {
//         Header: "End Time",
//         accessor: "endTime",
//       },
//       {
//         Header: "Payment Status",
//         accessor: "paymentStatus",
//         Cell: ({ value, row: { original } }) => (
//           <span className={original.statusClass}>{value}</span>
//         ),
//       },
//       {
//         Header: "Actions",
//         accessor: "actions",
//         Cell: ({ row: { original } }) => (
//           <div className="flex gap-2">
//             <Link to={`/admin/auctions/view/${original.actions}`}>
//               <FaEye
//                 size={38}
//                 className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color  px-2 py-[5px] transition-all"
//               />
//             </Link>
//             <button onClick={() => handleDeleteUser(original.actions)}>
//               <MdDeleteForever
//                 size={38}
//                 className=" inline mt-[-3px] text-color-danger hover:text-white hover:bg-color-danger rounded-lg border-2 border-color-danger  px-[6px] py-[3px] transition-all"
//               />
//             </button>
//             {original.status === "upcoming" && (
//               <Link to={`/admin/auctions/edit/${original.actions}`}>
//                 <FaRegEdit
//                   size={38}
//                   className="inline mt-[-3px] text-theme-color hover:text-white hover:bg-theme-color rounded-lg border-2 border-theme-color px-2 py-[5px] transition-all"
//                 />
//               </Link>
//             )}
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   useEffect(() => {
//     dispatch(getAllUsers());
//     dispatch(getAllAuctions());
//   }, [dispatch]);

//   // Filter data based on selected country first
//   const countryFilteredData = useMemo(() => {
//     if (selectedCountry === "All") return auction;
//     return auction.filter(
//       (item) => extractCountry(item?.location?.name) === selectedCountry
//     );
//   }, [auction, selectedCountry]);

//   // Then apply the rest of the transformations
//   const data = useMemo(
//     () =>
//       Array.isArray(countryFilteredData)
//         ? countryFilteredData.map((auc) => {
//             const paymentStatus = auc?.paid === false ? "UnPaid" : "Paid";
//             const statusClass =
//               auc?.paid === false
//                 ? "text-color-danger px-2 py-1 border border-color-danger rounded-full "
//                 : " text-color-success px-2 py-1 border border-color-success  rounded-full";

//             return {
//               picture:
//                 Array.isArray(auc?.images) && auc.images.length > 0
//                   ? auc.images[0]
//                   : auc?.image
//                     ? auc.image
//                     : "https://via.placeholder.com/50",

//               name: auc?.name,
//               category: auc?.category?.name || "---",
//               seller: auc?.seller?.firstName || auc?.seller?.fullName || "---",
//               location: auc?.location?.name,
//               country: extractCountry(auc?.location?.name),
//               status: auc?.status,
//               startingPrice: auc?.startingPrice,
//               startTime: new Date(auc?.startTime).toLocaleString(),
//               endTime: new Date(auc?.endTime).toLocaleString(),
//               paymentStatus: paymentStatus,
//               statusClass: statusClass,
//               actions: auc?._id,
//             };
//           })
//         : [],
//     [countryFilteredData]
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     page,
//     prepareRow,
//     nextPage,
//     previousPage,
//     canPreviousPage,
//     canNextPage,
//     state: { pageIndex, pageSize },
//     pageCount,
//     gotoPage,
//     setPageSize,
//     setFilter,
//   } = useTable(
//     {
//       columns,
//       data,
//       initialState: { pageSize: 8 },
//     },
//     useFilters,
//     useSortBy,
//     usePagination
//   );

//   return (
//     <>
//       <div className="px-7 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl h-[100vh]">
//         <h2 className=" text-white font-bold text-xl border-b border-border-info-color pb-3 mb-5 ">
//           All Auctions
//         </h2>

//         <div className="text-slate-400 mb-4">
//           {selectedCountry === "All" ? (
//             <p>
//               Showing all auctions from all countries ({auction.length} records)
//             </p>
//           ) : (
//             <p>
//               Showing auctions from {selectedCountry} (
//               {countryFilteredData.length} records)
//             </p>
//           )}
//         </div>

//         <div className="flex flex-col md:flex-row gap-4 mb-4">
//           <select
//             className="outline-none bg-theme-bg2 rounded-xl px-3 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all"
//             value={selectedCountry}
//             onChange={(e) => setSelectedCountry(e.target.value)}
//           >
//             <option value="All">All Countries</option>
//             {COUNTRIES.map((country) => (
//               <option key={country} value={country}>
//                 {country}
//               </option>
//             ))}
//           </select>

//           <select
//             className="outline-none bg-theme-bg2 rounded-xl px-3 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all"
//             value={filterField}
//             onChange={(e) => setFilterField(e.target.value)}
//           >
//             <option value="name">Filter By</option>
//             <option value="name">Name</option>
//             <option value="category">Category</option>
//             <option value="seller">Seller</option>
//             <option value="location">Location</option>
//             <option value="status">Status</option>
//             <option value="startingPrice">Bid</option>
//             <option value="startTime">Start Time</option>
//             <option value="endTime">End Time</option>
//             <option value="paymentStatus">Payment Status</option>
//           </select>

//           <input
//             className="outline-none w-full md:w-[200px] bg-theme-bg2 rounded-xl px-3 py-3 border border-border-info-color focus:border-theme-color transition-all"
//             value={filterInput}
//             onChange={handleFilterChange}
//             placeholder={`Search ${filterField}`}
//           />
//         </div>

//         <div className="overflow-auto px-4 rounded-2xl border border-border-info-color mt-4 max-h-[700px]">
//           <table
//             {...getTableProps()}
//             className="text-left whitespace-nowrap w-full border-separate border-spacing-x-0 border-spacing-y-4 "
//           >
//             <thead className="sticky top-0 bg-theme-bg table-header-group">
//               {headerGroups.map((headerGroup, headerGroupIndex) => (
//                 <tr
//                   className="table-row"
//                   {...headerGroup.getHeaderGroupProps()}
//                   key={headerGroupIndex}
//                 >
//                   {headerGroup?.headers.map((column, columnIndex) => (
//                     <th
//                       {...column.getHeaderProps(column.getSortByToggleProps())}
//                       key={columnIndex}
//                       className="p-2 pr-5 select-none first:rounded-l-lg last:rounded-r-lg border-b border-border-info-color  hover:bg-theme-bg2  transition-all"
//                     >
//                       <div className="flex gap-4">
//                         {column.render("Header")}
//                         <span>
//                           {column.isSorted ? (
//                             column.isSortedDesc ? (
//                               <FaCaretDown size={24} className="mt-[-2px]" />
//                             ) : (
//                               <FaCaretUp size={24} />
//                             )
//                           ) : null}
//                         </span>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <tbody className="table-row-group" {...getTableBodyProps()}>
//               {page&&page.map((row) => {
//                 prepareRow(row);
//                 const rowProps = row.getRowProps();
//                 return (
//                   <tr
//                     {...rowProps}
//                     {...row.getRowProps()}
//                     key={row.id}
//                     className=" border "
//                   >
//                     {row.cells.map((cell, cellIndex) => {
//                       return (
//                         <td
//                           {...cell.getCellProps()}
//                           key={cellIndex}
//                           className="pl-2 pr-5 border-b border-border-info-color pb-2"
//                         >
//                           {cell.render("Cell")}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination controls */}
//         <div className="flex flex-col md:flex-row justify-center gap-4 my-4 items-center md:button:px-4 md:button:py-2 button:px-2 button:py-1 button:rounded-lg">
//           <div className="flex justify-center items-center gap-4">
//             <button
//               className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
//                 pageIndex === 0 ? "bg-gray-500 hover:bg-gray-500" : ""
//               }`}
//               onClick={() => gotoPage(0)}
//               disabled={pageIndex === 0}
//             >
//               <MdSkipPrevious size={18} />
//             </button>
//             <button
//               onClick={() => previousPage()}
//               disabled={!canPreviousPage}
//               className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
//                 !canPreviousPage ? "bg-gray-500 hover:bg-gray-500" : ""
//               }`}
//             >
//               <FaCaretLeft size={18} />
//             </button>
//             <span className="text-slate-300">
//               Page{" "}
//               <strong>
//                 {pageIndex + 1} of {pageCount}
//               </strong>
//             </span>
//             <button
//               onClick={() => nextPage()}
//               disabled={!canNextPage}
//               className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
//                 !canNextPage ? "bg-gray-500 hover:bg-gray-500" : ""
//               }`}
//             >
//               <FaCaretRight size={18} />
//             </button>
//             <button
//               className={`bg-[#00A3FF] hover:bg-color-danger text-white transition-all ${
//                 pageIndex === pageCount - 1
//                   ? "bg-gray-500 hover:bg-gray-500"
//                   : ""
//               }`}
//               onClick={() => gotoPage(pageCount - 1)}
//               disabled={pageIndex === pageCount - 1}
//             >
//               <MdSkipNext size={18} />
//             </button>
//           </div>

//           <select
//             className="outline-none hidden md:block bg-theme-bg2 rounded-xl px-4 py-3 cursor-pointer border border-border-info-color focus:border-theme-color transition-all"
//             value={pageSize}
//             onChange={(e) => setPageSize(Number(e.target.value))}
//           >
//             {[8, 12, 16, 20, 24, 28, 32, 36, 40].map((size) => (
//               <option key={size} value={size}>
//                 Show {size}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AllAuctions;
