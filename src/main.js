window.addEventListener("load", () => {
    //初期化
    initialize();

    //メインループ開始
    loop();
});

let mode;
let frame;

function initialize() {
    Scene.initialize();
    SocketIO.initialize();

    mode = 'start';
    frame = 0;
}

function loop() {
    switch (mode) {
        case 'start':
            Scene.setScene('start_scene');
            mode = 'make_join_Room';
            break;

        case 'make_join_Room':
            break;
    }

    frame++;
    requestAnimationFrame(loop);
}