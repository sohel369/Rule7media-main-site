import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import campaignService from "./campaignService";

const currentUserRole = localStorage.getItem("userType");
export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchAll",
  async (_, thunkAPI) => {
    try {
      const campaigns = await campaignService.getCampaigns();
      return campaigns;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
export const fetchCampaignsbyuserid = createAsyncThunk(
  "campaigns/fetchMy",
  async (_, thunkAPI) => {
    try {
      const campaigns = await campaignService.getCampaignsByUserId(); // Yeh wala call
      return campaigns;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to load your campaigns",
      );
    }
  },
);
export const fetchCampaignById = createAsyncThunk(
  "campaigns/fetchById",
  async (id, thunkAPI) => {
    try {
      const campaign = await campaignService.getCampaignById(id);
      return campaign;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
// Create campaign
export const createNewCampaign = createAsyncThunk(
  "campaigns/create",
  async (campaignData, thunkAPI) => {
    try {
      const campaign = await campaignService.createCampaign(campaignData);
      return campaign;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message,
      );
    }
  },
);
export const updateExistingCampaign = createAsyncThunk(
  "campaigns/update",
  async ({ id, data }, thunkAPI) => {
    try {
      const updated = await campaignService.updateCampaign(id, data);
      return updated;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

// Delete campaign
export const deleteExistingCampaign = createAsyncThunk(
  "campaigns/delete",
  async (id, thunkAPI) => {
    try {
      await campaignService.deleteCampaign(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
export const searchCampaigns = createAsyncThunk(
  "campaigns/search",
  async (searchData, thunkAPI) => {
    try {
      const result = await campaignService.searchCampaigns(searchData);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
const campaignSlice = createSlice({
  name: "campaigns",
  initialState: {
    campaigns: [],
    myCampaigns: [],
    searchResults: [],
    currentCampaign: null,
    isLoading: false,
    error: null,
    successMessage: null,
  },

  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCampaignsbyuserid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaignsbyuserid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myCampaigns = action.payload;
      })
      .addCase(fetchCampaignsbyuserid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCampaignById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentCampaign = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createNewCampaign.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.campaigns.push(action.payload);
        state.successMessage = "Campaign created successfully!";
      })
      .addCase(createNewCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateExistingCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateExistingCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.myCampaigns.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.myCampaigns[index] = action.payload;
        }
        state.successMessage = "Campaign updated successfully!";
      })
      .addCase(updateExistingCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update campaign";
      })
      .addCase(deleteExistingCampaign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteExistingCampaign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myCampaigns = state.myCampaigns.filter(
          (c) => c._id !== action.payload,
        );
        state.successMessage = "Campaign deleted successfully!";
      })
      .addCase(deleteExistingCampaign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete campaign";
      })
      .addCase(searchCampaigns.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchCampaigns.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.campaigns || [];
      })
      .addCase(searchCampaigns.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});
export const { clearMessages, clearSearchResults } = campaignSlice.actions;
export default campaignSlice.reducer;
