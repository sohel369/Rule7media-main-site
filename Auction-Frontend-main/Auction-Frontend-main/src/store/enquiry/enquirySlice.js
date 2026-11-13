import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import enquiryService from "./enquiryService";

// =====================
// Async Thunks
// =====================

// Submit new enquiry
export const submitEnquiryAsync = createAsyncThunk(
  "enquiry/submit",
  async (enquiryData, { rejectWithValue }) => {
    try {
      const response = await enquiryService.submitEnquiry(enquiryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Get all enquiries (Admin)
export const getAllEnquiriesAsync = createAsyncThunk(
  "enquiry/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await enquiryService.getAllEnquiries();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Get enquiry by ID (Admin)
export const getEnquiryByIdAsync = createAsyncThunk(
  "enquiry/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await enquiryService.getEnquiryById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Update enquiry status (Admin)
export const updateEnquiryStatusAsync = createAsyncThunk(
  "enquiry/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await enquiryService.updateEnquiryStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// =====================
// Slice
// =====================

const initialState = {
  loading: false,
  success: false,
  error: null,
  enquiryResponse: null,
  allEnquiries: [],
  singleEnquiry: null,
};

const enquirySlice = createSlice({
  name: "enquiry",
  initialState,
  reducers: {
    resetEnquiryState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.enquiryResponse = null;
      state.singleEnquiry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit enquiry
      .addCase(submitEnquiryAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitEnquiryAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.enquiryResponse = action.payload;
      })
      .addCase(submitEnquiryAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get all enquiries
      .addCase(getAllEnquiriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllEnquiriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.allEnquiries = action.payload.data || [];
      })
      .addCase(getAllEnquiriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single enquiry by ID
      .addCase(getEnquiryByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnquiryByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.singleEnquiry = action.payload.data || null;
      })
      .addCase(getEnquiryByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update enquiry status
      .addCase(updateEnquiryStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnquiryStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update the enquiry in allEnquiries array if exists
        const index = state.allEnquiries.findIndex(
          (e) => e._id === action.payload.data._id,
        );
        if (index !== -1) state.allEnquiries[index] = action.payload.data;
      })
      .addCase(updateEnquiryStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetEnquiryState } = enquirySlice.actions;
export default enquirySlice.reducer;
