import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import backupService from "./backupService";

export const fetchBackupList = createAsyncThunk(
  "backup/fetchList",
  async (_, api) => {
    try {
      return await backupService.getBackupList();
    } catch (e) {
      return api.rejectWithValue(
        e.response?.data?.message || "Failed to fetch backups",
      );
    }
  },
);

export const fetchBackupStats = createAsyncThunk(
  "backup/fetchStats",
  async (_, api) => {
    try {
      return await backupService.getBackupStats();
    } catch (e) {
      return api.rejectWithValue(
        e.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

export const triggerBackup = createAsyncThunk(
  "backup/trigger",
  async (_, api) => {
    try {
      return await backupService.triggerManualBackup();
    } catch (e) {
      return api.rejectWithValue(
        e.response?.data?.message || "Failed to start backup",
      );
    }
  },
);

export const removeBackup = createAsyncThunk(
  "backup/delete",
  async (backupName, api) => {
    try {
      await backupService.deleteBackup(backupName);
      return backupName;
    } catch (e) {
      return api.rejectWithValue(
        e.response?.data?.message || "Failed to delete backup",
      );
    }
  },
);

export const restoreFromBackup = createAsyncThunk(
  "backup/restore",
  async (backupName, api) => {
    try {
      return await backupService.restoreBackup(backupName);
    } catch (e) {
      return api.rejectWithValue(
        e.response?.data?.message || "Failed to restore backup",
      );
    }
  },
);

export const cleanupOldBackups = createAsyncThunk(
  "backup/cleanup",
  async (daysToKeep, api) => {
    try {
      return await backupService.cleanupOldBackups(daysToKeep);
    } catch (e) {
      return api.rejectWithValue(
        e.response?.data?.message || "Failed to cleanup backups",
      );
    }
  },
);

const backupSlice = createSlice({
  name: "backup",
  initialState: {
    backups: [],
    stats: null,
    isLoading: false,
    isTriggering: false,
    isDeleting: null,
    isRestoring: null,
    isCleaningUp: false,
    error: null,
    successMsg: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchBackupList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBackupList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.backups = action.payload.backups || [];
      })
      .addCase(fetchBackupList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchBackupStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      .addCase(fetchBackupStats.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Trigger Backup
      .addCase(triggerBackup.pending, (state) => {
        state.isTriggering = true;
      })
      .addCase(triggerBackup.fulfilled, (state, action) => {
        state.isTriggering = false;
        state.successMsg = action.payload.message;
      })
      .addCase(triggerBackup.rejected, (state, action) => {
        state.isTriggering = false;
        state.error = action.payload;
      })

      // Delete Backup
      .addCase(removeBackup.pending, (state, action) => {
        state.isDeleting = action.meta.arg;
      })
      .addCase(removeBackup.fulfilled, (state, action) => {
        state.isDeleting = null;
        state.backups = state.backups.filter((b) => b.name !== action.payload);
        state.successMsg = "Backup deleted successfully";
      })
      .addCase(removeBackup.rejected, (state, action) => {
        state.isDeleting = null;
        state.error = action.payload;
      })

      // Restore Backup
      .addCase(restoreFromBackup.pending, (state, action) => {
        state.isRestoring = action.meta.arg;
      })
      .addCase(restoreFromBackup.fulfilled, (state, action) => {
        state.isRestoring = null;
        state.successMsg = action.payload.message;
      })
      .addCase(restoreFromBackup.rejected, (state, action) => {
        state.isRestoring = null;
        state.error = action.payload;
      })

      // Cleanup Old Backups
      .addCase(cleanupOldBackups.pending, (state) => {
        state.isCleaningUp = true;
      })
      .addCase(cleanupOldBackups.fulfilled, (state, action) => {
        state.isCleaningUp = false;
        state.successMsg = action.payload.message;
      })
      .addCase(cleanupOldBackups.rejected, (state, action) => {
        state.isCleaningUp = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = backupSlice.actions;
export default backupSlice.reducer;
