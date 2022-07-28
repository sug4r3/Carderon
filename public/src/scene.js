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

        this.title = new Vue({
            el: '#title',
            data: {
                isSeen: true
            }
        })

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
                username: 'no name',
                isSeen: false
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
                room_property: {
                    roomID: 0,
                    username: 'no name'
                },
                isSeen: false
            },
            methods: {
                setScene: function (nextScene) {
                    Scene.setScene(nextScene);
                },
                joinRoom: function () {
                    SocketIO.emit('joinRoom', this.room_property);
                    Scene.isHost = false;
                }
            }
        })

        this.waitRoom_scene = new Vue({
            el: '#waitRoom_scene',
            data: {
                room_property: {
                    roomID: 0,
                    username: 'no name'
                },
                isSeen: false
            },
            methods: {
                setRoomProperty: function (obj) {
                    this.room_property = obj
                },
                setScene: function (nextScene) {
                    Scene.setScene(nextScene);
                }
            }
        })

        this.room_scene = new Vue({
            el: '#room_scene',
            data: {
                room_property: {
                    roomID: 0,
                    player1: null,
                    player2: null
                },
                isSeen: false
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
                },
                setScene: function (nextScene) {
                    Scene.setScene(nextScene);
                },
                leaveRoom: function () {
                    SocketIO.emit('leaveRoom', Scene.isHost);
                },
                kickEnemy: function () {
                    SocketIO.emit('kickEnemy', Scene.isHost);
                },
                startGame: function () {
                    SocketIO.emit('startGame', this.room_property);
                },
                getIsHost: function () {
                    return Scene.isHost;
                }
            }
        })

    }

    static setScene(sceneName) {
        Scene.clearIsSeen();
        switch (sceneName) {
            case 'start_scene':
                GameScene.setScene('reset');
                Scene.isHost = false;
                Scene.title.isSeen = true;
                Scene.start_scene.isSeen = true;
                break;
            case 'makeRoom_scene':
                Scene.makeRoom_scene.isSeen = true;
                break;
            case 'joinRoom_scene':
                Scene.joinRoom_scene.isSeen = true;
                break;
            case 'waitRoom_scene':
                Scene.waitRoom_scene.isSeen = true;
                break;
            case 'room_scene':
                Scene.room_scene.isSeen = true;
                break;
            case 'game_scene':
                Scene.title.isSeen = false;
                const room_property = Scene.room_scene.room_property;
                GameScene.room_property = {
                    roomID: room_property.roomID,
                    my_username: (Scene.isHost) ? room_property.player1 : room_property.player2,
                    enemy_username: (!Scene.isHost) ? room_property.player1 : room_property.player2
                }
        }
    }

    static clearIsSeen() {
        Scene.start_scene.isSeen = false;
        Scene.makeRoom_scene.isSeen = false;
        Scene.joinRoom_scene.isSeen = false;
        Scene.waitRoom_scene.isSeen = false;
        Scene.room_scene.isSeen = false;
    }
}