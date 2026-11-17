import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { COUNTRY_TO_CURRENCY } from "../../utils/regionsAndCountries";

const getApiBase = () => {
  if (typeof window !== "undefined") {
    if (window.location.hostname.includes("railway.app")) {
      return "https://rule7media-main-site-production.up.railway.app";
    }
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
  }
  return "https://www.rule7media.com";
};

// Country -> currency symbol (mapped from all 8 global regions)
export const getCurrencySymbol = (country) => COUNTRY_TO_CURRENCY[country] || "$";

// Browser ka public IP (VPN ke saath bhi sahi milta hai)
const getBrowserIp = async () => {
  try {
    const r = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(2500),
    });
    return (await r.json()).ip;
  } catch {
    return null; // adblock/fail ho to backend headers se kaam chalega
  }
};

export const fetchUserCountry = createAsyncThunk(
  "country/fetchUserCountry",
  async () => {
    try {
      let url = `${getApiBase()}/api/user-country`;

      const ip = await getBrowserIp();
      if (ip) url += `?ip=${ip}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data && data.country) {
        return { country: data.country, ip: data.ip || ip };
      }
    } catch (err) {
      console.warn("Backend user-country lookup failed, falling back to direct lookup:", err.message);
    }

    // Direct client fallback to ensure international visitors (Vietnam, Germany, etc.) are never misclassified
    try {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      if (data && data.success && data.country) {
        return { country: data.country, ip: data.ip || null };
      }
    } catch {}

    return { country: "Australia", ip: null };
  }
);

const countrySlice = createSlice({
  name: "country",
  initialState: {
    country: null,
    ip: null,
    currency: "A$",
    isLoading: true,
    isManual: false, // user ne dropdown se khud choose kiya?
  },
  reducers: {
    setCountry: (state, action) => {
      state.country = action.payload;
      state.currency = getCurrencySymbol(action.payload);
      state.isManual = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCountry.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserCountry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ip = action.payload.ip;
        if (!state.isManual) {
          state.country = action.payload.country;
          state.currency = getCurrencySymbol(action.payload.country);
        }
      })
      .addCase(fetchUserCountry.rejected, (state) => {
        state.isLoading = false;
        if (!state.isManual) {
          state.country = "Australia";
          state.currency = "A$";
        }
      });
  },
});

export const { setCountry } = countrySlice.actions;
export default countrySlice.reducer;



// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // Function to map country to currency symbol
// const getCurrencySymbol = (country) => {
//   switch (country) {
//     case "India":
//       return "₹";
//     case "Australia":
//       return "A$";
//     case "France":
//     case "Spain":
//       return "€";
//     case "United States":
//       return "$";
//     case "Canada":
//       return "C$";
//     case "Japan":
//     case "China":
//       return "¥";
//     case "Thailand":
//       return "฿";
//     case "Indonesia":
//       return "Rp";
//     case "United Kingdom":
//       return "£";
//     default:
//       return "A$"; // Default: Australia
//   }
// };

// // Fetch country based on IP with fast fallback and caching
// export const fetchUserCountry = createAsyncThunk(
//   "country/fetchUserCountry",
//   async (_, { getState }) => {
//     // If country already loaded in state or localStorage, use it immediately
//     const existing = getState()?.country?.country || (typeof window !== "undefined" && localStorage.getItem("selectedCountry"));
//     if (existing && existing !== "undefined") {
//       return existing;
//     }

//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 sec max
      
//       const response = await fetch("https://ipapi.co/json/", { signal: controller.signal });
//       clearTimeout(timeoutId);
//       const data = await response.json();
//       return data.country_name || "Australia";
//     } catch (error) {
//       try {
//         const controller2 = new AbortController();
//         const timeoutId2 = setTimeout(() => controller2.abort(), 1500);
//         const res2 = await fetch("https://ipwho.is/", { signal: controller2.signal });
//         clearTimeout(timeoutId2);
//         const data2 = await res2.json();
//         return data2.country || "Australia";
//       } catch (err2) {
//         return "Australia";
//       }
//     }
//   },
// );

// const countrySlice = createSlice({
//   name: "country",
//   initialState: {
//     country:
//       typeof window !== "undefined"
//         ? localStorage.getItem("selectedCountry") || null
//         : null,
//     currency: "A$", // Default currency
//     isLoading: false,
//   },
//   reducers: {
//     setCountry: (state, action) => {
//       state.country = action.payload;
//       state.currency = getCurrencySymbol(action.payload); // Update currency when country changes
//       localStorage.setItem("selectedCountry", action.payload);
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUserCountry.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchUserCountry.fulfilled, (state, action) => {
//         state.country = action.payload;
//         state.currency = getCurrencySymbol(action.payload); // Set currency based on fetched country
//         state.isLoading = false;
//         localStorage.setItem("selectedCountry", action.payload);
//       })
//       .addCase(fetchUserCountry.rejected, (state) => {
//         state.isLoading = false;
//         state.country = "Australia";
//         state.currency = "A$"; // Fallback currency
//       });
//   },
// });

// export const { setCountry } = countrySlice.actions;
// export default countrySlice.reducer;

// // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // // IP se country fetch karna
// // export const fetchUserCountry = createAsyncThunk("country/fetchUserCountry", async () => {
// //     try {
// //         const response = await fetch("https://ipapi.co/json/");
// //         const data = await response.json();
// //
// //         return data.country_name || "Australia";
// //     } catch (error) {
// //         console.error("Error fetching country:", error);
// //         return "Australia";
// //     }
// // });
// // ///Selected country Dropdown
// // const countrySlice = createSlice({
// //     name: "country",
// //     initialState: {
// //         country: typeof window !== "undefined" ? localStorage.getItem("selectedCountry") || null : null,
// //         isLoading: false
// //     },
// //     reducers: {
// //         setCountry: (state, action) => {
// //             state.country = action.payload;
// //             localStorage.setItem("selectedCountry", action.payload);
// //         }
// //     },
// //     extraReducers: (builder) => {
// //         builder
// //             .addCase(fetchUserCountry.pending, (state) => {
// //                 state.isLoading = true;
// //             })
// //             .addCase(fetchUserCountry.fulfilled, (state, action) => {
// //                 state.country = action.payload;
// //                 state.isLoading = false;
// //                 localStorage.setItem("selectedCountry", action.payload);
// //             })
// //             .addCase(fetchUserCountry.rejected, (state) => {
// //                 state.isLoading = false;
// //             });
// //     },
// // });

// // export const { setCountry } = countrySlice.actions;
// // export default countrySlice.reducer;
