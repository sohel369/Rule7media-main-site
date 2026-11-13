import fs from "fs";
import path from "path";
import { MongoClient } from "mongodb";
import { sendBackupEmail } from "../utils/backup.js";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");

// ── Helper: folder size ───────────────────────────────────────────────────────
const getFolderSizeMB = (folderPath) => {
  let total = 0;
  try {
    const walkDir = (dir) => {
      fs.readdirSync(dir).forEach((f) => {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) walkDir(fp);
        else total += fs.statSync(fp).size;
      });
    };
    walkDir(folderPath);
  } catch (_) {}
  return (total / 1024 / 1024).toFixed(2);
};

// ── Helper: Ensure backup directory exists ────────────────────────────────────
const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

// ── Helper: Get MongoDB URI ──────────────────────────────────────────────────
const getMongoURI = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured in environment variables");
  }
  return uri;
};

// ── GET /list ─────────────────────────────────────────────────────────────────
export const getBackupList = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ success: true, backups: [] });
    }

    const backups = fs
      .readdirSync(BACKUP_DIR)
      .filter((n) => n.startsWith("backup-"))
      .map((name) => {
        const fullPath = path.join(BACKUP_DIR, name);
        const stat = fs.statSync(fullPath);
        
        return {
          name,
          createdAt: stat.birthtime,
          sizeMB: getFolderSizeMB(fullPath),
          status: "completed",
          location: "local",
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, backups });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch backup list",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ── GET /stats ────────────────────────────────────────────────────────────────
export const getBackupStats = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({
        success: true,
        stats: {
          totalBackups: 0,
          lastBackup: null,
          nextBackup: "2:00 AM IST",
          oldestBackup: null,
          backupLocation: BACKUP_DIR,
        },
      });
    }

    const entries = fs
      .readdirSync(BACKUP_DIR)
      .filter((n) => n.startsWith("backup-"))
      .map((name) => ({
        name,
        createdAt: fs.statSync(path.join(BACKUP_DIR, name)).birthtime,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      stats: {
        totalBackups: entries.length,
        lastBackup: entries[0]?.createdAt || null,
        nextBackup: "2:00 AM IST (daily)",
        oldestBackup: entries[entries.length - 1]?.createdAt || null,
        backupLocation: BACKUP_DIR,
      },
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch backup stats",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ── POST /trigger ─────────────────────────────────────────────────────────────
export const triggerManualBackup = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Local backup started successfully.",
      destination: "local",
    });

    setImmediate(() => {
      runLocalBackup().catch(() => {});
    });

  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to start backup",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
};

// ── Local Backup Function ─────────────────────────────────────────────────────
const runLocalBackup = async () => {
  const client = new MongoClient(getMongoURI());
  
  try {
    ensureBackupDir();
    
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const backupName = `backup-${date}-${time}`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    await client.connect();
    
    const db = client.db();
   
    const collections = await db.listCollections().toArray();
     
    
    let totalDocuments = 0;
    const backupResults = [];

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      const documents = await collection.find({}).toArray();
      const count = documents.length;
      totalDocuments += count;
      
      const filePath = path.join(backupPath, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
      
      backupResults.push({
        collection: collectionName,
        documents: count,
        file: filePath
      });
    }

    const metadata = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: backupResults,
      totalDocuments: totalDocuments,
      backupLocation: backupPath
    };
    
    fs.writeFileSync(
      path.join(backupPath, "_metadata.json"),
      JSON.stringify(metadata, null, 2)
    );
    
    const sizeMB = getFolderSizeMB(backupPath);
    
    await sendBackupEmail(
      true, 
      `Local backup completed successfully!\n\n` +
      `Backup Name: ${backupName}\n` +
      `Location: ${backupPath}\n` +
      `Collections: ${collections.length}\n` +
      `Documents: ${totalDocuments}\n` +
      `Size: ${sizeMB} MB\n` +
      `Time: ${new Date().toLocaleString("en-IN")}`
    );
    
  } catch (error) {
    await sendBackupEmail(false, `Local backup failed: ${error.message}`);
  } finally {
    await client.close();
  }
};

// ── DELETE /:backupName ───────────────────────────────────────────────────────
export const deleteBackup = async (req, res) => {
  try {
    const { backupName } = req.params;
    
    if (!backupName || !backupName.startsWith("backup-")) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid backup name" 
      });
    }
    
    const fullPath = path.join(BACKUP_DIR, backupName);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ 
        success: false, 
        message: "Backup not found" 
      });
    }
    
    fs.rmSync(fullPath, { recursive: true, force: true });
    
    return res.json({ 
      success: true, 
      message: "Backup deleted successfully" 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to delete backup",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ── POST /restore/:backupName ─────────────────────────────────────────────────
export const restoreBackup = async (req, res) => {
  try {
    const { backupName } = req.params;
    
    if (!backupName || !backupName.startsWith("backup-")) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid backup name" 
      });
    }
    
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ 
        success: false, 
        message: "Backup not found" 
      });
    }

    res.json({
      success: true,
      message: "Restore started successfully.",
    });

    setImmediate(async () => {
      await executeRestore(backupName, backupPath);
    });
    
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to start restore",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ── Execute Restore Function ──────────────────────────────────────────────────
const executeRestore = async (backupName, backupPath) => {
  const client = new MongoClient(getMongoURI());
  
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup folder not found: ${backupPath}`);
    }
    
    const metadataPath = path.join(backupPath, "_metadata.json");
    if (!fs.existsSync(metadataPath)) {
      throw new Error("Metadata file not found. Invalid backup folder.");
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    
    await client.connect();
    const db = client.db();
    
    let restoredCount = 0;
    
    for (const collectionInfo of metadata.collections) {
      const collectionName = collectionInfo.collection;
      const filePath = path.join(backupPath, `${collectionName}.json`);
      
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      try {
        await db.collection(collectionName).drop();
      } catch (e) {}
      
      if (data.length > 0) {
        await db.collection(collectionName).insertMany(data);
        restoredCount += data.length;
      }
    }
    
    await sendBackupEmail(
      true, 
      `Database restored successfully from backup: ${backupName}\n\n` +
      `Collections restored: ${metadata.collections.length}\n` +
      `Total documents: ${restoredCount}\n` +
      `Time: ${new Date().toLocaleString("en-IN")}`
    );
    
  } catch (error) {
    await sendBackupEmail(false, `RESTORE FAILED from ${backupName}:\n${error.message}`);
  } finally {
    await client.close();
  }
};

// ── POST /cleanup-old ─────────────────────────────────────────────────────────
export const cleanupOldBackups = async (req, res) => {
  try {
    const daysToKeep = parseInt(req.body.daysToKeep) || 7;
    
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ success: true, message: "No backups directory found", deletedCount: 0 });
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const backups = fs
      .readdirSync(BACKUP_DIR)
      .filter((n) => n.startsWith("backup-"));
    
    let deletedCount = 0;
    let deletedSize = 0;
    
    for (const backup of backups) {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stat = fs.statSync(backupPath);
      
      if (stat.birthtime < cutoffDate) {
        const sizeMB = parseFloat(getFolderSizeMB(backupPath));
        deletedSize += sizeMB;
        fs.rmSync(backupPath, { recursive: true, force: true });
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      await sendBackupEmail(
        true,
        `Automatic cleanup completed!\n\n` +
        `Deleted backups: ${deletedCount}\n` +
        `Freed space: ${deletedSize.toFixed(2)} MB\n` +
        `Retention period: ${daysToKeep} days`
      );
    }
    
    return res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old backup(s)`,
      deletedCount,
      freedSpaceMB: deletedSize.toFixed(2)
    });
    
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to cleanup old backups",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};