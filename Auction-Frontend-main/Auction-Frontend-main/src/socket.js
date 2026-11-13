// src/socket.js
import io from "socket.io-client";
const socket = io(
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "https://www.rule7media.com"
    : "https://www.rule7media.com",
  {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  }
);
export default socket;
