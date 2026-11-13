import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import emailSettingsService from "./emailSettingsService";

const initialState = {
  settings: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const getEmailSettings = createAsyncThunk(
  "emailSettings/get",
  async (_, thunkAPI) => {
    try {
      return await emailSettingsService.getEmailSettings();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const saveEmailSettings = createAsyncThunk(
  "emailSettings/save",
  async (settingsData, thunkAPI) => {
    try {
      const { settings } = thunkAPI.getState().emailSettings;
      if (settings && settings._id) {
        return await emailSettingsService.updateEmailSettings(settingsData);
      } else {
        return await emailSettingsService.createEmailSettings(settingsData);
      }
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const emailSettingsSlice = createSlice({
  name: "emailSettings",
  initialState,
  reducers: {
    resetEmailSettingsState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEmailSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEmailSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.settings = action.payload;
      })
      .addCase(getEmailSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.settings = null;
      })
      .addCase(saveEmailSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveEmailSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.settings = action.payload;
        state.message = "Email settings saved successfully";
      })
      .addCase(saveEmailSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetEmailSettingsState } = emailSettingsSlice.actions;
export default emailSettingsSlice.reducer;
