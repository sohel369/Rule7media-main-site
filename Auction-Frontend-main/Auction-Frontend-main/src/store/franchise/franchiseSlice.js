import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import franchiseService from "./franchiseService";

export const getfranchise = createAsyncThunk(
  "franchise/getFranchise",
  async (
    { page = 1, limit = 10, formType = "all", search = "" } = {},
    thunkAPI,
  ) => {
    try {
      return await franchiseService.getFranchise({
        page,
        limit,
        formType,
        search,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch franchise";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const addFranchise = createAsyncThunk(
  "franchise/addFranchise",
  async (formData, thunkAPI) => {
    try {
      return await franchiseService.addFranchise(formData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload franchise";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const sendManualEmail = createAsyncThunk(
  "franchise/sendManualEmail",
  async ({ to, subject, body }, thunkAPI) => {
    try {
      return await franchiseService.sendEmail({ to, subject, body });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Email send failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const updateFranchiseStatus = createAsyncThunk(
  "franchise/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      return await franchiseService.updateStatus(id, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
export const deleteFranchiseById = createAsyncThunk(
  "franchise/deleteFranchise",
  async (id, thunkAPI) => {
    try {
      return await franchiseService.deleteFranchise(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
const franchiseSlice = createSlice({
  name: "franchise",
  initialState: {
    franchise: [],
    loading: false,
    error: null,
    success: false,
    message: "",
    emailSending: false,
    emailSuccess: false,
    emailError: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },
  reducers: {
    resetFranchise: (state) => {
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getfranchise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getfranchise.fulfilled, (state, action) => {
        state.loading = false;
        state.franchise = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getfranchise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFranchise.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addFranchise.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.franchise.unshift(action.payload);
        state.message = "Franchise added successfully!";
      })
      .addCase(addFranchise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendManualEmail.pending, (state) => {
        state.emailSending = true;
        state.emailError = null;
      })
      .addCase(sendManualEmail.fulfilled, (state) => {
        state.emailSending = false;
        state.emailSuccess = true;
      })
      .addCase(sendManualEmail.rejected, (state, action) => {
        state.emailSending = false;
        state.emailError = action.payload;
      })
      .addCase(updateFranchiseStatus.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const idx = state.franchise.findIndex((f) => f._id === updated._id);
        if (idx !== -1) state.franchise[idx] = updated;
      })
      .addCase(deleteFranchiseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteFranchiseById.fulfilled, (state, action) => {
        state.loading = false;

        state.franchise = state.franchise.filter(
          (item) => item._id !== action.meta.arg,
        );

        state.success = true;
        state.message = "Franchise deleted successfully";
      })

      .addCase(deleteFranchiseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
        state.success = false;
      });
  },
});

export const { resetFranchise } = franchiseSlice.actions;

export default franchiseSlice.reducer;
