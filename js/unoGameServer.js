/// <reference path="unoGameShared.js" />

// Creates a list of indices, representing a shuffled deck.
var UnoDeck = function (shuffleArray) {

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

// Uno game server
var UnoGameServer = UnoGame.extend({
	constructor: function () {
		this.base();
		this.cards = UnoCards();
		this.deck = UnoDeck(true);
		this.heap = new UnoHeap();
	},
	takeCards: function (amount) {

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
	},

	cards: null,
	deck: null,
	heap: null,
	currentDeckIndex: 0
});