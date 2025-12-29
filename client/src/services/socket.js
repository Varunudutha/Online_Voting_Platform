import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

if (!SOCKET_URL) {
    throw new Error("CRITICAL: VITE_API_BASE_URL is missing for Socket.IO");
}

const socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"], // Re-adding polling just in case websocket is blocked by firewall, but usually websocket is better
    autoConnect: true,
});

console.log("Socket Initialized connecting to:", SOCKET_URL);

export default socket;
