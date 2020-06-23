var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io') (http);
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

var mongoDB = 'mongodb+srv://hjn80:painandsuffer@cluster0-sxq4m.azure.mongodb.net/videos?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Conversation = require('../messenger/models/convo');
const { Console } = require('console');

app.get('/',function(req,res) {
    res.sendFile(__dirname +'/home.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (room, msg) => {
        console.log(room+' Server');
        io.emit('chat message',room, msg);
    });
});

app.post('/newchatroom',function(req,res){
    const roomNumber = createConvo();
    res.sendFile(__dirname+'/chatroom.html');
    chatSetup(roomNumber);
})

async function createConvo(){
    var number = 1;
    var loop = true;
    while(loop){
        loop = await Conversation.exists({Room : number});
        if(loop){
            number++;
        }
    }
    const awesome_instance = Conversation.create({ Room: number }, function (err, awesome_instance) {
        if (err) return handleError(err);
        // saved!
     });
     return number;
}

async function chatSetup(roomNumber){
    var num = await roomNumber;
    var numString = num.toString();
    io.emit('room number',num);
}

app.post('/newfeed',function(req,res){
    res.sendFile(__dirname+'/newfeed.html');
});

app.post('/joinroom',function(req,res){
    const inputRoom = req.body.room;
    console.log(inputRoom);
    Conversation.exists({Room : inputRoom}).then(result => {
        if(result){
            res.sendFile(__dirname+'/chatroom.html');
            setTimeout(function(){
                io.emit('room number',inputRoom);
            },1200)
        }
        else{
            
        }
    });
});

app.get('/feed.js',function(req,res){
    res.sendFile(__dirname+'/feed.js');
});

http.listen(3000,function() {
    console.log("Listening on 3000!");
});