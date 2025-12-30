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

// SAFETY CHECK: Panic if using localhost in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && cleanBaseUrl.includes('localhost')) {
    const criticalMsg = `
    🚨 CRITICAL CONFIGURATION ERROR 🚨
    -----------------------------------------------------
    Your App is running on a live domain (${window.location.hostname})
    BUT it is trying to connect to 'localhost' (${cleanBaseUrl}).
    
    This is why Login/OTP fails.
    
    FIX:
    1. Go to Vercel Dashboard > Settings > Environment Variables
    2. Change VITE_API_BASE_URL to your Render Backend URL (https://....onrender.com)
    3. REDEPLOY the project.
    -----------------------------------------------------
    `;
    console.error(criticalMsg);
    alert("SYSTEM ERROR: Backend not configured correctly. See console for details.");
}

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
