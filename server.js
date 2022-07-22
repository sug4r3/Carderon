//乱数生成用
class Random {
    constructor(seed = 88675123) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;
    }

    next() {
        let t;
        t = this.x ^ (this.x << 11);
        this.x = this.y; this.y = this.z;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
    }

    nextInt(min, max) {
        const r = Math.abs(this.next());
        return min + (r % (max + 1 - min));
    }
}

var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/src/main.js', function (req, res) {
    res.sendFile(__dirname + '/src/main.js');
});
app.get('/src/scene.js', function (req, res) {
    res.sendFile(__dirname + '/src/scene.js');
});
app.get('/src/socketio.js', function (req, res) {
    res.sendFile(__dirname + '/src/socketio.js');
});

const random = new Random(1);
let room_list = [{ roomID: 0, player1: 'dummy1', player2: 'dummy2' }];

io.on('connection', function (socket) {
    socket.on('makeRoom', function (obj) {
        const username = obj.username;
        let roomID = 0;
        while (searchRoomList(roomID) != undefined) {
            roomID = random.nextInt(10000, 99999);
        }
        socket.join(roomID);
        socket.roomID = roomID;
        socket.username = username;
        socket.isFirstPlay = true;
        room_list.push({ roomID: roomID, player1: username, player2: null });
        socket.emit('makeRoom', { username: username, roomID: roomID });
    })

    socket.on('joinRoom', function (obj) {
        const username = obj.username;
        const roomID = obj.roomID;
        const index = searchRoomList(roomID);
        if (index == undefined) {   //部屋がない
            socket.emit('ERR_ROOMID_NOT_FOUND', roomID);
        }
        else if (roomID < 10000 || roomID > 99999) {    //範囲外
            socket.emit('ERR_ROOMID_OUT_OF_RANGE', roomID);
        }
        else if (index.player2 != null) {
            socket.emit('ERR_ROOMID_USED', roomID);
        }
        else {  //マッチング
            index.player2 = username;
            socket.join(roomID);
            socket.roomID = roomID;
            socket.username = username;
            socket.isFirstPlay = false;
            io.to(roomID).emit('matching', index);
        }
    })

    // disconnection
    socket.on('disconnect', function () {
        if (socket.roomID != undefined) {
            io.to(socket.roomID).emit('ERR_DISCONNECT', socket.roomID);
            room_list = room_list.filter(element => element.roomID != socket.roomID);
        }
    })

    //for debug
    socket.on('message', function (msg) {
        console.log('message: ' + msg);
        io.emit('message', msg);
    });
});

http.listen(PORT, function () {
    console.log('server listening. Port:' + PORT);
});


//room_listの部屋番号検索
//なかったらundefined
function searchRoomList(roomID) {
    const index = room_list.find(element => element.roomID == roomID);
    return index;
}