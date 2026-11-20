// src/socket.js
import io from "socket.io-client";
const getSocketUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname.includes("railway.app")) {
    return "https://rule7media-main-site-production.up.railway.app";
  }
  return "https://www.rule7media.com";
};

const socket = io(getSocketUrl(), {
  path: "/socket.io",
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});
export default socket;
