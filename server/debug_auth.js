try {
    require('dotenv').config(); // Load env vars if needed
    require('./controllers/authController');
    console.log("authController loaded successfully");
} catch (e) {
    console.error("Error loading authController:", e);
}
