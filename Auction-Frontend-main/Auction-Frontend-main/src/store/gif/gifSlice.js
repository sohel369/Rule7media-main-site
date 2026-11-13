import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import gifService from "./gifService";

export const getGifs = createAsyncThunk("gif/getGifs", async (_, thunkAPI) => {
  try {
    return await gifService.getGifs();
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Failed to fetch GIFs";
    return thunkAPI.rejectWithValue(message);
  }
});

export const addGif = createAsyncThunk(
  "gif/addGif",
  async (formData, thunkAPI) => {
    try {
      return await gifService.addGif(formData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload GIF";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const updateGifById = createAsyncThunk(
  "gif/updateGif",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await gifService.updateGifById(id, formData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to update";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const deleteGifById = createAsyncThunk(
  "gif/deleteGif",
  async (id, thunkAPI) => {
    try {
      await gifService.deleteGifById(id);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to delete";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const getPublicGifs = createAsyncThunk(
  "gif/getPublic",
  async (_, thunkAPI) => {
    try {
      return await gifService.getPublicGifs();
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to load public ads");
    }
  },
);

export const trackImpression = createAsyncThunk(
  "gif/trackImpression",
  async (adId) => {
    await gifService.trackImpression(adId);
    return adId;
  },
);

export const trackClick = createAsyncThunk("gif/trackClick", async (adId) => {
  await gifService.trackClick(adId);
  return adId;
});
export const getGifById = createAsyncThunk(
  "gif/getById",
  async (id, thunkAPI) => {
    try {
      return await gifService.getGifById(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "gif not found",
      );
    }
  },
);
const gifSlice = createSlice({
  name: "gif",
  initialState: {
    gifs: [],
    publicGifs: [],
    singleGif: null,
    loading: false,
    error: null,
    success: false,
    message: "",
  },
  reducers: {
    resetGif: (state) => {
      state.success = false;
      state.error = null;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(getGifs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGifs.fulfilled, (state, action) => {
        state.loading = false;
        state.gifs = action.payload;
      })
      .addCase(getGifs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getGifById.pending, (state) => {
        state.loading = true;
        state.singleGif = null;
      })
      .addCase(getGifById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleGif = action.payload;
      })
      .addCase(getGifById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPublicGifs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPublicGifs.fulfilled, (state, action) => {
        state.loading = false;
        state.publicGifs = action.payload;
      })
      .addCase(getPublicGifs.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addGif.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addGif.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.gifs.unshift(action.payload);
        state.message = "GIF campaign uploaded successfully!";
      })
      .addCase(addGif.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateGifById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.gifs.findIndex((g) => g._id === action.payload._id);
        if (index !== -1) state.gifs[index] = action.payload;
        state.message = "Updated successfully!";
      })

      .addCase(deleteGifById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.gifs = state.gifs.filter((g) => g._id !== action.payload);
        state.message = "Deleted successfully!";
      })
      .addCase(trackImpression.fulfilled, () => {})
      .addCase(trackClick.fulfilled, () => {});
  },
});

export const { resetGif } = gifSlice.actions;

export default gifSlice.reducer;
