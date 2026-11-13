import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import cartService from "./cartService";

export const getCartItems = createAsyncThunk(
  "cart/getCartItems",
  async (_, thunkAPI) => {
    try {
      return await cartService.getCartItems();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;

      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getWinningBid = createAsyncThunk(
  "cart/getWinningBid",
  async (userId, thunkAPI) => {
    try {
      // Add validation
      if (!userId) {
        throw new Error("User ID is required");
      }

      const response = await cartService.getWinningBid(userId);
      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const addtoCart = createAsyncThunk(
  "cart/addtocart",
  async (cartItem, thunkAPI) => {
    try {
      return await cartService.addToCart(cartItem);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      return await cartService.clearCart();
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;

      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, thunkAPI) => {
    try {
      return await cartService.deleteCartItem(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;

      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

const initialState = {
  cartItems: [],
  winningBid: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addtoCart: (state, action) => {
      const { productId, quantity, ...productData } = action.payload;

      const existingItemIndex = state.cartItems.findIndex((item) =>
        item.products.some((p) => p._id === productId),
      );

      if (existingItemIndex >= 0) {
        state.cartItems = state.cartItems.map((item) => ({
          ...item,
          products: item.products.map((p) =>
            p._id === productId ? { ...p, quantity: p.quantity + quantity } : p,
          ),
        }));
      } else {
        const newCartItem = {
          _id: Date.now().toString(),
          products: [
            {
              _id: productId,
              ...productData,
              quantity: quantity,
            },
          ],
        };
        state.cartItems.push(newCartItem);
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.isLoading = false;
      state.isError = false;
      state.message = "Cart cleared successfully";
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
      .addCase(getCartItems.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      // In cartSlice.js
      .addCase(getCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;

        const cartData = action.payload?.data || action.payload;

        // Handle both old and new structure
        const cartItems = Array.isArray(cartData)
          ? cartData
          : [
              {
                ...cartData,
                products: cartData.products || [],
                auctions: cartData.auctions || [],
              },
            ];

        state.cartItems = cartItems;
        state.message = "";
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      .addCase(addtoCart.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(addtoCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.cartItems = action.payload.data;
        state.message = "";
      })
      .addCase(getWinningBid.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(getWinningBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = null;

        // Handle different response structures
        if (Array.isArray(action.payload)) {
          state.winningBid = action.payload;
        } else if (action.payload?.data) {
          state.winningBid = Array.isArray(action.payload.data)
            ? action.payload.data
            : [action.payload.data];
        } else if (action.payload) {
          state.winningBid = [action.payload];
        } else {
          state.winningBid = [];
        }

        state.message = "";
      })
      .addCase(getWinningBid.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      .addCase(addtoCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.cartItems = action.payload.data;
        state.message = "";
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(deleteCartItem.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      });
  },
});

export const { addToCart, reset } = cartSlice.actions;

export default cartSlice.reducer;
