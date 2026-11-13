// fleetownerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import fleetOwnerService from "./fleetownerService";
import { toast } from "react-toastify";

export const addfleetauctiondata = createAsyncThunk(
  "fleetowner/addfleetauctiondata",
  async (data, thunkAPI) => {
    try {
      const res = await fleetOwnerService.addfleetauction(data);
      return res.data;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getfleetauctiondata = createAsyncThunk(
  "fleetowner/getfleetauctiondata",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      return await fleetOwnerService.getfleetauctiondata(page, limit);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const gettopfleetauction = createAsyncThunk(
  "fleetowner/gettopfleetauction",
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      return await fleetOwnerService.gettopfleetauction(page, limit);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const getfleetauctionbyid = createAsyncThunk(
  "fleetowner/getfleetauctionbyid",
  async (id, thunkAPI) => {
    try {
      return await fleetOwnerService.getfleetauctionbyid(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const getAuctionsByFleetOwner = createAsyncThunk(
  "fleetowner/getAuctionsByFleetOwner",
  async (fleetOwnerId, thunkAPI) => {
    try {
      return await fleetOwnerService.getAuctionsByFleetOwner(fleetOwnerId);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const fetchBudgetRequestsForFleetOwner = createAsyncThunk(
  "fleetowner/fetchBudgetRequestsForFleetOwner",
  async (fleetOwnerId, thunkAPI) => {
    try {
      return await fleetOwnerService.fetchBudgetRequestsForFleetOwner(
        fleetOwnerId,
      );
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const updateFleetAuction = createAsyncThunk(
  "fleetowner/updateFleetAuction",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await fleetOwnerService.updateFleetAuction(id, data);
      return res.data;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const submitBudgetRequest = createAsyncThunk(
  "budget/submit",
  async (formData, thunkAPI) => {
    try {
      return await fleetService.submitBudgetRequest(formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit budget request",
      );
    }
  },
);

export const getVehicalAvalibality = createAsyncThunk(
  "fleetowner/getVehicalAvalibality",
  async (fleetOwnerId, thunkAPI) => {
    try {
      return await fleetOwnerService.getVehicalAvalibality(fleetOwnerId);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const fetchCPMData = createAsyncThunk(
  "fleetowner/fetchCPMData",
  async (id, thunkAPI) => {
    try {
      return await fleetOwnerService.fetchCPMData(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const approveFleetAuction = createAsyncThunk(
  "fleetOwner/approveFleetAuction",
  async (auctionId, thunkAPI) => {
    try {
      return await fleetOwnerService.approveFleetAuction(auctionId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);
export const rejectFleetAuction = createAsyncThunk(
  "fleetOwner/rejectFleetAuction",
  async (auctionId, thunkAPI) => {
    try {
      return await fleetOwnerService.rejectFleetAuction(auctionId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);
export const deleteSingleFleetAuctionById = createAsyncThunk(
  "auction/deleteSingleFleetAuctionById",
  async (id, thunkAPI) => {
    try {
      return await fleetOwnerService.deleteSingleFleetAuctionById(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const searchFleetAuction = createAsyncThunk(
  "fleetowner/searchFleetAuction",
  async (filters, thunkAPI) => {
    try {
      return await fleetOwnerService.searchFleetCampaigns(filters);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
const fleetOwnerSlice = createSlice({
  name: "fleetOwner",
  initialState: {
    form: null,
    fleetauction: null,
    fleetrequest: null,
    vehicalavalibality: null,
    searchedCampaigns: [],
    CPMData: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    searchLoading: false,
    searchError: null,
    searchSuccess: false,
    message: "",
  },
  reducers: {
    resetFleetOwner: (state) => {
      state.form = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addfleetauctiondata.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(addfleetauctiondata.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.form = action.payload;
      })
      .addCase(addfleetauctiondata.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getfleetauctiondata.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getfleetauctiondata.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.form = action.payload;
      })
      .addCase(getfleetauctiondata.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(gettopfleetauction.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(gettopfleetauction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.form = action.payload;
      })
      .addCase(gettopfleetauction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getfleetauctionbyid.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })

      .addCase(getfleetauctionbyid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.form = action.payload;
      })

      .addCase(getfleetauctionbyid.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.form = null;
      })
      .addCase(updateFleetAuction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateFleetAuction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(updateFleetAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAuctionsByFleetOwner.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })

      .addCase(getAuctionsByFleetOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fleetauction = action.payload;
      })

      .addCase(getAuctionsByFleetOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.fleetauction = null;
      })

      .addCase(fetchBudgetRequestsForFleetOwner.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(fetchBudgetRequestsForFleetOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.fleetrequest = action.payload;
      })
      .addCase(fetchBudgetRequestsForFleetOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.fleetrequest = null;
      })
      .addCase(submitBudgetRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitBudgetRequest.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(submitBudgetRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      .addCase(getVehicalAvalibality.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getVehicalAvalibality.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.vehicalavalibality = action.payload;
      })
      .addCase(getVehicalAvalibality.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.vehicalavalibality = null;
      })
      .addCase(fetchCPMData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(fetchCPMData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.CPMData = action.payload;
      })
      .addCase(fetchCPMData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.CPMData = null;
      })
      .addCase(approveFleetAuction.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(approveFleetAuction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "Auction approved successfully";
        if (state.form && state.form.data && Array.isArray(state.form.data)) {
          state.form.data = state.form.data.map((auction) =>
            auction._id === action.meta.arg
              ? { ...auction, isApprovedByAdmin: true }
              : auction,
          );
        }
      })
      .addCase(approveFleetAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to approve auction";
      })
      .addCase(rejectFleetAuction.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(rejectFleetAuction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = "Auction reject successfully";
        state.status = action.payload;
      })
      .addCase(rejectFleetAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to reject auction";
      })
      .addCase(searchFleetAuction.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
        state.searchSuccess = false;
        state.searchedCampaigns = [];
      })
      .addCase(searchFleetAuction.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchSuccess = true;
        state.searchError = null;
        state.searchedCampaigns = action.payload.campaigns || [];
      })
      .addCase(searchFleetAuction.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchSuccess = false;
        state.searchError = action.payload || "Search failed";
        state.searchedCampaigns = [];
      });
    builder.addCase(deleteSingleFleetAuctionById.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(deleteSingleFleetAuctionById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(deleteSingleFleetAuctionById.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
  },
});

export const { resetFleetOwner } = fleetOwnerSlice.actions;
export default fleetOwnerSlice.reducer;
