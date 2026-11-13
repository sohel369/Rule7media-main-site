import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import vehicleWrapService from "./vehicalwrapperService";

// Async Thunks
export const fetchVehicleWraps = createAsyncThunk(
  "vehicleWraps/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await vehicleWrapService.getVehicleWraps();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wraps";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const fetchVehicleWrapById = createAsyncThunk(
  "vehicleWraps/fetchById",
  async (id, thunkAPI) => {
    try {
      return await vehicleWrapService.getVehicleWrapById(id);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wrap";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const createVehicleWrap = createAsyncThunk(
  "vehicleWraps/create",
  async (data, thunkAPI) => {
    try {
      return await vehicleWrapService.addVehicleWrap(data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Creation failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const modifyVehicleWrap = createAsyncThunk(
  "vehicleWraps/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await vehicleWrapService.updateVehicleWrap(id, data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const removeVehicleWrap = createAsyncThunk(
  "vehicleWraps/delete",
  async (id, thunkAPI) => {
    try {
      await vehicleWrapService.deleteVehicleWrap(id);
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Deletion failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  wraps: [],
  currentWrap: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  operation: null, // 'fetch' | 'create' | 'update' | 'delete'
};

const vehicleWrapSlice = createSlice({
  name: "vehicleWraps",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
      state.operation = null;
    },
    setCurrentWrap: (state, action) => {
      state.currentWrap = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Wraps
      .addCase(fetchVehicleWraps.pending, (state) => {
        state.isLoading = true;
        state.operation = "fetch";
      })
      .addCase(fetchVehicleWraps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wraps = action.payload;
      })
      .addCase(fetchVehicleWraps.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Fetch Single Wrap
      .addCase(fetchVehicleWrapById.pending, (state) => {
        state.isLoading = true;
        state.operation = "fetch";
      })
      .addCase(fetchVehicleWrapById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentWrap = action.payload;
      })
      .addCase(fetchVehicleWrapById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Create New Wrap
      .addCase(createVehicleWrap.pending, (state) => {
        state.isLoading = true;
        state.operation = "create";
      })
      .addCase(createVehicleWrap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wraps.push(action.payload);
        state.currentWrap = action.payload;
        state.message = "Wrap created successfully!";
      })
      .addCase(createVehicleWrap.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update Wrap
      .addCase(modifyVehicleWrap.pending, (state) => {
        state.isLoading = true;
        state.operation = "update";
      })
      .addCase(modifyVehicleWrap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wraps = state.wraps.map((wrap) =>
          wrap._id === action.payload._id ? action.payload : wrap,
        );
        state.currentWrap = action.payload;
        state.message = "Wrap updated successfully!";
      })
      .addCase(modifyVehicleWrap.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete Wrap
      .addCase(removeVehicleWrap.pending, (state) => {
        state.isLoading = true;
        state.operation = "delete";
      })
      .addCase(removeVehicleWrap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wraps = state.wraps.filter((wrap) => wrap._id !== action.payload);
        state.currentWrap = null;
        state.message = "Wrap deleted successfully!";
      })
      .addCase(removeVehicleWrap.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setCurrentWrap } = vehicleWrapSlice.actions;
export default vehicleWrapSlice.reducer;
