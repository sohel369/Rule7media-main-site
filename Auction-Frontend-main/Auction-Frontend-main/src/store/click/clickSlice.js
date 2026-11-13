import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CTRService from "./clickService"; // 👈 Service imported

// Thunk for tracking click
// store/click/clickSlice.js
export const trackClickAsync = createAsyncThunk(
  "click/trackClick",
  async (
    { auctionId, fleetOwnerId, userId, referrer, userAgent },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState();
      const user = state.auth.user;

      const data = await CTRService.trackClick({
        auctionId,
        fleetOwnerId,
        userId: userId || user?._id || "anonymous",
        email: user?.email || "unknown@email.com",
        userType: user?.userType || "other",
        referrer,
        userAgent,
        auctionType: "fleetauction",
      });

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Click tracking failed",
      );
    }
  },
);
export const getAdminCTR = createAsyncThunk(
  "click/getAdminCTR",
  async (_, thunkAPI) => {
    try {
      const response = await CTRService.getAdminCTR();

      return response; // Remove .data here since service already returns .data
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message); // Simplify error
    }
  },
);
const clickSlice = createSlice({
  name: "click",
  initialState: {
    adminCTR: [],
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetClickState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackClickAsync.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(trackClickAsync.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(trackClickAsync.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(getAdminCTR.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getAdminCTR.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.adminCTR = action.payload || []; // Fallback to empty array
      })
      .addCase(getAdminCTR.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { resetClickState } = clickSlice.actions;
export default clickSlice.reducer;
