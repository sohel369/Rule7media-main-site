import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import mediaKitService from "./mediaKitService";

// ─── Public Thunks ──────────────────────────────────────────────────────────
export const fetchAvailableKits = createAsyncThunk(
  "mediaKit/fetchAvailableKits",
  async (country = "", { rejectWithValue }) => {
    try {
      const response = await mediaKitService.fetchAvailableKits(country);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch available media kits");
    }
  }
);

export const downloadKit = createAsyncThunk(
  "mediaKit/download",
  async (data, { rejectWithValue }) => {
    try {
      const response = await mediaKitService.downloadMediaKit(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Download failed");
    }
  }
);

// ─── Admin Thunks ───────────────────────────────────────────────────────────
export const fetchAdminLanguageKits = createAsyncThunk(
  "mediaKit/fetchAdminLanguageKits",
  async (country = "Global", { rejectWithValue }) => {
    try {
      const response = await mediaKitService.fetchAdminLanguageKits(country);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch language kits");
    }
  }
);

export const uploadKit = createAsyncThunk(
  "mediaKit/uploadKit",
  async (payload, { rejectWithValue }) => {
    try {
      // payload can be File (default en) or { file, country, language, languageName, onProgress }
      const file = payload?.file || payload;
      const country = payload?.country || "Global";
      const language = payload?.language || "en";
      const languageName = payload?.languageName || "English";
      const onProgress = payload?.onProgress || null;
      const response = await mediaKitService.uploadKit(file, language, languageName, onProgress, country);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Upload failed");
    }
  }
);

export const deleteLanguageKit = createAsyncThunk(
  "mediaKit/deleteLanguageKit",
  async (payload, { rejectWithValue }) => {
    try {
      const language = typeof payload === "string" ? payload : payload.language;
      const country = typeof payload === "object" ? payload.country : "Global";
      const response = await mediaKitService.deleteLanguageKit(language, country);
      return { language, country, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete kit");
    }
  }
);

export const fetchDownloads = createAsyncThunk(
  "mediaKit/fetchDownloads",
  async ({ page = 1, limit = 10, language = "all", search = "" } = {}, { rejectWithValue }) => {
    try {
      const response = await mediaKitService.fetchDownloads(page, limit, language, search);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch downloads");
    }
  }
);

export const fetchKitHistory = createAsyncThunk(
  "mediaKit/fetchKitHistory",
  async ({ page = 1, limit = 10, language = "all" } = {}, { rejectWithValue }) => {
    try {
      const response = await mediaKitService.fetchKitHistory(page, limit, language);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch kit history");
    }
  }
);

export const deleteDownloadRecord = createAsyncThunk(
  "mediaKit/deleteDownloadRecord",
  async (id, { rejectWithValue }) => {
    try {
      const response = await mediaKitService.deleteDownloadRecord(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

export const deleteActiveKit = createAsyncThunk(
  "mediaKit/deleteActiveKit",
  async (_, { rejectWithValue }) => {
    try {
      const response = await mediaKitService.deleteActiveKit();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete kit");
    }
  }
);

const mediaKitSlice = createSlice({
  name: "mediaKit",
  initialState: {
    // Public state
    loading: false,
    success: false,
    message: null,
    error: null,
    downloadUrl: null,
    activeLanguages: [],
    suggestedLanguages: [],
    hasMultipleSuggestedLanguages: false,

    // Admin state - 11 Languages Matrix
    languageKits: [],
    totalSupported: 11,
    totalActiveLanguages: 0,

    // Admin state - Downloads
    downloads: [],
    totalDownloads: 0,
    downloadsCurrentPage: 1,
    downloadsTotalPages: 1,
    downloadsLimit: 10,
    selectedFilterLanguage: "all",
    searchQuery: "",

    // Admin state - Kit History
    kitHistory: [],
    totalKits: 0,
    historyCurrentPage: 1,
    historyTotalPages: 1,
    historyLimit: 10,

    // Loading states
    adminLoading: false,
    adminError: null,
    uploadLoading: false,
    historyLoading: false,

    // UI state
    deleteConfirmId: null,
    deleteKitConfirmLang: null,
  },
  reducers: {
    resetDownloadState: (state) => {
      state.loading = false;
      state.success = false;
      state.message = null;
      state.error = null;
      state.downloadUrl = null;
    },
    setDeleteConfirm: (state, action) => {
      state.deleteConfirmId = action.payload;
    },
    setDeleteKitConfirmLang: (state, action) => {
      state.deleteKitConfirmLang = action.payload;
    },
    setFilterLanguage: (state, action) => {
      state.selectedFilterLanguage = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    resetAdminState: (state) => {
      state.adminError = null;
      state.uploadLoading = false;
    },
    clearKitHistory: (state) => {
      state.kitHistory = [];
      state.totalKits = 0;
      state.historyCurrentPage = 1;
    },
    setDownloadsPage: (state, action) => {
      state.downloadsCurrentPage = action.payload;
    },
    setHistoryPage: (state, action) => {
      state.historyCurrentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== FETCH AVAILABLE KITS (PUBLIC) ==========
      .addCase(fetchAvailableKits.fulfilled, (state, action) => {
        state.activeLanguages = action.payload.languages || [];
        state.suggestedLanguages = action.payload.suggestedLanguages || [];
        state.hasMultipleSuggestedLanguages = !!action.payload.hasMultipleSuggestedLanguages;
      })

      // ========== DOWNLOAD KIT (PUBLIC) ==========
      .addCase(downloadKit.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(downloadKit.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.downloadUrl = action.payload.downloadUrl;
      })
      .addCase(downloadKit.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // ========== FETCH ADMIN LANGUAGE KITS ==========
      .addCase(fetchAdminLanguageKits.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchAdminLanguageKits.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.languageKits = action.payload.languages || [];
        state.totalSupported = action.payload.totalSupported || 11;
        state.totalActiveLanguages = action.payload.totalActiveLanguages || 0;
        state.totalDownloads = action.payload.totalDownloads || state.totalDownloads;
      })
      .addCase(fetchAdminLanguageKits.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })

      // ========== UPLOAD KIT (ADMIN) ==========
      .addCase(uploadKit.pending, (state) => {
        state.uploadLoading = true;
        state.adminError = null;
      })
      .addCase(uploadKit.fulfilled, (state, action) => {
        state.uploadLoading = false;
        const uploadedKit = action.payload.kit;
        if (uploadedKit) {
          // Update corresponding language card in matrix
          state.languageKits = state.languageKits.map((lang) =>
            lang.code === uploadedKit.language
              ? { ...lang, hasKit: true, activeKit: uploadedKit }
              : lang
          );
          state.totalActiveLanguages = state.languageKits.filter((l) => l.hasKit).length;
          state.kitHistory = [uploadedKit, ...(state.kitHistory || [])];
          state.totalKits = state.totalKits + 1;
        }
      })
      .addCase(uploadKit.rejected, (state, action) => {
        state.uploadLoading = false;
        state.adminError = action.payload;
      })

      // ========== DELETE LANGUAGE KIT (ADMIN) ==========
      .addCase(deleteLanguageKit.fulfilled, (state, action) => {
        const deletedLang = action.payload.language;
        state.languageKits = state.languageKits.map((lang) =>
          lang.code === deletedLang
            ? { ...lang, hasKit: false, activeKit: null }
            : lang
        );
        state.totalActiveLanguages = state.languageKits.filter((l) => l.hasKit).length;
        state.deleteKitConfirmLang = null;
      })
      .addCase(deleteLanguageKit.rejected, (state, action) => {
        state.adminError = action.payload;
      })

      // ========== FETCH DOWNLOADS (ADMIN) ==========
      .addCase(fetchDownloads.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(fetchDownloads.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.downloads = action.payload.downloads || [];
        state.totalDownloads = action.payload.totalDownloads || 0;
        state.downloadsCurrentPage = action.payload.currentPage || 1;
        state.downloadsTotalPages = action.payload.totalPages || 1;
        state.downloadsLimit = action.payload.limit || 10;
      })
      .addCase(fetchDownloads.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })

      // ========== FETCH KIT HISTORY (ADMIN) ==========
      .addCase(fetchKitHistory.pending, (state) => {
        state.historyLoading = true;
        state.adminError = null;
      })
      .addCase(fetchKitHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.kitHistory = action.payload.kits || [];
        state.totalKits = action.payload.totalKits || 0;
        state.historyCurrentPage = action.payload.currentPage || 1;
        state.historyTotalPages = action.payload.totalPages || 1;
        state.historyLimit = action.payload.limit || 10;
      })
      .addCase(fetchKitHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.adminError = action.payload;
      })

      // ========== DELETE DOWNLOAD RECORD (ADMIN) ==========
      .addCase(deleteDownloadRecord.fulfilled, (state, action) => {
        state.downloads = (state.downloads || []).filter((d) => d._id !== action.payload.id);
        state.totalDownloads = Math.max(0, state.totalDownloads - 1);
        state.deleteConfirmId = null;
      })
      .addCase(deleteDownloadRecord.rejected, (state, action) => {
        state.adminError = action.payload;
      })

      // ========== DELETE ACTIVE KIT (LEGACY) ==========
      .addCase(deleteActiveKit.fulfilled, (state) => {
        state.deleteConfirmId = null;
      });
  },
});

export const {
  resetDownloadState,
  setDeleteConfirm,
  setDeleteKitConfirmLang,
  setFilterLanguage,
  setSearchQuery,
  resetAdminState,
  clearKitHistory,
  setDownloadsPage,
  setHistoryPage,
} = mediaKitSlice.actions;

export default mediaKitSlice.reducer;