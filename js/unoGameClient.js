/// <reference path="unoGameShared.js" />

// The images used in Uno
var UnoCardsTileset = null;
var UnoDeckSprite = null;
var UnoDeckHighlightSprite = null;

// Configuration values relevant to the client
var UnoClientConfiguration = {
	maxHandAngle: Math.PI / 180 * 75,
	maxAngleBetweenCards: Math.PI / 15,
	cardWidth: 86,
	cardHeight: 128
};

// Vertical offset values for the tileset of images
var UnoColorYOffset = {
	red: 0 * UnoClientConfiguration.cardHeight,
	blue: 2 * UnoClientConfiguration.cardHeight,
	green: 1 * UnoClientConfiguration.cardHeight,
	yellow: 3 * UnoClientConfiguration.cardHeight,
	neutral: 4 * UnoClientConfiguration.cardHeight
};

// Locations where player hands are drawn
var UnoOtherPlayerLocations = {
	none: "none",
	left: "left",
	top: "top",
	right: "right"
};

// TODO: remove this when fixed
// Bug in p5, where the vector.get function is called,
// but the function is actually called 'copy', so we need to add this, in case it isn;t there
if (typeof p5.Vector.prototype.get !== 'function') {
	p5.Vector.prototype.get = function () {
		if (this.p5) {
			return new p5.Vector(this.p5, [
			  this.x,
			  this.y,
			  this.z
			]);
		} else {
			return new p5.Vector(this.x, this.y, this.z);
		}
	};
}

// Creates a list of all available cards in Uno. (This is not a deck of Uno cards!)
var UnoCardsClient = function () {
	var cards = new Array(55);

	// red value cards
	var offset = 0;
	var tileOffset = [0, 0];
	for (var i = 0; i < 10; ++i) {
		tileOffset = [i * UnoClientConfiguration.cardWidth, UnoColorYOffset.red];
		cards[i + offset] = new UnoCardClient(UnoColors.red, UnoCardTypes.value, i, tileOffset);
	}

	// green value cards
	offset += 10;
	for (var i = 0; i < 10; ++i) {
		tileOffset = [i * UnoClientConfiguration.cardWidth, UnoColorYOffset.green];
		cards[i + offset] = new UnoCardClient(UnoColors.green, UnoCardTypes.value, i, tileOffset);
	}

	// blue value cards
	offset += 10;
	for (var i = 0; i < 10; ++i) {
		tileOffset = [i * UnoClientConfiguration.cardWidth, UnoColorYOffset.blue];
		cards[i + offset] = new UnoCardClient(UnoColors.blue, UnoCardTypes.value, i, tileOffset);
	}

	// yellow value cards
	offset += 10;
	for (var i = 0; i < 10; ++i) {
		tileOffset = [i * UnoClientConfiguration.cardWidth, UnoColorYOffset.yellow];
		cards[i + offset] = new UnoCardClient(UnoColors.yellow, UnoCardTypes.value, i, tileOffset);
	}

	// skip cards
	offset += 10;
	tileOffset = [10 * UnoClientConfiguration.cardWidth, UnoColorYOffset.red];
	cards[offset] = new UnoCardClient(UnoColors.red, UnoCardTypes.skip, 20, tileOffset);
	tileOffset = [10 * UnoClientConfiguration.cardWidth, UnoColorYOffset.green];
	cards[offset + 1] = new UnoCardClient(UnoColors.green, UnoCardTypes.skip, 20, tileOffset);
	tileOffset = [10 * UnoClientConfiguration.cardWidth, UnoColorYOffset.blue];
	cards[offset + 2] = new UnoCardClient(UnoColors.blue, UnoCardTypes.skip, 20, tileOffset);
	tileOffset = [10 * UnoClientConfiguration.cardWidth, UnoColorYOffset.yellow];
	cards[offset + 3] = new UnoCardClient(UnoColors.yellow, UnoCardTypes.skip, 20, tileOffset);

	// reverse cards
	offset += 4;
	tileOffset = [11 * UnoClientConfiguration.cardWidth, UnoColorYOffset.red];
	cards[offset] = new UnoCardClient(UnoColors.red, UnoCardTypes.reverse, 20, tileOffset);
	tileOffset = [11 * UnoClientConfiguration.cardWidth, UnoColorYOffset.green];
	cards[offset + 1] = new UnoCardClient(UnoColors.green, UnoCardTypes.reverse, 20, tileOffset);
	tileOffset = [11 * UnoClientConfiguration.cardWidth, UnoColorYOffset.blue];
	cards[offset + 2] = new UnoCardClient(UnoColors.blue, UnoCardTypes.reverse, 20, tileOffset);
	tileOffset = [11 * UnoClientConfiguration.cardWidth, UnoColorYOffset.yellow];
	cards[offset + 3] = new UnoCardClient(UnoColors.yellow, UnoCardTypes.reverse, 20, tileOffset);

	// plus 2 cards
	offset += 4;
	tileOffset = [12 * UnoClientConfiguration.cardWidth, UnoColorYOffset.red];
	cards[offset] = new UnoCardClient(UnoColors.red, UnoCardTypes.plus2, 20, tileOffset);
	tileOffset = [12 * UnoClientConfiguration.cardWidth, UnoColorYOffset.green];
	cards[offset + 1] = new UnoCardClient(UnoColors.green, UnoCardTypes.plus2, 20, tileOffset);
	tileOffset = [12 * UnoClientConfiguration.cardWidth, UnoColorYOffset.blue];
	cards[offset + 2] = new UnoCardClient(UnoColors.blue, UnoCardTypes.plus2, 20, tileOffset);
	tileOffset = [12 * UnoClientConfiguration.cardWidth, UnoColorYOffset.yellow];
	cards[offset + 3] = new UnoCardClient(UnoColors.yellow, UnoCardTypes.plus2, 20, tileOffset);

	// plus 4 and color change cards
	offset += 4;
	tileOffset = [UnoClientConfiguration.cardWidth, UnoColorYOffset.neutral];
	cards[offset] = new UnoCardClient(UnoColors.neutral, UnoCardTypes.plus4, 50, tileOffset);
	tileOffset = [0, UnoColorYOffset.neutral];
	cards[offset + 1] = new UnoCardClient(UnoColors.neutral, UnoCardTypes.colorChange, 50, tileOffset);
	tileOffset = [2 * UnoClientConfiguration.cardWidth, UnoColorYOffset.neutral];
	cards[offset + 2] = new UnoCardClient(UnoColors.neutral, UnoCardTypes.back, 0, tileOffset);

	return cards;
};

// Representation of an Uno card
var UnoCardClient = UnoCard.extend({
	constructor: function (color, type, weight, offset) {
		this.base(color, type, weight);
		this.image = UnoCardsTileset.get(offset[0], offset[1], UnoClientConfiguration.cardWidth, UnoClientConfiguration.cardHeight);
	},

	image: null
});

// Representation of the current player
var UnoThisPlayer = UnoPlayer.extend({
	constructor: function (id, name) {
		this.base(id, name);
	},
	drawHand: function () {
		// Some variables that will be used often
		var radius = canvas.width / 4;
		var mousePosition = createVector(mouseX, mouseY, 0);
		var handCenter = createVector(canvas.width / 2, canvas.height + radius / 2, 0);

		// Determine the angle between the different cards
		var handSize = this.hand.length;
		var angleBetweenCards = UnoClientConfiguration.maxAngleBetweenCards;
		if (handSize *  angleBetweenCards > UnoClientConfiguration.maxHandAngle) {
			angleBetweenCards = UnoClientConfiguration.maxHandAngle / handSize;
		}

		// The angle used to rotate the system to the left-most card
		var startAngle = (angleBetweenCards * ((handSize - 1) / 2 + 1));

		// Determine whether the player's cursor is over any of the cards
		var cursorInRange = false;
		var cursorAngle = 0;
		var distance =  p5.Vector.sub(handCenter, mousePosition).mag();
		if ((mouseY < canvas.height)
			&& (distance > (radius - UnoClientConfiguration.cardHeight / 2))
			&& (distance < (radius + UnoClientConfiguration.cardHeight / 2))) {
				cursorInRange = true;

				var mouseCursorDirection = p5.Vector.sub(mousePosition, handCenter).normalize();
				cursorAngle = acos(mouseCursorDirection.x);
		}

		// When its this player's turn, then get the card suggestions
		var cardSuggestions = null;
		if (this.playerTurn === true) {
			cardSuggestions = unoGameClient.cardSuggestions(this.hand);
		}

		// Start drawing the cards
		push();
		translate(handCenter.x, handCenter.y);
		rotate(-startAngle); // For some weird reason, positive and negative angles are reversed in the P5 system

		for (var i = 0; i < handSize; ++i) {

			push();
			rotate(angleBetweenCards * i);

			// When the player's cursor is within rang,
			// then we check on which card the cursor rests,
			// and highlight that card

			if (cursorInRange) {

				var angle1 = startAngle + Math.PI / 2 - i * angleBetweenCards;
				var angle2 = 0;
				if (i < (handSize - 1)) {
					angle2 = startAngle + Math.PI / 2 - (i + 1) * angleBetweenCards;
				} else {
					var finalAngle = atan2(UnoClientConfiguration.cardWidth, radius);
					angle2 = startAngle + Math.PI / 2 - i * angleBetweenCards - finalAngle;
				}

				if ((cursorAngle < angle1) && (cursorAngle > angle2)) {
					translate(0, -(radius + UnoClientConfiguration.cardHeight / 1.2));
				} else {
					translate(0, -(radius + UnoClientConfiguration.cardHeight / 2));
				}

			} else {
				translate(0, -(radius + UnoClientConfiguration.cardHeight / 2));
			}

			if ((this.playerTurn === true) && (cardSuggestions[i] === false)) {
				tint(255, 127);
			}

			image(this.hand[i].image);
			pop();
		}

		pop();
	}
});

// Representation of other players
var UnoOtherPlayer = UnoPlayer.extend({
	constructor: function (side, id, name) {
		this.base(id, name);

		this.side = side;
	},
	drawHand: function () {

		var radius = canvas.width / 4;
		var startAngle;
		var handCenter;

		switch (this.side) {
			case "none":
				handCenter = createVector(canvas.width / 2, canvas.height + radius / 2, 0);
				startAngle = 0;
				break;
			case "top":
				handCenter = createVector(canvas.width / 2, -radius / 2, 0);
				startAngle = PI;
				break;
			case "left":
				handCenter = createVector(-radius / 2, canvas.height / 2, 0);
				startAngle = HALF_PI;
				break;
			case "right":
				handCenter = createVector(canvas.width + radius / 2, canvas.height / 2, 0);
				startAngle = PI + HALF_PI;
				break;
		}

		// When the amount of cards * angle between cards exceeds the maxAngle,
		// then each card is drawn closer to each other
		var angleBetweenCards = UnoClientConfiguration.maxAngleBetweenCards;
		if (this.hand * angleBetweenCards > UnoClientConfiguration.maxHandAngle) {
			angleBetweenCards = UnoClientConfiguration.maxHandAngle / this.hand;
		}

		startAngle += (-angleBetweenCards * ((this.hand - 1) / 2 + 1));

		// Draw the hand of the other player
		// These cards are always with their back turned

		push();
		translate(handCenter.x, handCenter.y);
		rotate(startAngle);

		var backSideCard = unoGameClient.cards[unoGameClient.cards.length - 1];
		for (var i = 0; i < this.hand; ++i) {

			push();
			rotate(angleBetweenCards * i);
			translate(0, -(radius + UnoClientConfiguration.cardHeight / 2));
			image(backSideCard.image);
			pop();
		}

		pop();
	},
	addCard: function () {
		this.hand += 1;
	},
	playCard: function () {
		this.hand -= 1;

		if (this.hand < 0) {
			this.hand = 0;
		}
	},

	side: "none"
});

// Manages all Uno animations
var UnoAnimator = Base.extend({
	constructor: function () {

	}
});

var UnoHeapClient = UnoHeap.extend({
	constructor: function () {
		this.cards = new Array();
	},

	addCard: function (card, color) {
		this.base(card, color);
		this.cards.push({ card: card.image, angle: radians(random(-45, 45)) });
	},

	cards: null
});

// Client which manages all communication with the server
var UnoGameClient = UnoGame.extend({
	constructor: function () {
		this.base();
		this.cards = UnoCardsClient();
		this.heap = new UnoHeapClient();
		this.heapHistory = new Array();
	},
	receivedMessage: function (message) {

	},
	drawGame: function () {

		// TODO: draw background and fancy items
		background(255, 204, 0);

		for (var i = 0; i < this.players.length; ++i) {
			this.players[i].drawHand();
		}

		var deckLocation = createVector(canvas.width / 4, (canvas.height - UnoDeckSprite.height) / 2, 1);
		var heapLocation = createVector(canvas.width * 5 / 8, (canvas.height) / 2, 1);

		// Draw deck
		push();
		translate(deckLocation.x, deckLocation.y);

		if ((mouseX > deckLocation.x) && (mouseX < deckLocation.x + UnoDeckSprite.width)
			&& (mouseY > deckLocation.y) && (mouseY < deckLocation.y + UnoDeckSprite.height)) {
			image(UnoDeckHighlightSprite);
		} else {
			image(UnoDeckSprite);
		}
		pop();

		// Draw heap
		push();
		translate(heapLocation.x, heapLocation.y);
		scale(1.2);

		for (var i = 0; i < this.heap.cards.length; ++i) {
			push();
			rotate(this.heap.cards[i].angle);
			translate(-UnoClientConfiguration.cardWidth / 2, -UnoClientConfiguration.cardHeight / 2);
			image(this.heap.cards[i].card);
			pop();
		}

		pop();
	},

	cards: null,
});