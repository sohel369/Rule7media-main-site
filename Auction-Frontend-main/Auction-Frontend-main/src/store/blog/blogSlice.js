import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchBlogsByCountryAPI,
  fetchBlogByIdAPI,
  createBlogAPI,
  updateBlogAPI,
  deleteBlogAPI,
  getAllBlogsAdminAPI,
} from "./blogService";

// ========== PUBLIC THUNKS ==========
export const fetchBlogsByCountry = createAsyncThunk(
  "blog/fetchByCountry",
  async ({ country, page = 1, limit = 9 }, { rejectWithValue }) => {
    try {
      const response = await fetchBlogsByCountryAPI(country, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch blogs");
    }
  }
);
export const fetchBlogById = createAsyncThunk(
  "blog/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchBlogByIdAPI(id);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blog"
      );
    }
  }
);
// ========== ADMIN THUNKS ==========
export const createBlog = createAsyncThunk(
  "blog/create",
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await createBlogAPI(blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create blog");
    }
  }
);

export const updateBlog = createAsyncThunk(
  "blog/update",
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await updateBlogAPI(id, blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update blog");
    }
  }
);

export const deleteBlog = createAsyncThunk(
  "blog/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteBlogAPI(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete blog");
    }
  }
);

export const getAllBlogsAdmin = createAsyncThunk(
  "blog/getAllAdmin",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getAllBlogsAdminAPI(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch blogs");
    }
  }
);

// ========== SLICE ==========
const blogSlice = createSlice({
  name: "blog",
  initialState: {
    // Public state
    blogs: [],
    totalBlogs: 0,
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    error: null,
    blog: null,
    // Admin state
    adminBlogs: [],
    adminTotalBlogs: 0,
    adminCurrentPage: 1,
    adminTotalPages: 1,
    adminCategories: [],
    adminLoading: false,
    adminError: null,
    
    // Form state
    isSubmitting: false,
    submitSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.adminError = null;
    },
    resetSubmitState: (state) => {
      state.isSubmitting = false;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== FETCH BLOGS BY COUNTRY ==========
      .addCase(fetchBlogsByCountry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogsByCountry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.blogs || [];
        state.totalBlogs = action.payload.totalBlogs || 0;
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchBlogsByCountry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ========== GET ALL BLOGS ADMIN ==========
      .addCase(getAllBlogsAdmin.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getAllBlogsAdmin.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.adminBlogs = action.payload.blogs || [];
        state.adminTotalBlogs = action.payload.totalBlogs || 0;
        state.adminCurrentPage = action.payload.currentPage || 1;
        state.adminTotalPages = action.payload.totalPages || 1;
        state.adminCategories = action.payload.categories || [];
      })
      .addCase(getAllBlogsAdmin.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })
      
      // ========== CREATE BLOG ==========
      .addCase(createBlog.pending, (state) => {
        state.isSubmitting = true;
        state.submitSuccess = false;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        state.adminBlogs = [action.payload.blog, ...(state.adminBlogs || [])];
        state.adminTotalBlogs += 1;
      })
      .addCase(createBlog.rejected, (state) => {
        state.isSubmitting = false;
        state.submitSuccess = false;
      })
      
      // ========== UPDATE BLOG ==========
      .addCase(updateBlog.pending, (state) => {
        state.isSubmitting = true;
        state.submitSuccess = false;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
        const index = state.adminBlogs.findIndex(b => b._id === action.payload.blog._id);
        if (index !== -1) {
          state.adminBlogs[index] = action.payload.blog;
        }
      })
      .addCase(updateBlog.rejected, (state) => {
        state.isSubmitting = false;
        state.submitSuccess = false;
      })
      
      // ========== DELETE BLOG ==========
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.adminBlogs = state.adminBlogs.filter(b => b._id !== action.payload.id);
        state.adminTotalBlogs -= 1;
      })
      .addCase(fetchBlogById.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchBlogById.fulfilled, (state, action) => {
  state.isLoading = false;
  state.blog = action.payload.blog;
})
.addCase(fetchBlogById.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
  },
});

export const { clearError, resetSubmitState } = blogSlice.actions;
export default blogSlice.reducer;