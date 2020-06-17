var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io') (http);
var path = require('path');
var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://hjn80:painandsuffer@cluster0-sxq4m.azure.mongodb.net/videos?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Conversation = require('../messenger/models/convo');

app.get('/',function(req,res) {
    res.sendFile(__dirname +'/home.html');
});

io.on('connection', (socket) => {
    console.log('Connection logged');
    socket.on('chat message', (msg) => {
        console.log(msg);
        io.emit('chat message', msg);
    });
});



app.post('/newfeed',function(req,res){
    Conversation.create({pain : 1}, function (err, Conversation) {
        if (err) return handleError(err);
    });
    res.sendFile(__dirname+'/newfeed.html');
});

app.get('/feed.js',function(req,res){
    res.sendFile(__dirname+'/feed.js');
});

http.listen(3000,function() {
    console.log("Listening on 3000!");
});