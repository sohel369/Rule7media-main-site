import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import wrapperassignordersService from "./wrapperassignorderService";

export const fetchWrappers = createAsyncThunk(
  "wrapper/fetchWrappers",
  async (orderId, thunkAPI) => {
    try {
      const data =
        await wrapperassignordersService.getWrappersForOrder(orderId);
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wrappers";
      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const fetchAllAssignmentsStatus = createAsyncThunk(
  "wrapper/fetchAllStatus",
  async (_, thunkAPI) => {
    try {
      const data = await wrapperassignordersService.getAllAssignmentsStatus();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);
export const getWrapperOrders = createAsyncThunk(
  "wrapper/getWrapperOrders",
  async (wrapperId, thunkAPI) => {
    try {
      const data = await wrapperassignordersService.getWrapperOrders(wrapperId);
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch wrapper orders";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const getsingleassignmentsorder = createAsyncThunk(
  "wrapper/getsingleassignmentsorder",
  async (orderId, thunkAPI) => {
    try {
      const data =
        await wrapperassignordersService.getsingleassignmentsorder(orderId);

      return data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch assignment";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const assignWrapper = createAsyncThunk(
  "wrapper/assignWrapper",
  async ({ orderId, wrapperId }, thunkAPI) => {
    try {
      const data = await wrapperassignordersService.assignWrapperToOrder(
        orderId,
        wrapperId,
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to assign wrapper";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const updateAssignment = createAsyncThunk(
  "wrapper/updateAssignment",
  async ({ assignmentId, status, acceptStatus }, thunkAPI) => {
    try {
      const data = await wrapperassignordersService.updateAssignmentStatus(
        assignmentId,
        { status, acceptStatus },
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update assignment";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const initialState = {
  wrappers: [],
  assignments: [],
  singleAssignment: null,
  alreadyAssigned: [],
  wrappersstatus: [],
  count: 0,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const wrapperSlice = createSlice({
  name: "wrappers",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
      state.wrappers = [];
      state.assignments = [];
      state.alreadyAssigned = [];
      state.count = 0;
    },
    clearMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wrappers
      .addCase(fetchWrappers.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(fetchWrappers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.wrappers = action.payload.matchingWrappers || [];

        // Handle already assigned wrappers - ensure it's always an array
        if (action.payload.alreadyAssigned) {
          if (Array.isArray(action.payload.alreadyAssigned)) {
            state.alreadyAssigned = action.payload.alreadyAssigned;
          } else if (
            typeof action.payload.alreadyAssigned === "object" &&
            action.payload.alreadyAssigned._id
          ) {
            state.alreadyAssigned = [action.payload.alreadyAssigned._id];
          } else {
            state.alreadyAssigned = [action.payload.alreadyAssigned];
          }
        } else {
          state.alreadyAssigned = [];
        }

        state.count = action.payload.count || 0;
      })
      .addCase(fetchWrappers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload;
        state.wrappers = [];
        state.alreadyAssigned = [];
        state.count = 0;
      })
      ///get wrpper status
      .addCase(fetchAllAssignmentsStatus.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(fetchAllAssignmentsStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wrappersstatus = action.payload;
      })
      .addCase(fetchAllAssignmentsStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      // Get Wrapper Orders
      .addCase(getWrapperOrders.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getWrapperOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assignments = action.payload.assignments || [];
      })
      .addCase(getWrapperOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.assignments = [];
      })

      // Get Single Assignment Order
      .addCase(getsingleassignmentsorder.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.singleAssignment = null;
      })
      .addCase(getsingleassignmentsorder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.singleAssignment = action.payload;
      })
      .addCase(getsingleassignmentsorder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.singleAssignment = null;
      })

      // Assign Wrapper
      .addCase(assignWrapper.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(assignWrapper.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;

        // Update the already assigned list if the assignment was successful
        if (action.payload.order && action.payload.order.assignedWrapper) {
          const wrapperId =
            action.payload.order.assignedWrapper._id ||
            action.payload.order.assignedWrapper;
          if (!state.alreadyAssigned.includes(wrapperId)) {
            state.alreadyAssigned.push(wrapperId);
          }
        }
      })
      .addCase(assignWrapper.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Update Assignment
      .addCase(updateAssignment.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;

        // Update singleAssignment if it exists
        if (
          state.singleAssignment &&
          state.singleAssignment._id === action.payload.assignment._id
        ) {
          state.singleAssignment = action.payload.assignment;
        }

        // Update assignments array if the assignment exists
        const assignmentIndex = state.assignments.findIndex(
          (assignment) => assignment._id === action.payload.assignment._id,
        );
        if (assignmentIndex !== -1) {
          state.assignments[assignmentIndex] = action.payload.assignment;
        }

        // If status is DELIVERED, remove from already assigned
        if (action.payload.assignment.status === "DELIVERED") {
          const wrapperId =
            action.payload.assignment.wrapper._id ||
            action.payload.assignment.wrapper;
          state.alreadyAssigned = state.alreadyAssigned.filter(
            (id) => id !== wrapperId,
          );
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearMessage } = wrapperSlice.actions;
export default wrapperSlice.reducer;
