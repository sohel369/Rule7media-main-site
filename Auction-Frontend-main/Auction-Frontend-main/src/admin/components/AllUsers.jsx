import { RiUserAddFill } from "react-icons/ri";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import {
  FaUsers,
  FaShop,
  FaTruck,
  FaBullhorn,
  FaPaintRoller,
  FaCartPlus,
} from "react-icons/fa6";
import {
  FaCaretUp,
  FaCaretDown,
  FaCaretRight,
  FaCaretLeft,
  FaEye,
  FaRegEdit,
  FaGlobe,
  FaChartLine,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllUsers,
  deleteUserById,
  getTopSellers,
} from "../../store/user/userSlice";
import { useTable, useSortBy, usePagination, useFilters } from "react-table";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import worldData from "../../countries+states+cities.json";

// Lookup map for mapping ISO codes & alternate names to standard JSON country names
const countryLookup = new Map();
worldData.forEach((c) => {
  if (c.name) countryLookup.set(c.name.toLowerCase(), c.name);
  if (c.iso2) countryLookup.set(c.iso2.toLowerCase(), c.name);
  if (c.iso3) countryLookup.set(c.iso3.toLowerCase(), c.name);
});

const normalizeCountry = (val) => {
  if (!val) return "";
  let countryStr = "";
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") {
        countryStr = parsed.name || parsed.label || parsed.country || val;
      } else {
        countryStr = val;
      }
    } catch (e) {
      countryStr = val;
    }
  } else if (typeof val === "object") {
    countryStr = val.name || val.label || val.country || "";
  } else {
    countryStr = String(val);
  }
  countryStr = countryStr.trim();
  const normalized = countryLookup.get(countryStr.toLowerCase());
  return normalized || countryStr;
};

const extractUserCountry = (user) => {
  if (!user || !user.country) return "Unknown";
  let raw = "";
  if (typeof user.country === "string") {
    try {
      const parsed = JSON.parse(user.country);
      if (parsed && typeof parsed === "object") {
        raw = parsed.name || parsed.label || parsed.country || user.country;
      } else {
        raw = user.country;
      }
    } catch (e) {
      raw = user.country;
    }
  } else if (typeof user.country === "object") {
    raw = user.country.name || user.country.label || user.country.country || "";
  } else {
    raw = String(user.country);
  }
  raw = raw.trim();
  if (!raw) return "Unknown";
  return normalizeCountry(raw) || raw;
};

const AllUsers = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterInput, setFilterInput] = useState(searchParams.get("q") || "");
  const [filterField, setFilterField] = useState(
    searchParams.get("field") || "firstName",
  );
  const [filteredUserType, setFilteredUserType] = useState(
    searchParams.get("type") || "all",
  );
  const [selectedCountry, setSelectedCountry] = useState(
    searchParams.get("country") || "all",
  );
  const [showCharts, setShowCharts] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const dispatch = useDispatch();
  const { allUser, topSellers, isLoading, isError, message } = useSelector(
    (state) => state.user,
  );

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getTopSellers());
  }, [dispatch]);

  // All countries loaded directly from countries+states+cities.json
  const allCountriesList = useMemo(() => {
    if (!Array.isArray(worldData)) return [];
    return worldData.map((c) => c.name).sort((a, b) => a.localeCompare(b));
  }, []);

  // Quick lookup for active user count per country
  const userCountsByCountry = useMemo(() => {
    const counts = {};
    if (Array.isArray(allUser?.data)) {
      allUser.data.forEach((u) => {
        const uCountry = extractUserCountry(u);
        const norm = normalizeCountry(uCountry) || uCountry;
        if (norm) {
          counts[norm.toLowerCase()] = (counts[norm.toLowerCase()] || 0) + 1;
        }
      });
    }
    return counts;
  }, [allUser]);

  const getAvailableYears = () => {
    if (!allUser?.data?.length) return [new Date().getFullYear()];

    const years = allUser.data
      .map((user) => {
        if (user.createdAt) {
          return new Date(user.createdAt).getFullYear();
        }
        return null;
      })
      .filter((year) => year !== null);

    const minYear = years.length ? Math.min(...years) : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let year = minYear; year <= currentYear; year++) {
      yearList.push(year);
    }
    return yearList;
  };

  const getMonthlyDataForYear = (year) => {
    const monthlyData = new Array(12).fill(0);
    allUser?.data?.forEach((user) => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const userYear = date.getFullYear();
        if (userYear === year) {
          const month = date.getMonth();
          monthlyData[month] = monthlyData[month] + 1;
        }
      }
    });
    return monthlyData;
  };

  const currentYearData = getMonthlyDataForYear(selectedYear);
  const availableYears = getAvailableYears();

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setIsDeleting(true);
        await dispatch(deleteUserById(id)).unwrap();
        await dispatch(getAllUsers());
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const userTypeLabels = {
    seller: "Ancillary Advertiser",
    fleetOwner: "Vehicle Owner or Fleet Manager",
    wrapper: "Vehicle Wrapping Business",
    advertiser: "Buyer or Marketing Executive",
  };

  const getUserTypeLabel = (type) => {
    return userTypeLabels[type] || type || "Unknown";
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Picture",
        accessor: "profilePicture",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ value }) => (
          <img
            src={value || "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg"}
            alt="Profile"
            style={{ width: "45px", height: "45px", borderRadius: "50%" }}
            className="object-cover border border-white/10"
          />
        ),
      },
      {
        Header: "Name",
        accessor: "firstName",
        Cell: ({ value, row }) => (
          <div>
            <div className="font-medium text-white">{value || "N/A"}</div>
            <div className="text-xs text-gray-400">
              {row.original.lastName || ""}
            </div>
          </div>
        ),
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => <div className="text-sm text-slate-300 truncate max-w-[200px]">{value || "N/A"}</div>,
      },
      {
        Header: "Country",
        accessor: "country",
        Cell: ({ value }) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-200">
            <span className="text-cyan-400">🌍</span>
            <span>{value || "Unknown"}</span>
          </span>
        ),
      },
      {
        Header: "Type",
        accessor: "userType",
        Cell: ({ value }) => (
          <span className="capitalize px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/60 border border-blue-700/50 text-blue-300">
            {getUserTypeLabel(value)}
          </span>
        ),
      },
      {
        Header: "Verified",
        accessor: "paymentVerified",
        Cell: ({ value }) => (
          <span
            className={`py-1 px-2.5 border rounded-lg text-xs font-medium ${
              value === "Unverified"
                ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        disableFilters: true,
        disableSortBy: true,
        Cell: ({ row: { original } }) => (
          <div className="flex gap-2 items-center">
            <Link
              to={`/admin/users/profile/${original.actions}`}
              className="inline-block"
            >
              <FaEye
                size={30}
                className="text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-500/40 p-1.5 transition-all cursor-pointer"
                title="View User"
              />
            </Link>
            <button
              onClick={() => handleDeleteUser(original.actions)}
              disabled={isDeleting}
              className="inline-block"
            >
              <MdDeleteForever
                size={30}
                className={`text-red-400 hover:text-white hover:bg-red-600 rounded-lg border border-red-500/40 p-1.5 transition-all ${
                  isDeleting
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                title="Delete User"
              />
            </button>
            <Link
              to={`/admin/users/edit/${original.actions}`}
              state={{
                from: `${location.pathname}${location.search}`,
              }}
              className="inline-block"
            >
              <FaRegEdit
                size={30}
                className="text-emerald-400 hover:text-white hover:bg-emerald-600 rounded-lg border border-emerald-500/40 p-1.5 transition-all cursor-pointer"
                title="Edit User"
              />
            </Link>
          </div>
        ),
      },
    ],
    [isDeleting, location.pathname, location.search],
  );

  const data = React.useMemo(() => {
    if (!Array.isArray(allUser?.data)) {
      return [];
    }

    let filteredData = allUser.data;

    // Filter by userType
    if (filteredUserType !== "all") {
      filteredData = filteredData.filter(
        (user) => user.userType === filteredUserType,
      );
    }

    // Filter by country (matching with raw or normalized world country name)
    if (selectedCountry !== "all") {
      filteredData = filteredData.filter((user) => {
        const uCountry = extractUserCountry(user);
        const normUser = normalizeCountry(uCountry);
        const normSelected = normalizeCountry(selectedCountry);
        return (
          uCountry.toLowerCase() === selectedCountry.toLowerCase() ||
          normUser.toLowerCase() === normSelected.toLowerCase() ||
          normUser.toLowerCase() === selectedCountry.toLowerCase()
        );
      });
    }

    return filteredData.map((user) => ({
      profilePicture: user.profilePicture || "https://res.cloudinary.com/dnsxaor2k/image/upload/v1721403078/r4s3ingo0ysqq5hzsqal.jpg",
      firstName: user.firstName || "N/A",
      lastName: user.lastName || user.lastname || "",
      email: user.email || "N/A",
      country: extractUserCountry(user),
      userType: user.userType || "N/A",
      paymentVerified: user.paymentVerified ? "Verified" : "Unverified",
      actions: user._id,
    }));
  }, [allUser, filteredUserType, selectedCountry]);

  const pageFromUrl = Number(searchParams.get("page")) || 0;
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
      initialState: {
        pageSize: 8,
        pageIndex: pageFromUrl,
      },
      autoResetPage: false,
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  const filterFieldLabels = {
    firstName: "Name",
    email: "Email",
    country: "Country",
    userType: "User Type",
    paymentVerified: "Verified",
  };

  const handleFilterChange = (e) => {
    const value = e.target.value || "";
    setFilter(filterField, value);
    setFilterInput(value);

    setSearchParams({
      q: value,
      field: filterField,
      type: filteredUserType,
      country: selectedCountry,
      page: pageIndex,
    });
  };

  const handleCountryFilter = (country) => {
    setSelectedCountry(country);
    gotoPage(0);
    setSearchParams({
      q: filterInput,
      field: filterField,
      type: filteredUserType,
      country: country,
      page: 0,
    });
  };

  const handleUserTypeFilter = (userType) => {
    setFilteredUserType(userType);
    gotoPage(0);
    setSearchParams({
      q: filterInput,
      field: filterField,
      type: userType,
      country: selectedCountry,
      page: 0,
    });
  };

  const handlePageChange = (newPage) => {
    gotoPage(newPage);
    setSearchParams({
      q: filterInput,
      field: filterField,
      type: filteredUserType,
      country: selectedCountry,
      page: newPage,
    });
  };

  const handleNextPage = () => {
    const newPage = pageIndex + 1;
    nextPage();
    setSearchParams({
      q: filterInput,
      field: filterField,
      type: filteredUserType,
      country: selectedCountry,
      page: newPage,
    });
  };

  const handlePreviousPage = () => {
    const newPage = pageIndex - 1;
    previousPage();
    setSearchParams({
      q: filterInput,
      field: filterField,
      type: filteredUserType,
      country: selectedCountry,
      page: newPage,
    });
  };

  const totalUsers = allUser?.data?.length || 0;
  const totalBuyers =
    allUser?.data?.filter((user) => user.userType === "buyer")?.length || 0;
  const totalVerifiedUsers =
    allUser?.data?.filter((user) => user.paymentVerified === true)?.length || 0;
  const totalSellers =
    allUser?.data?.filter((user) => user.userType === "seller")?.length || 0;
  const totalfleetOwner =
    allUser?.data?.filter((user) => user.userType === "fleetOwner")?.length || 0;
  const totalwrapper =
    allUser?.data?.filter((user) => user.userType === "wrapper")?.length || 0;
  const totaladvertiser =
    allUser?.data?.filter((user) => user.userType === "advertiser")?.length || 0;

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20 text-slate-300">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mr-3"></div>
        <span>Loading Users...</span>
      </div>
    );

  if (isError)
    return (
      <div className="text-red-400 bg-red-950/40 border border-red-800 rounded-2xl p-6 text-center my-8">
        Error: {message}
      </div>
    );

  return (
    <div className="px-3 sm:px-6 py-4 w-full bg-theme-bg text-slate-300 rounded-2xl border border-white/5">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-border-info-color pb-3">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <FaUsers className="text-blue-400" /> Users Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Managing {totalUsers} total registered users across {allCountriesList.length} countries
          </p>
        </div>

        <button
          onClick={() => setShowCharts(!showCharts)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            showCharts
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-theme-bg2 text-slate-300 border-border-info-color hover:text-white hover:border-slate-500"
          }`}
        >
          <FaChartLine size={14} />
          <span>{showCharts ? "Hide Analytics" : "Show Analytics"}</span>
        </button>
      </div>

      {/* User Type Horizontal Filter Ribbon */}
      <div className="mb-4 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => handleUserTypeFilter("all")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filteredUserType === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-theme-bg2 border border-border-info-color hover:border-theme-color text-slate-300"
            }`}
          >
            All Users ({totalUsers})
          </button>
          <button
            onClick={() => handleUserTypeFilter("seller")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filteredUserType === "seller"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-theme-bg2 border border-border-info-color hover:border-theme-color text-slate-300"
            }`}
          >
            Ancillary Advertiser ({totalSellers})
          </button>
          <button
            onClick={() => handleUserTypeFilter("fleetOwner")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filteredUserType === "fleetOwner"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-theme-bg2 border border-border-info-color hover:border-theme-color text-slate-300"
            }`}
          >
            Fleet Manager ({totalfleetOwner})
          </button>
          <button
            onClick={() => handleUserTypeFilter("wrapper")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filteredUserType === "wrapper"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-theme-bg2 border border-border-info-color hover:border-theme-color text-slate-300"
            }`}
          >
            Vehicle Wrapping ({totalwrapper})
          </button>
          <button
            onClick={() => handleUserTypeFilter("advertiser")}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              filteredUserType === "advertiser"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-theme-bg2 border border-border-info-color hover:border-theme-color text-slate-300"
            }`}
          >
            Marketing Executive ({totaladvertiser})
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="text-white grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-4">
        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-emerald-400 font-bold">{totalUsers}</div>
          <span className="text-xs text-slate-400 text-center mt-1">Total Users</span>
        </div>

        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-pink-400 font-bold">{totalSellers}</div>
          <span className="text-xs text-slate-400 text-center mt-1 truncate">Advertisers</span>
        </div>

        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-amber-400 font-bold">{totalfleetOwner}</div>
          <span className="text-xs text-slate-400 text-center mt-1 truncate">Fleet Owners</span>
        </div>

        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-purple-400 font-bold">{totaladvertiser}</div>
          <span className="text-xs text-slate-400 text-center mt-1 truncate">Executives</span>
        </div>

        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-cyan-400 font-bold">{totalwrapper}</div>
          <span className="text-xs text-slate-400 text-center mt-1 truncate">Wrappers</span>
        </div>

        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-blue-400 font-bold">
            {allUser?.data?.filter(
              (user) =>
                new Date(user.createdAt).getTime() >
                new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
            ).length || 0}
          </div>
          <span className="text-xs text-slate-400 text-center mt-1">New This Week</span>
        </div>

        <div className="flex flex-col justify-center items-center border rounded-xl bg-theme-bg2 border-border-info-color p-3">
          <div className="text-2xl text-green-400 font-bold">{totalVerifiedUsers}</div>
          <span className="text-xs text-slate-400 text-center mt-1">Verified</span>
        </div>
      </div>

      {/* Collapsible Charts Section */}
      {showCharts && (
        <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-slate-900/60 rounded-2xl border border-border-info-color animate-fadein">
          <div className="w-full lg:w-[35%] flex justify-center items-center bg-theme-bg2 border border-border-info-color rounded-xl p-4">
            <div className="w-full max-w-[280px]">
              <Doughnut
                data={{
                  labels: [
                    "Ancillary Advertiser",
                    "Fleet Owners",
                    "Buyer / Executives",
                    "Wrapping Business",
                  ],
                  datasets: [
                    {
                      data: [totalSellers, totalfleetOwner, totaladvertiser, totalwrapper],
                      backgroundColor: [
                        "rgb(244, 114, 182)",
                        "rgb(251, 191, 36)",
                        "rgb(192, 132, 252)",
                        "rgb(45, 212, 191)",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "bottom", labels: { color: "white", boxWidth: 12, font: { size: 10 } } },
                    title: { display: true, text: "User Base Distribution", color: "white" },
                  },
                }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center bg-theme-bg2 border border-border-info-color rounded-xl p-4">
            <div className="w-full">
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  datasets: [
                    {
                      label: `New Users in ${selectedYear}`,
                      data: currentYearData,
                      fill: true,
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      borderColor: "rgb(59, 130, 246)",
                      borderWidth: 2,
                      tension: 0.3,
                      pointBackgroundColor: "rgb(59, 130, 246)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1, color: "white", precision: 0 },
                      grid: { color: "rgba(255, 255, 255, 0.05)" },
                    },
                    x: {
                      ticks: { color: "white" },
                      grid: { color: "rgba(255, 255, 255, 0.05)" },
                    },
                  },
                  plugins: {
                    legend: { labels: { color: "white" } },
                  },
                }}
              />
              <div className="flex justify-end mt-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-theme-bg border border-border-info-color rounded-lg px-3 py-1 text-xs text-white outline-none"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-theme-bg2 p-3.5 rounded-2xl border border-border-info-color mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Country Dropdown Filter */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <FaGlobe className="text-cyan-400 flex-shrink-0" size={16} />
            <select
              className="w-full outline-none bg-theme-bg text-white rounded-xl px-3 py-2.5 text-xs font-medium border border-border-info-color focus:border-cyan-400 transition-all cursor-pointer"
              value={selectedCountry}
              onChange={(e) => handleCountryFilter(e.target.value)}
            >
              <option value="all">🌍 All Countries ({allCountriesList.length} Countries)</option>
              {allCountriesList.map((c) => {
                const count = userCountsByCountry[c.toLowerCase()] || 0;
                return (
                  <option key={c} value={c}>
                    {c} {count > 0 ? `(${count} users)` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Field Selector */}
          <div className="lg:col-span-3">
            <select
              className="w-full outline-none bg-theme-bg text-white rounded-xl px-3 py-2.5 text-xs font-medium border border-border-info-color focus:border-blue-500 transition-all cursor-pointer"
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              <option value="firstName">Search by Name</option>
              <option value="email">Search by Email</option>
              <option value="country">Search by Country</option>
              <option value="userType">Search by User Type</option>
              <option value="paymentVerified">Search by Verified Status</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="lg:col-span-5">
            <input
              className="w-full outline-none bg-theme-bg text-white rounded-xl px-4 py-2.5 text-xs border border-border-info-color focus:border-blue-500 transition-all placeholder:text-slate-500"
              value={filterInput}
              onChange={handleFilterChange}
              placeholder={`Search users by ${filterFieldLabels[filterField] || filterField}...`}
            />
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(selectedCountry !== "all" || filteredUserType !== "all" || filterInput) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-white/5 text-xs">
            <span className="text-slate-400 font-medium">Active Filters:</span>
            {selectedCountry !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300 font-medium">
                Country: {selectedCountry}
                <button
                  onClick={() => handleCountryFilter("all")}
                  className="hover:text-white font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {filteredUserType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-950 border border-blue-800 text-blue-300 font-medium">
                Type: {getUserTypeLabel(filteredUserType)}
                <button
                  onClick={() => handleUserTypeFilter("all")}
                  className="hover:text-white font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
            {filterInput && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                {filterFieldLabels[filterField]}: "{filterInput}"
                <button
                  onClick={() => {
                    setFilter(filterField, "");
                    setFilterInput("");
                    setSearchParams({
                      q: "",
                      field: filterField,
                      type: filteredUserType,
                      country: selectedCountry,
                      page: pageIndex,
                    });
                  }}
                  className="hover:text-white font-bold ml-1"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCountry("all");
                setFilteredUserType("all");
                setFilterInput("");
                setFilter(filterField, "");
                setSearchParams({});
              }}
              className="text-red-400 hover:underline ml-2"
            >
              Reset All
            </button>
            <span className="ml-auto text-slate-400">
              Showing <strong className="text-white">{data.length}</strong> matching users
            </span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-border-info-color scrollbar-hide">
        <table
          {...getTableProps()}
          className="text-left w-full border-collapse min-w-[700px]"
        >
          <thead className="sticky top-0 bg-theme-bg border-b border-border-info-color">
            {headerGroups.map((headerGroup, headerGroupIndex) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                key={headerGroupIndex}
              >
                {headerGroup.headers.map((column, i) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={i}
                    className="p-3.5 text-left text-xs font-semibold text-slate-300 select-none hover:bg-theme-bg2 transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      {column.render("Header")}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FaCaretDown size={14} />
                          ) : (
                            <FaCaretUp size={14} />
                          )
                        ) : null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page && page.length > 0 ? (
              page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    key={i}
                    className="border-b border-white/5 hover:bg-theme-bg2/60 transition-all text-xs"
                  >
                    {row.cells.map((cell, j) => (
                      <td
                        className="p-3.5"
                        {...cell.getCellProps()}
                        key={`${i}-${j}`}
                      >
                        {cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-10 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaUsers size={32} className="text-slate-600" />
                    <p className="font-semibold text-slate-300">No users found matching your criteria</p>
                    <p className="text-xs text-slate-500">Try adjusting your country or user type filter</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-5 items-center">
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded-xl flex items-center justify-center transition-all ${
              pageIndex === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
            onClick={() => handlePageChange(0)}
            disabled={pageIndex === 0}
          >
            <MdSkipPrevious size={16} />
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
            className={`px-3 py-2 rounded-xl flex items-center justify-center transition-all ${
              !canPreviousPage
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
          >
            <FaCaretLeft size={16} />
          </button>
          <span className="text-slate-300 text-xs px-2">
            Page{" "}
            <strong className="text-white">
              {pageIndex + 1} of {pageCount || 1}
            </strong>
          </span>
          <button
            onClick={handleNextPage}
            disabled={!canNextPage}
            className={`px-3 py-2 rounded-xl flex items-center justify-center transition-all ${
              !canNextPage
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
          >
            <FaCaretRight size={16} />
          </button>
          <button
            className={`px-3 py-2 rounded-xl flex items-center justify-center transition-all ${
              pageIndex === pageCount - 1
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            }`}
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={pageIndex === pageCount - 1}
          >
            <MdSkipNext size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Rows per page:</span>
          <select
            className="outline-none bg-theme-bg2 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer border border-border-info-color focus:border-theme-color transition-all text-white"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[8, 15, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
