// src/store/slices/adminbudgetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminbudgetService from "./adminbudgetService";

export const getAdminBudgetRequests = createAsyncThunk(
  "adminbudget/getAdminBudgetRequests",
  async (params, thunkAPI) => {
    try {
      const response = await adminbudgetService.getAdminBudgetRequests(params);

      return response;
    } catch (error) {
      const message = error.message || "Failed to fetch requests";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const manageBudgetRequest = createAsyncThunk(
  "adminbudget/manageBudgetRequest",
  async ({ budgetRequestId, formData }, thunkAPI) => {
    try {
      return await adminbudgetService.manageBudgetRequest(
        budgetRequestId,
        formData,
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to process request";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const fetchSingleBudgetRequest = createAsyncThunk(
  "adminbudget/fetchSingleBudgetRequest",
  async (id, thunkAPI) => {
    try {
      return await adminbudgetService.getSingleBudgetRequest(id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch request";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
const initialState = {
  requests: [],

  stats: {
    review_pending: 0,
    approved: 0,
    rejected: 0,
    info_requested: 0,
    direct_contact_enabled: 0,
  },
  loading: false,
  success: false,
  error: null,
  message: null,
  selectedRequest: null,
};
const adminbudgetSlice = createSlice({
  name: "adminbudget",
  initialState,
  reducers: {
    resetAdminBudgetState: (state) => initialState,
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Admin Budget Requests
      .addCase(getAdminBudgetRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminBudgetRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.stats = action.payload.stats;
        // Remove pagination data
      })
      .addCase(getAdminBudgetRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Manage Budget Request
      .addCase(manageBudgetRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(manageBudgetRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // Update the specific request in state
        const index = state.requests.findIndex(
          (r) => r._id === action.payload.data._id,
        );

        if (index !== -1) {
          state.requests[index] = action.payload.data;
        }

        // Update stats
        const oldStatus = state.selectedRequest?.adminStatus;
        const newStatus = action.payload.data.adminStatus;

        if (oldStatus && oldStatus !== newStatus) {
          state.stats[oldStatus] -= 1;
          state.stats[newStatus] = (state.stats[newStatus] || 0) + 1;
        }

        state.selectedRequest = action.payload.data;
      })
      .addCase(manageBudgetRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSingleBudgetRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleBudgetRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRequest = action.payload.data;
      })
      .addCase(fetchSingleBudgetRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetAdminBudgetState,
  clearError,
  clearSuccess,
  setSelectedRequest,
} = adminbudgetSlice.actions;

export default adminbudgetSlice.reducer;
