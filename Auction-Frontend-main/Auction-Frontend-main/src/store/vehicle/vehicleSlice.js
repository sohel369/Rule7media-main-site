import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import vehicleService from "./vehicleService";
// Async thunk to fetch vehicles
export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await vehicleService.getAllVehicles();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicles",
      );
    }
  },
);

// Async thunk to create a vehicle
export const createVehicle = createAsyncThunk(
  "vehicles/create",
  async (vehicleData, thunkAPI) => {
    try {
      return await vehicleService.addVehicle(vehicleData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add vehicle",
      );
    }
  },
);
export const getVehicleDetails = createAsyncThunk(
  "vehicles/getDetails",
  async (vehicle, thunkAPI) => {
    try {
      return await vehicleService.getVehicleDetails(vehicle);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicle details",
      );
    }
  },
);
export const uploadVehiclesFromCsv = createAsyncThunk(
  "vehicles/uploadCsv",
  async (vehicles, thunkAPI) => {
    try {
      return await vehicleService.uploadCsvData(vehicles);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "CSV Upload failed",
      );
    }
  },
);
export const updateVehicle = createAsyncThunk(
  "vehicles/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await vehicleService.updateVehicle(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update vehicle",
      );
    }
  },
);
export const deleteVehicle = createAsyncThunk(
  "vehicles/delete",
  async (id, thunkAPI) => {
    try {
      await vehicleService.deleteVehicle(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete vehicle",
      );
    }
  },
);
export const approveVehicle = createAsyncThunk(
  "vehicles/approve",
  async ({ vehicleId }, thunkAPI) => {
    try {
      return await vehicleService.approveVehicle(vehicleId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to approve vehicle",
      );
    }
  },
);

/////////////fleetOwenr
export const fetchVehiclesbyfleetOwner = createAsyncThunk(
  "vehicles/fetchvehciclebyfleetowner",
  async (fleetOwnerId, thunkAPI) => {
    try {
      return await vehicleService.getVehiclesbyfleetower(fleetOwnerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch vehicles",
      );
    }
  },
);
export const createVehiclebyfleetower = createAsyncThunk(
  "vehicles/createbyfleetowner",
  async ({ fleetOwnerId, formData }, thunkAPI) => {
    try {
      return await vehicleService.createVehiclebyfleetower(
        fleetOwnerId,
        formData,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add vehicle",
      );
    }
  },
);
export const updateVehiclebyfleetower = createAsyncThunk(
  "vehicles/updateByFleetOwner",
  async ({ id, data }, thunkAPI) => {
    try {
      return await vehicleService.updateVehiclebyfleetower(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update vehicle",
      );
    }
  },
);
export const deleteVehiclbyfleetower = createAsyncThunk(
  "vehicles/deleteByFleetOwner",
  async (id, thunkAPI) => {
    try {
      await vehicleService.deleteVehiclbyfleetower(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete vehicle",
      );
    }
  },
);

export const uploadVehicleCSVByFleetOwner = createAsyncThunk(
  "vehicles/uploadCsvbyfleetOwner",
  async ({ vehicles, fleetOwnerId }, thunkAPI) => {
    try {
      return await vehicleService.uploadVehicleCSVByFleetOwner(
        vehicles,
        fleetOwnerId,
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "CSV Upload failed",
      );
    }
  },
);

const vehicleSlice = createSlice({
  name: "vehicles",
  initialState: {
    list: [],
    fleetvehclelist: [],
    selectedVehicle: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getVehicleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicleDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVehicle = action.payload.data;
      })
      .addCase(getVehicleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadVehiclesFromCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadVehiclesFromCsv.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadSuccess = true;
        state.list = [...state.list, ...action.payload.data];
      })
      .addCase(uploadVehiclesFromCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadSuccess = false;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const index = state.list.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
        state.loading = false;
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DELETE
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.list = state.list.filter((v) => v._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(approveVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //////fleetOwener
      .addCase(fetchVehiclesbyfleetOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesbyfleetOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.fleetvehclelist = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchVehiclesbyfleetOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVehiclebyfleetower.pending, (state) => {
        state.loading = true;
      })
      .addCase(createVehiclebyfleetower.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createVehiclebyfleetower.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateVehiclebyfleetower.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehiclebyfleetower.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateVehiclebyfleetower.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteVehiclbyfleetower.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehiclbyfleetower.fulfilled, (state, action) => {
        state.loading = false;

        // More defensive
        if (action.payload) {
          state.fleetvehclelist = state.fleetvehclelist.filter(
            (v) => v && v._id !== action.payload,
          );
          state.list = state.list.filter((v) => v && v._id !== action.payload);
        }
      })
      .addCase(deleteVehiclbyfleetower.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(uploadVehicleCSVByFleetOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadVehicleCSVByFleetOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadSuccess = true;
        // action.payload.details.savedVehicles se push karo, single vehicle nahi
        if (action.payload?.details?.savedVehicles?.length > 0) {
          state.fleetvehclelist = [
            ...state.fleetvehclelist,
            ...action.payload.details.savedVehicles,
          ];
        }
      })
      .addCase(uploadVehicleCSVByFleetOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.uploadSuccess = false;
      });
  },
});
export const { setSelectedVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
