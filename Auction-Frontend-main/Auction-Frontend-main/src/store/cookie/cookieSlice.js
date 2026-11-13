import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cookieService from "./cookieService";

// Get cookie policy
export const getCookie = createAsyncThunk(
  "cookie/getCookie",
  async (_, thunkAPI) => {
    try {
      return await cookieService.getCookie();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Update cookie policy
export const updateCookie = createAsyncThunk(
  "cookie/updateCookie",
  async (data, thunkAPI) => {
    try {
      return await cookieService.updateCookie(data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  cookie: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const cookieSlice = createSlice({
  name: "cookie",
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
      .addCase(getCookie.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCookie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cookie = action.payload;
      })
      .addCase(getCookie.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update
      .addCase(updateCookie.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCookie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cookie = action.payload;
      })
      .addCase(updateCookie.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = cookieSlice.actions;
export default cookieSlice.reducer;
