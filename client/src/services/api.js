import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// STRICT VALIDATION: Fail loudly if missing
if (!API_BASE) {
    const errorMsg = "CRITICAL: VITE_API_BASE_URL is missing. The frontend cannot connect to the backend.";
    console.error(errorMsg);
    throw new Error(errorMsg);
}

// Remove trailing slash if present to avoid double slashes
const cleanBaseUrl = API_BASE.replace(/\/$/, '');

console.log(`%c API Configured: ${cleanBaseUrl}`, 'color: #00ff00; font-weight: bold;');

const api = axios.create({
    baseURL: `${cleanBaseUrl}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
