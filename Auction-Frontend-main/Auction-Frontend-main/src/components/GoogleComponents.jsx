import React, { useRef, useState, useEffect, useMemo } from "react";
import googlemapService from "../store/googlemap/googlemapService";

// ─────────────────────────────────────────────────────────────
// Global singleton state — SHARED across every map instance
// ─────────────────────────────────────────────────────────────
let googleMapsPromise = null; // ensures script is loaded only ONCE, ever
let geocodeQueue = Promise.resolve(); // ensures geocode calls run ONE at a time

/**
 * Loads the Google Maps JS API exactly once, no matter how many
 * GoogleMapComponent instances mount at the same time.
 */
const loadGoogleMapsAPI = () => {
  // Already loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  // Already in progress (or already resolved) — reuse the SAME promise
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    googlemapService
      .getgoogleapi()
      .then(({ key, libraries = "places,geometry" }) => {
        if (!key) {
          console.error("❌ [Google Maps] API key is missing or empty");
          googleMapsPromise = null;
          reject(new Error("Google Maps API key is missing"));
          return;
        }

        if (!key.startsWith("AIza")) {
          console.warn(
            "⚠️ [Google Maps] API key doesn't start with 'AIza' - may be incorrect",
          );
        }

        // Unique callback name so we never collide with any other script on the page
        const callbackName = "__googleMapsInitCallback__";

        const script = document.createElement("script");
        const apiUrl = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=${libraries}&callback=${callbackName}`;

        script.src = apiUrl;
        script.async = true;
        script.defer = true;

        script.onerror = (err) => {
          console.error("❌ [Google Maps] Script loading failed:", err);
          googleMapsPromise = null;
          reject(new Error("Failed to load Google Maps API script"));
        };

        // Single global callback — set once, never overwritten by later mounts
        window[callbackName] = () => {
          if (window.google && window.google.maps) {
            resolve(window.google.maps);
          } else {
            console.error(
              "❌ [Google Maps] Google maps object not available after loading",
            );
            googleMapsPromise = null;
            reject(new Error("Google maps object not available after loading"));
          }
        };

        // Auth failure handler (set once, safe to overwrite — always same behavior)
        window.gm_authFailure = () => {
          console.error(
            "🔐 [Google Maps] Authentication failed - Check API key and restrictions",
          );
          googleMapsPromise = null;
          reject(
            new Error(
              "Google Maps authentication failed - Check API key restrictions",
            ),
          );
        };

        document.head.appendChild(script);
      })
      .catch((error) => {
        console.error(
          "❌ [Google Maps] Failed to get API key from service:",
          error,
        );
        googleMapsPromise = null;
        reject(new Error(`Failed to get API key: ${error.message}`));
      });
  });

  return googleMapsPromise;
};

/**
 * Runs a geocode call through a global queue so that only ONE
 * geocode request is in-flight at a time across ALL map cards.
 * This avoids Google's OVER_QUERY_LIMIT / rate-limit throttling
 * that happens when 10 cards geocode in parallel.
 */
const queueGeocode = (fn) => {
  const run = () =>
    fn().finally(() => new Promise((resolve) => setTimeout(resolve, 200)));

  const result = geocodeQueue.then(run, run);
  // Keep the queue alive even if this particular call rejects
  geocodeQueue = result.catch(() => {});
  return result;
};

const GoogleMapComponent = React.memo(
  ({ zipCode, location, latitude, longitude, additionalLocations = [] }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [googleMaps, setGoogleMaps] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const mapConfig = useMemo(() => {
      const cleanLocation =
        location?.replace(new RegExp(`${zipCode}$`), "").replace(/,\s*$/, "") ||
        location;
      const searchQuery = zipCode
        ? `${cleanLocation}, ${zipCode}`.replace(/\s+/g, " ").trim()
        : cleanLocation;

      return {
        primaryLocation: {
          hasValidCoords:
            latitude &&
            longitude &&
            !isNaN(parseFloat(latitude)) &&
            !isNaN(parseFloat(longitude)) &&
            Math.abs(parseFloat(latitude)) <= 90 &&
            Math.abs(parseFloat(longitude)) <= 180,
          searchQuery: searchQuery,
          cleanLocation: cleanLocation,
        },
        hasAdditionalLocations:
          Array.isArray(additionalLocations) && additionalLocations.length > 0,
      };
    }, [zipCode, location, latitude, longitude, additionalLocations]);

    // Function to geocode a location (wrapped by the global queue when called)
    const geocodeLocation = (address, geocoderInstance) => {
      return new Promise((resolve, reject) => {
        if (!address || !address.trim()) {
          console.warn(
            "⚠️ [GoogleMapComponent] No address provided for geocoding",
          );
          reject(new Error("No address provided for geocoding"));
          return;
        }

        if (!geocoderInstance) {
          console.error("❌ [GoogleMapComponent] Geocoder not available");
          reject(new Error("Geocoder not available"));
          return;
        }

        const cleanAddress = address.replace(/\s+/g, " ").trim();

        geocoderInstance.geocode(
          { address: cleanAddress },
          (results, status) => {
            if (status === "OK" && results && results[0]) {
              const { lat, lng } = results[0].geometry.location;
              const position = { lat: lat(), lng: lng() };
              resolve(position);
            } else {
              console.error("❌ [GoogleMapComponent] Geocoding failed:", {
                status,
                address: cleanAddress,
              });
              reject(
                new Error(
                  `Geocoding failed for: ${cleanAddress} (Status: ${status})`,
                ),
              );
            }
          },
        );
      });
    };

    // Function to add a marker
    const addMarker = (mapInstance, position, title, mapsInstance) => {
      if (!mapsInstance || !mapInstance) {
        console.warn(
          "⚠️ [GoogleMapComponent] Google Maps not available for adding marker",
        );
        return null;
      }

      const marker = new mapsInstance.Marker({
        position,
        map: mapInstance,
        title,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new mapsInstance.Size(32, 32),
        },
      });

      const infoWindow = new mapsInstance.InfoWindow({
        content: `<div style="padding: 5px;"><strong>${title}</strong></div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstance, marker);
      });

      return marker;
    };

    // Function to fit map bounds
    const fitMapToBounds = (mapInstance, positions, mapsInstance) => {
      if (positions.length === 0 || !mapsInstance || !mapInstance) {
        console.warn("⚠️ [GoogleMapComponent] No positions to fit bounds");
        return;
      }

      const bounds = new mapsInstance.LatLngBounds();
      positions.forEach((pos) => bounds.extend(pos));
      mapInstance.fitBounds(bounds);

      if (positions.length === 1) {
        mapInstance.setZoom(13);
      }
    };

    // Load Google Maps API only once (shared singleton across all cards)
    useEffect(() => {
      let isMounted = true;

      loadGoogleMapsAPI()
        .then((maps) => {
          if (!isMounted) return;
          setGoogleMaps(maps);
          const geocoderInstance = new maps.Geocoder();
          setGeocoder(geocoderInstance);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error(
            "❌ [GoogleMapComponent] Failed to load Google Maps API:",
            err.message,
          );
          setError(
            `Failed to load Google Maps: ${err.message}. Please check API key configuration.`,
          );
          setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }, []);

    // Initialize map when Google Maps API is loaded
    useEffect(() => {
      if (!googleMaps || !geocoder || initialized || !mapRef.current) {
        return;
      }

      let isCancelled = false;

      const initializeMap = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const mapOptions = {
            zoom: 10,
            center: { lat: 40.6892, lng: -74.0445 },
            mapTypeId: googleMaps.MapTypeId.ROADMAP,
            streetViewControl: false,
            mapTypeControl: true,
            zoomControl: true,
            scaleControl: true,
            rotateControl: false,
            fullscreenControl: true,
            gestureHandling: "cooperative",
            clickableIcons: false,
          };

          const newMap = new googleMaps.Map(mapRef.current, mapOptions);
          const allPositions = [];
          const markers = [];

          // Process primary location
          let primaryPosition = null;
          if (mapConfig.primaryLocation.hasValidCoords) {
            primaryPosition = {
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            };

            const marker = addMarker(
              newMap,
              primaryPosition,
              mapConfig.primaryLocation.cleanLocation || "Primary Location",
              googleMaps,
            );
            if (marker) markers.push(marker);
            allPositions.push(primaryPosition);
          } else if (mapConfig.primaryLocation.searchQuery) {
            try {
              primaryPosition = await queueGeocode(() =>
                geocodeLocation(mapConfig.primaryLocation.searchQuery, geocoder),
              );
              if (isCancelled) return;

              const marker = addMarker(
                newMap,
                primaryPosition,
                mapConfig.primaryLocation.cleanLocation || "Primary Location",
                googleMaps,
              );
              if (marker) markers.push(marker);
              allPositions.push(primaryPosition);
            } catch (err) {
              console.error(
                "❌ [GoogleMapComponent] Primary location geocoding failed:",
                err.message,
              );

              primaryPosition = { lat: 39.8283, lng: -98.5795 };
              const marker = addMarker(
                newMap,
                primaryPosition,
                "Default Location",
                googleMaps,
              );
              if (marker) markers.push(marker);
              allPositions.push(primaryPosition);
            }
          }

          if (isCancelled) return;

          // Process additional locations
          if (mapConfig.hasAdditionalLocations) {
            for (const [index, loc] of additionalLocations.entries()) {
              if (isCancelled) return;

              let position = null;
              const title = loc.name || loc.zip || `Location ${index + 1}`;

              if (
                loc.coordinates &&
                loc.coordinates.coordinates &&
                loc.coordinates.coordinates.length === 2 &&
                !isNaN(loc.coordinates.coordinates[0]) &&
                !isNaN(loc.coordinates.coordinates[1])
              ) {
                const [lng, lat] = loc.coordinates.coordinates;
                position = { lat, lng };
              } else if (loc.zip || loc.name) {
                const searchQuery =
                  `${loc.name || ""} ${loc.zip || ""}, USA`.trim();

                try {
                  position = await queueGeocode(() =>
                    geocodeLocation(searchQuery, geocoder),
                  );
                } catch (err) {
                  console.error(
                    `❌ [GoogleMapComponent] Failed to geocode ${searchQuery}:`,
                    err.message,
                  );
                  continue;
                }
              }

              if (isCancelled) return;

              if (position) {
                const marker = addMarker(newMap, position, title, googleMaps);
                if (marker) markers.push(marker);
                allPositions.push(position);
              }
            }
          }

          if (isCancelled) return;

          if (allPositions.length > 0) {
            fitMapToBounds(newMap, allPositions, googleMaps);
          } else {
            newMap.setCenter({ lat: 39.8283, lng: -98.5795 });
            newMap.setZoom(4);
          }

          setMap(newMap);
          setInitialized(true);
        } catch (err) {
          if (isCancelled) return;
          console.error("❌ [GoogleMapComponent] Map initialization error:", {
            message: err.message,
            stack: err.stack,
          });
          setError(`Map error: ${err.message}`);
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      initializeMap();

      return () => {
        isCancelled = true;
      };
    }, [googleMaps, geocoder, mapConfig, initialized]);

    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10 rounded-xl">
            <div className="text-gray-600 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading map...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-50 text-red-600 p-4 flex items-center justify-center z-10 rounded-xl">
            <div className="text-center max-w-md">
              <div className="font-medium mb-2">Map Error</div>
              <div className="text-sm mb-3">{error}</div>
              <div className="text-xs text-gray-600">
                Please check Google Maps API configuration
              </div>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-64 sm:h-80 rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
        />
      </div>
    );
  },
);

GoogleMapComponent.displayName = "GoogleMapComponent";
export default GoogleMapComponent;



















// import React, { useRef, useState, useEffect, useMemo } from "react";
// import googlemapService from "../store/googlemap/googlemapService";

// // ✅ Improved Google Maps API loading helper
// const loadGoogleMapsAPI = async () => {
//   return new Promise((resolve, reject) => {
//     // Check if already loaded
//     if (window.google && window.google.maps) {
//       resolve(window.google.maps);
//       return;
//     }

//     // Check if already loading
//     if (window.googleMapsLoading) {
//       let attempts = 0;
//       const maxAttempts = 50; // 5 seconds max

//       const checkInterval = setInterval(() => {
//         attempts++;
//         if (window.google && window.google.maps) {
//           clearInterval(checkInterval);

//           resolve(window.google.maps);
//         } else if (attempts >= maxAttempts) {
//           clearInterval(checkInterval);
//           reject(new Error("Google Maps API loading timeout after 5 seconds"));
//         }
//       }, 100);
//       return;
//     }

//     window.googleMapsLoading = true;

//     googlemapService
//       .getgoogleapi()
//       .then(({ key, libraries = "places,geometry" }) => {
//         // ✅ FIXED: geocoding -> geometry

//         if (!key) {
//           console.error("❌ [Google Maps] API key is missing or empty");
//           window.googleMapsLoading = false;
//           reject(new Error("Google Maps API key is missing"));
//           return;
//         }

//         // Validate API key format
//         if (!key.startsWith("AIza")) {
//           console.warn(
//             "⚠️ [Google Maps] API key doesn't start with 'AIza' - may be incorrect",
//           );
//         }

//         // Create script element - FIXED libraries parameter
//         const script = document.createElement("script");
//         // ✅ CORRECTED: Removed geocoding, using only geometry
//         const apiUrl = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=${libraries}&callback=googleMapsLoaded`;

//         script.src = apiUrl;
//         script.async = true;
//         script.defer = true;

//         script.onload = () => {};

//         script.onerror = (err) => {
//           console.error("❌ [Google Maps] Script loading failed:", err);
//           window.googleMapsLoading = false;
//           reject(new Error("Failed to load Google Maps API script"));
//         };

//         // Global callback
//         window.googleMapsLoaded = () => {
//           window.googleMapsLoading = false;
//           if (window.google && window.google.maps) {
//             resolve(window.google.maps);
//           } else {
//             console.error(
//               "❌ [Google Maps] Google maps object not available after loading",
//             );
//             reject(new Error("Google maps object not available after loading"));
//           }
//         };

//         // Add authentication failure handler
//         window.gm_authFailure = () => {
//           console.error(
//             "🔐 [Google Maps] Authentication failed - Check API key and restrictions",
//           );
//           console.error(
//             "   - Make sure your website URL is whitelisted in Google Cloud Console",
//           );
//           console.error("   - URL to whitelist: https://swvision.wort.ee/*");
//           window.googleMapsLoading = false;
//           reject(
//             new Error(
//               "Google Maps authentication failed - Check API key restrictions",
//             ),
//           );
//         };

//         // Add to document
//         document.head.appendChild(script);
//       })
//       .catch((error) => {
//         console.error(
//           "❌ [Google Maps] Failed to get API key from service:",
//           error,
//         );
//         window.googleMapsLoading = false;
//         reject(new Error(`Failed to get API key: ${error.message}`));
//       });
//   });
// };

// const GoogleMapComponent = React.memo(
//   ({ zipCode, location, latitude, longitude, additionalLocations = [] }) => {
//     const mapRef = useRef(null);
//     const [map, setMap] = useState(null);
//     const [error, setError] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [googleMaps, setGoogleMaps] = useState(null);
//     const [geocoder, setGeocoder] = useState(null);
//     const [initialized, setInitialized] = useState(false);

//     const mapConfig = useMemo(() => {
//       const cleanLocation =
//         location?.replace(new RegExp(`${zipCode}$`), "").replace(/,\s*$/, "") ||
//         location;
//       const searchQuery = zipCode
//         ? `${cleanLocation}, ${zipCode}`.replace(/\s+/g, " ").trim()
//         : cleanLocation;

//       const config = {
//         primaryLocation: {
//           hasValidCoords:
//             latitude &&
//             longitude &&
//             !isNaN(parseFloat(latitude)) &&
//             !isNaN(parseFloat(longitude)) &&
//             Math.abs(parseFloat(latitude)) <= 90 &&
//             Math.abs(parseFloat(longitude)) <= 180,
//           searchQuery: searchQuery,
//           cleanLocation: cleanLocation,
//         },
//         hasAdditionalLocations:
//           Array.isArray(additionalLocations) && additionalLocations.length > 0,
//       };
//       return config;
//     }, [zipCode, location, latitude, longitude, additionalLocations]);

//     // Function to geocode a location
//     const geocodeLocation = (address, geocoderInstance) => {
//       return new Promise((resolve, reject) => {
//         if (!address || !address.trim()) {
//           console.warn(
//             "⚠️ [GoogleMapComponent] No address provided for geocoding",
//           );
//           reject(new Error("No address provided for geocoding"));
//           return;
//         }

//         if (!geocoderInstance) {
//           console.error("❌ [GoogleMapComponent] Geocoder not available");
//           reject(new Error("Geocoder not available"));
//           return;
//         }

//         const cleanAddress = address.replace(/\s+/g, " ").trim();

//         geocoderInstance.geocode(
//           { address: cleanAddress },
//           (results, status) => {
//             if (status === "OK" && results && results[0]) {
//               const { lat, lng } = results[0].geometry.location;
//               const position = { lat: lat(), lng: lng() };

//               resolve(position);
//             } else {
//               console.error("❌ [GoogleMapComponent] Geocoding failed:", {
//                 status,
//                 address: cleanAddress,
//                 errorMessage:
//                   window.google?.maps?.GeocoderStatus?.[status] || status,
//               });
//               reject(
//                 new Error(
//                   `Geocoding failed for: ${cleanAddress} (Status: ${status})`,
//                 ),
//               );
//             }
//           },
//         );
//       });
//     };

//     // Function to add a marker
//     const addMarker = (mapInstance, position, title) => {
//       if (!googleMaps || !mapInstance) {
//         console.warn(
//           "⚠️ [GoogleMapComponent] Google Maps not available for adding marker",
//         );
//         return null;
//       }

//       const marker = new googleMaps.Marker({
//         position,
//         map: mapInstance,
//         title,
//         icon: {
//           url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//           scaledSize: new googleMaps.Size(32, 32),
//         },
//       });

//       const infoWindow = new googleMaps.InfoWindow({
//         content: `<div style="padding: 5px;"><strong>${title}</strong></div>`,
//       });

//       marker.addListener("click", () => {
//         infoWindow.open(mapInstance, marker);
//       });

//       return marker;
//     };

//     // Function to fit map bounds
//     const fitMapToBounds = (mapInstance, positions) => {
//       if (positions.length === 0 || !googleMaps || !mapInstance) {
//         console.warn("⚠️ [GoogleMapComponent] No positions to fit bounds");
//         return;
//       }

//       const bounds = new googleMaps.LatLngBounds();
//       positions.forEach((pos) => bounds.extend(pos));
//       mapInstance.fitBounds(bounds);

//       if (positions.length === 1) {
//         mapInstance.setZoom(13);
//       }
//     };

//     // Load Google Maps API only once
//     useEffect(() => {
//       let isMounted = true;

//       const loadAPI = async () => {
//         try {
//           const maps = await loadGoogleMapsAPI();
//           if (isMounted) {
//             setGoogleMaps(maps);

//             // Initialize geocoder
//             const geocoderInstance = new maps.Geocoder();
//             setGeocoder(geocoderInstance);
//           }
//         } catch (err) {
//           if (isMounted) {
//             console.error(
//               "❌ [GoogleMapComponent] Failed to load Google Maps API:",
//               {
//                 message: err.message,
//                 stack: err.stack,
//               },
//             );
//             setError(
//               `Failed to load Google Maps: ${err.message}. Please check API key configuration.`,
//             );
//             setIsLoading(false);
//           }
//         }
//       };

//       // Only load if not already loaded
//       if (!googleMaps && !window.googleMapsLoading) {
//         loadAPI();
//       } else if (googleMaps) {
//       }

//       return () => {
//         isMounted = false;
//       };
//     }, []);

//     // Initialize map when Google Maps API is loaded
//     useEffect(() => {
//       if (!googleMaps || !geocoder || initialized || !mapRef.current) {
//         if (!googleMaps);
//         if (!geocoder);
//         if (initialized);
//         if (!mapRef.current);
//         return;
//       }

//       const initializeMap = async () => {
//         try {
//           setIsLoading(true);
//           setError(null);
//           const mapOptions = {
//             zoom: 10,
//             center: { lat: 40.6892, lng: -74.0445 },
//             mapTypeId: googleMaps.MapTypeId.ROADMAP,
//             streetViewControl: false,
//             mapTypeControl: true,
//             zoomControl: true,
//             scaleControl: true,
//             rotateControl: false,
//             fullscreenControl: true,
//             gestureHandling: "cooperative",
//             clickableIcons: false,
//           };

//           const newMap = new googleMaps.Map(mapRef.current, mapOptions);
//           const allPositions = [];
//           const markers = [];

//           // Process primary location
//           let primaryPosition = null;
//           if (mapConfig.primaryLocation.hasValidCoords) {
//             primaryPosition = {
//               lat: parseFloat(latitude),
//               lng: parseFloat(longitude),
//             };

//             const marker = addMarker(
//               newMap,
//               primaryPosition,
//               mapConfig.primaryLocation.cleanLocation || "Primary Location",
//             );
//             if (marker) markers.push(marker);
//             allPositions.push(primaryPosition);
//           } else if (mapConfig.primaryLocation.searchQuery) {
//             try {
//               primaryPosition = await geocodeLocation(
//                 mapConfig.primaryLocation.searchQuery,
//                 geocoder,
//               );
//               const marker = addMarker(
//                 newMap,
//                 primaryPosition,
//                 mapConfig.primaryLocation.cleanLocation || "Primary Location",
//               );
//               if (marker) markers.push(marker);
//               allPositions.push(primaryPosition);
//             } catch (err) {
//               console.error(
//                 "❌ [GoogleMapComponent] Primary location geocoding failed:",
//                 err.message,
//               );

//               primaryPosition = { lat: 39.8283, lng: -98.5795 };
//               const marker = addMarker(
//                 newMap,
//                 primaryPosition,
//                 "Default Location",
//               );
//               if (marker) markers.push(marker);
//               allPositions.push(primaryPosition);
//             }
//           }

//           // Process additional locations
//           if (mapConfig.hasAdditionalLocations) {
//             for (const [index, loc] of additionalLocations.entries()) {
//               let position = null;
//               const title = loc.name || loc.zip || `Location ${index + 1}`;

//               if (
//                 loc.coordinates &&
//                 loc.coordinates.coordinates &&
//                 loc.coordinates.coordinates.length === 2 &&
//                 !isNaN(loc.coordinates.coordinates[0]) &&
//                 !isNaN(loc.coordinates.coordinates[1])
//               ) {
//                 const [lng, lat] = loc.coordinates.coordinates;
//                 position = { lat, lng };
//               } else if (loc.zip || loc.name) {
//                 const searchQuery =
//                   `${loc.name || ""} ${loc.zip || ""}, USA`.trim();

//                 try {
//                   position = await geocodeLocation(searchQuery, geocoder);
//                 } catch (err) {
//                   console.error(
//                     `❌ [GoogleMapComponent] Failed to geocode ${searchQuery}:`,
//                     err.message,
//                   );
//                   continue;
//                 }
//               }

//               if (position) {
//                 const marker = addMarker(newMap, position, title);
//                 if (marker) markers.push(marker);
//                 allPositions.push(position);
//               }
//             }
//           }

//           if (allPositions.length > 0) {
//             fitMapToBounds(newMap, allPositions);
//           } else {
//             // Set default view
//             newMap.setCenter({ lat: 39.8283, lng: -98.5795 });
//             newMap.setZoom(4);
//           }

//           setMap(newMap);
//           setInitialized(true);
//         } catch (err) {
//           console.error("❌ [GoogleMapComponent] Map initialization error:", {
//             message: err.message,
//             stack: err.stack,
//           });
//           setError(`Map error: ${err.message}`);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       initializeMap();
//     }, [googleMaps, geocoder, mapConfig, initialized]);

//     return (
//       <div className="relative">
//         {isLoading && (
//           <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10 rounded-xl">
//             <div className="text-gray-600 flex items-center space-x-2">
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
//               <span>Loading map...</span>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="absolute inset-0 bg-red-50 text-red-600 p-4 flex items-center justify-center z-10 rounded-xl">
//             <div className="text-center max-w-md">
//               <div className="font-medium mb-2">Map Error</div>
//               <div className="text-sm mb-3">{error}</div>
//               <div className="text-xs text-gray-600">
//                 Please check Google Maps API configuration
//               </div>
//             </div>
//           </div>
//         )}

//         <div
//           ref={mapRef}
//           className="w-full h-64 sm:h-80 rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
//         />
//       </div>
//     );
//   },
// );

// GoogleMapComponent.displayName = "GoogleMapComponent";
// export default GoogleMapComponent;
