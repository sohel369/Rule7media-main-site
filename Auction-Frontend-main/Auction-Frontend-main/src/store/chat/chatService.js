import axiosInstance from "../../axiosInstance";
export const getConversations = () => async (dispatch, getState) => {
  try {
    const { auth } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${auth?.user?.token}`,
      },
    };

    const res = await axiosInstance.get(
      "/api/messages/conversations/all",
      config,
    );

    dispatch({
      type: GET_CONVERSATIONS,
      payload: res.data.conversations || [],
    });
  } catch (err) {
    console.error("API Error:", err);
    dispatch(setAlert("Error loading conversations", "error"));
  }
};

// Get messages with a specific user
const getMessages = (userId) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${auth.user.token}`,
      },
    };

    const res = await axiosInstance.get(`/messages/${userId}`, config);

    dispatch({
      type: GET_MESSAGES,
      payload: {
        userId,
        messages: res.data.messages || [],
      },
    });
  } catch (err) {
    console.error(err);
    dispatch(setAlert("Error loading messages", "error"));
  }
};

// Send a message
const sendMessage = (receiverId, text) => async (dispatch, getState) => {
  try {
    const { auth } = getState();
    const config = {
      headers: {
        Authorization: `Bearer ${auth.user.token}`,
      },
    };

    const body = { receiverId, text };
    const res = await axiosInstance.post("/messages", body, config);

    dispatch({
      type: SEND_MESSAGE,
      payload: res.data.message,
    });

    return res.data.message;
  } catch (err) {
    console.error(err);
    dispatch(setAlert("Error sending message", "error"));
    throw err;
  }
};

// Set current chat user
const setCurrentChat = (user) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_CHAT,
    payload: user,
  });
};

// New message received (for socket.io)
const newMessage = (message) => (dispatch) => {
  dispatch({
    type: NEW_MESSAGE,
    payload: message,
  });
};

// Set online users
const setOnlineUsers = (users) => (dispatch) => {
  dispatch({
    type: SET_ONLINE_USERS,
    payload: users,
  });
};

const chatService = {
  sendMessage,
  setCurrentChat,
  newMessage,
  setOnlineUsers,
  getMessages,
};

export default chatService;
