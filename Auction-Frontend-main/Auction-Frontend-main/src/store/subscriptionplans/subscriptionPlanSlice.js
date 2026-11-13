import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import subscriptionPlanService from "./subscriptionPlanService";

export const fetchPlans = createAsyncThunk(
  "subscription/fetchPlans",
  async (_, thunkAPI) => {
    try {
      return await subscriptionPlanService.getSubscriptionPlans();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch plans";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const fetchPlansForUser = createAsyncThunk(
  "subscription/fetchPlansForUser",
  async (_, thunkAPI) => {
    try {
      return await subscriptionPlanService.getSubscriptionPlansforusers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch plans";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const createPlan = createAsyncThunk(
  "subscription/createPlan",
  async (planData, thunkAPI) => {
    try {
      return await subscriptionPlanService.createSubscriptionPlan(planData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create plan";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const updatePlan = createAsyncThunk(
  "subscription/updatePlan",
  async ({ id, planData }, thunkAPI) => {
    try {
      return await subscriptionPlanService.updateSubscriptionPlan({
        id,
        planData,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update plan";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const deletePlan = createAsyncThunk(
  "subscription/deletePlan",
  async (id, thunkAPI) => {
    try {
      await subscriptionPlanService.deleteSubscriptionPlan(id);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete plan";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const upgradeSubscription = createAsyncThunk(
  "subscriptionPlan/upgrade",
  async ({ newPriceId, userEmail }, thunkAPI) => {
    try {
      const response = await subscriptionPlanService.upgradeSubscription({
        newPriceId,
        userEmail,
      });
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Upgrade failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    plans: [],
    userplans: [],
    subscriptionStatus: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetSubscriptionState: (state) => {
      state.subscriptionStatus = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPlansForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlansForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userplans = action.payload; // Ye ab user-specific plans honge
      })
      .addCase(fetchPlansForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload);
        state.success = true;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.map((plan) =>
          plan._id === action.payload._id ? action.payload : plan,
        );
        state.success = true;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Plan
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = state.plans.filter((plan) => plan._id !== action.payload);
        state.success = true;
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(upgradeSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionStatus =
          action.payload.subscription || state.subscriptionStatus;
        //toast.success("Subscription upgraded successfully!");
      })
      .addCase(upgradeSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
