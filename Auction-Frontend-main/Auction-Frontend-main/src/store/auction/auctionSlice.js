import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import auctionService from "./auctionService";

export const createAuction = createAsyncThunk(
  "auction/createAuction",
  async (payload, thunkAPI) => {
    try {
      return await auctionService.createAuction(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const createAuctionsFromCSV = createAsyncThunk(
  "auction/createAuctionsFromCSV",
  async (payload, thunkAPI) => {
    try {
      return await auctionService.createAuctionsFromCSV(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getAllAuctions = createAsyncThunk(
  "auction/getAllAuactions",
  async (payload, thunkAPI) => {
    try {
      return await auctionService.getAllAuctions(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getAllAuctionscombined = createAsyncThunk(
  "auction/getAllAuctionscombined",
  async (payload, thunkAPI) => {
    try {
      return await auctionService.getAllAuctionscombined(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getSingleAuctionById = createAsyncThunk(
  "auction/getSingleAuctionById",
  async (id, thunkAPI) => {
    try {
      const data = await auctionService.getSingleAuctionById(id);

      return data;
    } catch (error) {
      const message =
        `${id} - ` + (error.response && error.response.data.message) ||
        error.message;
      console.error("❌ API error:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getLiveAuctionsbysellerid = createAsyncThunk(
  "auction/getLiveAuctionsbysellerid",
  async (sellerId, thunkAPI) => {
    try {
      return await auctionService.getLiveAuctionsbysellerid(sellerId);
    } catch (error) {
      const message =
        `${sellerId} - ` + (error.response && error.response.data.message) ||
        error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const updateAuctionStatus = createAsyncThunk(
  "auction/updateAuctionStatus",
  async (payload, thunkAPI) => {
    //directly chnage status
    try {
      return await auctionService.updateAuctionStatus(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const selectAuctionWinner = createAsyncThunk(
  "auction/selectAuctionWinner",
  async (payload, thunkAPI) => {
    try {
      return await auctionService.selectAuctionWinner(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getSellerAuction = createAsyncThunk(
  "auction/getSellerAuction",
  async (_, thunkAPI) => {
    try {
      return await auctionService.getSellerAuction();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const deleteSingleAuctionById = createAsyncThunk(
  "auction/deleteSingleAuctionById",
  async (id, thunkAPI) => {
    try {
      return await auctionService.deleteSingleAuctionById(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const deleteAuctionByAdminById = createAsyncThunk(
  "auction/deleteAuctionByAdminById",
  async (id, thunkAPI) => {
    try {
      return await auctionService.deleteAuctionByAdminById(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const updateSingleAuction = createAsyncThunk(
  "auction/updateSingleAuaction",
  async (payload, thunkAPI) => {
    try {
      return await auctionService.updateSingleAuction(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getWinnerDetail = createAsyncThunk(
  "auction/winnerDetail",
  async (id, thunkAPI) => {
    try {
      return await auctionService.getWinnerDetail(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getLiveAuctions = createAsyncThunk(
  "auction/getLiveAuctions",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const country = state.country.country || "United States";

      return await auctionService.getLiveAuctions(country);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getUpcomingAuctions = createAsyncThunk(
  "auction/getUpcomingAuctions",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const country = state.country.country || "United States";
      return await auctionService.getUpcomingAuctions(country);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getEndingAuctions = createAsyncThunk(
  "auction/getEndingAuctions",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const country = state.country.country || "United States";
      return await auctionService.getEndingAuctions(country);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const updatePaymentStatus = createAsyncThunk(
  "auction/updatePaymentStatus",
  async (id, thunkAPI) => {
    try {
      return await auctionService.updatePaymentStatus(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getAuctionsBySellerWithBids = createAsyncThunk(
  "auction/getAuctionsBySellerWithBids",
  async (id, thunkAPI) => {
    try {
      return await auctionService.getAuctionsBySellerWithBids(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getAllAuctionWinners = createAsyncThunk(
  "auction/winners",
  async (_, thunkAPI) => {
    try {
      return await auctionService.getAllAuctionWinners();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const updateCampingStatus = createAsyncThunk(
  "auction/updateCampingStatus",
  async (payload, thunkAPI) => {
    //directly chnage status
    try {
      return await auctionService.updateCampingAdminStatus(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
const initialState = {
  auction: [],
  singleAuction: {},
  sellerAuction: [],
  auctionWinnerDetail: null,
  liveAuctions: [],
  liveAuction: {
    count: 0,
  },
  upComingAuctions: [],
  endingAuctions: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  csvUpload: {
    loading: false,
    error: null,
    success: false,
  },
};

const auctionSlice = createSlice({
  name: "auction",
  initialState,

  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
      state.csvUpload = {
        // Also reset the csvUpload state
        loading: false,
        error: null,
        success: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createAuction.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(createAuction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = action.payload.isError;
      state.isSuccess = action.payload.success;
      state.message = action.payload.message;
    });
    builder
      .addCase(createAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      .addCase(createAuctionsFromCSV.pending, (state) => {
        state.csvUpload.loading = true;
        state.csvUpload.error = null;
        state.csvUpload.success = false;
      })
      .addCase(createAuctionsFromCSV.fulfilled, (state, action) => {
        state.csvUpload.loading = false;
        state.csvUpload.success = true;
        state.csvUpload.successCount = action.payload.successCount || 0;
        state.csvUpload.errorCount = action.payload.errorCount || 0;
        state.csvUpload.errors = action.payload.errors || [];
        state.isSuccess = true;
        state.message =
          action.payload.message || "Auctions uploaded successfully";
        if (action.payload.createdAuctions) {
          state.auction = [...state.auction, ...action.payload.createdAuctions];
        }
      })
      .addCase(createAuctionsFromCSV.rejected, (state, action) => {
        state.csvUpload.loading = false;
        state.csvUpload.error =
          action.payload?.message || "Failed to upload CSV";
        state.isError = true;
        state.message = action.payload?.message || "Failed to upload CSV";
      });
    builder.addCase(getAllAuctions.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getAllAuctions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      state.auction = action.payload.data;
    });
    builder.addCase(getAllAuctions.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(getAllAuctionscombined.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getAllAuctionscombined.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      state.auction = action.payload.data;
    });
    builder
      .addCase(getAllAuctionscombined.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      .addCase(getSingleAuctionById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getSingleAuctionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message =
          action.payload?.message || "Auction fetched successfully";

        // FIX: Properly handle the response structure
        if (action.payload?.data) {
          // If response has data property (normal API response)
          state.singleAuction = action.payload.data;
        } else if (action.payload?._id) {
          // If response is the auction object directly
          state.singleAuction = action.payload;
        } else {
          // Fallback - use whatever we got
          state.singleAuction = action.payload || {};
        }
      })
      .addCase(getSingleAuctionById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      });
    builder.addCase(getLiveAuctionsbysellerid.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getLiveAuctionsbysellerid.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;

      // Handle different possible response structures
      if (typeof action.payload === "number") {
        state.liveAuction.count = action.payload;
      } else if (action.payload?.count !== undefined) {
        state.liveAuction.count = action.payload.count;
      } else if (action.payload?.data?.count !== undefined) {
        state.liveAuction.count = action.payload.data.count;
      } else {
        state.liveAuction.count = 0;
      }
    });
    builder.addCase(getLiveAuctionsbysellerid.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(updateAuctionStatus.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(updateAuctionStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(updateAuctionStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(updateCampingStatus.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(updateCampingStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(updateCampingStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });

    builder.addCase(getAuctionsBySellerWithBids.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getAuctionsBySellerWithBids.fulfilled, (state, action) => {
      state.singleAuction = Array.isArray(action.payload)
        ? action.payload[0]
        : action.payload;
    });
    builder.addCase(getAuctionsBySellerWithBids.rejected, (state, action) => {
      const errorMessage = action.payload?.message || "Unknown error";
      console.error("Rejected auctions fetch:", errorMessage);
      state.error = errorMessage;
    });
    builder.addCase(selectAuctionWinner.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(selectAuctionWinner.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      state.auctionWinnerDetail = action.payload.data;
    });
    builder.addCase(selectAuctionWinner.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(getSellerAuction.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getSellerAuction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      state.sellerAuction = action.payload.data;
    });
    builder.addCase(getSellerAuction.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(deleteSingleAuctionById.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(deleteSingleAuctionById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(deleteSingleAuctionById.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(updateSingleAuction.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(updateSingleAuction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = action.payload.isError;
      state.isSuccess = action.payload.isSuccess || true;
      state.message = action.payload.message;
    });
    builder.addCase(updateSingleAuction.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(getWinnerDetail.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getWinnerDetail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
      state.auctionWinnerDetail = action.payload.data;
    });
    builder.addCase(getWinnerDetail.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(getLiveAuctions.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getLiveAuctions.fulfilled, (state, action) => {
      state.isLoading = false;

      state.liveAuctions = action.payload.data;
    });
    builder.addCase(getLiveAuctions.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(getUpcomingAuctions.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getUpcomingAuctions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.upComingAuctions = action.payload.data;
    });
    builder.addCase(getUpcomingAuctions.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(getEndingAuctions.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(getEndingAuctions.fulfilled, (state, action) => {
      state.isLoading = false;
      state.endingAuctions = action.payload.data || [];
    });
    builder.addCase(getEndingAuctions.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    builder.addCase(updatePaymentStatus.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(updatePaymentStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(updatePaymentStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });
    //deleteAuctionByAdminById
    builder.addCase(deleteAuctionByAdminById.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    });
    builder.addCase(deleteAuctionByAdminById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(deleteAuctionByAdminById.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
    });

    builder.addCase(getAllAuctionWinners.pending, (state) => {
      state.isLoading = true;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
      state.auctionWinners = [];
    });
    builder.addCase(getAllAuctionWinners.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = true;
      state.message = "Auction winners fetched successfully";
      state.auctionWinners = action.payload || [];
    });
    builder.addCase(getAllAuctionWinners.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.payload.message;
      state.auctionWinners = [];
    });

    // Handle other actions...
  },
});

export const { reset } = auctionSlice.actions;
export default auctionSlice.reducer;
