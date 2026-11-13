import { getEmailTransporter, getFromAddress } from "./emailTransporter.js";

// ── Send Email Notification ───────────────────────────────────────────────────
export const sendBackupEmail = async (success, details) => {
  try {
    
    
    const transporter = await getEmailTransporter();
    const fromAddress = await getFromAddress();

    // Verify connection
    await transporter.verify();
    
    const emailResult = await transporter.sendMail({
      from: fromAddress,
      to: fromAddress,
      subject: success ? "✅ Backup Successful" : "❌ Backup FAILED",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${success ? "#16a34a" : "#dc2626"};">
            ${success ? "✅ Backup Operation Complete" : "❌ Backup Operation Failed"}
          </h2>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: monospace;">${details}</pre>
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            Time: ${new Date().toLocaleString("en-IN")}
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">
            This is an automated message from your Backup Management System.
          </p>
        </div>
      `,
    });
    

    
  } catch (err) {
    console.error("[Backup] Email failed:", err.message);
  }
};

// ── Schedule Daily Backup ─────────────────────────────────────────────────────
export const scheduleDailyBackup = (callback) => {
  const scheduleNextBackup = () => {
    const now = new Date();
    const nextBackup = new Date();
    
    // Set to 2:00 AM IST (convert to UTC)
    nextBackup.setUTCHours(20, 30, 0, 0); // 2:00 AM IST = 8:30 PM UTC previous day
    
    if (nextBackup < now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    
    const delay = nextBackup - now;
    
    setTimeout(() => {

      callback();
      
      // Schedule next backup
      scheduleNextBackup();
    }, delay);
    

  };
  
  scheduleNextBackup();
};