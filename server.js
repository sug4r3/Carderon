//乱数生成用
/*
class Random {
    constructor(seed = 88675133) {
        this.x = 123456789;
        this.y = 362436055;
        this.z = 521288644;
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
*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


//const random = new Random(1);
let room_list = [{ roomID: 0, player1: 'dummy1', player2: 'dummy2' }];
/*
 *  room_list [{ 
 *               roomID: 5桁数値, 
 *               player1: 'String', 
 *               player2: 'String', 
 *               player1_cards: {
 *                   first: {suit: 'String', num: 1~3},
 *                   second: {suit: 'String', num: 1~3},
 *                   third: {suit: 'String', num: 1~3},
 *                              }
 *               player2_cards: {
 *                   first: {suit: 'String', num: 1~3},
 *                   second: {suit: 'String', num: 1~3},
 *                   third: {suit: 'String', num: 1~3},
 *                              },
 *               isHost: boolean
 *            }]     
 */

io.on('connection', function (socket) {
    socket.on('makeRoom', function (obj) {
        const username = obj.username;
        let roomID = 0;
        while (searchRoomList(roomID) != undefined) {
            //roomID = random.nextInt(10000, 99999);
            roomID = Math.floor(Math.random() * 90000) + 10000;
        }
        socket.join(roomID);
        socket.roomID = roomID;
        socket.username = username;

        socket.isHost = true;
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
            socket.isHost = false;
            io.to(roomID).emit('matching', index);
        }
    })

    socket.on('leaveRoom', function (isHost) {
        const roomID = socket.roomID;
        const username = socket.username;
        const index = searchRoomList(roomID);
        socket.username = undefined;
        socket.roomID = undefined;
        socket.isHost = undefined;
        if (!isHost) {
            socket.to(roomID).emit('leaveEnemy', username);
            index.player2 = null;
        }
        else {
            socket.to(roomID).emit('roomBroken', roomID);
            room_list = room_list.filter(element => element.roomID != roomID);
        }
        socket.leave(roomID);
    })

    socket.on('deleteID', function (isHost) {
        socket.leave(socket.roomID);
        socket.username = undefined;
        socket.roomID = undefined;
        socket.isHost = undefined;
    })

    socket.on('kickEnemy', function (isHost) {
        const roomID = socket.roomID;
        socket.to(roomID).emit('kicked', roomID);
    })

    socket.on('startGame', function (room_property) {
        const roomID = room_property.roomID;
        const index = searchRoomList(roomID);
        io.to(roomID).emit('gameStart', index);
        console.log('start game:', index);
    })

    // in game
    socket.on('send3Cards', function (cards) {
        const roomID = socket.roomID;
        const index = searchRoomList(roomID);
        const isHost = socket.isHost;
        if (isHost) {
            index.player1_cards = cards;
        } else {
            index.player2_cards = cards;
        }
        if (index.player1_cards != undefined && index.player2_cards != undefined) {
            io.to(roomID).emit('bothCardSet', roomID);
        }
    })

    socket.on('checkCard', function (card) {
        const roomID = socket.roomID;
        const index = searchRoomList(roomID);
        const isHost = socket.isHost;
        const place = card.place;
        const suit = card.suit;
        const num = card.num;

        let result = '';
        if (isHost) {
            result = check(index.player2_cards, place, suit, num);
        }
        else {
            result = check(index.player1_cards, place, suit, num);
        }

        io.to(roomID).emit('checkResult', { card: card, result: result });
    })

    socket.on('challenge', function (cards) {
        const roomID = socket.roomID;
        const index = searchRoomList(roomID);
        const isHost = socket.isHost;
        let result = '';
        if (isHost) {
            result = challenge(index.player2_cards, cards);
        }
        else {
            result = challenge(index.player1_cards, cards);
        }

        if (result == 'correct') {
            io.to(roomID).emit('finishGame', { player1_cards: index.player1_cards, player2_cards: index.player2_cards });
            room_list = room_list.filter(element => element.roomID != socket.roomID);
        }
        else
            io.to(roomID).emit('challengeResult', { cards: cards, result: result });
    })

    socket.on('endGame', function (obj) {
        const roomID = socket.roomID;
        const index = searchRoomList(roomID);
        const isHost = socket.isHost;
        io.to(roomID).emit('endGame', { player1_cards: index.player1_cards, player2_cards: index.player2_cards });

        room_list = room_list.filter(element => element.roomID != socket.roomID);
    })

    socket.on('finishMyTurn', function (bool) {
        const roomID = socket.roomID;
        io.to(roomID).emit('changeTurn', bool);
    })

    // disconnection
    socket.on('disconnect', function () {
        if (socket.roomID != undefined) {
            socket.to(socket.roomID).emit('ERR_DISCONNECT', socket.roomID);
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

//check時のヒットブロー判定
function check(list, place, suit, num) {
    let target;
    let result = 'miss';
    if (place == 1) {
        target = list.first;
    }
    else if (place == 2) {
        target = list.second;
    }
    else if (place == 3) {
        target = list.third;
    }

    if (target.suit == suit) {
        if (target.num == num) {
            result = 'match';
        }
        else {
            result = 'near';
        }
    }
    else if (target.num == num) {
        result = 'near';
    }

    return result;
}

//challenge
function challenge(target, cards) {
    let res = 'miss';
    if ((target.first.suit == cards.first.suit && target.first.num == cards.first.num) &&
        (target.second.suit == cards.second.suit && target.second.num == cards.second.num) &&
        (target.third.suit == cards.third.suit && target.third.num == target.third.num)) {
        res = 'correct'
    }
    return res;
}