import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getContactInfo } from "../store/contact/contactSlice";
import { getgoogleapi } from "../store/googlemap/googlemapService";

// Project lat/lng to SVG coordinates
const projectToGlobe = (lat, lng, cx = 340, cy = 340, r = 240) => {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = ((lng - 10) * Math.PI) / 180;
  const x = cx + r * Math.cos(latRad) * Math.sin(lngRad);
  const y = cy - r * Math.sin(latRad);
  const z = Math.cos(latRad) * Math.cos(lngRad);
  return { cx: x, cy: y, visible: z > 0 };
};

// Comprehensive fallback coordinates for all countries (approximate)
const countryFallback = {
  usa: { lat: 37.0902, lng: -95.7129 },
  "united states": { lat: 37.0902, lng: -95.7129 },
  india: { lat: 20.5937, lng: 78.9629 },
  australia: { lat: -25.2744, lng: 133.7751 },
  uk: { lat: 55.3781, lng: -3.436 },
  "united kingdom": { lat: 55.3781, lng: -3.436 },
  uae: { lat: 23.4241, lng: 53.8478 },
  canada: { lat: 56.1304, lng: -106.3468 },
  germany: { lat: 51.1657, lng: 10.4515 },
  france: { lat: 46.6034, lng: 1.8883 },
  japan: { lat: 36.2048, lng: 138.2529 },
  china: { lat: 35.8617, lng: 104.1954 },
  brazil: { lat: -14.235, lng: -51.9253 },
  "south africa": { lat: -30.5595, lng: 22.9375 },
  russia: { lat: 61.524, lng: 105.3188 },
  mexico: { lat: 23.6345, lng: -102.5528 },
  indonesia: { lat: -0.7893, lng: 113.9213 },
  pakistan: { lat: 30.3753, lng: 69.3451 },
  nigeria: { lat: 9.082, lng: 8.6753 },
  bangladesh: { lat: 23.685, lng: 90.3563 },
  turkey: { lat: 38.9637, lng: 35.2433 },
  italy: { lat: 41.8719, lng: 12.5674 },
  spain: { lat: 40.4637, lng: -3.7492 },
  "south korea": { lat: 35.9078, lng: 127.7669 },
  netherlands: { lat: 52.1326, lng: 5.2913 },
  sweden: { lat: 60.1282, lng: 18.6435 },
  norway: { lat: 60.472, lng: 8.4689 },
  poland: { lat: 51.9194, lng: 19.1451 },
  argentina: { lat: -38.4161, lng: -63.6167 },
  egypt: { lat: 26.8206, lng: 30.8025 },
  "saudi arabia": { lat: 23.8859, lng: 45.0792 },
  thailand: { lat: 15.87, lng: 100.9925 },
  vietnam: { lat: 14.0583, lng: 108.2772 },
  malaysia: { lat: 4.2105, lng: 101.9758 },
  philippines: { lat: 12.8797, lng: 121.774 },
  kenya: { lat: -1.2864, lng: 36.8172 },
  "new zealand": { lat: -40.9006, lng: 174.886 },
  ireland: { lat: 53.4129, lng: -8.2439 },
  portugal: { lat: 39.3999, lng: -8.2245 },
  greece: { lat: 39.0742, lng: 21.8243 },
  israel: { lat: 31.0461, lng: 34.8516 },
  singapore: { lat: 1.3521, lng: 103.8198 },
};

// Load Google Maps script
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.Geocoder) {
      resolve();
      return;
    }
    if (document.getElementById("google-maps-script")) {
      const interval = setInterval(() => {
        if (window.google?.maps?.Geocoder) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps load failed"));
    document.head.appendChild(script);
  });
};

const GlobalHubsGlobe = () => {
  const dispatch = useDispatch();
  const { contact, isLoading: contactLoading } = useSelector(
    (state) => state.contactInfo,
  );
  const [pins, setPins] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contact || contact.length === 0) {
      dispatch(getContactInfo());
    }
  }, [dispatch, contact]);

  useEffect(() => {
    if (!contact?.length) return;

    const fetchAllCoords = async () => {
      try {
        setLoading(true);
        const apiData = await getgoogleapi();
        const apiKey = apiData?.key || apiData?.apiKey || apiData;

        let geocoder = null;
        if (apiKey) {
          await loadGoogleMapsScript(apiKey);
          geocoder = new window.google.maps.Geocoder();
        }

        const results = await Promise.all(
          contact.map(async (item) => {
            let coords = null;

            // Try geocoding if API key available
            if (geocoder) {
              const fullAddress = `${item.officeAddress}, ${item.country}`;
              coords = await geocodeWithRetry(geocoder, fullAddress);
              if (!coords)
                coords = await geocodeWithRetry(geocoder, item.country);
            }

            // Fallback to country mapping
            if (!coords) {
              const countryKey = item.country.toLowerCase();
              if (countryFallback[countryKey]) {
                coords = countryFallback[countryKey];
              } else {
                // Default to center of map (0,0) - will be hidden mostly
                coords = { lat: 0, lng: 0 };
              }
            }

            const projected = projectToGlobe(coords.lat, coords.lng);
            return {
              ...projected,
              label: item.country,
              address: item.officeAddress,
              email: item.email,
              phone: item.phone,
            };
          }),
        );
        setPins(results);
      } catch (err) {
        console.error("Globe error:", err);
        // Fallback: show all contacts at approximate positions using country mapping only
        const fallbackPins = contact.map((item) => {
          const countryKey = item.country.toLowerCase();
          const coords = countryFallback[countryKey] || { lat: 0, lng: 0 };
          const projected = projectToGlobe(coords.lat, coords.lng);
          return {
            ...projected,
            label: item.country,
            address: item.officeAddress,
          };
        });
        setPins(fallbackPins);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCoords();
  }, [contact]);

  const geocodeWithRetry = (geocoder, address, retries = 1) => {
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (res, status) => {
        if (status === "OK" && res?.[0]) {
          const lat = res[0].geometry.location.lat();
          const lng = res[0].geometry.location.lng();
          resolve({ lat, lng });
        } else {
          resolve(null);
        }
      });
    });
  };

  return (
    <svg
      viewBox="0 0 680 680"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <radialGradient id="globeGrad" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <clipPath id="globeClip">
          <circle cx="340" cy="340" r="240" />
        </clipPath>
      </defs>
      <circle
        cx="340"
        cy="340"
        r="240"
        fill="url(#globeGrad)"
        stroke="#1e3a5f"
        strokeWidth="1"
      />
      <g
        clipPath="url(#globeClip)"
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="0.6"
        opacity="0.6"
      >
        <ellipse cx="340" cy="340" rx="240" ry="60" />
        <ellipse cx="340" cy="340" rx="240" ry="120" />
        <ellipse cx="340" cy="340" rx="240" ry="185" />
        <line x1="340" y1="100" x2="340" y2="580" />
        <line x1="100" y1="340" x2="580" y2="340" />
        <line x1="175" y1="175" x2="505" y2="505" />
        <line x1="505" y1="175" x2="175" y2="505" />
      </g>
      <g clipPath="url(#globeClip)" fill="#1e3a5f" opacity="0.6">
        <path d="M195 285 Q225 265 265 272 Q305 258 340 268 Q375 255 400 270 Q418 278 420 295 Q422 315 405 328 Q385 342 355 337 Q330 348 305 340 Q278 350 255 340 Q228 342 210 325 Q195 312 195 285Z" />
        <path d="M138 335 Q158 318 180 325 Q202 313 220 322 Q235 313 242 322 Q247 332 240 342 Q228 352 210 347 Q192 355 175 348 Q158 355 147 347 Q138 352 138 340Z" />
        <path d="M388 375 Q410 362 435 368 Q460 358 475 368 Q490 362 494 377 Q496 392 485 403 Q470 412 450 408 Q432 415 415 408 Q398 415 390 405 Q383 395 388 375Z" />
        <path d="M280 415 Q302 400 325 407 Q345 397 362 405 Q378 397 384 410 Q388 424 378 435 Q362 445 342 440 Q322 448 305 440 Q286 447 278 435 Q273 424 280 415Z" />
        <path d="M510 252 Q535 242 555 248 Q572 242 578 255 Q580 268 570 277 Q555 283 538 278 Q522 284 513 274 Q506 264 510 252Z" />
      </g>
      {(loading || contactLoading) && (
        <text
          x="340"
          y="348"
          textAnchor="middle"
          fontSize="13"
          fill="#94a3b8"
          fontFamily="sans-serif"
        >
          Loading hubs...
        </text>
      )}
      {!loading && pins.length > 1 && (
        <g fill="none" stroke="#f43f5e" strokeWidth="0.4" opacity="0.15">
          {pins
            .filter((p) => p.visible)
            .map((pin, i) =>
              pins
                .filter((p) => p.visible)
                .slice(i + 1)
                .map((pin2, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={pin.cx}
                    y1={pin.cy}
                    x2={pin2.cx}
                    y2={pin2.cy}
                  />
                )),
            )}
        </g>
      )}
      {pins
        .filter((p) => p.visible)
        .map((pin, i) => (
          <g
            key={i}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <circle
              cx={pin.cx}
              cy={pin.cy}
              r="12"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="1"
              opacity={hovered === i ? 0.6 : 0.2}
            />
            <circle
              cx={pin.cx}
              cy={pin.cy}
              r="5"
              fill="#f43f5e"
              opacity={hovered === i ? 1 : 0.85}
            />
            {hovered === i && (
              <g>
                <rect
                  x={pin.cx + 12}
                  y={pin.cy - 50}
                  width={Math.max(
                    pin.address?.length * 6 + 16,
                    pin.label.length * 8 + 16,
                    120,
                  )}
                  height={pin.address ? 52 : 30}
                  rx="6"
                  fill="#0f172a"
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                  opacity="0.97"
                />
                <text
                  x={pin.cx + 20}
                  y={pin.cy - 32}
                  fontSize="11"
                  fill="#f87171"
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  {pin.label}
                </text>
                {pin.address && (
                  <text
                    x={pin.cx + 20}
                    y={pin.cy - 16}
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="sans-serif"
                  >
                    {pin.address.length > 30
                      ? pin.address.substring(0, 30) + "..."
                      : pin.address}
                  </text>
                )}
              </g>
            )}
          </g>
        ))}
      <circle
        cx="340"
        cy="340"
        r="240"
        fill="none"
        stroke="#1e40af"
        strokeWidth="1.2"
        opacity="0.35"
      />
    </svg>
  );
};

export default GlobalHubsGlobe;
