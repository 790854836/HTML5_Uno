// Different colors of the Uno cards.
var UnoColors = {
	red: "red",
	blue: "blue",
	green: "green",
	yellow: "yellow",
	neutral: "neutral"
};

// Different types of cards
var UnoCardTypes = {
	back: "back",
	value: "value",
	skip: "skip",
	reverse: "reverse",
	plus2: "plus2",
	plus4: "plus4",
	colorChange: "colorChange"
};

// Base class for all of the Uno cards.
var UnoCard = Base.extend({
	constructor: function (color, type, weight) {

		if (typeof UnoColors[color] !== undefined) {
			this.color = color;
		} else {
			console.error("Invalid card color " + color.toString());
		}

		if (typeof UnoCardTypes[type] !== undefined) {
			this.type = type;
		} else {
			console.error("Invalid card type " + type.toString());
		}

		if (typeof weight === "number") {
			this.weight = weight;
		} else {
			console.error("Invalid weight type " + weight.toString());
		}

	},
	color: UnoColors.neutral,	// Color of the card
	type: UnoCardTypes.value,	// Type of the card
	weight: 0,					// Weight of the card - For value cards, this is also their value
});

// Comparison function for sorting Uno cards.
var UnoCardComparison = function (a, b) {

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

		if (typeof unoCardIndex != "Number") {
			console.error("The index of the card to add to the player's hand has an invalid type");
		}

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
		if (card.color === UnoColors.neutral) {
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

		if (players.constructor !== Array) {
			console.error("The player list is not of type Array");
			return;
		}

		this.players = players;

		if (typeof currentPlayer === "number") {
			this.currentPlayerIndex = currentPlayerIndex;
		} else {
			this.currentPlayerIndex = 0;
			console.log("The index of the current player is initialized by default to " + this.currentPlayerIndex);
		}
	},
	cardSuggestions: function (hand) {

		var suggestions = new Array(hand.length);
		for (var i = 0; i < hand.length; ++i) {

			if (hand[i].color === UnoColors.neutral) {
				// A neutral card always be played
				suggestions[i] = true;
			} else if (hand[i].color === this.heap.color) {
				// When the heap has the same color
				suggestions[i] = true;
			} else if ((hand[i].type === UnoCardTypes.value) && (this.heap.card.type === UnoCardTypes.value) && (hand[i].weight === this.heap.card.weight)) {
				// When the card and the heap have different colors, but both have the value type
				// and have the same value
				suggestions[i] = true;
			} else if ((hand[i].type !== UnoCardTypes.value) && (this.heap.card.type !== UnoCardTypes.value) && (hand[i].type === this.heap.card.type)) {
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