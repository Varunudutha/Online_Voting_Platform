import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL;

if (!SOCKET_URL) {
    throw new Error("CRITICAL: VITE_API_BASE_URL is missing for Socket.IO");
}

const cleanSocketUrl = SOCKET_URL.replace(/\/$/, '');

// SAFETY CHECK: Panic if using localhost in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && cleanSocketUrl.includes('localhost')) {
    console.error("🚨 SOCKET CRITICAL: Trying to connect to localhost from production!");
}

const socket = io(cleanSocketUrl, {
    transports: ["websocket", "polling"],
    autoConnect: true,
});

console.log("Socket Initialized connecting to:", cleanSocketUrl);

export default socket;
