import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productsService from "./ProductService";

export const createProducts = createAsyncThunk(
  "product/createProducts",
  async (payload, thunkAPI) => {
    try {
      return await productsService.createProducts(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);
export const getProductsBySellerId = createAsyncThunk(
  "product/getProductsBySellerId",
  async ({ id, page, limit }, thunkAPI) => {
    try {
      const response = await productsService.getProductsBySellerId(
        id,
        page,
        limit,
      );
      return {
        data: response.data,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
export const ShowAllProducts = createAsyncThunk(
  "product/ShowAllProducts",
  async (payload, thunkAPI) => {
    try {
      const response = await productsService.ShowAllProducts(payload);

      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (payload, thunkAPI) => {
    try {
      const response = await productsService.getAllProducts(payload);

      return response;
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getSingleProductById = createAsyncThunk(
  "product/getSingleProductById",
  async (id, thunkAPI) => {
    try {
      const response = await productsService.getSingleProductById(id);

      return response;
    } catch (error) {
      const message =
        `${id} - ` + (error.response && error.response.data.message) ||
        error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const deleteSingleProductById = createAsyncThunk(
  "product/deleteSingleProductById",
  async (id, thunkAPI) => {
    try {
      return await productsService.deleteSingleProductById(id);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const updateSingleProduct = createAsyncThunk(
  "product/updateSingleProduct",
  async (payload, thunkAPI) => {
    try {
      return await productsService.updateSingleProduct(payload);
    } catch (error) {
      const message =
        (error.response && error.response.data.message) || error.message;
      return thunkAPI.rejectWithValue({ message, isError: true });
    }
  },
);

export const getAllPRO = createAsyncThunk(
  "products/getAllPRO",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await productsService.getAllPRO({ page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  product: [],
  singleProduct: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
  totalPages: 0,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ShowAllProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(ShowAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload; // Ensure the payload is correct
      })
      .addCase(ShowAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProductsBySellerId.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })
      .addCase(getProductsBySellerId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getProductsBySellerId.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Failed to fetch products";
        state.product = [];
      })
      .addCase(getAllProducts.pending, (state) => {
        state.isLoading = true;
        state.product = []; // Clear old data on new search
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload.data;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || "Search failed";
        state.product = []; // Critical: Clear on error too
      })
      .addCase(createProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message = action.payload.message;
      })

      .addCase(getSingleProductById.pending, (state) => {
        state.isLoading = true;
        state.isError = null;
      })
      .addCase(getSingleProductById.fulfilled, (state, action) => {
        state.isLoading = false;

        state.singleProduct = action.payload;
      })
      .addCase(getSingleProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      });
    builder.addCase(deleteSingleProductById.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(deleteSingleProductById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.message = action.payload.message;
    });
    builder.addCase(deleteSingleProductById.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload.message;
    });
    builder.addCase(updateSingleProduct.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateSingleProduct.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isError = action.payload.isError;
      state.isSuccess = action.payload.isSuccess || true;
      state.message = action.payload.message;
    });
    builder
      .addCase(updateSingleProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload.message;
      })
      .addCase(getAllPRO.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllPRO.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.product = action.payload.products || [];
        state.totalPages = action.payload.totalPages || 1;
      })

      .addCase(getAllPRO.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
