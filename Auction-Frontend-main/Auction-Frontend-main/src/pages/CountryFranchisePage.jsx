import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Globe, Maximize2, X, MapPin, ZoomIn, ZoomOut, Menu } from "lucide-react";
import FranchiseForm from "../components/FranchiseForm";
import FranchiseTopBar, { FranchiseMobileControls } from "../components/FranchiseTopBar";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Circle,
  InfoWindow,
} from "@react-google-maps/api";
import googlemapService from "../store/googlemap/googlemapService";
import {
  addFranchise,
  resetFranchise,
} from "../store/franchise/franchiseSlice";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

// Dark theme map styles
const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1d2c3d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ color: "#f43f5e" }],
    },
    {
      featureType: "administrative.province",
      elementType: "geometry.stroke",
      stylers: [{ color: "#f43f5e", visibility: "on", weight: 1.5 }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0e2531" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4e6d70" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2a4359" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  backgroundColor: "#02040a",
};

// Varying coverage percentages (12% to 27%) for each country
const countries = [
  {
    id: "us",
    name: "United States",
    code: "USA",
    coverage: "18%",
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
  },
  {
    id: "uk",
    name: "United Kingdom",
    code: "GBR",
    coverage: "22%",
    center: { lat: 54.5, lng: -3.5 },
    zoom: 5,
  },
  {
    id: "au",
    name: "Australia",
    code: "AUS",
    coverage: "15%",
    center: { lat: -25.2744, lng: 133.7751 },
    zoom: 4,
  },
  {
    id: "ca",
    name: "Canada",
    code: "CAN",
    coverage: "27%",
    center: { lat: 56.1304, lng: -106.3468 },
    zoom: 3,
  },
  {
    id: "cn",
    name: "China",
    code: "CHN",
    coverage: "24%",
    center: { lat: 35.8617, lng: 104.1954 },
    zoom: 4,
  },
  {
    id: "jp",
    name: "Japan",
    code: "JPN",
    coverage: "19%",
    center: { lat: 36.2048, lng: 138.2529 },
    zoom: 5,
  },
  {
    id: "de",
    name: "Germany",
    code: "DEU",
    coverage: "21%",
    center: { lat: 51.1657, lng: 10.4515 },
    zoom: 6,
  },
  {
    id: "fr",
    name: "France",
    code: "FRA",
    coverage: "17%",
    center: { lat: 46.6034, lng: 1.8883 },
    zoom: 5,
  },
  {
    id: "es",
    name: "Spain",
    code: "ESP",
    coverage: "14%",
    center: { lat: 40.4637, lng: -3.7492 },
    zoom: 5,
  },
  {
    id: "it",
    name: "Italy",
    code: "ITA",
    coverage: "16%",
    center: { lat: 41.8719, lng: 12.5674 },
    zoom: 6,
  },
  {
    id: "in",
    name: "India",
    code: "IND",
    coverage: "23%",
    center: { lat: 20.5937, lng: 78.9629 },
    zoom: 4,
  },
  {
    id: "id",
    name: "Indonesia",
    code: "IDN",
    coverage: "13%",
    center: { lat: -0.7893, lng: 113.9213 },
    zoom: 4,
  },
  {
    id: "vn",
    name: "Vietnam",
    code: "VNM",
    coverage: "12%",
    center: { lat: 14.0583, lng: 108.2772 },
    zoom: 5,
  },
  {
    id: "ph",
    name: "Philippines",
    code: "PHL",
    coverage: "20%",
    center: { lat: 12.8797, lng: 121.774 },
    zoom: 5,
  },
];

// Reserved territories with real coordinates
const reservedZones = {
  us: [
    {
      lat: 40.7128,
      lng: -74.006,
      name: "New York",
      radius: 50000,
      territory: "NYC Metro",
    },
    {
      lat: 34.0522,
      lng: -118.2437,
      name: "Los Angeles",
      radius: 60000,
      territory: "SoCal",
    },
    {
      lat: 41.8781,
      lng: -87.6298,
      name: "Chicago",
      radius: 45000,
      territory: "Great Lakes",
    },
  ],
  uk: [
    {
      lat: 51.5074,
      lng: -0.1278,
      name: "London",
      radius: 45000,
      territory: "Greater London",
    },
    {
      lat: 53.4808,
      lng: -2.2426,
      name: "Manchester",
      radius: 30000,
      territory: "North West",
    },
  ],
  au: [
    {
      lat: -33.8688,
      lng: 151.2093,
      name: "Sydney",
      radius: 50000,
      territory: "NSW",
    },
    {
      lat: -37.8136,
      lng: 144.9631,
      name: "Melbourne",
      radius: 45000,
      territory: "Victoria",
    },
  ],
  ca: [
    {
      lat: 43.6532,
      lng: -79.3832,
      name: "Toronto",
      radius: 45000,
      territory: "Ontario",
    },
    {
      lat: 45.5017,
      lng: -73.5673,
      name: "Montreal",
      radius: 35000,
      territory: "Quebec",
    },
  ],
  in: [
    {
      lat: 28.6139,
      lng: 77.209,
      name: "Delhi",
      radius: 50000,
      territory: "NCR",
    },
    {
      lat: 19.076,
      lng: 72.8777,
      name: "Mumbai",
      radius: 55000,
      territory: "Maharashtra",
    },
    {
      lat: 12.9716,
      lng: 77.5946,
      name: "Bangalore",
      radius: 40000,
      territory: "Karnataka",
    },
  ],
  jp: [
    {
      lat: 35.6762,
      lng: 139.6503,
      name: "Tokyo",
      radius: 50000,
      territory: "Kanto",
    },
    {
      lat: 34.6937,
      lng: 135.5023,
      name: "Osaka",
      radius: 35000,
      territory: "Kansai",
    },
  ],
  de: [
    {
      lat: 52.52,
      lng: 13.405,
      name: "Berlin",
      radius: 40000,
      territory: "Berlin",
    },
    {
      lat: 48.1351,
      lng: 11.582,
      name: "Munich",
      radius: 35000,
      territory: "Bavaria",
    },
  ],
  fr: [
    {
      lat: 48.8566,
      lng: 2.3522,
      name: "Paris",
      radius: 45000,
      territory: "Ile-de-France",
    },
    {
      lat: 45.764,
      lng: 4.8357,
      name: "Lyon",
      radius: 30000,
      territory: "Auvergne",
    },
  ],
  id: [
    {
      lat: -6.2088,
      lng: 106.8456,
      name: "Jakarta",
      radius: 45000,
      territory: "Java",
    },
    {
      lat: -7.2575,
      lng: 112.7521,
      name: "Surabaya",
      radius: 30000,
      territory: "East Java",
    },
  ],
  vn: [
    {
      lat: 21.0285,
      lng: 105.8542,
      name: "Hanoi",
      radius: 35000,
      territory: "Northern",
    },
    {
      lat: 10.8231,
      lng: 106.6297,
      name: "Ho Chi Minh",
      radius: 40000,
      territory: "Southern",
    },
  ],
  cn: [
    {
      lat: 39.9042,
      lng: 116.4074,
      name: "Beijing",
      radius: 55000,
      territory: "Jingjinji Metro",
    },
    {
      lat: 31.2304,
      lng: 121.4737,
      name: "Shanghai",
      radius: 50000,
      territory: "Yangtze Delta",
    },
    {
      lat: 23.1291,
      lng: 113.2644,
      name: "Guangzhou",
      radius: 45000,
      territory: "Greater Bay Area",
    },
  ],
  es: [
    {
      lat: 40.4168,
      lng: -3.7038,
      name: "Madrid",
      radius: 45000,
      territory: "Comunidad de Madrid",
    },
    {
      lat: 41.3851,
      lng: 2.1734,
      name: "Barcelona",
      radius: 40000,
      territory: "Catalonia",
    },
  ],
  it: [
    {
      lat: 41.9028,
      lng: 12.4964,
      name: "Rome",
      radius: 45000,
      territory: "Lazio",
    },
    {
      lat: 45.4642,
      lng: 9.19,
      name: "Milan",
      radius: 40000,
      territory: "Lombardy",
    },
  ],
};

// Card Map Component - Optimized with memo
const CardMap = React.memo(({ country, zones, isGoogleLoaded }) => {
  const mapRef = useRef(null);

  if (!isGoogleLoaded || typeof window === "undefined" || !window.google?.maps) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const circleSymbol = window.google?.maps?.SymbolPath?.CIRCLE || 0;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={country.center}
        zoom={country.zoom}
        options={{
          ...mapOptions,
          zoomControl: false,
          draggable: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          gestureHandling: "none",
          keyboardShortcuts: false,
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {zones?.slice(0, 3).map((zone, index) => (
          <React.Fragment key={index}>
            <Marker
              position={{ lat: zone.lat, lng: zone.lng }}
              icon={{
                path: circleSymbol,
                scale: 7,
                fillColor: "#FB7185",
                fillOpacity: 1,
                strokeColor: "#FFE4E6",
                strokeWeight: 2,
              }}
            />
            <Circle
              center={{ lat: zone.lat, lng: zone.lng }}
              radius={zone.radius || 40000}
              options={{
                fillColor: "#FB7185",
                fillOpacity: 0.25,
                strokeColor: "#FFE4E6",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          </React.Fragment>
        ))}
      </GoogleMap>

      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] to-transparent opacity-60 pointer-events-none"></div>

      <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
        <h3 className="text-2xl font-extrabold text-white">{country.name}</h3>
        <p className="text-rose-500 text-xs font-black tracking-widest uppercase">
          {country.code}
        </p>
      </div>
    </div>
  );
});

// Modal Map Component
const ModalMap = React.memo(({
  country,
  zones,
  mapZoom,
  selectedZone,
  setSelectedZone,
  isGoogleLoaded,
}) => {
  if (!isGoogleLoaded || typeof window === "undefined" || !window.google?.maps) {
    return (
      <div className="h-[500px] w-full bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const circleSymbol = window.google?.maps?.SymbolPath?.CIRCLE || 0;

  return (
    <div className="h-[300px] sm:h-[400px] md:h-[500px] w-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={country.center}
        zoom={mapZoom}
        options={mapOptions}
      >
        {zones?.map((zone, index) => (
          <React.Fragment key={index}>
            <Marker
              position={{ lat: zone.lat, lng: zone.lng }}
              icon={{
                path: circleSymbol,
                scale: 9,
                fillColor: "#FB7185",
                fillOpacity: 1,
                strokeColor: "#FFE4E6",
                strokeWeight: 2.5,
              }}
              onClick={() => setSelectedZone(zone)}
            />

            <Circle
              center={{ lat: zone.lat, lng: zone.lng }}
              radius={zone.radius || 40000}
              options={{
                fillColor: "#FB7185",
                fillOpacity: 0.3,
                strokeColor: "#FFE4E6",
                strokeOpacity: 0.9,
                strokeWeight: 2.5,
              }}
            />

            {selectedZone === zone && (
              <InfoWindow
                position={{ lat: zone.lat, lng: zone.lng }}
                onCloseClick={() => setSelectedZone(null)}
              >
                <div className="bg-slate-900 text-white p-3 rounded-lg border border-rose-500/30">
                  <h3 className="font-bold text-rose-500">{zone.name}</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {zone.territory}
                  </p>
                  <p className="text-xs text-rose-300 mt-2 font-semibold">
                    ★ Rose Gold Reserved Territory
                  </p>
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>

      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20 bg-black/80 backdrop-blur-sm px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></div>
            <span className="text-xs font-bold text-slate-300">
              Reserved Territory
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-rose-500/50 rounded-full"></div>
            <span className="text-xs font-bold text-slate-300">
              Zone Boundary
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 bg-black/80 backdrop-blur-sm px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-white/10">
        <div className="text-xs sm:text-sm">
          <span className="text-rose-500 font-bold">{zones?.length || 0}</span>
          <span className="text-slate-400 ml-1 sm:ml-2">Territories</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {country.coverage} reserved
        </div>
      </div>

      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 text-xs text-slate-600">
        © Google
      </div>
    </div>
  );
});

const CountryFranchisePage = () => {
  const dispatch = useDispatch();
  const [googleKey, setGoogleKey] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [apiCheckComplete, setApiCheckComplete] = useState(false);
  const { country: userCountry, isLoading: countryLoading } = useSelector(
    (state) => state.country,
  );
  const [enquiryForm, setEnquiryForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: userCountry || "",
    formType: "enquiry",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { loading, success, error, message } = useSelector(
    (state) => state.franchise,
  );
  const countryList = [
    "Australia",
    "Argentina",
    "Austria",
    "Bangladesh",
    "Belgium",
    "Brazil",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Czech Republic",
    "Denmark",
    "Egypt",
    "Finland",
    "France",
    "Germany",
    "Hungary",
    "India",
    "Indonesia",
    "Iran",
    "Ireland (Eire)",
    "Italy",
    "Japan",
    "Mexico",
    "Middle East",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Norway",
    "Pakistan",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Russia",
    "Other South America",
    "South Korea",
    "Spain",
    "Sweden",
    "Thailand",
    "Turkey",
    "United Kingdom",
    "USA",
    "Vietnam",
    "Ethiopia",
    "Tanzania",
    "South Africa",
    "Ukraine",
    "Venezuela",
    "Ecuador",
    "Bolivia",
    "DR Congo",
    "Kenya",
    "Sudan",
    "Algeria",
    "Morocco",
    "Mozambique",
    "Other Africa",
  ];

  useEffect(() => {
    if (userCountry) {
      setEnquiryForm((prev) => ({ ...prev, country: userCountry }));
    }
  }, [userCountry]);

  // Fetch API key with retry mechanism
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const fetchKey = async () => {
      try {
        const res = await googlemapService.getgoogleapi();
        let apiKey = null;
        if (res?.googleApiKey) {
          apiKey = res.googleApiKey;
        } else if (res?.key) {
          apiKey = res.key;
        } else if (res?.apiKey) {
          apiKey = res.apiKey;
        } else if (typeof res === "string") {
          apiKey = res;
        }

        if (apiKey) {
          setGoogleKey(apiKey);
          setMapError(null);
        } else {
          setMapError("No Google Maps API key found in server response");
        }
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchKey, 2000 * retryCount);
        } else {
          setMapError("Failed to load Google Maps API key from server");
        }
      } finally {
        setApiCheckComplete(true);
      }
    };

    fetchKey();
  }, []);

  useEffect(() => {
    if (success) {
      toast.success("Form submitted successfully!");

      setEnquiryForm({
        firstName: "",
        lastName: "",
        email: "",
        country: userCountry || "",
        formType: "enquiry",
      });
      setIsModalOpen(false);
      dispatch(resetFranchise());
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch, userCountry]);

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    dispatch(addFranchise(enquiryForm));
  };

  const handleEnquiryChange = (e) => {
    setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value });
  };

  const handleScriptLoad = useCallback(() => {
    setIsScriptLoaded(true);
    setMapsLoaded(true);
    setMapError(null);
  }, []);

  const handleScriptError = useCallback((error) => {
    let errorMessage = "Failed to load Google Maps. ";
    if (error?.includes("ApiProjectMapError")) {
      errorMessage =
        "Google Maps API key is invalid or not authorized. Please check:\n" +
        "1. Billing is enabled in Google Cloud Console\n" +
        "2. Maps JavaScript API is enabled\n" +
        "3. API key has no restrictions or correct restrictions are set\n" +
        "4. You have not exceeded your daily quota";
    } else if (error?.includes("InvalidKeyMapError")) {
      errorMessage =
        "Invalid Google Maps API key. Please check your key in Google Cloud Console.";
    } else if (error?.includes("RefererDeniedMapError")) {
      errorMessage =
        "API key is restricted. Please add your domain to the allowed referrers in Google Cloud Console.";
    } else {
      errorMessage += error || "Please check your API key configuration.";
    }
    setMapError(errorMessage);
  }, []);

  // Function to calculate sold count based on coverage percentage
  const getSoldCount = useCallback((coveragePercent) => {
    const totalTerritories = 120;
    return Math.round((parseFloat(coveragePercent) / 100) * totalTerritories);
  }, []);

  // Function to calculate remaining count
  const getRemainingCount = useCallback((coveragePercent) => {
    const totalTerritories = 120;
    const soldCount = getSoldCount(coveragePercent);
    return totalTerritories - soldCount;
  }, [getSoldCount]);

  if (!apiCheckComplete) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500 mx-auto mb-6"></div>
          <p className="text-slate-400 text-lg">Loading map configuration...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-2xl w-full">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-red-500 font-bold text-2xl mb-4 text-center">
            Google Maps Error
          </h3>
          <p className="text-slate-300 text-center mb-6 whitespace-pre-line">
            {mapError}
          </p>

          <div className="bg-black/50 rounded-xl p-6 mb-6">
            <h4 className="text-white font-bold mb-3">Quick Fix Guide:</h4>
            <ol className="text-slate-400 space-y-3 text-sm list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:underline"
                >
                  Google Cloud Console
                </a>
              </li>
              <li>Select your project</li>
              <li>Go to "APIs & Services" → "Library"</li>
              <li>Search for and enable "Maps JavaScript API"</li>
              <li>Go to "Billing" and ensure billing is enabled</li>
              <li>Go to "APIs & Services" → "Credentials"</li>
              <li>
                Edit your API key and remove restrictions temporarily for
                testing
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-rose-500 rounded-xl font-bold text-white hover:bg-rose-600 transition-colors"
            >
              Retry Connection
            </button>

            <a
              href="https://console.cloud.google.com/google/maps-apis/apis/maps-backend.googleapis.com/overview"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors text-center"
            >
              Open Google Cloud Console
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      {/* Country & Language Top Bar */}
      <FranchiseTopBar />

      {/* Navigation */}
      <nav className="fixed w-[94%] sm:w-full z-[100] top-14 sm:top-16 left-1/2 -translate-x-1/2 max-w-6xl mx-auto">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg shadow-rose-900/20">
                R7
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-200 uppercase">
                RULE 7 MEDIA
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
            <Link to="/businessmodel" className="hover:text-rose-500 transition-colors">
              Business Model
            </Link>
            <Link to="/franchise" className="hover:text-rose-500 transition-colors">
              Franchise
            </Link>
            <Link to="/franchise-faq" className="hover:text-rose-500 transition-colors">
              FAQ
            </Link>
            <Link to="/countries-franchise" className="text-rose-500 font-bold border-b-2 border-rose-500 pb-1">
              Territories
            </Link>
            <Link to="/firstmover" className="hover:text-rose-500 transition-colors">
              Success Stories
            </Link>
          </div>
          <div className="hidden md:block">
            <a href="#enquiry-form">
              <button className="bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-rose-500/25">
                Enquire Now
              </button>
            </a>
          </div>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden w-11 h-11 flex items-center justify-center text-white focus:outline-none bg-white/5 rounded-xl border border-white/10"
          >
            {!mobileMenu ? <Menu size={22} /> : <X size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[99] md:hidden pt-28 px-6 flex flex-col items-center justify-start overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenu(false);
          }}
        >
          <div className="w-full max-w-sm flex flex-col gap-3 text-center">
            <Link
              to="/businessmodel"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Business Model
            </Link>
            <Link
              to="/franchise"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Franchise
            </Link>
            <Link
              to="/franchise-faq"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              FAQ
            </Link>
            <Link
              to="/countries-franchise"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 font-bold transition-all text-base"
            >
              Territories
            </Link>
            <Link
              to="/firstmover"
              onClick={() => setMobileMenu(false)}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-rose-400 transition-all border border-white/5 text-base font-semibold"
            >
              Success Stories
            </Link>
            <a
              href="#enquiry-form"
              onClick={() => setMobileMenu(false)}
              className="bg-gradient-to-br from-rose-600 to-rose-900 w-full py-3.5 rounded-xl text-center text-white font-bold shadow-lg shadow-rose-900/30 mt-2 text-base block"
            >
              Enquire Now
            </a>

            {/* Mobile Region/Country Control */}
            <FranchiseMobileControls />
          </div>
        </div>
      )}

      {/* Header Section */}
      <section className="relative pt-44 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8">
            Global Expansion Phase II
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
            Global{" "}
            <span className="bg-gradient-to-r from-rose-300 via-rose-500 to-rose-600 bg-clip-text text-transparent">
              Territory
            </span>{" "}
            Registry
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Exclusive franchise rights for Rule 7 Media's decreasing-bid auction
            platform. Reserved regions are currently closed for new
            applications.
          </p>

          {/* Legend - updated to reflect varying coverage */}
          <div className="flex items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Reserved (12-27%)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-slate-600"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Map Grid */}
      <section className="pb-32 px-6">
        {googleKey ? (
          <LoadScript
            googleMapsApiKey={googleKey}
            onLoad={handleScriptLoad}
            onError={handleScriptError}
            loadingElement={
              <div className="w-full h-64 bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
              </div>
            }
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className="group bg-white/5 backdrop-blur-sm rounded-[32px] overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-500 flex flex-col"
                >
                  <div className="relative h-64 w-full overflow-hidden">
                    <CardMap
                      country={country}
                      zones={reservedZones[country.id] || []}
                      isGoogleLoaded={isScriptLoaded}
                    />
                  </div>

                  <div className="p-8 space-y-6 flex-grow">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 text-left">
                          Coverage Status
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-extrabold text-slate-200">
                            {country.coverage}
                          </span>
                          <span className="text-slate-500 text-sm font-semibold">
                            Reserved
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Globe className="w-8 h-8 text-slate-700" />
                      </div>
                    </div>

                    {/* Progress bar width based on coverage percentage */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"
                        style={{ width: country.coverage }}
                      />
                    </div>

                    <button
                      onClick={() => setSelectedCountry(country)}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      View Territory Map
                      <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Detailed Map */}
            {selectedCountry && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-3 md:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto my-auto"
                onClick={() => {
                  setSelectedCountry(null);
                  setSelectedZone(null);
                }}
              >
                <div
                  className="bg-[#0b0f19] max-w-6xl w-full rounded-2xl sm:rounded-3xl md:rounded-[40px] overflow-hidden border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] relative my-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="p-4 sm:p-7 border-b border-white/10 bg-slate-900/90">
                    <div className="flex justify-between items-start gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185] animate-pulse flex-shrink-0" />
                          <h2 className="text-lg sm:text-3xl font-extrabold text-white break-words">
                            {selectedCountry.name} Territory Map
                          </h2>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1 sm:mt-0.5">
                          Google Maps — Reserved zones in <span className="text-[#FB7185] font-semibold">Rose Gold</span>
                        </p>
                      </div>

                      {/* Controls & Close Button */}
                      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                        <button
                          onClick={() => setMapZoom((prev) => Math.min(prev + 1, 12))}
                          title="Zoom In"
                          className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-white/15 transition-colors flex-shrink-0"
                        >
                          <ZoomIn size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                          onClick={() => setMapZoom((prev) => Math.max(prev - 1, 4))}
                          title="Zoom Out"
                          className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center justify-center hover:bg-white/15 transition-colors flex-shrink-0"
                        >
                          <ZoomOut size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCountry(null);
                            setSelectedZone(null);
                          }}
                          title="Close Map"
                          className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-300 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-900/30 flex-shrink-0"
                        >
                          <X size={18} className="sm:w-[20px] sm:h-[20px]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Modal Map */}
                  <ModalMap
                    country={selectedCountry}
                    zones={reservedZones[selectedCountry.id] || []}
                    mapZoom={mapZoom}
                    selectedZone={selectedZone}
                    setSelectedZone={setSelectedZone}
                    isGoogleLoaded={isScriptLoaded}
                  />

                  <div className="p-4 sm:p-8 bg-black/40 flex flex-col gap-4 sm:gap-6 sm:items-center sm:justify-between">
                    <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                      <div className="bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-rose-500/30 flex-1 sm:flex-none text-center">
                        <span className="text-rose-500 font-bold mr-1 sm:mr-2">
                          {getSoldCount(selectedCountry.coverage)}
                        </span>
                        <span className="text-xs text-slate-400 uppercase font-bold">
                          Sold*
                        </span>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-slate-700 flex-1 sm:flex-none text-center">
                        <span className="text-white font-bold mr-1 sm:mr-2">
                          {getRemainingCount(selectedCountry.coverage)}
                        </span>
                        <span className="text-xs text-slate-400 uppercase font-bold">
                          Remaining
                        </span>
                      </div>
                    </div>
                    <Link to="/franchise" className="w-full sm:w-auto">
                      <button className="w-full px-6 sm:px-8 py-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg sm:rounded-xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all text-sm sm:text-base">
                        Request Full Prospectus
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </LoadScript>
        ) : (
          <div className="w-full h-64 bg-slate-900/50 flex items-center justify-center rounded-3xl border border-white/5">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        )}
      </section>

      <section id="enquiry-form" className="py-24 bg-[#050608]/50">
        <div className="max-w-2xl mx-auto px-6">
          <FranchiseForm />
        </div>
      </section>

      {/* Footer with asterisk footnote */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded flex items-center justify-center font-bold text-white">
                R7
              </div>
              <span className="font-bold text-slate-200 uppercase tracking-tighter">
                RULE 7 MEDIA
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold text-slate-600">
                © 2026 RULE 7 MEDIA GLOBAL FRANCHISING. ALL RIGHTS RESERVED.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                * Sold or reserved for Corporate Development
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CountryFranchisePage;









// import React, { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { Globe, Maximize2, X, MapPin, ZoomIn, ZoomOut } from "lucide-react";
// import FranchiseForm from "../components/FranchiseForm";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   Circle,
//   InfoWindow,
// } from "@react-google-maps/api";
// import googlemapService from "../store/googlemap/googlemapService";
// import {
//   addFranchise,
//   resetFranchise,
// } from "../store/franchise/franchiseSlice";

// const mapContainerStyle = {
//   width: "100%",
//   height: "100%",
// };

// // Dark theme map styles
// const mapOptions = {
//   styles: [
//     { elementType: "geometry", stylers: [{ color: "#1d2c3d" }] },
//     { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
//     { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
//     {
//       featureType: "administrative.country",
//       elementType: "geometry.stroke",
//       stylers: [{ color: "#f43f5e" }],
//     },
//     {
//       featureType: "administrative.province",
//       elementType: "geometry.stroke",
//       stylers: [{ color: "#f43f5e", visibility: "on", weight: 1.5 }],
//     },
//     {
//       featureType: "water",
//       elementType: "geometry",
//       stylers: [{ color: "#0e2531" }],
//     },
//     {
//       featureType: "water",
//       elementType: "labels.text.fill",
//       stylers: [{ color: "#4e6d70" }],
//     },
//     {
//       featureType: "road",
//       elementType: "geometry",
//       stylers: [{ color: "#2a4359" }],
//     },
//     {
//       featureType: "road",
//       elementType: "labels.text.fill",
//       stylers: [{ color: "#9ca5b3" }],
//     },
//   ],
//   disableDefaultUI: true,
//   zoomControl: false,
//   mapTypeControl: false,
//   streetViewControl: false,
//   fullscreenControl: false,
//   backgroundColor: "#02040a",
// };

// // Varying coverage percentages (12% to 27%) for each country
// const countries = [
//   {
//     id: "us",
//     name: "United States",
//     code: "USA",
//     coverage: "18%",
//     center: { lat: 39.8283, lng: -98.5795 },
//     zoom: 4,
//   },
//   {
//     id: "uk",
//     name: "United Kingdom",
//     code: "GBR",
//     coverage: "22%",
//     center: { lat: 54.5, lng: -3.5 },
//     zoom: 5,
//   },
//   {
//     id: "au",
//     name: "Australia",
//     code: "AUS",
//     coverage: "15%",
//     center: { lat: -25.2744, lng: 133.7751 },
//     zoom: 4,
//   },
//   {
//     id: "ca",
//     name: "Canada",
//     code: "CAN",
//     coverage: "27%",
//     center: { lat: 56.1304, lng: -106.3468 },
//     zoom: 3,
//   },
//   {
//     id: "cn",
//     name: "China",
//     code: "CHN",
//     coverage: "24%",
//     center: { lat: 35.8617, lng: 104.1954 },
//     zoom: 4,
//   },
//   {
//     id: "jp",
//     name: "Japan",
//     code: "JPN",
//     coverage: "19%",
//     center: { lat: 36.2048, lng: 138.2529 },
//     zoom: 5,
//   },
//   {
//     id: "de",
//     name: "Germany",
//     code: "DEU",
//     coverage: "21%",
//     center: { lat: 51.1657, lng: 10.4515 },
//     zoom: 6,
//   },
//   {
//     id: "fr",
//     name: "France",
//     code: "FRA",
//     coverage: "17%",
//     center: { lat: 46.6034, lng: 1.8883 },
//     zoom: 5,
//   },
//   {
//     id: "es",
//     name: "Spain",
//     code: "ESP",
//     coverage: "14%",
//     center: { lat: 40.4637, lng: -3.7492 },
//     zoom: 5,
//   },
//   {
//     id: "it",
//     name: "Italy",
//     code: "ITA",
//     coverage: "16%",
//     center: { lat: 41.8719, lng: 12.5674 },
//     zoom: 6,
//   },
//   {
//     id: "in",
//     name: "India",
//     code: "IND",
//     coverage: "23%",
//     center: { lat: 20.5937, lng: 78.9629 },
//     zoom: 4,
//   },
//   {
//     id: "id",
//     name: "Indonesia",
//     code: "IDN",
//     coverage: "13%",
//     center: { lat: -0.7893, lng: 113.9213 },
//     zoom: 4,
//   },
//   {
//     id: "vn",
//     name: "Vietnam",
//     code: "VNM",
//     coverage: "12%",
//     center: { lat: 14.0583, lng: 108.2772 },
//     zoom: 5,
//   },
//   {
//     id: "ph",
//     name: "Philippines",
//     code: "PHL",
//     coverage: "20%",
//     center: { lat: 12.8797, lng: 121.774 },
//     zoom: 5,
//   },
// ];

// // Reserved territories with real coordinates
// const reservedZones = {
//   us: [
//     {
//       lat: 40.7128,
//       lng: -74.006,
//       name: "New York",
//       radius: 50000,
//       territory: "NYC Metro",
//     },
//     {
//       lat: 34.0522,
//       lng: -118.2437,
//       name: "Los Angeles",
//       radius: 60000,
//       territory: "SoCal",
//     },
//     {
//       lat: 41.8781,
//       lng: -87.6298,
//       name: "Chicago",
//       radius: 45000,
//       territory: "Great Lakes",
//     },
//   ],
//   uk: [
//     {
//       lat: 51.5074,
//       lng: -0.1278,
//       name: "London",
//       radius: 45000,
//       territory: "Greater London",
//     },
//     {
//       lat: 53.4808,
//       lng: -2.2426,
//       name: "Manchester",
//       radius: 30000,
//       territory: "North West",
//     },
//   ],
//   au: [
//     {
//       lat: -33.8688,
//       lng: 151.2093,
//       name: "Sydney",
//       radius: 50000,
//       territory: "NSW",
//     },
//     {
//       lat: -37.8136,
//       lng: 144.9631,
//       name: "Melbourne",
//       radius: 45000,
//       territory: "Victoria",
//     },
//   ],
//   ca: [
//     {
//       lat: 43.6532,
//       lng: -79.3832,
//       name: "Toronto",
//       radius: 45000,
//       territory: "Ontario",
//     },
//     {
//       lat: 45.5017,
//       lng: -73.5673,
//       name: "Montreal",
//       radius: 35000,
//       territory: "Quebec",
//     },
//   ],
//   in: [
//     {
//       lat: 28.6139,
//       lng: 77.209,
//       name: "Delhi",
//       radius: 50000,
//       territory: "NCR",
//     },
//     {
//       lat: 19.076,
//       lng: 72.8777,
//       name: "Mumbai",
//       radius: 55000,
//       territory: "Maharashtra",
//     },
//     {
//       lat: 12.9716,
//       lng: 77.5946,
//       name: "Bangalore",
//       radius: 40000,
//       territory: "Karnataka",
//     },
//   ],
//   jp: [
//     {
//       lat: 35.6762,
//       lng: 139.6503,
//       name: "Tokyo",
//       radius: 50000,
//       territory: "Kanto",
//     },
//     {
//       lat: 34.6937,
//       lng: 135.5023,
//       name: "Osaka",
//       radius: 35000,
//       territory: "Kansai",
//     },
//   ],
//   de: [
//     {
//       lat: 52.52,
//       lng: 13.405,
//       name: "Berlin",
//       radius: 40000,
//       territory: "Berlin",
//     },
//     {
//       lat: 48.1351,
//       lng: 11.582,
//       name: "Munich",
//       radius: 35000,
//       territory: "Bavaria",
//     },
//   ],
//   fr: [
//     {
//       lat: 48.8566,
//       lng: 2.3522,
//       name: "Paris",
//       radius: 45000,
//       territory: "Ile-de-France",
//     },
//     {
//       lat: 45.764,
//       lng: 4.8357,
//       name: "Lyon",
//       radius: 30000,
//       territory: "Auvergne",
//     },
//   ],
//   id: [
//     {
//       lat: -6.2088,
//       lng: 106.8456,
//       name: "Jakarta",
//       radius: 45000,
//       territory: "Java",
//     },
//     {
//       lat: -7.2575,
//       lng: 112.7521,
//       name: "Surabaya",
//       radius: 30000,
//       territory: "East Java",
//     },
//   ],
//   vn: [
//     {
//       lat: 21.0285,
//       lng: 105.8542,
//       name: "Hanoi",
//       radius: 35000,
//       territory: "Northern",
//     },
//     {
//       lat: 10.8231,
//       lng: 106.6297,
//       name: "Ho Chi Minh",
//       radius: 40000,
//       territory: "Southern",
//     },
//   ],
//   ph: [
//     {
//       lat: 14.5995,
//       lng: 120.9842,
//       name: "Manila",
//       radius: 45000,
//       territory: "Metro Manila",
//     },
//     {
//       lat: 10.3157,
//       lng: 123.8854,
//       name: "Cebu",
//       radius: 30000,
//       territory: "Visayas",
//     },
//   ],
// };

// // Card Map Component
// const CardMap = ({ country, zones, isGoogleLoaded }) => {
//   const mapRef = useRef(null);

//   if (!isGoogleLoaded) {
//     return (
//       <div className="w-full h-full bg-slate-900 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-full">
//       <GoogleMap
//         mapContainerStyle={{ width: "100%", height: "100%" }}
//         center={country.center}
//         zoom={country.zoom}
//         options={{
//           ...mapOptions,
//           zoomControl: false,
//           draggable: false,
//           scrollwheel: false,
//           disableDoubleClickZoom: true,
//           gestureHandling: "none",
//           keyboardShortcuts: false,
//         }}
//         onLoad={(map) => {
//           mapRef.current = map;
//         }}
//       >
//         {zones?.slice(0, 3).map((zone, index) => (
//           <React.Fragment key={index}>
//             <Marker
//               position={{ lat: zone.lat, lng: zone.lng }}
//               icon={{
//                 path: window.google?.maps?.SymbolPath?.CIRCLE,
//                 scale: 6,
//                 fillColor: "#f43f5e",
//                 fillOpacity: 1,
//                 strokeColor: "#ffffff",
//                 strokeWeight: 1.5,
//               }}
//             />
//             <Circle
//               center={{ lat: zone.lat, lng: zone.lng }}
//               radius={zone.radius}
//               options={{
//                 fillColor: "#f43f5e",
//                 fillOpacity: 0.1,
//                 strokeColor: "#f43f5e",
//                 strokeOpacity: 0.3,
//                 strokeWeight: 1,
//               }}
//             />
//           </React.Fragment>
//         ))}
//       </GoogleMap>

//       <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] to-transparent opacity-60 pointer-events-none"></div>

//       <div className="absolute bottom-4 left-6 z-10 pointer-events-none">
//         <h3 className="text-2xl font-extrabold text-white">{country.name}</h3>
//         <p className="text-rose-500 text-xs font-black tracking-widest uppercase">
//           {country.code}
//         </p>
//       </div>
//     </div>
//   );
// };

// // Modal Map Component - Separate component to handle its own map instance
// const ModalMap = ({
//   country,
//   zones,
//   googleKey,
//   mapZoom,
//   selectedZone,
//   setSelectedZone,
// }) => {
//   const [modalScriptLoaded, setModalScriptLoaded] = useState(false);

//   if (!googleKey) {
//     return (
//       <div className="h-[500px] w-full bg-slate-900 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-[500px] w-full relative">
//       <LoadScript
//         googleMapsApiKey={googleKey}
//         onLoad={() => setModalScriptLoaded(true)}
//       >
//         {modalScriptLoaded ? (
//           <GoogleMap
//             mapContainerStyle={mapContainerStyle}
//             center={country.center}
//             zoom={mapZoom}
//             options={mapOptions}
//           >
//             {zones?.map((zone, index) => (
//               <React.Fragment key={index}>
//                 <Marker
//                   position={{ lat: zone.lat, lng: zone.lng }}
//                   icon={{
//                     path: window.google?.maps?.SymbolPath?.CIRCLE,
//                     scale: 8,
//                     fillColor: "#f43f5e",
//                     fillOpacity: 1,
//                     strokeColor: "#ffffff",
//                     strokeWeight: 2,
//                   }}
//                   onClick={() => setSelectedZone(zone)}
//                 />

//                 <Circle
//                   center={{ lat: zone.lat, lng: zone.lng }}
//                   radius={zone.radius}
//                   options={{
//                     fillColor: "#f43f5e",
//                     fillOpacity: 0.15,
//                     strokeColor: "#f43f5e",
//                     strokeOpacity: 0.5,
//                     strokeWeight: 2,
//                   }}
//                 />

//                 {selectedZone === zone && (
//                   <InfoWindow
//                     position={{ lat: zone.lat, lng: zone.lng }}
//                     onCloseClick={() => setSelectedZone(null)}
//                   >
//                     <div className="bg-slate-900 text-white p-3 rounded-lg border border-rose-500/30">
//                       <h3 className="font-bold text-rose-500">{zone.name}</h3>
//                       <p className="text-xs text-slate-300 mt-1">
//                         {zone.territory}
//                       </p>
//                       <p className="text-xs text-slate-400 mt-2">
//                         Reserved Territory
//                       </p>
//                     </div>
//                   </InfoWindow>
//                 )}
//               </React.Fragment>
//             ))}
//           </GoogleMap>
//         ) : (
//           <div className="h-full w-full bg-slate-900 flex items-center justify-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
//           </div>
//         )}
//       </LoadScript>

//       <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></div>
//             <span className="text-xs font-bold text-slate-300">
//               Reserved Territory
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 border-2 border-rose-500/50 rounded-full"></div>
//             <span className="text-xs font-bold text-slate-300">
//               Zone Boundary
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
//         <div className="text-sm">
//           <span className="text-rose-500 font-bold">{zones?.length || 0}</span>
//           <span className="text-slate-400 ml-2">Reserved Territories</span>
//         </div>
//         <div className="text-xs text-slate-500 mt-1">
//           {country.coverage} of land mass reserved
//         </div>
//       </div>

//       <div className="absolute bottom-4 right-4 z-20 text-xs text-slate-600">
//         Map data © Google
//       </div>
//     </div>
//   );
// };

// const CountryFranchisePage = () => {
//   const dispatch = useDispatch();
//   const [googleKey, setGoogleKey] = useState(null);
//   const [mapsLoaded, setMapsLoaded] = useState(false);
//   const [mapError, setMapError] = useState(null);
//   const [selectedCountry, setSelectedCountry] = useState(null);
//   const [mapZoom, setMapZoom] = useState(5);
//   const [selectedZone, setSelectedZone] = useState(null);
//   const [isScriptLoaded, setIsScriptLoaded] = useState(false);
//   const [apiCheckComplete, setApiCheckComplete] = useState(false);
//   const { country: userCountry, isLoading: countryLoading } = useSelector(
//     (state) => state.country,
//   );
//   const [enquiryForm, setEnquiryForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     country: userCountry || "",
//     formType: "enquiry",
//   });
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { loading, success, error, message } = useSelector(
//     (state) => state.franchise,
//   );
//   const countryList = [
//     "Australia",
//     "Argentina",
//     "Austria",
//     "Bangladesh",
//     "Belgium",
//     "Brazil",
//     "Canada",
//     "Chile",
//     "China",
//     "Colombia",
//     "Czech Republic",
//     "Denmark",
//     "Egypt",
//     "Finland",
//     "France",
//     "Germany",
//     "Hungary",
//     "India",
//     "Indonesia",
//     "Iran",
//     "Ireland (Eire)",
//     "Italy",
//     "Japan",
//     "Mexico",
//     "Middle East",
//     "Netherlands",
//     "New Zealand",
//     "Nigeria",
//     "Norway",
//     "Pakistan",
//     "Peru",
//     "Philippines",
//     "Poland",
//     "Portugal",
//     "Russia",
//     "Other South America",
//     "South Korea",
//     "Spain",
//     "Sweden",
//     "Thailand",
//     "Turkey",
//     "United Kingdom",
//     "USA",
//     "Vietnam",
//     "Ethiopia",
//     "Tanzania",
//     "South Africa",
//     "Ukraine",
//     "Venezuela",
//     "Ecuador",
//     "Bolivia",
//     "DR Congo",
//     "Kenya",
//     "Sudan",
//     "Algeria",
//     "Morocco",
//     "Mozambique",
//     "Other Africa",
//   ];

//   useEffect(() => {
//     if (userCountry) {
//       setEnquiryForm((prev) => ({ ...prev, country: userCountry }));
//     }
//   }, [userCountry]);

//   useEffect(() => {
//     const fetchKey = async () => {
//       try {
//         const res = await googlemapService.getgoogleapi();
//         let apiKey = null;
//         if (res?.googleApiKey) {
//           apiKey = res.googleApiKey;
//         } else if (res?.key) {
//           apiKey = res.key;
//         } else if (res?.apiKey) {
//           apiKey = res.apiKey;
//         } else if (typeof res === "string") {
//           apiKey = res;
//         }

//         if (apiKey) {
//           setGoogleKey(apiKey);
//         } else {
//           setMapError("No Google Maps API key found in server response");
//         }
//       } catch (err) {
//         setMapError("Failed to load Google Maps API key from server");
//       } finally {
//         setApiCheckComplete(true);
//       }
//     };

//     fetchKey();
//   }, []);

//   useEffect(() => {
//     if (success) {
//       toast.success("Form submitted successfully!");

//       setEnquiryForm({
//         firstName: "",
//         lastName: "",
//         email: "",
//         country: userCountry || "",
//         formType: "enquiry",
//       });
//       setIsModalOpen(false);
//       dispatch(resetFranchise());
//     }
//     if (error) {
//       toast.error(error);
//     }
//   }, [success, error, dispatch, userCountry]);

//   const handleEnquirySubmit = (e) => {
//     e.preventDefault();
//     dispatch(addFranchise(enquiryForm));
//   };

//   const handleEnquiryChange = (e) => {
//     setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value });
//   };

//   const handleScriptLoad = () => {
//     setIsScriptLoaded(true);
//     setMapsLoaded(true);
//     setMapError(null);
//   };

//   const handleScriptError = (error) => {
//     let errorMessage = "Failed to load Google Maps. ";
//     if (error?.includes("ApiProjectMapError")) {
//       errorMessage =
//         "Google Maps API key is invalid or not authorized. Please check:\n" +
//         "1. Billing is enabled in Google Cloud Console\n" +
//         "2. Maps JavaScript API is enabled\n" +
//         "3. API key has no restrictions or correct restrictions are set\n" +
//         "4. You have not exceeded your daily quota";
//     } else if (error?.includes("InvalidKeyMapError")) {
//       errorMessage =
//         "Invalid Google Maps API key. Please check your key in Google Cloud Console.";
//     } else if (error?.includes("RefererDeniedMapError")) {
//       errorMessage =
//         "API key is restricted. Please add your domain to the allowed referrers in Google Cloud Console.";
//     } else {
//       errorMessage += error || "Please check your API key configuration.";
//     }
//     setMapError(errorMessage);
//   };

//   // Function to calculate sold count based on coverage percentage
//   const getSoldCount = (coveragePercent) => {
//     const totalTerritories = 120; // Change this to your actual total
//     return Math.round((parseFloat(coveragePercent) / 100) * totalTerritories);
//   };

//   // Function to calculate remaining count
//   const getRemainingCount = (coveragePercent) => {
//     const totalTerritories = 120; // Change this to your actual total
//     const soldCount = getSoldCount(coveragePercent);
//     return totalTerritories - soldCount;
//   };

//   if (!apiCheckComplete) {
//     return (
//       <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500 mx-auto mb-6"></div>
//           <p className="text-slate-400 text-lg">Loading map configuration...</p>
//         </div>
//       </div>
//     );
//   }

//   if (mapError) {
//     return (
//       <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6">
//         <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-2xl w-full">
//           <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
//             <span className="text-3xl">⚠️</span>
//           </div>
//           <h3 className="text-red-500 font-bold text-2xl mb-4 text-center">
//             Google Maps Error
//           </h3>
//           <p className="text-slate-300 text-center mb-6 whitespace-pre-line">
//             {mapError}
//           </p>

//           <div className="bg-black/50 rounded-xl p-6 mb-6">
//             <h4 className="text-white font-bold mb-3">Quick Fix Guide:</h4>
//             <ol className="text-slate-400 space-y-3 text-sm list-decimal list-inside">
//               <li>
//                 Go to{" "}
//                 <a
//                   href="https://console.cloud.google.com"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-rose-500 hover:underline"
//                 >
//                   Google Cloud Console
//                 </a>
//               </li>
//               <li>Select your project</li>
//               <li>Go to "APIs & Services" → "Library"</li>
//               <li>Search for and enable "Maps JavaScript API"</li>
//               <li>Go to "Billing" and ensure billing is enabled</li>
//               <li>Go to "APIs & Services" → "Credentials"</li>
//               <li>
//                 Edit your API key and remove restrictions temporarily for
//                 testing
//               </li>
//             </ol>
//           </div>

//           <div className="flex flex-col gap-3">
//             <button
//               onClick={() => window.location.reload()}
//               className="w-full py-4 bg-rose-500 rounded-xl font-bold text-white hover:bg-rose-600 transition-colors"
//             >
//               Retry Connection
//             </button>

//             <a
//               href="https://console.cloud.google.com/google/maps-apis/apis/maps-backend.googleapis.com/overview"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-slate-300 hover:bg-white/10 transition-colors text-center"
//             >
//               Open Google Cloud Console
//             </a>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#02040a] text-white">
//       {/* Navigation */}
//       <nav className="fixed w-full z-50 top-4 left-1/2 -translate-x-1/2 max-w-6xl mx-auto">
//         <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl border border-white/10">
//           <div className="flex items-center gap-2">
//             <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center font-extrabold text-xl text-white shadow-lg">
//               R7
//             </div>
//             <span className="font-bold text-xl tracking-tight text-slate-200 uppercase">
//               RULE 7 MEDIA
//             </span>
//           </div>
//           <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-slate-400">
//             <a href="/" className="hover:text-rose-500 transition-colors">
//               Home
//             </a>
//             <a href="/franchise" className="text-rose-500 transition-colors">
//               Franchise
//             </a>
//             <Link
//               to={"/about-us"}
//               className="hover:text-rose-500 transition-colors"
//             >
//               Global Map
//             </Link>
//           </div>
//           <a href="#enquiry-form">
//             <button className="bg-gradient-to-br from-rose-500 to-rose-600 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-rose-500/25">
//               Enquire Now
//             </button>
//           </a>
//         </div>
//       </nav>

//       {/* Header Section */}
//       <section className="relative pt-44 pb-20 overflow-hidden">
//         <div className="container mx-auto px-6 relative z-10 text-center">
//           <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[10px] font-black tracking-[0.2em] uppercase mb-8">
//             Global Expansion Phase II
//           </span>
//           <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tighter">
//             Global{" "}
//             <span className="bg-gradient-to-r from-rose-300 via-rose-500 to-rose-600 bg-clip-text text-transparent">
//               Territory
//             </span>{" "}
//             Registry
//           </h1>
//           <p className="text-slate-400 max-w-2xl mx-auto text-lg">
//             Exclusive franchise rights for Rule 7 Media's decreasing-bid auction
//             platform. Reserved regions are currently closed for new
//             applications.
//           </p>

//           {/* Legend - updated to reflect varying coverage */}
//           <div className="flex items-center justify-center gap-8 mt-12">
//             <div className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
//               <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
//                 Reserved (12-27%)
//               </span>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="w-3 h-3 rounded-full bg-slate-600"></span>
//               <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
//                 Available
//               </span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Map Grid */}
//       <section className="pb-32 px-6">
//         {googleKey && (
//           <LoadScript
//             googleMapsApiKey={googleKey}
//             onLoad={handleScriptLoad}
//             onError={handleScriptError}
//             loadingElement={
//               <div className="w-full h-64 bg-slate-900 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
//               </div>
//             }
//           >
//             <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {countries.map((country) => (
//                 <div
//                   key={country.id}
//                   className="group bg-white/5 backdrop-blur-sm rounded-[32px] overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-500 flex flex-col"
//                 >
//                   <div className="relative h-64 w-full overflow-hidden">
//                     <CardMap
//                       country={country}
//                       zones={reservedZones[country.id] || []}
//                       isGoogleLoaded={isScriptLoaded}
//                     />
//                   </div>

//                   <div className="p-8 space-y-6 flex-grow">
//                     <div className="flex justify-between items-end">
//                       <div>
//                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 text-left">
//                           Coverage Status
//                         </div>
//                         <div className="flex items-baseline gap-2">
//                           <span className="text-3xl font-extrabold text-slate-200">
//                             {country.coverage}
//                           </span>
//                           <span className="text-slate-500 text-sm font-semibold">
//                             Reserved
//                           </span>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <Globe className="w-8 h-8 text-slate-700" />
//                       </div>
//                     </div>

//                     {/* Progress bar width based on coverage percentage */}
//                     <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"
//                         style={{ width: country.coverage }}
//                       />
//                     </div>

//                     <button
//                       onClick={() => setSelectedCountry(country)}
//                       className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 flex items-center justify-center gap-2 group"
//                     >
//                       View Territory Map
//                       <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </LoadScript>
//         )}
//       </section>

//       {/* Modal for Detailed Map */}
//       {selectedCountry && googleKey && (
//         <div
//           className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
//           onClick={() => {
//             setSelectedCountry(null);
//             setSelectedZone(null);
//           }}
//         >
//           <div
//             className="bg-white/5 backdrop-blur-md max-w-6xl w-full rounded-[40px] overflow-hidden border border-white/10 relative"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="p-8 border-b border-white/5 flex justify-between items-center">
//               <div>
//                 <h2 className="text-3xl font-extrabold text-white">
//                   {selectedCountry.name} Territory Map
//                 </h2>
//                 <p className="text-slate-400 text-sm">
//                   Google Maps - Reserved zones shown in rose gold
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setMapZoom((prev) => Math.min(prev + 1, 12))}
//                   className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-rose-500/20 transition-colors"
//                 >
//                   <ZoomIn className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => setMapZoom((prev) => Math.max(prev - 1, 4))}
//                   className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-rose-500/20 transition-colors"
//                 >
//                   <ZoomOut className="w-5 h-5" />
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedCountry(null);
//                     setSelectedZone(null);
//                   }}
//                   className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-rose-500/20 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Use the separate ModalMap component */}
//             <ModalMap
//               country={selectedCountry}
//               zones={reservedZones[selectedCountry.id] || []}
//               googleKey={googleKey}
//               mapZoom={mapZoom}
//               selectedZone={selectedZone}
//               setSelectedZone={setSelectedZone}
//             />

//             <div className="p-8 bg-black/40 flex flex-col md:flex-row gap-6 items-center justify-between">
//               <div className="flex gap-4">
//                 <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-rose-500/30">
//                   <span className="text-rose-500 font-bold mr-2">
//                     {getSoldCount(selectedCountry.coverage)}
//                   </span>
//                   <span className="text-xs text-slate-400 uppercase font-bold">
//                     Sold*
//                   </span>
//                 </div>
//                 <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700">
//                   <span className="text-white font-bold mr-2">
//                     {getRemainingCount(selectedCountry.coverage)}
//                   </span>
//                   <span className="text-xs text-slate-400 uppercase font-bold">
//                     Remaining
//                   </span>
//                 </div>
//               </div>
//               <Link to="/franchise">
//                 <button className="w-full md:w-auto px-8 py-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl font-bold text-white shadow-lg hover:shadow-rose-500/25 transition-all">
//                   Request Full Prospectus
//                 </button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}

//       <section id="enquiry-form" className="py-24 bg-[#050608]/50">
//         <div className="max-w-2xl mx-auto px-6">
//           <FranchiseForm />
//         </div>
//       </section>

//       {/* Footer with asterisk footnote */}
//       <footer className="py-20 border-t border-white/5 bg-black">
//         <div className="container mx-auto px-6">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-10">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded flex items-center justify-center font-bold text-white">
//                 R7
//               </div>
//               <span className="font-bold text-slate-200 uppercase tracking-tighter">
//                 RULE 7 MEDIA
//               </span>
//             </div>
//             <div className="text-center md:text-right">
//               <p className="text-xs font-bold text-slate-600">
//                 © 2026 RULE 7 MEDIA GLOBAL FRANCHISING. ALL RIGHTS RESERVED.
//               </p>
//               <p className="text-xs text-slate-500 mt-2">
//                 * Sold or reserved for Corporate Development
//               </p>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default CountryFranchisePage;
