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

Conversation.deleteMany({},(err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Success');
    }
});

app.get('/',function(req,res) {
    res.sendFile(__dirname +'/home.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (room, msg) => {
        io.emit('chat message',room, msg);
    });
});

app.post('/newchatroom',function(req,res){
    res.sendFile(__dirname+'/chatroom_files/chatroom.html');
    createConvo().then(roomNumber => {
        setTimeout(() => {
            var num = roomNumber;
            var numString = num.toString();
            io.emit('room number',num);
            var start = 1;
            start = start.toString();
            io.emit('users',start)
        },2000);
    });
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
    const awesome_instance = Conversation.create({ Room: number , UserNumber : 1}, function (err, awesome_instance) {
        if (err) return handleError(err);
        // saved!
     });
     return number;
}

function chatSetup(roomNumber){
    var num = roomNumber;
    var numString = num.toString();
    io.emit('room number',num);
    var start = 1;
    start = start.toString();
    io.emit('users',start)
}

app.post('/newfeed',function(req,res){
    res.sendFile(__dirname+'/newfeed.html');
});

app.post('/joinroom',function(req,res){
    const inputRoom = req.body.room;
    
    Conversation.exists({Room : inputRoom}).then(result => {
        if(result){
            var numberOfUsers = 0;
            Conversation.findOne({Room : inputRoom}).then(doc =>{
                doc.UserNumber = doc.UserNumber+1;
                doc.save();
                numberOfUsers = doc.UserNumber;
            });
            res.sendFile(__dirname+'/chatroom_files/chatroom.html');
            setTimeout(function(){
                io.emit('room number',inputRoom);
                io.emit('chat message',inputRoom,"A new user connected!");
                io.emit('users',numberOfUsers);
            },1200);
        }
        else{
            
        }
    });
});

app.get('/chatroom_files/styles.css',function(req,res){
    res.sendFile(__dirname+'/chatroom_files/styles.css');
});

app.get('/feed.js',function(req,res){
    res.sendFile(__dirname+'/feed.js');
});

http.listen(3000,function() {
    console.log("Listening on 3000!");
});