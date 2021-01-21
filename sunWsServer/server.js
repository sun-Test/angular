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
const UPDATE_TREE_ROOT = 'updatetree01Root';
const UPDATE_TREE_CHILDREN = 'updatetree01Children';
const TREE_ROOT = 'tree01 root';
const TREE_CHILDREN = 'tree01 children';
const WS_READY='wsReady';

sktIo.on('connection', (socket) => {
    console.log('new webSocket connection...');
    socket.emit('wsReady', 'hello from ws server');

    // handle the event
    socket.on(UPDATE_TREE_ROOT, updateTreeListenerRoot);
    socket.on(UPDATE_TREE_CHILDREN, updateTreeListenerChildren);
});

const updateTreeListenerRoot = (data) => {
    console.log(data);
    sktIo.emit(TREE_ROOT, {'root': ['programming', 'life and study']});
  }

  const updateTreeListenerChildren = (data) => {
    console.log(data);
    sktIo.emit(TREE_CHILDREN, {'children': [
      ['life and study', ['language', 'study in Germany', 'travel']],
      ['programming', ['java', 'c++', 'database']],
      ['language', ['Chinese', 'German']],
      ['java', ['java architecture', 'java concepts', 'jvm', 'garbage collection', 'java performance tuning', 'spring']],
    ]});
  }

server.listen(PORT, () => console.log('WebSocket Server running on port ' + PORT));