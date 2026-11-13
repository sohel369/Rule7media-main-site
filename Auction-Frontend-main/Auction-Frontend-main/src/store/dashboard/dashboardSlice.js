import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import DashboardService from "./dashboardService";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (userId, thunkAPI) => {
    try {
      return await DashboardService.getDashboardStats(userId);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  stats: null,
  userType: null,
  isLoading: false,
  isError: false,
  message: "",
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboard: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.userType = action.payload.userType;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
