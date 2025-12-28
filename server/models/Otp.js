const mongoose = require('mongoose');
const validator = require('validator');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
    }
});

module.exports = mongoose.models.Otp || mongoose.model('Otp', otpSchema);
