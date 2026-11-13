import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import OrderService from "../order/OrderService";
import { act } from "react";

// ✅ Async Thunks
export const placeOrderAsync = createAsyncThunk(
  "orders/placeOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await OrderService.createOrders(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const placeauctionOrder = createAsyncThunk(
  "orders/auctionOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await OrderService.createAuctionorder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const fetchOrdersAsync = createAsyncThunk(
  "orders/fetchOrders",
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await OrderService.getAllOrder(page);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchSoldWraps = createAsyncThunk(
  "order/fetchSoldWraps",
  async (fleetAuctionId, { rejectWithValue }) => {
    try {
      return await OrderService.getWrapTypesSoldByFleetAuctionId(
        fleetAuctionId,
      );
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
export const fetchorderbuyer = createAsyncThunk(
  "orders/fetchorderbuyer",
  async ({ page = 1, productId }, { rejectWithValue }) => {
    try {
      const response = await OrderService.getBuyersOfProduct(productId, page);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const fetchOrdersSummaryAsync = createAsyncThunk(
  "orders/fetchOrdersSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await OrderService.getOrderSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
///get order by user id
export const fetchOrdersbyUserIdAsync = createAsyncThunk(
  "orders/fetchOrdersbyUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await OrderService.fetchOrdersbyUserIdAsync(userId);

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const getSoldQuantity = createAsyncThunk(
  "orders/getSoldQuantity",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getSoldQuantity(productId);

      return response;
    } catch (err) {
      console.error("Error in getSoldQuantity thunk:", err);
      return rejectWithValue(
        err.response?.data?.message || "Error fetching Sold Quantity",
      );
    }
  },
);

export const updateSingleOrder = createAsyncThunk(
  "orders/updateSingleOrder",
  async ({ orderId, status, fcmToken }, { rejectWithValue }) => {
    try {
      const response = await OrderService.updateSingleOrder(
        orderId,
        status,
        fcmToken,
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const adminUpdateOrderStatus = createAsyncThunk(
  "orders/adminUpdateOrderStatus",
  async ({ orderId, status, fcmToken }, { rejectWithValue }) => {
    try {
      const response = await OrderService.adminUpdateOrderStatus(
        orderId,
        status,
        fcmToken,
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const downloadInvoiceService = createAsyncThunk(
  "orders/downloadInvoiceService",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await OrderService.downloadInvoiceService(
        orderId,
        status,
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

///////get seller order
export const getSellerOrders = createAsyncThunk(
  "orders/getSellerOrders",
  async (sellerId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getSellerOrders(sellerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getSellerOrderSummary = createAsyncThunk(
  "orders/getSellerOrderSummary",
  async (sellerId, { rejectWithValue }) => {
    try {
      const response = await OrderService.getSellerOrderSummary(sellerId); // missing await in your original

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    order: null,
    ordersSummary: null,
    updateOrder: null,
    soldQuantity: null,
    soldWraps: [],
    sellerorder: {
      data: [],
      count: 0,
      success: false,
    },

    summary: null,
    paidOrders: [],
    pendingOrders: [],
    shippedOrders: [],
    deliveredOrders: [],
    cancelledOrders: [],
    status: "idle",
    loading: false,
    error: null,
    isLoading: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(placeOrderAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(placeOrderAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (Array.isArray(state.orders)) {
          state.orders.push(action.payload);
        }
      })
      .addCase(placeOrderAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(placeauctionOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(placeauctionOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (Array.isArray(state.orders)) {
          state.orders.push(action.payload);
        }
      })
      .addCase(placeauctionOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchOrdersAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchOrdersAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSoldWraps.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSoldWraps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.soldWraps = action.payload;
      })

      .addCase(fetchSoldWraps.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload;
      })
      .addCase(fetchorderbuyer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchorderbuyer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.buyerOrders = action.payload; // Store the actual data
      })
      .addCase(fetchorderbuyer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // Store the error message
      })
      .addCase(fetchOrdersSummaryAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrdersSummaryAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ordersSummary = action.payload;
      })
      .addCase(fetchOrdersSummaryAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateSingleOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSingleOrder.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateSingleOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(adminUpdateOrderStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminUpdateOrderStatus.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(adminUpdateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrdersbyUserIdAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrdersbyUserIdAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.error = null;
        // Ensure you're assigning the correct data
        const payload = action.payload;
        state.orders = Array.isArray(payload) ? payload : payload.data || [];
      })
      .addCase(fetchOrdersbyUserIdAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        console.error("Redux Action Error:", action.payload);
      })
      .addCase(getSoldQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSoldQuantity.fulfilled, (state, action) => {
        state.soldQuantity = action.payload?.soldQuantity || 0;
      })
      .addCase(getSoldQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSellerOrders.pending, (state) => {
        state.status = "loading";
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loading = false;
        state.sellerorder = {
          data: Array.isArray(action.payload)
            ? action.payload
            : action.payload.data || [],
          count: action.payload.count || action.payload.length || 0,
          success: action.payload.success || true,
        };
      })
      .addCase(getSellerOrders.rejected, (state, action) => {
        state.status = "failed";
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

      // Get Seller Order Summary
      .addCase(getSellerOrderSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSellerOrderSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(getSellerOrderSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
      });
    //  .addCase(downloadInvoiceService.pending, (state) => {
    //   state.status = "loading";
    // })
    // .addCase(downloadInvoiceService.fulfilled, (state, action) => {
    //   if (!action.payload || !action.payload.blob) {
    //     console.error("Invalid payload structure:", action.payload);
    //     return;
    //   }

    //   const { blob, orderId } = action.payload;
    //   const url = window.URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = `invoice-${orderId}.pdf`;
    //   document.body.appendChild(a);
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    //   document.body.removeChild(a);
    // })

    // .addCase(downloadInvoiceService.rejected, (state, action) => {
    //   state.status = "failed";
    //   state.error = action.payload || "Failed to download invoice";
    //   console.error("Redux Action Error:", action.payload);
    // });
  },
});

export default orderSlice.reducer;
