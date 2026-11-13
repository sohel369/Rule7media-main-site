import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAY5nD92Uytrx2_nmCuLmfmqTqXG8_acZ4",
  authDomain: "push-notifications-85671.firebaseapp.com",
  projectId: "push-notifications-85671",
  storageBucket: "push-notifications-85671.firebasestorage.app",
  messagingSenderId: "797161567843",
  appId: "1:797161567843:web:1996773e4b3ed76c8faa56",
  measurementId: "G-5Z5Y1C4YX8",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Request permission to receive notifications and generate token
// export const generateToken = async () => {
//   try {
//     // Request permission for notifications
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//
//       // Get the FCM token
//       const currentToken = await getToken(messaging, {
//         vapidKey: "BEHTmGpe8DVd23aevz-VfBEUQrgqkJ_ImL88Cqz1VQ2Nxur7jpwOI18AxaOQUQkxtAa_rGMvrK1suJkXxr0WJtE",
//         serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
//       });
//       if (currentToken) {
//
//         return currentToken;
//       }
//     }
//   } catch (error) {
//     console.error("An error occurred while retrieving token. ", error);
//   }
// };
// Function to generate the FCM token
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BEHTmGpe8DVd23aevz-VfBEUQrgqkJ_ImL88Cqz1VQ2Nxur7jpwOI18AxaOQUQkxtAa_rGMvrK1suJkXxr0WJtE",
        serviceWorkerRegistration: await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        ),
      });
      if (token) {
        return token;
      }
    }
  } catch (error) {
    console.error("An error occurred while retrieving token.", error);
  }
};

// Handle incoming messages when the app is in the foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
