const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const Brevo = require('@getbrevo/brevo');
const dns = require('dns');
const util = require('util');
const resolveMx = util.promisify(dns.resolveMx);
const disposableDomains = require('../utils/disposableDomains');

// Transporter Config
// Brevo Config
const apiInstance = new Brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    let { name, email, password, role, otp } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validate OTP
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Simplified Role Selection (No Secret Key)
    // Users can freely choose to be 'admin' or 'voter'
    // Default to 'voter' if not specified or invalid
    let userRole = 'voter';
    if (role === 'admin') {
        userRole = 'admin';
    }

    const user = await User.create({
        name,
        email,
        password,
        role: userRole
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    let { email, password } = req.body;

    // Normalize input
    email = email?.trim().toLowerCase();
    password = password?.trim();

    console.log('Login Attempt (Normalized):', { email, password });

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password (User not found)');
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasVotedIn: user.hasVotedIn
    });
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    const users = await User.find({ role: 'voter' }).select('name email');
    res.status(200).json(users);
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    let { email } = req.body;
    email = email?.trim().toLowerCase();

    if (!email) {
        res.status(400);
        throw new Error('Email address is required');
    }

    // Strict Format Validation (Backend)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    // Disposable Email Check
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) {
        res.status(400);
        throw new Error('Please use a valid personal or work email address.');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // MX Record Validation (Soft Check for Production Reliability)
    try {
        const addresses = await resolveMx(domain);
        if (!addresses || addresses.length === 0) {
            // Only throw if purely testing, or log warn in prod?
            // For now, let's treat no MX records as a "soft fail" - maybe just warn?
            // STRICT MODE: throw new Error('No MX records found');
            console.warn(`[MX CHECK] No MX records for ${domain}, but allowing registration to proceed.`);
        }
    } catch (error) {
        // In production, DNS lookups can fail due to network restrictions. 
        // We DO NOT want to block valid users because of a timeout or DNS glitch.
        console.warn(`[MX CHECK WARN] DNS lookup failed for ${domain}: ${error.code}. Proceeding anyway.`);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/Overwrite OTP
    await Otp.findOneAndDelete({ email }); // Clear previous
    await Otp.create({ email, otp });

    // Send Email
    try {
        if (!process.env.BREVO_API_KEY) {
            console.log('DEV MODE (No Brevo Key): OTP for', email, 'is', otp);
        } else {
            const senderEmail = process.env.EMAIL_FROM ? process.env.EMAIL_FROM.trim() : 'noreply@votesecure.com';

            const sendSmtpEmail = new Brevo.SendSmtpEmail();
            sendSmtpEmail.to = [{ email }];
            sendSmtpEmail.sender = { email: senderEmail, name: 'VoteSecure' };
            sendSmtpEmail.subject = 'Your Verification Code';
            sendSmtpEmail.htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4A90E2;">Verification Code</h2>
                    <p>Your OTP is:</p>
                    <h1 style="background: #eee; padding: 10px; display: inline-block; border-radius: 5px;">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                    <hr>
                    <small>If you didn't request this, please ignore this email.</small>
                </div>
            `;

            await apiInstance.sendTransacEmail(sendSmtpEmail);
        }
        res.status(200).json({ message: 'OTP sent successfully to ' + email });
    } catch (error) {
        console.error('Email send error:', error.response?.body || error.message);
        res.status(500);
        throw new Error('Failed to send OTP email');
    }

};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    getAllUsers,
    sendOtp
};
