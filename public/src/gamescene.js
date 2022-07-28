class GameScene {
    //card_use_list[num][suit]

    static initialize() {
        this.card_use_list = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1]
        ];

        this.my_set_cards = {
            first: undefined,
            second: undefined,
            third: undefined
        }

        this.room_property = {
            roomID: 0,
            my_username: null,
            enemy_username: null
        }

        this.isSend = false;
        this.challenge_count = 0;

        //コンポーネント
        this.background = new Vue({
            el: '#background',
            data: {
                isSeen: false
            }
        })

        this.card_set = new Vue({
            el: '.card_set',
            data: {
                isSeen: false,
                cardImg1: "card-back-white",
                cardImg2: "card-back-white",
                cardImg3: "card-back-white",
                counter: 1,
                isSet3Cards: false
            },
            methods: {
                clickCard: function (suit, num) {
                    if (this.counter > 0 && this.counter < 4) {
                        GameScene.card_use_list[num - 1][GameScene.suitNum(suit)] = 0;
                        if (this.counter == 1) {
                            this.cardImg1 = suit + '-' + num;
                            GameScene.my_set_cards.first = { suit: suit, num: num };
                        }
                        else if (this.counter == 2) {
                            this.cardImg2 = suit + '-' + num;
                            GameScene.my_set_cards.second = { suit: suit, num: num };
                        }
                        else if (this.counter == 3) {
                            this.cardImg3 = suit + '-' + num;
                            GameScene.my_set_cards.third = { suit: suit, num: num };
                            this.isSet3Cards = true;
                        }
                        this.counter++;
                    }
                },
                resetCard: function () {
                    GameScene.card_use_list = [
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1]
                    ];
                    GameScene.my_set_cards = {
                        first: undefined,
                        second: undefined,
                        third: undefined
                    };
                    this.isSet3Cards = false;
                    this.counter = 1;
                    this.cardImg1 = "card-back-white";
                    this.cardImg2 = "card-back-white";
                    this.cardImg3 = "card-back-white";
                },
                setScene: function (scene) {
                    GameScene.setScene(scene);
                },
                isUsed: function (suit, num) {
                    return GameScene.card_use_list[num - 1][GameScene.suitNum(suit)];
                },
                sendMyCards: function () {
                    if (this.isSet3Cards) {
                        SocketIO.emit('send3Cards', GameScene.my_set_cards);
                        this.setScene('wait_enemy_set');
                    }
                }
            }
        })

        this.wait_enemy_set = new Vue({
            el: '.wait_enemy_set',
            data: {
                isSeen: false
            }
        })

        this.my_turn = new Vue({
            el: '.my_turn',
            data: {
                isSeen: false,

                cardImg1: "card-back-white",
                cardImg2: "card-back-white",
                cardImg3: "card-back-white",

                my_logs: [],
                enemy_logs: [],

                selected_card: {
                    suit: null,
                    num: null
                },

                cardDummy1: "card_dummy",
                cardDummy2: "card_dummy",
                cardDummy3: "card_dummy",
                isOnCard: false,

                checkCard: {
                    place: null,
                    suit: null,
                    num: null
                }
            },
            methods: {
                setMyCards: function () {
                    const cards = GameScene.my_set_cards;
                    this.cardImg1 = cards.first.suit + '-' + cards.first.num;
                    this.cardImg2 = cards.second.suit + '-' + cards.second.num;
                    this.cardImg3 = cards.third.suit + '-' + cards.third.num;
                },
                isUsed: function (suit, num) {
                    return GameScene.card_use_list[num - 1][GameScene.suitNum(suit)];
                },
                getRoomProperty: function () {
                    return GameScene.room_property;
                },

                clickCard: function (suit, num) {
                    if (this.isSelected(suit, num)) {
                        this.resetSelectedCard();
                    }
                    else {
                        this.selected_card = {
                            suit: suit,
                            num: num
                        }
                    }
                },
                isSelected: function (suit, num) {
                    return (suit == this.selected_card.suit && num == this.selected_card.num) ? true : false;
                },
                resetSelectedCard: function () {
                    this.selected_card = {
                        suit: null,
                        num: null
                    }
                },
                resetDummyCard: function () {
                    if (this.checkCard.place != null) {
                        GameScene.card_use_list[this.checkCard.num - 1][GameScene.suitNum(this.checkCard.suit)] = 1;
                    }

                    this.checkCard = {
                        place: null,
                        suit: null,
                        num: null
                    }

                    this.cardDummy1 = "card_dummy";
                    this.cardDummy2 = "card_dummy";
                    this.cardDummy3 = "card_dummy";
                    this.isOnCard = false;
                    this.resetSelectedCard();
                },
                setDummyCard: function (place) {
                    if (!this.isOnCard) {
                        const suit = this.selected_card.suit;
                        const num = this.selected_card.num;
                        if (suit != null && num != null) {
                            if (place == 1) {
                                this.cardDummy1 = suit + '-' + num;
                            }
                            else if (place == 2) {
                                this.cardDummy2 = suit + '-' + num;
                            }
                            else if (place == 3) {
                                this.cardDummy3 = suit + '-' + num;
                            }

                            this.checkCard = {
                                place: place,
                                suit: suit,
                                num: num
                            }

                            GameScene.card_use_list[num - 1][GameScene.suitNum(suit)] = 0;
                            this.resetSelectedCard();
                            this.isOnCard = true;
                        }
                    }
                },

                sendCheckMessage: function () {
                    if (this.checkCard.place != null) {
                        SocketIO.emit('checkCard', this.checkCard);
                        GameScene.wait_calc.isSeen = true;
                        GameScene.isSend = true;

                        this.cardDummy1 = "card_dummy";
                        this.cardDummy2 = "card_dummy";
                        this.cardDummy3 = "card_dummy";
                        this.isOnCard = false;
                        this.resetSelectedCard();
                    }
                },

                challenge: function () {
                    GameScene.challenge.isSeen = true;
                },

                resetLogs: function () {
                    this.my_logs = [];
                    this.enemy_logs = [];
                },
                pushMyLogs: function (log) {
                    this.my_logs.push(log);
                },
                pushEnemyLogs: function (log) {
                    this.enemy_logs.push(log);
                },
            }
        })

        this.wait_calc = new Vue({
            el: '.wait_calc',
            data: {
                isSeen: false
            }
        })

        this.check_result = new Vue({
            el: '.check_result',
            data: {
                isSeen: false,
                cardDummy1: "card_dummy",
                cardDummy2: "card_dummy",
                cardDummy3: "card_dummy",
                message: ""
            },
            methods: {
                setMessage: function (card, result) {
                    this.message = result.toUpperCase() + ' !';

                    const place = card.place;
                    const suit = card.suit;
                    const num = card.num;
                    if (place == 1) {
                        this.cardDummy1 = suit + '-' + num;
                    }
                    else if (place == 2) {
                        this.cardDummy2 = suit + '-' + num;
                    }
                    else if (place == 3) {
                        this.cardDummy3 = suit + '-' + num;
                    }
                },
                resetDummyCard: function () {
                    this.cardDummy1 = "card_dummy";
                    this.cardDummy2 = "card_dummy";
                    this.cardDummy3 = "card_dummy";

                    this.message = "";
                },
                finishMyTurn: function () {
                    SocketIO.emit('finishMyTurn', true);
                }
            }
        })

        this.challenge = new Vue({
            el: '.challenge',
            data: {
                cardImg1: "card-back-white",
                cardImg2: "card-back-white",
                cardImg3: "card-back-white",
                counter: 1,
                card_use_list: [
                    [1, 1, 1, 1],
                    [1, 1, 1, 1],
                    [1, 1, 1, 1]
                ],
                isSet3Cards: false,
                my_set_cards: {
                    first: undefined,
                    second: undefined,
                    third: undefined,
                },
                isSeen: false,
            },
            methods: {
                clickCard: function (suit, num) {
                    if (this.counter > 0 && this.counter < 4) {
                        this.card_use_list[num - 1][GameScene.suitNum(suit)] = 0;
                        if (this.counter == 1) {
                            this.cardImg1 = suit + '-' + num;
                            this.my_set_cards.first = { suit: suit, num: num };
                        }
                        else if (this.counter == 2) {
                            this.cardImg2 = suit + '-' + num;
                            this.my_set_cards.second = { suit: suit, num: num };
                        }
                        else if (this.counter == 3) {
                            this.cardImg3 = suit + '-' + num;
                            this.my_set_cards.third = { suit: suit, num: num };
                            this.isSet3Cards = true;
                        }
                        this.counter++;
                    }
                },
                resetCard: function () {
                    this.card_use_list = [
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1]
                    ];
                    this.my_set_cards = {
                        first: undefined,
                        second: undefined,
                        third: undefined
                    };
                    this.isSet3Cards = false;
                    this.counter = 1;
                    this.cardImg1 = "card-back-white";
                    this.cardImg2 = "card-back-white";
                    this.cardImg3 = "card-back-white";
                },
                isUsed: function (suit, num) {
                    return this.card_use_list[num - 1][GameScene.suitNum(suit)];
                },
                sendMyCards: function () {
                    if (this.isSet3Cards) {
                        this.isSet3Cards = false;
                        GameScene.isSend = true;
                        SocketIO.emit('challenge', this.my_set_cards);
                        GameScene.challenge.isSeen = false;
                        GameScene.wait_calc.isSeen = true;
                        GameScene.challenge_count++;
                        this.resetCard();
                    }
                },
                halt: function () {
                    this.resetCard();
                    this.isSeen = false;
                }
            }
        })

        this.challenge_result = new Vue({
            el: '.challenge_result',
            data: {
                isSeen: false,
                cardDummy1: "card_dummy",
                cardDummy2: "card_dummy",
                cardDummy3: "card_dummy",
                message: ""
            },
            methods: {
                setMessage: function (cards, result) {
                    this.message = result.toUpperCase() + ' !';

                    const first = cards.first;
                    const second = cards.second;
                    const third = cards.third;
                    this.cardDummy1 = first.suit + '-' + first.num;
                    this.cardDummy2 = second.suit + '-' + second.num;
                    this.cardDummy3 = third.suit + '-' + third.num;
                },
                resetDummyCard: function () {
                    this.cardDummy1 = "card_dummy";
                    this.cardDummy2 = "card_dummy";
                    this.cardDummy3 = "card_dummy";

                    this.message = "";
                },
                finishMyTurn: function () {
                    SocketIO.emit('finishMyTurn', true);
                }
            }
        })

        this.enemy_turn = new Vue({
            el: '.enemy_turn',
            data: {
                isSeen: false
            }
        })

        this.game_result = new Vue({
            el: '.game_result',
            data: {
                isSeen: false,

                myCard1: "card_dummy",
                myCard2: "card_dummy",
                myCard3: "card_dummy",

                enemyCard1: "card_dummy",
                enemyCard2: "card_dummy",
                enemyCard3: "card_dummy",

                message: '',
            },
            methods: {
                setScene: function (scene) {
                    Scene.setScene('start_scene');
                    Main.reset();
                    SocketIO.emit('deleteID', true);
                },
                setMyCards: function (cards) {
                    const first = cards.first;
                    const second = cards.second;
                    const third = cards.third;
                    this.myCard1 = first.suit + '-' + first.num;
                    this.myCard2 = second.suit + '-' + second.num;
                    this.myCard3 = third.suit + '-' + third.num;
                },
                setEnemyCards: function (cards) {
                    const first = cards.first;
                    const second = cards.second;
                    const third = cards.third;
                    this.enemyCard1 = first.suit + '-' + first.num;
                    this.enemyCard2 = second.suit + '-' + second.num;
                    this.enemyCard3 = third.suit + '-' + third.num;
                },
                setMessage: function (msg) {
                    this.message = msg;
                },
                getMyUsername: function () {
                    return GameScene.room_property.my_username;
                },
                getEnemyUsername: function () {
                    return GameScene.room_property.enemy_username;
                }
            }
        })
    }

    static setScene(sceneName) {
        GameScene.clearIsSeen();
        switch (sceneName) {
            case 'reset':
                GameScene.background.isSeen = false;
                GameScene.card_set.resetCard();
                GameScene.card_use_list = [
                    [1, 1, 1, 1],
                    [1, 1, 1, 1],
                    [1, 1, 1, 1]
                ];
                GameScene.card_set.isSet3Cards = false;
                GameScene.my_turn.resetDummyCard();
                GameScene.check_result.resetDummyCard();
                GameScene.challenge_result.resetDummyCard();
                GameScene.my_turn.resetLogs();
                GameScene.isSend = false;
                GameScene.challenge_count = 0;
                break;
            case 'card_set':
                GameScene.background.isSeen = true;
                GameScene.card_set.isSeen = true;
                break;
            case 'wait_enemy_set':
                GameScene.card_set.isSeen = true;
                GameScene.wait_enemy_set.isSeen = true;
                break;
            case 'my_turn':
                GameScene.my_turn.isSeen = true;
                break;
            case 'enemy_turn':
                GameScene.my_turn.isSeen = true;
                GameScene.enemy_turn.isSeen = true;
                break;
        }
    }

    static clearIsSeen() {
        GameScene.card_set.isSeen = false;
        GameScene.wait_enemy_set.isSeen = false;
        GameScene.my_turn.isSeen = false;
        GameScene.enemy_turn.isSeen = false;
        GameScene.wait_calc.isSeen = false;
        GameScene.check_result.isSeen = false;
        GameScene.challenge_result.isSeen = false;
        GameScene.game_result.isSeen = false;
    }

    static suitNum(suit) {
        let num = -1;
        switch (suit) {
            case 'spade':
                num = 0;
                break;
            case 'clover':
                num = 1;
                break;
            case 'heart':
                num = 2;
                break;
            case 'diamond':
                num = 3;
                break;
        }
        return num;
    }

    //log生成用
    static makeLog(card, result) {
        const place = card.place;
        const suit = card.suit;
        const num = card.num;

        let result_mark;
        if (result == 'match') result_mark = '〇';
        else if (result == 'near') result_mark = '△';
        else result_mark = '✕';

        const suit_mark = GameScene.getSuitMark(suit);

        let log = '';
        if (place == 1) {
            log = suit_mark + num + ': ' + result_mark + ' ー ー';
        }
        else if (place == 2) {
            log = suit_mark + num + ': ' + 'ー ' + result_mark + ' ー';
        }
        else if (place == 3) {
            log = suit_mark + num + ': ' + 'ー ー ' + result_mark;
        }

        return log;
    }

    static getSuitMark(suit) {
        let suit_mark;
        if (suit == 'spade') suit_mark = '♠';
        else if (suit == 'clover') suit_mark = '♣';
        else if (suit == 'heart') suit_mark = '♡';
        else if (suit == 'diamond') suit_mark = '♢';
        return suit_mark;
    }

    static makeChallengeLog(cards) {
        const first = cards.first;
        const second = cards.second;
        const third = cards.third;

        const log = 'miss: ' + GameScene.getSuitMark(first.suit) + first.num + ' ' +
            GameScene.getSuitMark(second.suit) + second.num + ' ' +
            GameScene.getSuitMark(third.suit) + third.num;
        return log;
    }
}