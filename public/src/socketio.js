class SocketIO {
    static initialize() {
        this.socket = io();

        this.socket.on('makeRoom', function (obj) {
            Scene.waitRoom_scene.setRoomProperty(obj);
        })

        this.socket.on('matching', function (index) {
            Scene.setScene('room_scene');
            Scene.room_scene.setRoomProperty(index);
        })

        this.socket.on('leaveEnemy', function (enemyName) {
            Scene.setScene('waitRoom_scene');
            Scene.room_scene.setRoomProperty({ roomID: 0, player1: null, player2: null });
        })

        this.socket.on('roomBroken', function (roomID) {
            SocketIO.emit('deleteID', Scene.isHost);
            Scene.setScene('start_scene');
            Main.reset();
            alert('通信が切断されました');
        })

        this.socket.on('kicked', function (roomID) {
            SocketIO.emit('leaveRoom', Scene.isHost);
            Scene.setScene('start_scene');
            Main.reset();
            alert('ホストによりキックされました');
        })

        this.socket.on('gameStart', function (index) {
            Scene.setScene('game_scene');
            GameScene.setScene('card_set');
            Scene.isMatched = true;
        })

        //in game
        this.socket.on('bothCardSet', function (roomID) {
            if (Scene.isHost) {
                GameScene.setScene('my_turn');
                GameScene.my_turn.setMyCards();
            }
            else {
                GameScene.setScene('enemy_turn');
                GameScene.my_turn.setMyCards();
            }
        })

        this.socket.on('checkResult', function (obj) {
            const card = obj.card;
            const result = obj.result;
            if (GameScene.isSend) { //checkした側
                const log = GameScene.makeLog(card, result);
                GameScene.my_turn.pushEnemyLogs(log);
                //結果表示
                GameScene.check_result.setMessage(card, result);
                GameScene.check_result.isSeen = true;
            }
            else {  //された側
                const log = GameScene.makeLog(card, result);
                GameScene.my_turn.pushMyLogs(log);
            }
        })

        this.socket.on('challengeResult', function (obj) {  //challenge間違い
            const cards = obj.cards;
            const result = obj.result;
            if (GameScene.isSend) {
                const log = GameScene.makeChallengeLog(cards);
                GameScene.my_turn.pushEnemyLogs(log);
                GameScene.challenge_result.setMessage(cards, result);
                GameScene.challenge_result.isSeen = true;
            }
            else {
                const log = GameScene.makeChallengeLog(cards);
                GameScene.my_turn.pushMyLogs(log);
            }

            if (GameScene.challenge_count >= 2) {   //challenge回数オーバー
                SocketIO.emit('endGame', true);
            }
        })

        this.socket.on('changeTurn', function (obj) {
            if (GameScene.isSend) {
                GameScene.isSend = false;
                GameScene.check_result.resetDummyCard();
                GameScene.challenge_result.resetDummyCard();
                GameScene.setScene('enemy_turn');
            }
            else {
                GameScene.setScene('my_turn');
            }
        })

        this.socket.on('finishGame', function (obj) {   //challenge あたり
            const player1_cards = obj.player1_cards;
            const player2_cards = obj.player2_cards;
            if (Scene.isHost) {
                GameScene.game_result.setMyCards(player1_cards);
                GameScene.game_result.setEnemyCards(player2_cards);
            }
            else {
                GameScene.game_result.setMyCards(player2_cards);
                GameScene.game_result.setEnemyCards(player1_cards);
            }
            if (GameScene.isSend) {
                GameScene.game_result.setMessage('あなたの勝ちです！！！');
            }
            else {
                GameScene.game_result.setMessage('あなたの負けです...');
            }
            //
            GameScene.enemy_turn.isSeen = false;
            GameScene.wait_calc.isSeen = false;
            //
            GameScene.game_result.isSeen = true;
        })

        this.socket.on('endGame', function (obj) {  //challenge 2かいはずれ負け
            const player1_cards = obj.player1_cards;
            const player2_cards = obj.player2_cards;
            if (Scene.isHost) {
                GameScene.game_result.setMyCards(player1_cards);
                GameScene.game_result.setEnemyCards(player2_cards);
            }
            else {
                GameScene.game_result.setMyCards(player2_cards);
                GameScene.game_result.setEnemyCards(player1_cards);
            }
            if (!GameScene.isSend) {
                GameScene.game_result.setMessage('あなたの勝ちです！！！');
            }
            else {
                GameScene.game_result.setMessage('あなたの負けです...');
            }
            //
            GameScene.enemy_turn.isSeen = false;
            GameScene.wait_calc.isSeen = false;
            //
            GameScene.game_result.isSeen = true;
        })

        // Error messages
        this.socket.on('ERR_ROOMID_NOT_FOUND', function (roomID) {
            Scene.setScene('start_scene');
            Main.reset();
            alert('指定した番号の部屋が見つかりません');
        })

        this.socket.on('ERR_ROOMID_OUT_OF_RANGE', function (roomID) {
            Scene.setScene('start_scene');
            Main.reset();
            alert('部屋番号は5桁の整数で入力してください');
        })

        this.socket.on('ERR_ROOMID_USED', function (roomID) {
            Scene.setScene('start_scene');
            Main.reset();
            alert('その部屋番号はゲーム中です');
        })

        this.socket.on('ERR_DISCONNECT', function (roomID) {
            Scene.setScene('start_scene');
            Main.reset();
            alert('通信が切断されました');
        })

        // for debug
        this.socket.on('message', function (msg) {
            console.log(msg);
        })
    }

    static emit = function (event, data) {
        SocketIO.socket.emit(event, data);
    }
}