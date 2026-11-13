// store/slices/deleteData.slice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import deleteDataService from "./deleteDataService";

// Send OTP
export const sendDeletionOTP = createAsyncThunk(
  "deleteData/sendDeletionOTP",
  async (email, thunkAPI) => {
    try {
      const response = await deleteDataService.sendDeletionOTP(email);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send OTP";
      return thunkAPI.rejectWithValue({ message, errorType: error.response?.data?.errorType });
    }
  }
);

// Resend OTP
export const resendDeletionOTP = createAsyncThunk(
  "deleteData/resendDeletionOTP",
  async (email, thunkAPI) => {
    try {
      const response = await deleteDataService.resendDeletionOTP(email);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend OTP";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify OTP
export const verifyDeletionOTP = createAsyncThunk(
  "deleteData/verifyDeletionOTP",
  async ({ email, otp }, thunkAPI) => {
    try {
      const response = await deleteDataService.verifyDeletionOTP(email, otp);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "OTP verification failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete All Data
export const deleteAllData = createAsyncThunk(
  "deleteData/deleteAllData",
  async ({ deletionToken, confirmText, email }, thunkAPI) => {
    try {
      const result = await deleteDataService.deleteAllData(deletionToken, confirmText, email);
      return result;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete data";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Check Status
export const checkDeletionStatus = createAsyncThunk(
  "deleteData/checkDeletionStatus",
  async (email, thunkAPI) => {
    try {
      const response = await deleteDataService.checkDeletionStatus(email);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to check status";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  step: "email",
  email: "",
  userId: null,
  deletionToken: null,
  otpSent: false,
  otpVerified: false,
  results: null,
  summary: null,
  totalDeleted: 0,
  deletionLog: null,
  activeOTP: false,
  canResend: false,
  resendTimer: 0,
  expiresIn: 0,
  isAdmin: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  errorType: null,
};

const deleteDataSlice = createSlice({
  name: "deleteData",
  initialState,
  reducers: {
    reset: (state) => {
      return initialState;
    },
    clearMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
      state.errorType = null;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    startResendTimer: (state) => {
      state.canResend = false;
      state.resendTimer = 60;
    },
    decrementResendTimer: (state) => {
      if (state.resendTimer > 0) {
        state.resendTimer -= 1;
      }
      if (state.resendTimer === 0) {
        state.canResend = true;
      }
    },
    updateExpiresIn: (state, action) => {
      state.expiresIn = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendDeletionOTP.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorType = null;
      })
      .addCase(sendDeletionOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.otpSent = true;
        state.step = "otp";
        state.email = action.payload.email;
        state.userId = action.payload.userId;
        state.message = action.payload.message;
        state.isAdmin = action.payload.isAdmin || false;
        state.canResend = false;
        state.resendTimer = 60;
        state.errorType = null;
      })
      .addCase(sendDeletionOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to send OTP";
        state.errorType = action.payload?.errorType || null;
      })

      // Resend OTP
      .addCase(resendDeletionOTP.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(resendDeletionOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
        state.canResend = false;
        state.resendTimer = 60;
      })
      .addCase(resendDeletionOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Verify OTP
      .addCase(verifyDeletionOTP.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(verifyDeletionOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.otpVerified = true;
        state.deletionToken = action.payload.deletionToken;
        state.step = "confirm";
        state.message = action.payload.message;
      })
      .addCase(verifyDeletionOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete All Data
      .addCase(deleteAllData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteAllData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.results = action.payload.results;
        state.summary = action.payload.summary;
        state.totalDeleted = action.payload.summary?.totalDeleted || 0;
        state.deletionLog = {
          deletedBy: action.payload.deletedBy,
          deletedAt: action.payload.deletedAt,
          totalDeleted: action.payload.summary?.totalDeleted,
        };
        state.step = "completed";
        state.message = action.payload.message;
      })
      .addCase(deleteAllData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Check Status
      .addCase(checkDeletionStatus.pending, (state) => {
        state.isError = false;
      })
      .addCase(checkDeletionStatus.fulfilled, (state, action) => {
        state.activeOTP = action.payload.hasActiveOTP;
        state.expiresIn = action.payload.expiresIn || 0;
      })
      .addCase(checkDeletionStatus.rejected, (state, action) => {
        console.error("Status check failed:", action.payload);
      });
  },
});

export const { 
  reset, 
  clearMessage, 
  setStep, 
  setEmail, 
  startResendTimer, 
  decrementResendTimer,
  updateExpiresIn 
} = deleteDataSlice.actions;

export default deleteDataSlice.reducer;