import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import planeService from "./pricingService";

export const fetchPlanes = createAsyncThunk(
  "planes/fetchPlanes",
  async (_, thunkAPI) => {
    try {
      return await planeService.fetchPlane();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const addPlane = createAsyncThunk(
  "planes/addPlane",
  async (plan, thunkAPI) => {
    try {
      return await planeService.createplane(plan);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const updatePlane = createAsyncThunk(
  "planes/updatePlane",
  async ({ id, plan }, thunkAPI) => {
    try {
      return await planeService.updateplan(id, plan);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const deletePlane = createAsyncThunk(
  "planes/deletePlane",
  async (id, thunkAPI) => {
    try {
      return await planeService.deleteplan(id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const planeSlice = createSlice({
  name: "planes",
  initialState: {
    planes: [],
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetPlane: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanes.fulfilled, (state, action) => {
        state.loading = false;
        state.planes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPlanes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addPlane.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(addPlane.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.planes.push(action.payload);
      })
      .addCase(addPlane.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })
      .addCase(updatePlane.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlane.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.planes.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.planes[index] = action.payload;
      })
      .addCase(updatePlane.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePlane.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlane.fulfilled, (state, action) => {
        state.loading = false;
        state.planes = state.planes.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePlane.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPlane } = planeSlice.actions;
export default planeSlice.reducer;
