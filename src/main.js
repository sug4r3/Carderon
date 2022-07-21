window.addEventListener("load", () => {
    //初期化
    Main.initialize();

    //メインループ開始
    Main.loop();
});

//frame
//mode

class Main {
    static initialize() {
        Scene.initialize();
        SocketIO.initialize();

        this.reset();
    }

    static loop() {
        switch (Main.mode) {
            case 'start':
                Scene.setScene('start_scene');
                Main.mode = 'make_join_Room';
                break;

            case 'make_join_Room':
                if (Scene.isMatched) {
                    Main.mode = 'card_set';
                }
                break;

            case 'card_set':
                console.log(Main.mode);
                break;
        }

        Main.frame++;
        requestAnimationFrame(Main.loop);
    }

    static reset() {
        this.mode = 'start';
        this.frame = 0;
        Scene.isMatched = false;
    }
}