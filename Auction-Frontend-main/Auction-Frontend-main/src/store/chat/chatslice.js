import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "./chatService";

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, thunkAPI) => {
    try {
      return await chatService.getMessages(userId);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, text, fcmToken }, thunkAPI) => {
    try {
      return await chatService.sendMessage(receiverId, text);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const setCurrentChat = createAsyncThunk(
  "chat/setCurrentChat",
  async (data, thunkAPI) => {
    try {
      return await chatService.setCurrentChat(data);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getConversations = createAsyncThunk(
  "chat/getConversations",
  async (_, thunkAPI) => {
    try {
      return await chatService.getConversations();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
//delete city
const initialState = {
  cities: [],
  topCities: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  conversations: [],
  currentChat: null,
  messages: {},
  onlineUsers: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    newMessage: (state, action) => {
      const { senderId, text, createdAt } = action.payload;
      if (!state.messages[senderId]) {
        state.messages[senderId] = [];
      }
      state.messages[senderId].push({
        sender: { _id: senderId },
        text,
        createdAt,
      });
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    resetChat: (state) => {
      state.currentChat = null;
      state.messages = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.userId] = action.payload.messages;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message = action.payload;
        if (!state.messages[message.receiver._id]) {
          state.messages[message.receiver._id] = [];
        }
        state.messages[message.receiver._id].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { reset, newMessageReducer } = chatSlice.actions;

export default chatSlice.reducer;
