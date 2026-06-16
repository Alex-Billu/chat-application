const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Chat App API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use('/uploads', express.static('uploads'));

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log('User setup in room:', userData._id);
        socket.emit('connected');
    });

    socket.on('join_chat', (room) => {
        socket.join(room);
        console.log('User joined room:', room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop_typing', (room) => socket.in(room).emit('stop_typing'));

    socket.on('new_message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log('Chat.users not defined');

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit('message_received', newMessageReceived);
        });
    });

    socket.off('setup', () => {
        console.log('USER DISCONNECTED');
        socket.leave(userData._id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
