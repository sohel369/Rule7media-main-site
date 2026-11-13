import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import termsService from "./termsService";

// Get terms policy
export const fetchterms = createAsyncThunk(
  "terms/fetchterms",
  async (_, thunkAPI) => {
    try {
      return await termsService.getterms();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Update terms policy
export const updateterms = createAsyncThunk(
  "terms/updateterms",
  async (data, thunkAPI) => {
    try {
      return await termsService.updateterms(data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  terms: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const termsSlice = createSlice({
  name: "terms",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchterms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchterms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.terms = action.payload;
        state.message = "Terms loaded successfully";
      })
      .addCase(fetchterms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update
      .addCase(updateterms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateterms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.terms = action.payload;
        state.message = "Terms updated successfully";
      })
      .addCase(updateterms.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = termsSlice.actions;
export default termsSlice.reducer;
