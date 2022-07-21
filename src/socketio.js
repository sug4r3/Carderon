class SocketIO {
    static initialize() {
        this.socket = io();

        this.socket.on('makeRoom', function (obj) {
            Scene.waitRoom_scene.setRoomProperty(obj);
        })

        this.socket.on('matching', function (index) {
            Scene.setScene('room_scene');
            Scene.room_scene.setRoomProperty(index);
            Scene.isMatched = true;
            console.log(index);
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

        this.socket.on('ERR_DISCONNECT', function () {
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