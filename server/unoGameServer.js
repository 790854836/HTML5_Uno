/// <reference path="unoGameShared.js" />

var unoShared = require("./../js/unoGameShared.js");

// Temporary player configuration values
var configValues = [
    { id: 0, name: "Jan" },
    { id: 1, name: "Wim" },
    { id: 2, name: "Keke" },
    { id: 3, name: "Vince" }
];

// Creates a list of indices, representing a shuffled deck.
var generateDeck = function (shuffleArray) {
    var deck = new Array(112);
    
    // Fill up the deck of cards with the color cards first,
    // since each of the color cards appears exactly twice in the deck
    for (var i = 0; i < 2; ++i) {
        
        for (var j = 0; j < 52; ++j) {
            deck[j + i * 52] = j;
        }

    }
    
    // Fill up the back of the deck with the plus 4 and color changing cards.
    for (var i = 0; i < 4; ++i) {
        deck[104 + i * 2] = 52;
        deck[104 + i * 2 + 1] = 53;
    }
    
    if (shuffleArray === true) {
        shuffle(deck);
    }
    
    return deck;
};

// Shuffles an array by randomly switching indexes
var shuffle = function (array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
};

// A server-based player class, which has access to the websocket.
var Player = function (socket, id, name) {
    unoShared.Player.call(this.id, name);
    this.socket = socket;
};
Player.prototype = Object.create(unoShared.Player.prototype);

// 
var GameManager = function () {
    unoShared.GameManager.call(this);
    this.cards = unoShared.generateCards();
    this.deck = generateDeck();
    this.heap = unoShared.Heap();

    this.currentDeckIndex = 0;

    // TODO: place first card on top
};
GameManager.prototype = Object.create(unoShared.GameManager.prototype);
GameManager.prototype.takeCards = function (amount) {
    var cards = new Array(amount);
    for (var i = 0; i < amount; ++i) {
        cards[i] = this.deck[this.currentDeckIndex];
        this.currentDeckIndex += 1;
        
        // The deck is shuffled when the last card in the list is drawn
        if (this.currentDeckIndex > (this.deck.length - 1)) {
            shuffle(this.deck);
            this.currentDeckIndex = 0;
        }
    }
    
    return cards;
};
GameManager.prototype.addPlayer = function (socket) {
    
    if (this.players.length < 4) {
        
        var id = this.players.length;
        var player = new Player(socket, configValues[id].id, configValues[id].name);
        
        // Go over all other players and let them know a player has joined
        for (var i = 0; i < this.players.length; ++i) {
            this.playerDisconnected.send("Player connected");
        }
        
        // Let this player know about the currently connected players

        this.players.push(player);

    } else {
        console.log("Server is full.");
        socket.close();
    }
};
GameManager.prototype.playerDisconnected = function (player) {

};

var gameManager = new GameManager();

exports.gameManager = gameManager;