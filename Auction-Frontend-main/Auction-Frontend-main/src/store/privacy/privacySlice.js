// // src/features/privacy/privacySlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import privacyService from './privacyService';

// // Get privacy policy
// export const fetchPrivacy = createAsyncThunk(
//   'privacy/fetchPrivacy',
//   async (_, thunkAPI) => {
//     try {
//       return await privacyService.getPrivacy();
//     } catch (error) {
//       const message =
//         (error.response?.data?.message) || error.message || 'Failed to fetch';
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );
// export const addPrivacy = createAsyncThunk(
//     'privacy/addPrivacy',
//     async (data, thunkAPI) => {
//       try {
//         return await privacyService.addPrivacy(data);
//       } catch (error) {
//         const message = error.response?.data?.message || error.message || 'Failed to add';
//         return thunkAPI.rejectWithValue(message);
//       }
//     }
//   );
// // Update privacy policy
// export const updatePrivacy = createAsyncThunk(
//   'privacy/updatePrivacy',
//   async (data, thunkAPI) => {
//     try {
//       return await privacyService.updatePrivacy(data);
//     } catch (error) {
//       const message =
//         (error.response?.data?.message) || error.message || 'Update failed';
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// const initialState = {
//   privacy: null,
//   isLoading: false,
//   isError: false,
//   isSuccess: false,
//   message: '',
// };

// const privacySlice = createSlice({
//   name: 'privacy',
//   initialState,
//   reducers: {
//     reset: (state) => {
//       state.isLoading = false;
//       state.isError = false;
//       state.isSuccess = false;
//       state.message = '';
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch
//       .addCase(fetchPrivacy.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(fetchPrivacy.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.privacy = action.payload;
//       })
//       .addCase(fetchPrivacy.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload;
//       })
//       .addCase(addPrivacy.pending, (state) => { state.isLoading = true; })
//       .addCase(addPrivacy.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.privacy = action.payload.policy;
//       })
//       .addCase(addPrivacy.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload;
//       })
//       // Update
//       .addCase(updatePrivacy.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(updatePrivacy.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isSuccess = true;
//         state.privacy = action.payload;
//       })
//       .addCase(updatePrivacy.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isError = true;
//         state.message = action.payload;
//       });
//   },
// });

// export const { reset } = privacySlice.actions;
// export default privacySlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import privacyService from "./privacyService";

// Fetch all privacy policies
export const fetchPrivacy = createAsyncThunk(
  "privacy/fetchPrivacy",
  async (_, thunkAPI) => {
    try {
      return await privacyService.getPrivacy();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Update privacy policy for a country
export const updatePrivacy = createAsyncThunk(
  "privacy/updatePrivacy",
  async (data, thunkAPI) => {
    try {
      return await privacyService.updatePrivacy(data); // data: { country, content }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Update failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Add is similar to update
export const addPrivacy = createAsyncThunk(
  "privacy/addPrivacy",
  async (data, thunkAPI) => {
    try {
      return await privacyService.addPrivacy(data);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to add";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  privacy: null, // { policies: { "US": "...", "IN": "..." } }
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const privacySlice = createSlice({
  name: "privacy",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivacy.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(fetchPrivacy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.privacy = action.payload;
        state.message = "Policies loaded successfully";
      })
      .addCase(fetchPrivacy.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to load policies";
        state.privacy = null;
      })
      .addCase(updatePrivacy.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updatePrivacy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.privacy = action.payload;
        state.message = "Policy updated successfully";
      })
      .addCase(updatePrivacy.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Failed to update policy";
      });
  },
});

export const { reset } = privacySlice.actions;
export default privacySlice.reducer;
