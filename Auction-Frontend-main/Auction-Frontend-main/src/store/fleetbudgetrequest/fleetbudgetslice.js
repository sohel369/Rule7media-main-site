import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fleetService from "./fleetbudgetService";

// Fetch fleet recommended auctions with budget comparison
export const fetchFleetRecommendedAuctions = createAsyncThunk(
  "budget/fetchFleetRecommendedAuctions",
  async ({ fleetOwnerId, budgetId }, thunkAPI) => {
    try {
      const result = await fleetService.fetchFleetRecommendedAuctions(
        fleetOwnerId,
        budgetId,
      );

      return result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch auctions";
      console.error("Redux: fetchFleetRecommendedAuctions error:", message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const submitBudgetRequest = createAsyncThunk(
  "budget/submit",
  async (formData, thunkAPI) => {
    try {
      const result = await fleetService.submitBudgetRequest(formData);

      return result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit budget request";
      console.error("Redux: submitBudgetRequest error:", message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Send fleet recommendation
export const sendFleetRecommendation = createAsyncThunk(
  "budget/sendRecommendation",
  async (budgetData, thunkAPI) => {
    try {
      const result = await fleetService.sendFleetRecommendation(budgetData);

      return result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send recommendation";
      console.error("Redux: sendFleetRecommendation error:", message);
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getFleetRecommendation = createAsyncThunk(
  "fleet/getFleetRecommendation",
  async (userId, thunkAPI) => {
    try {
      const response = await fleetService.getFleetRecommendation(userId); // Use fleetService, not direct function
      return response; // Return the entire response
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);

const budgetSlice = createSlice({
  name: "fleetbudget",
  initialState: {
    recommendedFleetAuctions: [],
    loading: false,
    success: false,
    error: null,
    message: null,
    hasBudgetComparison: false,
  },
  reducers: {
    resetBudgetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = null;
      state.recommendedFleetAuctions = [];
      state.hasBudgetComparison = false;
    },
    clearError: (state) => {
      state.error = null;
      state.message = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Fleet Recommended Auctions Cases
      .addCase(fetchFleetRecommendedAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchFleetRecommendedAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedFleetAuctions = action.payload.data; // Direct assignment
        state.hasBudgetComparison = action.payload.hasBudgetComparison;
        return state; // Explicit return for clarity
      })
      .addCase(fetchFleetRecommendedAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.recommendedFleetAuctions = [];
        state.hasBudgetComparison = false;
        console.error(
          "Redux State: Failed to fetch fleet auctions:",
          action.payload,
        );
      })

      // Submit Budget Cases
      .addCase(submitBudgetRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitBudgetRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = "Budget request submitted successfully!";
      })
      .addCase(submitBudgetRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Send Recommendation Cases
      .addCase(sendFleetRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendFleetRecommendation.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = "Recommendation sent successfully!";
      })
      .addCase(sendFleetRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error = true;
        state.success = false;
        state.message = action.payload.message;
      })
      .addCase(getFleetRecommendation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getFleetRecommendation.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedFleetAuctions = action.payload.data || [];
        state.error = null;
      })
      //     // Remove the duplicate rejected case
      .addCase(getFleetRecommendation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch recommendations";
        state.recommendedFleetAuctions = [];
        state.hasBudgetComparison = false;
        console.error("Recommendation fetch error:", action.payload);
      });
  },
});

export const { resetBudgetState, clearError, clearSuccess } =
  budgetSlice.actions;
export default budgetSlice.reducer;
