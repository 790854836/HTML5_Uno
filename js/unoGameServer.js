/// <reference path="unoGameShared.js" />

// Creates a list of all available cards in Uno. (This is not a deck of Uno cards!)
var UnoCardsServer = function () {
	var cards = new Array(55);

	// red value cards
	var offset = 0;
	for (var i = 0; i < 10; ++i) {
		cards[i + offset] = new UnoCard(UnoColors.red, UnoCardTypes.value, i);
	}

	// green value cards
	offset += 10;
	for (var i = 0; i < 10; ++i) {
		cards[i + offset] = new UnoCard(UnoColors.green, UnoCardTypes.value, i);
	}

	// blue value cards
	offset += 10;
	for (var i = 0; i < 10; ++i) {
		cards[i + offset] = new UnoCard(UnoColors.blue, UnoCardTypes.value, i);
	}

	// yellow value cards
	offset += 10;
	for (var i = 0; i < 10; ++i) {
		cards[i + offset] = new UnoCard(UnoColors.yellow, UnoCardTypes.value, i);
	}

	// skip cards
	offset += 10;
	cards[offset] = new UnoCard(UnoColors.red, UnoCardTypes.skip, 20);
	cards[offset + 1] = new UnoCard(UnoColors.green, UnoCardTypes.skip, 20);
	cards[offset + 2] = new UnoCard(UnoColors.blue, UnoCardTypes.skip, 20);
	cards[offset + 3] = new UnoCard(UnoColors.yellow, UnoCardTypes.skip, 20);

	// reverse cards
	offset += 4;
	cards[offset] = new UnoCard(UnoColors.red, UnoCardTypes.reverse, 20);
	cards[offset + 1] = new UnoCard(UnoColors.green, UnoCardTypes.reverse, 20);
	cards[offset + 2] = new UnoCard(UnoColors.blue, UnoCardTypes.reverse, 20);
	cards[offset + 3] = new UnoCard(UnoColors.yellow, UnoCardTypes.reverse, 20);

	// plus 2 cards
	offset += 4;
	cards[offset] = new UnoCard(UnoColors.red, UnoCardTypes.plus2, 20);
	cards[offset + 1] = new UnoCard(UnoColors.green, UnoCardTypes.plus2, 20);
	cards[offset + 2] = new UnoCard(UnoColors.blue, UnoCardTypes.plus2, 20);
	cards[offset + 3] = new UnoCard(UnoColors.yellow, UnoCardTypes.plus2, 20);

	// plus 4 and color change cards
	offset += 4;
	cards[offset] = new UnoCard(UnoColors.neutral, UnoCardTypes.plus4, 50);
	cards[offset + 1] = new UnoCard(UnoColors.neutral, UnoCardTypes.colorChange, 50);
	cards[offset + 2] = new UnoCard(UnoColors.neutral, UnoCardTypes.back, 0);

	return cards;
};

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
		this.cards = UnoHeap();
		this.deck = UnoDeck(true);
		this.heap = new UnoHeapServer;
	},
	takeCards: function (amount) {

		if (typeof amount !== "number") {
			console.error("Type of amount is not a number");
			return;
		}

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