require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Init Socket.IO
// CORS Config
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : "";

const corsOptions = {
    origin: [
        frontendUrl,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
};

// Init Socket.IO
const io = new Server(server, {
    cors: corsOptions
});

// Make io accessible globally via app.set
app.set('io', io);

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinElection', (electionId) => {
        socket.join(electionId);
        console.log(`Socket ${socket.id} joined election ${electionId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware
app.use(express.json());

// Debug Middleware for Production
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !corsOptions.origin.includes(origin)) {
        console.log(`[CORS BLOCKED] Origin: ${origin} is not in allowed list: ${corsOptions.origin}`);
    }
    next();
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

startServer(PORT);
