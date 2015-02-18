// Different colors of the Uno cards.
var UnoColors = [
	"red",
	"green",
	"blue",
	"yellow",
	"neutral"
];

// Different types of cards
var UnoCardTypes = [
	"back",
	"value",
	"skip",
	"reverse",
	"plus2",
	"plus4",
	"colorChange"
];

// Different message codes between client and server
var UnoMessageCodes = [
	"gameLoaded",
	"gameStart",
	"gameEnd",
	"playCard",
	"playerDisconnect"
];

// Base class for all of the Uno cards.
var UnoCard = Base.extend({
	constructor: function (color, type, weight) {
		this.color = color;
		this.type = type;
		this.weight = weight;
	},
	color: UnoColors[4],		// Color of the card
	type: UnoCardTypes[1],		// Type of the card
	weight: 0,					// Weight of the card - For value cards, this is also their value
});

// Creates a list of all available cards in Uno.
var UnoCards = function () {
	var cards = new Array(55);

	// Color cards first
	var color = 0;
	for (color = 0; color < UnoColors.length - 1; ++color) {

		for (var value = 0; value < 10; ++value) {
			cards[color * 13 + value] = new UnoCard(UnoColors[color], UnoCardTypes[1], value);
		}

		cards[color * 13 + 10] = new UnoCard(UnoColors[color], UnoCardTypes[2], 20);
		cards[color * 13 + 11] = new UnoCard(UnoColors[color], UnoCardTypes[3], 20);
		cards[color * 13 + 12] = new UnoCard(UnoColors[color], UnoCardTypes[4], 20);
	}


	// plus 4 and color change cards
	cards[color * 13] = new UnoCard(UnoColors[4], UnoCardTypes[5], 50);
	cards[color * 13 + 1] = new UnoCard(UnoColors[4], UnoCardTypes[6], 50);
	cards[color * 13 + 2] = new UnoCard(UnoColors[4], UnoCardTypes[0], 0);

	return cards;
};

// Comparison function for sorting Uno cards.
UnoCard.prototype.compare = function (a, b) {

	// Check for their color
	if (a.color < b.color) {
		return -1;
	}
	if (a.color > b.color) {
		return 1;
	}

	// Check their weight - cards are of the same color
	if (a.weight < b.weight) {
		return -1;
	}
	if (a.weight > b.weight) {
		return 1;
	}

	// Check for the types of card - cards have the same weight
	if (a.type < b.type) {
		return -1;
	}
	if (a.type > b.type) {
		return 1;
	}

	// They are the same cards.
	return 0;
};

// Representation of an Uno player.
var UnoPlayer = Base.extend({
	constructor: function (id, name) {
		this.id = id;
		this.name = name;
	},
	addCard: function (unoCardIndex) {

		if ((unoCardIndex < 0) || (unoCardIndex > 53)) {
			console.error("The index of the card is outside the range of different types of Uno cards");
		}

		this.hand.push(unoCardIndex);
		this.hand.sort(UnoCardComparison);
	},
	playCard: function (cardIndex) {
		if ((cardIndex < 0) || (cardIndex > (this.hand.length - 1))) {
			console.error("Cannot play a card that is out of bounds");
			return;
		}
	},

	id: 0,
	name: 0,
	hand: null,
	playerTurn: false
});

// The card that has been played last
var UnoHeap = Base.extend({
	constructor: function () {

	},
	addCard: function (card, color) {

		this.card = card;

		// If the card is a neutral card, then the color must be provided by the color parameter
		if (card.color === UnoColors[4]) {
			this.color = color;
		} else {
			this.color = card.color;
		}

	},

	card: null,
	color: null
});

// Base class for managing the game.
var UnoGame = Base.extend({
	constructor: function () {
		this.heap = new UnoHeap();
	},
	setPlayers: function (players, currentPlayerIndex) {
		this.players = players;
		this.currentPlayerIndex = currentPlayerIndex;
	},
	cardSuggestions: function (hand) {

		var suggestions = new Array(hand.length);
		for (var i = 0; i < hand.length; ++i) {

			if (hand[i].color === UnoColors[4]) {
				// A neutral card always be played
				suggestions[i] = true;
			} else if (hand[i].color === this.heap.color) {
				// When the heap has the same color
				suggestions[i] = true;
			} else if ((hand[i].type === UnoCardTypes[1]) && (this.heap.card.type === UnoCardTypes[1]) && (hand[i].weight === this.heap.card.weight)) {
				// When the card and the heap have different colors, but both have the value type
				// and have the same value
				suggestions[i] = true;
			} else if ((hand[i].type !== UnoCardTypes[1]) && (this.heap.card.type !== UnoCardTypes[1]) && (hand[i].type === this.heap.card.type)) {
				// When the card and the heap have different colors, but both have the same type
				suggestions[i] = true;
			} else {
				suggestions[i] = false;
			}

		}

		return suggestions;
	},
	
	heap: null,		// The current card on top of the heap
	players: null,	// List of players
	currentPlayerIndex: 0	// Index of the player currently on turn
});