import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import contactService from "./contactService";

export const CreateContactInfo = createAsyncThunk(
  "contact/CreateContactInfo",
  async (data, thunkAPI) => {
    try {
      const response = await contactService.CreateContactInfo(data); // ✅ pass data here
      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
// Async Thunk to Get Commission Rate
export const getContactInfo = createAsyncThunk(
  "contact/getContactInfo",
  async (_, thunkAPI) => {
    try {
      return await contactService.getContactInfo();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const sendMessage = createAsyncThunk(
  "contact/sendMessage",
  async (data, thunkAPI) => {
    // Add data parameter
    try {
      return await contactService.sendMessage(data); // Pass data to service
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
// Async Thunk to Update Commission Rate
export const updateContactInfo = createAsyncThunk(
  "contact/updateContactInfo",
  async (data, thunkAPI) => {
    try {
      const response = await contactService.updateContactInfo(data); // ✅ pass data here
      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const deleteContactInfo = createAsyncThunk(
  "contact/deleteContactInfo",
  async (id, thunkAPI) => {
    try {
      const response = await contactService.deleteContactInfo(id); // ✅ pass data here
      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
const initialState = {
  contact: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const contactslice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setCountry: (state, action) => {
      state.country = action.payload;
    },
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Commission
      .addCase(CreateContactInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(CreateContactInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload;
      })

      .addCase(CreateContactInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getContactInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getContactInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload;
      })
      .addCase(getContactInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })

      // Update Commission
      .addCase(updateContactInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateContactInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload;
      })

      .addCase(updateContactInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(deleteContactInfo.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteContactInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.contact = action.payload;
      })

      .addCase(deleteContactInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      });
  },
});
export const { reset, setCountry } = contactslice.actions;
export default contactslice.reducer;
