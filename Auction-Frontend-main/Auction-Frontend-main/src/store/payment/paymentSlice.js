import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PaymentService from "./paymentService";

export const fetchEarnings = createAsyncThunk(
  "payment/fetchEarnings",
  async (fetchData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.fetchEarnings(fetchData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchStripeAccountStatus = createAsyncThunk(
  "payment/fetchStripeAccountStatus",
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await PaymentService.fetchStripeAccountStatus(accountId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchSellerOnboarding = createAsyncThunk(
  "payment/fetchSellerOnboarding",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await PaymentService.fetchSellerOnboarding(userId);

      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchPayoutMethods = createAsyncThunk(
  "payment/fetchPayoutMethods",
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await PaymentService.fetchPayoutMethods(accountId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const generateOnboardingLink = createAsyncThunk(
  "payment/generateOnboardingLink",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await PaymentService.generateOnboardingLink(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const generateUpdateLink = createAsyncThunk(
  "payment/generateUpdateLink",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await PaymentService.generateUpdateLink(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const addPaymentMethod = createAsyncThunk(
  "payment/addPaymentMethod",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.addPaymentMethod(paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updatePaymentMethod = createAsyncThunk(
  "payment/updatePaymentMethod",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await PaymentService.updatePaymentMethod(paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deletePaymentMethod = createAsyncThunk(
  "payment/deletePaymentMethod",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PaymentService.deletePaymentMethod();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchPaymentMethod = createAsyncThunk(
  "payment/fetchPaymentMethod",
  async (_, { rejectWithValue }) => {
    try {
      const response = await PaymentService.getPaymentMethod();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
const paymentSlice = createSlice({
  name: "payments",
  initialState: {
    earnings: {
      available: 0,
      pending_clearance: 0,
      lifetime_total: 0,
      already_paid_out: 0,
      currency: "",
      breakdown: {
        available_by_currency: [],
        pending_by_currency: [],
      },
    },
    onboardingUrl: "",
    verificationStatus: "unverified",
    payoutMethods: [],
    stripeAccount: null,
    loading: false,
    buttonLoading: false,
    error: null,
  },
  reducers: {
    setVerificationStatus: (state, action) => {
      state.verificationStatus = action.payload;
    },
    resetPaymentState: (state) => {
      state.onboardingUrl = "";
      state.verificationStatus = "unverified";
      state.payoutMethods = [];
      state.stripeAccount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPaymentMethod.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentMethod = action.payload.paymentMethod;
      })
      .addCase(addPaymentMethod.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })

      // Update Payment Method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentMethod = action.payload.paymentMethod;
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })

      // Delete Payment Method
      .addCase(deletePaymentMethod.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(deletePaymentMethod.fulfilled, (state) => {
        state.paymentLoading = false;
        state.paymentMethod = null;
      })
      .addCase(deletePaymentMethod.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })

      // Fetch Payment Method
      .addCase(fetchPaymentMethod.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethod.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentMethod = action.payload.paymentMethod;
      })
      .addCase(fetchPaymentMethod.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
        state.paymentMethod = null;
      })
      .addCase(fetchEarnings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.loading = false;
        state.earnings = {
          available: action.payload.earnings?.available || 0,
          pending_clearance: action.payload.earnings?.pending_clearance || 0,
          lifetime_total: action.payload.earnings?.lifetime_total || 0,
          already_paid_out: action.payload.earnings?.already_paid_out || 0,
          currency: action.payload.earnings?.currency || "",
          breakdown: {
            available_by_currency:
              action.payload.breakdown?.available_by_currency || [],
            pending_by_currency:
              action.payload.breakdown?.pending_by_currency || [],
          },
        };
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Stripe Account Status
      .addCase(fetchStripeAccountStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStripeAccountStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.stripeAccount = action.payload;

        if (action.payload.isVerified) {
          state.verificationStatus = "verified";
        } else if (action.payload.isPending) {
          state.verificationStatus = "pending";
        } else {
          state.verificationStatus = "unverified";
        }
      })
      .addCase(fetchStripeAccountStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.verificationStatus = "unverified";
      })

      // Fetch Seller Onboarding
      .addCase(fetchSellerOnboarding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOnboarding.fulfilled, (state, action) => {
        state.loading = false;
        state.onboardingUrl = action.payload.onboardingUrl || "";
      })
      .addCase(fetchSellerOnboarding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Payout Methods
      .addCase(fetchPayoutMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayoutMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.payoutMethods = action.payload || [];
      })
      .addCase(fetchPayoutMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate Onboarding Link
      .addCase(generateOnboardingLink.pending, (state) => {
        state.buttonLoading = true;
        state.error = null;
      })
      .addCase(generateOnboardingLink.fulfilled, (state, action) => {
        state.buttonLoading = false;
        state.onboardingUrl = action.payload.onboardingUrl;
      })
      .addCase(generateOnboardingLink.rejected, (state, action) => {
        state.buttonLoading = false;
        state.error = action.payload;
      })

      // Generate Update Link
      .addCase(generateUpdateLink.pending, (state) => {
        state.buttonLoading = true;
        state.error = null;
      })
      .addCase(generateUpdateLink.fulfilled, (state, action) => {
        state.buttonLoading = false;
        state.onboardingUrl = action.payload.updateUrl || "";
      })
      .addCase(generateUpdateLink.rejected, (state, action) => {
        state.buttonLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setPaymentMethod, setVerificationStatus, resetPaymentState } =
  paymentSlice.actions;
export const selectPaymentMethod = (state) => state.payment.paymentMethod;
export const selectPaymentLoading = (state) => state.payment.paymentLoading;
export const selectEarnings = (state) => state.payment.earnings;
export const selectOnboardingUrl = (state) => state.payment.onboardingUrl;
export const selectVerificationStatus = (state) =>
  state.payment.verificationStatus;
export const selectPayoutMethods = (state) => state.payment.payoutMethods;
export const selectStripeAccount = (state) => state.payment.stripeAccount;
export const selectLoading = (state) => state.payment.loading;
export const selectButtonLoading = (state) => state.payment.buttonLoading;
export default paymentSlice.reducer;
