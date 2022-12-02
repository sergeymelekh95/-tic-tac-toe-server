const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'https://tic-tac-toe-cvbe.onrender.com',
        // origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('joinRoom', async ({ roomCode, userName }) => {
        console.log(`${socket.id} ${userName} joined in ${roomCode} room`);

        socket.userName = userName;
        socket.join(roomCode);

        const sockets = await io.in(roomCode).fetchSockets();

        const players = sockets.map((socket) => socket.userName);

        socket.broadcast.to(roomCode).emit('userJoined', {
            userName,
        });

        socket.nsp.to(roomCode).emit('players', players);

        //myself
        // socket.nsp.to(roomCode).emit('userJoined', {userName});
    });

    socket.on('win', ({userName, roomCode}) => {
        console.log('aaa')
        socket.nsp.to(roomCode).emit('winner', {userName});
    })

    socket.on('play', ({ i, roomCode }) => {
        console.log(`play at ${i} to ${roomCode}`);

        socket.broadcast.to(roomCode).emit('updateGame', i);
    });

    socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected');
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
