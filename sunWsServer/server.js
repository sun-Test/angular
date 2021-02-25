const express = require('express');
const http = require('http')
const socketio = require('socket.io');
const app = express();

const server = http.createServer(app);
const sktIo = socketio(server, {
  cors: {
    origins: ["http://localhost:4200"],
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
const UPDATE_TREE_ROOT = 'updatetree01Root';
const UPDATE_TREE_CHILDREN = 'updatetree01Children';
const TREE_ROOT = 'tree01 root';
const TREE_CHILDREN = 'tree01 children';
const CREATE_USER = 'create-user';
const WS_READY='wsReady';

sktIo.on('connection', (socket) => {
    console.log('new webSocket connection...');
    socket.emit('wsReady', 'hello from ws server');

    // handle the event
    socket.on(UPDATE_TREE_ROOT, updateTreeListenerRoot);
    socket.on(UPDATE_TREE_CHILDREN, updateTreeListenerChildren);
    socket.on(CREATE_USER, createUser);
});

const createUser = (data) => {
  console.log('socket-io create-user ', data);
  sendKafkaMsg(CREATE_USER, data);
}

const updateTreeListenerRoot = (data) => {
    console.log(data);
    sktIo.emit(TREE_ROOT, {'root': [{id:'1', name: 'programming'}, {id:'2', name: 'life and study'}]});
  }

  const updateTreeListenerChildren = (data) => {
    console.log(data);
    sktIo.emit(TREE_CHILDREN, {'children': [
      [{id:'2', name: 'life and study'}, [{id:'3', name: 'language'}, {id:'5', name: 'study in Germany'}, {id:'6', name: 'travel'}]],
      [{id:'1', name: 'programming'}, [{id:'12', name: 'java'}, {id:'8', name: 'c++'}]],
      [{id:'3', name: 'language'}, [{id:'10', name: 'Chinese'}, {id:'9', name: 'German'}]]
     ]});
  }

server.listen(PORT, () => console.log('WebSocket Server running on port ' + PORT));

var util  = require('util');
var Kafka = require('no-kafka');
var producer = new Kafka.Producer();
var DefaultPartitioner = Kafka.DefaultPartitioner;
var consumer = new Kafka.SimpleConsumer();
 

var newUserHandler = function (messageSet, topic, partition) {
    messageSet.forEach(function (m) {
        console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
        sktIo.emit('new-user', m.message.value.toString('utf8'));
    });
};

var newVotingHandler = function (messageSet, topic, partition) {
  messageSet.forEach(function (m) {
      console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
      sktIo.emit('new-voting', m.message.value.toString('utf8'));
  });
};

function sendKafkaMsg(topic, msg){
  producer.init().then(function(){
    return producer.send({
        topic: topic,
        message: {
            value: msg
        }
    });
  })
  .then(function (result) {
    /*
    [ { topic: 'kafka-test-topic', partition: 0, offset: 353 } ]
    */
  });
}
return consumer.init().then(function () {
    // Subscribe partitons 0 - 4 in a topic:
    consumer.subscribe('new-voting', [0,1,2,3,4], newVotingHandler);
    return consumer.subscribe('new-user', [0,1,2,3,4], newUserHandler);
});

