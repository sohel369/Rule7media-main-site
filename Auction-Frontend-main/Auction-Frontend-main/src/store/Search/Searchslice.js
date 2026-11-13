import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import searchService from "./Searchservice";

export const searchMarketplace = createAsyncThunk(
  "search/searchMarketplace",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await searchService.searchMarketplaceApi(payload);
      return data;
    } catch (error) {
      // Prefer backend's exact message; fall back only if truly no response
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Search failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  loading: false,
  results: [],
  resultType: "",
  count: 0,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.resultType = "";
      state.count = 0;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMarketplace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMarketplace.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.results = data?.results || [];
        state.resultType = data?.resultType || "";
        state.count = data?.count ?? state.results.length;
        state.error = null;
      })
      .addCase(searchMarketplace.rejected, (state, action) => {
        state.loading = false;
        state.results = [];
        state.resultType = "";
        state.count = 0;
        state.error = action.payload || "Search failed. Please try again.";
      });
  },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;