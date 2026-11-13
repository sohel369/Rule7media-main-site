import axiosInstance from "../../axiosInstance";

const getBackupList = () =>
  axiosInstance.get("/backups/list").then((r) => r.data);

const getBackupStats = () =>
  axiosInstance.get("/backups/stats").then((r) => r.data);

const triggerManualBackup = () =>
  axiosInstance
    .post("/backups/trigger", { destination: "local" })
    .then((r) => r.data);

const deleteBackup = (backupName) =>
  axiosInstance.delete(`/backups/${backupName}`).then((r) => r.data);

const restoreBackup = (backupName) =>
  axiosInstance.post(`/backups/restore/${backupName}`).then((r) => r.data);

const cleanupOldBackups = (daysToKeep = 7) =>
  axiosInstance
    .post("/backups/cleanup-old", { daysToKeep })
    .then((r) => r.data);

export default {
  getBackupList,
  getBackupStats,
  triggerManualBackup,
  deleteBackup,
  restoreBackup,
  cleanupOldBackups,
};
