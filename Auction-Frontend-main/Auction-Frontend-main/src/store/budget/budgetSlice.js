// src/redux/slices/budgetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import budgetService from "./budgetService";

// Get Budgets for a Seller
export const fetchbudgetbysellerid = createAsyncThunk(
  "budget/fetchbudget",
  async (sellerId, thunkAPI) => {
    try {
      return await budgetService.getbuyerbudgetinseller(sellerId);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
// In budgetSlice.js
export const fetchAuctionsByBudget = createAsyncThunk(
  "budget/fetchAuctionsByBudget",
  async ({ budget, category, sellerId }, thunkAPI) => {
    // Destructure the object
    try {
      return await budgetService.fetchAuctionsByBudget({
        budget,
        category,
        sellerId,
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

// Create Budget Request
export const createbudge = createAsyncThunk(
  "budget/createbudge",
  async (budgetData, thunkAPI) => {
    try {
      return await budgetService.createbudge(budgetData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const sendRecommendation = createAsyncThunk(
  "budget/sendRecommendation",
  async (budgetData, thunkAPI) => {
    try {
      return await budgetService.sendRecommendation(budgetData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getbuyerrecmondation = createAsyncThunk(
  "budget/getbuyerrecmondation",
  async (buyerId, thunkAPI) => {
    try {
      return await budgetService.getbuyerrecmondation(buyerId);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

const initialState = {
  budgetList: [],
  recommendedAuctions: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budgets for Seller
      .addCase(fetchbudgetbysellerid.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchbudgetbysellerid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        // Handle both direct array responses and { data: [...] } responses
        state.budgetList = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchbudgetbysellerid.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(fetchAuctionsByBudget.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAuctionsByBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recommendedAuctions = action.payload?.data || [];
      })
      .addCase(fetchAuctionsByBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getbuyerrecmondation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getbuyerrecmondation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recommendedAuctions = action.payload?.data || [];
      })
      .addCase(getbuyerrecmondation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      // Create Budget
      .addCase(createbudge.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createbudge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.budgetList.push(action.payload); // optional
      })
      .addCase(createbudge.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(sendRecommendation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendRecommendation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;

        state.budgetList = state.budgetList.map((request) => {
          if (request._id === action.payload.requestId) {
            return { ...request, status: "recommended" };
          }
          return request;
        });
      })
      .addCase(sendRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      });
  },
});

export const { reset } = budgetSlice.actions;
export default budgetSlice.reducer;
