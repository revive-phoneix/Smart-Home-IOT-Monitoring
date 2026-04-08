import { io } from "socket.io-client";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiBaseUrl.replace(/\/api\/?$/, "");

const socket = io(socketUrl, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;