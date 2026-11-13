// features/sellerOrders/sellerOrderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import sellerOrderService from "./sellerOrderService";

// Async thunk to fetch seller orders
export const fetchSellerOrders = createAsyncThunk(
  "sellerOrders/fetch",
  async ({ page, userId }, thunkAPI) => {
    try {
      return await sellerOrderService.getOrdersBySeller(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch orders",
      );
    }
  },
);

export const fetchOrderSummary = createAsyncThunk(
  "sellerOrders/fetchSummary",
  async (sellerId, thunkAPI) => {
    try {
      return await sellerOrderService.getOrderSummary(sellerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch order summary",
      );
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status, fcmToken, sellerId }, thunkAPI) => {
    try {
      const response = await sellerOrderService.updateStatus(orderId, status);
      return { orderId, status, fcmToken, sellerId, ...response };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update order status",
      );
    }
  },
);
export const getBuyerStats = createAsyncThunk(
  "buyer/getBuyerStats",
  async (userId, thunkAPI) => {
    try {
      const response = await sellerOrderService.getBuyerStats(userId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

export const getOrderfleetownerSummary = createAsyncThunk(
  "sellerOrders/getOrderfleetownerSummary",
  async (fleetownerId, thunkAPI) => {
    try {
      return await sellerOrderService.getOrderfleetownerSummary(fleetownerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch order summary",
      );
    }
  },
);
const initialState = {
  ordersResponse: {
    orders: [],
    totalPages: 1,
    currentPage: 1,
  },
  ordersSummary: null,
  fleetordersSummary: null,
  buyerStats: null,
  status: "idle",
  error: null,
  buyerStatsStatus: "idle",
  buyerStatsError: null,
  updatingStatus: false,
  updateError: null,
};

const sellerOrderSlice = createSlice({
  name: "sellerOrders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.ordersResponse = initialState.ordersResponse;
      state.ordersSummary = initialState.ordersSummary;
      state.status = initialState.status;

      state.error = initialState.error;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Seller Orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ordersResponse = {
          orders: action.payload.orders || action.payload,
          totalPages: action.payload.totalPages || 1,
          currentPage: action.payload.currentPage || 1,
        };
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch Order Summary
      .addCase(fetchOrderSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrderSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ordersSummary = action.payload;
      })
      .addCase(fetchOrderSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      //fleetordersummary
      .addCase(getOrderfleetownerSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getOrderfleetownerSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fleetordersSummary = action.payload;
      })
      .addCase(getOrderfleetownerSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updatingStatus = true;
        state.updateError = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updatedOrder = action.payload;
        state.ordersResponse.orders = state.ordersResponse.orders.map(
          (order) => (order._id === updatedOrder._id ? updatedOrder : order),
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.updateError = action.payload;
      })
      .addCase(getBuyerStats.pending, (state) => {
        state.buyerStatsStatus = "loading";
        state.buyerStatsError = null;
      })
      .addCase(getBuyerStats.fulfilled, (state, action) => {
        state.buyerStatsStatus = "succeeded";
        state.buyerStats = {
          activeBids: action.payload?.activeBids ?? 0,
          wonAuctions: action.payload?.wonAuctions ?? 0,
          totalOrders: action.payload?.totalOrders ?? 0,
          savedItems: action.payload?.savedItems ?? 0,
        };
      })
      .addCase(getBuyerStats.rejected, (state, action) => {
        state.buyerStatsStatus = "failed";
        state.buyerStatsError = action.payload;
        console.error("Buyer stats fetch failed:", action.payload);
      });
  },
});

export const { clearOrders } = sellerOrderSlice.actions;
export default sellerOrderSlice.reducer;
