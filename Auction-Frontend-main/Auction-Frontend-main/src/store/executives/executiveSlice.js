import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ExecutivesService from "./executiveService";

// Thunks
export const getExecutives = createAsyncThunk(
  "executives/getExecutives",
  async (_, thunkAPI) => {
    try {
      return await ExecutivesService.getExecutives();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const addExecutive = createAsyncThunk(
  "executives/addExecutive",
  async (data, thunkAPI) => {
    try {
      const res = await ExecutivesService.addExecutive(data);
      return res.data;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const updateExecutiveById = createAsyncThunk(
  "executives/updateExecutiveById",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await ExecutivesService.updateExecutiveById(id, data);
      return res.data;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const deleteExecutiveById = createAsyncThunk(
  "executives/deleteExecutiveById",
  async (id, thunkAPI) => {
    try {
      await ExecutivesService.deleteExecutiveById(id);
      return id;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

const executiveSlice = createSlice({
  name: "executives",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExecutives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExecutives.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getExecutives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(addExecutive.pending, (state) => {
        state.error = null;
      })
      .addCase(addExecutive.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(addExecutive.rejected, (state, action) => {
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(updateExecutiveById.pending, (state) => {
        state.error = null;
      })
      .addCase(updateExecutiveById.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (ex) => ex._id === action.payload._id,
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateExecutiveById.rejected, (state, action) => {
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(deleteExecutiveById.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteExecutiveById.fulfilled, (state, action) => {
        state.data = state.data.filter((ex) => ex._id !== action.payload);
      })
      .addCase(deleteExecutiveById.rejected, (state, action) => {
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default executiveSlice.reducer;
