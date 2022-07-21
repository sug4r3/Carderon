class Scene {
    //start_scene
    //makeRoom_scene
    //joinRoom_scene
    //room_scene

    //isHost
    //isMatched

    static initialize() {
        this.isHost = false;
        this.isMatched = false;

        this.start_scene = new Vue({
            el: '#start_scene',
            data: {
                isSeen: false
            },
            methods: {
                setScene: function (nextScene) {
                    Scene.setScene(nextScene);
                }
            }
        })

        this.makeRoom_scene = new Vue({
            el: '#makeRoom_scene',
            data: {
                isSeen: false,
                username: 'no name'
            },
            methods: {
                setScene: function (nextScene) {
                    Scene.setScene(nextScene);
                },
                makeRoom: function () {
                    SocketIO.emit('makeRoom', { username: this.username });
                    Scene.isHost = true;
                }
            }
        })

        this.joinRoom_scene = new Vue({
            el: '#joinRoom_scene',
            data: {
                isSeen: false,
                room_property: {
                    roomID: 0,
                    username: 'no name'
                }
            },
            methods: {
                setScene: function (nextScene) {
                    Scene.setScene(nextScene);
                },
                joinRoom: function () {
                    SocketIO.emit('joinRoom', this.room_property);
                }
            }
        })

        this.waitRoom_scene = new Vue({
            el: '#waitRoom_scene',
            data: {
                isSeen: false,
                room_property: {
                    roomID: 0,
                    username: 'no name'
                }
            },
            methods: {
                setRoomProperty: function (obj) {
                    this.room_property = obj
                }
            }
        })

        this.room_scene = new Vue({
            el: '#room_scene',
            data: {
                isSeen: false,
                room_property: {
                    roomID: 0,
                    player1: 'no name',
                    player2: 'no name'
                }
            },
            computed: {
                getMyUsername: function () {
                    return (Scene.isHost) ? this.room_property.player1 : this.room_property.player2;
                },
                getEnemyUsername: function () {
                    return (!Scene.isHost) ? this.room_property.player1 : this.room_property.player2;
                }
            },
            methods: {
                setRoomProperty: function (obj) {
                    this.room_property = obj;
                }
            }
        })

    }

    static setScene(sceneName) {
        switch (sceneName) {
            case 'start_scene':
                this.start_scene.isSeen = true;
                this.makeRoom_scene.isSeen = false;
                this.joinRoom_scene.isSeen = false;
                this.waitRoom_scene.isSeen = false;
                this.room_scene.isSeen = false;
                break;

            case 'makeRoom_scene':
                this.start_scene.isSeen = false;
                this.makeRoom_scene.isSeen = true;
                this.joinRoom_scene.isSeen = false;
                this.waitRoom_scene.isSeen = false;
                this.room_scene.isSeen = false;
                break;

            case 'joinRoom_scene':
                this.start_scene.isSeen = false;
                this.makeRoom_scene.isSeen = false;
                this.joinRoom_scene.isSeen = true;
                this.waitRoom_scene.isSeen = false;
                this.room_scene.isSeen = false;
                break;

            case 'waitRoom_scene':
                this.start_scene.isSeen = false;
                this.makeRoom_scene.isSeen = false;
                this.joinRoom_scene.isSeen = false;
                this.waitRoom_scene.isSeen = true;
                this.room_scene.isSeen = false;
                break;

            case 'room_scene':
                this.start_scene.isSeen = false;
                this.makeRoom_scene.isSeen = false;
                this.joinRoom_scene.isSeen = false;
                this.waitRoom_scene.isSeen = false;
                this.room_scene.isSeen = true;
                break;
        }
    }

}