import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import StatisticService from "./statisticService";

export const createStatistic = createAsyncThunk(
  "Statistic/createStatistic",
  async (data, thunkAPI) => {
    try {
      return await StatisticService.createStatistic(data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getStatistics = createAsyncThunk(
  "Statistic/getStatistics",
  async (_, thunkAPI) => {
    try {
      return await StatisticService.getStatistics();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const getStatisticsByCountry = createAsyncThunk(
  "Statistic/getStatisticsByCountry",
  async (country, thunkAPI) => {
    try {
      const data = await StatisticService.getStatisticsByCountry(country);

      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const updateStatistic = createAsyncThunk(
  "Statistic/updateStatistic",
  async ({ id, statisticData }, thunkAPI) => {
    try {
      if (!id) throw new Error("Invalid statistic ID");
      return await StatisticService.updateStatistic(id, statisticData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const deleteStatistic = createAsyncThunk(
  "Statistic/deleteStatistic",
  async (id, thunkAPI) => {
    try {
      await StatisticService.deleteStatistic(id);
      return id; // Return only the ID
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Delete failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  statistics: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
  currentStatistic: null,
};

const statisticSlice = createSlice({
  name: "statistic",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    setCurrentStatistic: (state, action) => {
      state.currentStatistic = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStatistic.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(createStatistic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.statistics.push(action.payload);
      })
      .addCase(createStatistic.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.statistics = action.payload;
      })
      .addCase(getStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      /////geetstatisticsbylanguage
      .addCase(getStatisticsByCountry.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getStatisticsByCountry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;

        state.statistics = (action.payload || []).map((stat) => ({
          ...stat,
          sources: (stat.sources || []).filter(
            (source) =>
              source &&
              typeof source.language === "string" &&
              source.language &&
              Array.isArray(source.url) &&
              source.url.length > 0 &&
              source.url.every((u) => typeof u === "string" && u.trim() !== ""),
          ),
        }));
      })

      .addCase(getStatisticsByCountry.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateStatistic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStatistic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.statistics.findIndex(
          (stat) => stat._id === action.payload._id,
        );
        if (index !== -1) {
          state.statistics[index] = action.payload;
        }
        if (state.currentStatistic?._id === action.payload._id) {
          state.currentStatistic = action.payload;
        }
      })
      .addCase(updateStatistic.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteStatistic.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteStatistic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.statistics = state.statistics.filter(
          (stat) => stat._id !== action.payload, // Filter by ID
        );
        if (state.currentStatistic?._id === action.payload) {
          state.currentStatistic = null;
        }
      })
      .addCase(deleteStatistic.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setCurrentStatistic } = statisticSlice.actions;
export default statisticSlice.reducer;
