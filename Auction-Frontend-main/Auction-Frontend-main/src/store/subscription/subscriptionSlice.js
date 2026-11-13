import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import subscriptionService from "./subscriptionService";

export const subscribeUser = createAsyncThunk(
  "subscription/subscribeUser",
  async ({ email, countryCode }, thunkAPI) => {
    try {
      return await subscriptionService.subscribeUser({ email, countryCode });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const fetchSubscriptionPlanes = createAsyncThunk(
  "subscription/fetchPlanes",
  async (_, thunkAPI) => {
    try {
      return await subscriptionService.getSubscriptionPlanes();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const checkSubscriptionStatus = createAsyncThunk(
  "subscription/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const subscription = await subscriptionService.checkSubscriptionStatus();
      return subscription;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to check subscription status";
      console.error("checkSubscriptionStatus rejected:", message); // Debug log
      return rejectWithValue(message);
    }
  },
);

export const verifySubscription = createAsyncThunk(
  "subscription/verifySubscription",
  async ({ sessionId }, thunkAPI) => {
    try {
      return await subscriptionService.verifySubscription(sessionId);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const createsubscriptionCheckoutSession = createAsyncThunk(
  "subscription/createCheckoutSession",
  async (
    {
      priceId,
      campaignId,
      price,
      currency,
      recurring,
      email,
      planDuration,
      country,
    },
    thunkAPI,
  ) => {
    try {
      const response =
        await subscriptionService.createsubscriptionCheckoutSession({
          priceId,
          campaignId,
          price,
          currency,
          recurring,
          email,
          planDuration,
          country,
        });
      return response.url;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const checkverifySubscription = createAsyncThunk(
  "subscription/verifySessionStatus",
  async ({ sessionId, token }, { rejectWithValue }) => {
    try {
      const data = await subscriptionService.verifySubscriptionSession(
        sessionId,
        token,
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Server Error";
      return rejectWithValue(message);
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancelSubscription",
  async (
    { stripeSubscriptionId, userEmail, userId, password, countryCode },
    thunkAPI,
  ) => {
    try {
      const response = await subscriptionService.cancelSubscription({
        stripeSubscriptionId,
        userEmail,
        userId,
        password,
        countryCode,
      });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const checkstripSubscriptionStatus = createAsyncThunk(
  "subscription/checkstripStatus",
  async (_, { getState, rejectWithValue }) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?._id || !user?.subscription?.stripeSubscriptionId) {
        return rejectWithValue({
          message: "User or subscription information not available",
        });
      }
      const response = await subscriptionService.getSubscriptionStatus({
        userId: user._id,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      });
      return response.subscription;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || {
          message: "Failed to fetch subscription status",
        },
      );
    }
  },
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    loading: false,
    success: false,
    error: null,
    expiry: null,
    checkoutUrl: null,
    subscriptionDetails: null,
    subscriptionPlanes: [],
    subscriptionStatus: null,
    stripsubscriptionStatus: null,
  },
  reducers: {
    resetSubscription: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.checkoutUrl = null;
      state.subscriptionDetails = null;
      state.subscriptionPlanes = [];
      state.subscriptionStatus = null;
      state.expiry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlanes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlanes.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionPlanes = action.payload;
      })
      .addCase(fetchSubscriptionPlanes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionStatus = action.payload;
      })
      .addCase(checkSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.subscriptionStatus = { status: "inactive" }; // Fallback to inactive
      })
      .addCase(subscribeUser.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(subscribeUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(subscribeUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(createsubscriptionCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.checkoutUrl = null;
      })
      .addCase(createsubscriptionCheckoutSession.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutUrl = action.payload;
      })
      .addCase(createsubscriptionCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionDetails = action.payload;
        if (state.user) {
          state.user.subscription = action.payload;
        }
      })
      .addCase(verifySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkverifySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkverifySubscription.fulfilled, (state, action) => {
        state.subscriptionDetails = action.payload;
        state.loading = false;
      })
      .addCase(checkverifySubscription.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.expiry = new Date(
          action.payload.currentPeriodEnd * 1000,
        ).toLocaleDateString();
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkstripSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.stripsubscriptionStatus = action.payload;
        state.error = null;
      })
      .addCase(checkstripSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
