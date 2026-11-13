import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      return await userService.getAllUsers();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getAllAdmin = createAsyncThunk(
  "user/getAllAdmin",
  async (_, thunkAPI) => {
    try {
      const response = await userService.getAllAdmin();

      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getSellerById = createAsyncThunk(
  "user/getSellerById",
  async (id, thunkAPI) => {
    try {
      const response = await userService.getSellerById(id); // Calling your service
      return response; // Returning the response to be used in reducers
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true }); // Reject if error occurs
    }
  },
);

//get a single user by id
export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (data, thunkAPI) => {
    try {
      return await userService.getUserById(data);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

//update user by id
export const updateUserById = createAsyncThunk(
  "user/updateUserById",
  async ({ data, id }, thunkAPI) => {
    try {
      const response = await userService.updateUserById({ data, id });
      return response; // Expect response to contain updated user or success message
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

//delete a user by id
export const deleteUserById = createAsyncThunk(
  "user/deleteUserById",
  async (data, thunkAPI) => {
    try {
      return await userService.deleteUserById(data);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

//get top selllers
export const getTopSellers = createAsyncThunk(
  "user/getTopSellers",
  async (_, thunkAPI) => {
    try {
      return await userService.getTopSellers();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

const initialState = {
  allUser: [],
  allAdmin: [],
  getseller: [],
  singleUser: null,
  messagingUsers: [],
  topSellers: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  updateSuccess: false,
  getUserSuccess: false,
  message: "",
};

const userSlice = createSlice({
  name: "allUser",
  initialState,

  reducers: {
    setMessagingUsers: (state, action) => {
      state.messagingUsers = action.payload;
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
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allUser = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getAllAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.allAdmin = action.payload;
      })
      .addCase(getAllAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSellerById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSellerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.getseller = action.payload;
      })

      .addCase(getSellerById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.singleUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(updateUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.updateSuccess = true;
        //state.message = action.payload.message;
        if (action.payload.user) {
          state.singleUser = action.payload.user;
        }
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(deleteUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getTopSellers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTopSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.topSellers = action.payload;
      })
      .addCase(getTopSellers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      });
  },
});

export const { reset, setMessagingUsers } = userSlice.actions;
export default userSlice.reducer;
