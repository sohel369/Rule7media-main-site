import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cpmService from "./cpmService";

export const createCpm = createAsyncThunk(
  "cpm/createCpm",
  async (data, thunkAPI) => {
    try {
      return await cpmService.createCpm(data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create CPM";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const getAllCpm = createAsyncThunk(
  "cpm/getAllCpm",
  async ({ pageType } = {}, thunkAPI) => {
    try {
      return await cpmService.getAllCpm(pageType);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch");
    }
  }
);
// export const getAllCpm = createAsyncThunk(
//   "cpm/getAllCpm",
//   async (_, thunkAPI) => {
//     try {
//       return await cpmService.getAllCpm();
//     } catch (error) {
//       const message =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to fetch CPM data";
//       return thunkAPI.rejectWithValue(message);
//     }
//   },
// );

export const updateCpm = createAsyncThunk(
  "cpm/updateCpm",
  async (data, thunkAPI) => {
    try {
      const result = await cpmService.updateCpm(data);
      // Refresh the data after successful update
      thunkAPI.dispatch(getAllCpm());
      return result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const deleteCpm = createAsyncThunk(
  "cpm/deleteCpm",
  async (id, thunkAPI) => {
    try {
      await cpmService.deleteCpm(id);
      // Refresh the data after successful delete
      thunkAPI.dispatch(getAllCpm());
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Delete failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  cpm: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const cpmSlice = createSlice({
  name: "cpm",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    clearMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create CPM
      .addCase(createCpm.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(createCpm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Add new item to existing array
        if (Array.isArray(state.cpm)) {
          state.cpm.push(action.payload);
        } else {
          state.cpm = [action.payload];
        }
        state.message = "CPM created successfully";
      })
      .addCase(createCpm.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Get All CPM
      .addCase(getAllCpm.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getAllCpm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.cpm = action.payload || [];
        state.message = "CPM data loaded successfully";
      })
      .addCase(getAllCpm.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.cpm = [];
        state.message = action.payload;
      })

      // Update CPM
      .addCase(updateCpm.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateCpm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "CPM updated successfully";
      })
      .addCase(updateCpm.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete CPM
      .addCase(deleteCpm.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteCpm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = "CPM deleted successfully";
      })
      .addCase(deleteCpm.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearMessage } = cpmSlice.actions;
export default cpmSlice.reducer;
