var express = require('express');
var compression = require('compression');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io') (http);
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

var dev_db_url = "Nice try"
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var Conversation = require(__dirname+'/models/convo');
var User = require(__dirname+'/models/user');

Conversation.deleteMany({},(err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Conversations cleared');
    }
});

User.deleteMany({},(err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Users cleared');
    }
});

app.get('/',function(req,res) {
    createUser().then(usernum => {
        res.sendFile(__dirname +'/home_files/home.html');
        setTimeout(() => {
            io.emit('currUser',usernum);
        },1200);
    });
});

app.get('/home_files/styles.css',function(req,res) {
    res.sendFile(__dirname+'/home_files/styles.css');
});

app.get('/home_files/phonestyles.css',function(req,res) {
    res.sendFile(__dirname+'/home_files/phonestyles.css');
});

io.on('connection', (socket) => {
    socket.on('chat message', (room, msg) => {
        io.emit('chat message',room, msg);
    });
    socket.on('user leaving' , (r) => {
        r = r*1;
        Conversation.findOne({Room : r}).then(doc => {
            doc.Users = doc.Users-1;
            doc.save();
            io.emit('users' , r , doc.Users);
            io.emit('chat message', r, "A user disconnected!");
        }).catch(err => console.log(err));
    });
    
});


app.post('/newchatroom',function(req,res){
    const user = req.body.userstart;
    res.sendFile(__dirname+'/chatroom_files/chatroom.html');
    createConvo().then(roomNumber => {
        setTimeout(() => {
            var num = roomNumber;
            var numString = num.toString();
            io.emit('room number',num);
            io.emit('user id', num, user);
        },1200);
    });
})

async function createUser(){
    var number = 1;
    var loop = true;
    while(loop){
        loop = await User.exists({User : number});
        if(loop){
            number++;
        }
    }
    const awesome_instance = User.create({ User : number}, function (err, awesome_instance) {
        if (err) return handleError(err);
        // saved!
     });
     return number;
}


async function createConvo(){
    var number = 1;
    var loop = true;
    while(loop){
        loop = await Conversation.exists({Room : number});
        if(loop){
            number++;
        }
    }
    const awesome_instance = Conversation.create({ Room: number , Users : 1}, function (err, awesome_instance) {
        if (err) return handleError(err);
        // saved!
     });
     return number;
}

function chatSetup(roomNumber){
    var num = roomNumber;
    var numString = num.toString();
    io.emit('room number',num);
}

app.post('/newfeed',function(req,res){
    res.sendFile(__dirname+'/newfeed.html');
});

app.post('/joinroom',function(req,res){
    const inputRoom = req.body.room;
    const use = req.body.user;

    
    Conversation.exists({Room : inputRoom}).then(result => {
        if(result){
            var numberOfUsers = 0;
            Conversation.findOne({Room : inputRoom}).then(doc =>{
                doc.Users = doc.Users+1;
                doc.save();
                numberOfUsers = doc.Users;
            });
            res.sendFile(__dirname+'/chatroom_files/chatroom.html');
            setTimeout(function(){
                io.emit('room number',inputRoom);
                io.emit('chat message',inputRoom,"A new user connected!");
                io.emit('users', inputRoom, numberOfUsers);
                io.emit('user id', inputRoom, use);
            },1200);
        }
        else{
            io.emit('error',use);
            setTimeout( () => {
                res.sendFile(__dirname +'/home_files/home.html');
            },1400);
        }
    });
});

app.get('/chatroom_files/styles.css',function(req,res){
    res.sendFile(__dirname+'/chatroom_files/styles.css');
});

app.get('/chatroom_files/phonestyles.css',function(req,res){
    res.sendFile(__dirname+'/chatroom_files/phonestyles.css');
});

app.get('/feed.js',function(req,res){
    res.sendFile(__dirname+'/feed.js');
});

http.listen(process.env.PORT || 3000,function() {
    console.log("Listening on 3000!");
});
