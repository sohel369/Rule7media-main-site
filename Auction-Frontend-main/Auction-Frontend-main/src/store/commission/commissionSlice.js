import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import commissionService from "./commissionService";

export const fetchCommission = createAsyncThunk(
  "commission/fetchCommission",
  async (_, thunkAPI) => {
    try {
      const response = await commissionService.fetchCommission();
      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const updateCommission = createAsyncThunk(
  "commission/updateCommission",
  async ({ planDuration, commissionRate }, thunkAPI) => {
    try {
      const response = await commissionService.updateCommission(
        planDuration,
        commissionRate,
      );
      return { planDuration, updatedCommission: response };
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

const initialState = {
  commission: {
    threeMonth: 0,
    sixMonth: 0,
    twelveMonth: 0,
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const commissionSlice = createSlice({
  name: "commission",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommission.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchCommission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const commissions = action.payload.commissions || [];
        state.commission = commissions.reduce(
          (acc, curr) => {
            // Map planDuration to state keys
            const key = {
              threeMonth: "threeMonth",
              sixMonth: "sixMonth",
              twelveMonth: "twelveMonth",
            }[curr.planDuration];
            if (key) acc[key] = curr.commissionRate;
            return acc;
          },
          { threeMonth: 0, sixMonth: 0, twelveMonth: 0 },
        );
        if (commissions.length === 0) {
          state.message = "No commission data available.";
        }
      })
      .addCase(fetchCommission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(updateCommission.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(updateCommission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const { planDuration, updatedCommission } = action.payload;
        const key = {
          threeMonth: "threeMonth",
          sixMonth: "sixMonth",
          twelveMonth: "twelveMonth",
        }[planDuration];
        if (key) {
          state.commission[key] = updatedCommission.commissionRate;
        }
        state.message = "Commission rate updated successfully!";
      })
      .addCase(updateCommission.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      });
  },
});

export const { reset } = commissionSlice.actions;
export default commissionSlice.reducer;
