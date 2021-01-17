const express = require('express');
const http = require('http')
const socketio = require('socket.io');
const app = express();

const server = http.createServer(app);
//enable cors for ... "https://example.com",
const sktIo = socketio(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

sktIo.on('connection', (socket) => {
    console.log('new webSocket connection...');
    socket.emit('eventName01', 'hello from ws server');

    // handle the event
    socket.on('updatetree', updateTreeListener);
});

const updateTreeListener = (data) => {
    console.log(data);
  }

server.listen(PORT, () => console.log('WebSocket Server running on port ' + PORT));