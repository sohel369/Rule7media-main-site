import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, "../serviceAccountKey.json");
let serviceAccount = null;

if (fs.existsSync(keyPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  } catch (err) {
    console.error("❌ Failed to parse serviceAccountKey.json:", err.message);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env:", err.message);
  }
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error.message);
  }
}
const sendPushNotification = async (fcmToken, message, senderName) => {
    if (!fcmToken) {
        console.error("No FCM Token available for user.");
        return;
    }

    const messagePayload = {
        notification: {
            title: senderName,
            body: message,
        },
        token: fcmToken,
    };
      try {
        await admin.messaging().send(messagePayload);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
      
};



export default sendPushNotification;
