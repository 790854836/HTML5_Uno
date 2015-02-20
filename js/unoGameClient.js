/// <reference path="unoGameShared.js" />
/// <reference path="p5.js" />

// The images used in Uno
var UnoCardsTileset = null;

// Configuration values relevant to the client
var UnoClientConfiguration = {
	maxHandAngle: Math.PI / 180 * 75,
	maxAngleBetweenCards: Math.PI / 15,
	cardWidth: 86,
	cardHeight: 128,
	deckWidth: 216,
	deckHeight: 180,
	avatarWidth: 64,
	avatarHeight: 64
};

// Vertical offset values for the tileset of images
var UnoColorYOffset = [
	0 * UnoClientConfiguration.cardHeight,	// Red
	1 * UnoClientConfiguration.cardHeight,	// Green
	2 * UnoClientConfiguration.cardHeight,	// Blue
	3 * UnoClientConfiguration.cardHeight,	// Yellow
	4 * UnoClientConfiguration.cardHeight	// Neutral
];

// Locations where player hands are drawn
var UnoOtherPlayerLocations = [
	"none",
	"left",
	"top",
	"right"
];

// Takes the list of cards, and adds an image property to them.
var UnoCardsClient = function (tileset, cards) {

	var offset = [0, 0];
	var cardIndex = 0;

	var addImageToCard = function (offset) {
		cards[cardIndex]["image"] = tileset.get(offset[0], offset[1], UnoClientConfiguration.cardWidth, UnoClientConfiguration.cardHeight);
		++cardIndex;
	};

	// Color cards first
	for (var color = 0; color < UnoColors.length - 1; ++color) {

		offset[1] = UnoColorYOffset[color];
		for (var value = 0; value < 13; ++value) {
			offset[0] = value * UnoClientConfiguration.cardWidth;
			addImageToCard(offset);
		}
	}

	// Neutral cards
	offset[1] = UnoColorYOffset[UnoColors.length - 1];
	for (var i = 0; i < 3; ++i) {
		offset[0] = i * UnoClientConfiguration.cardWidth;
		addImageToCard(offset);
	}
};

// Representation of the current player
var UnoThisPlayer = UnoPlayer.extend({
	constructor: function (id, name) {
		this.base(id, name);
		this.hand = new Array();
		this.animator = new UnoAnimator();
		this.resetState();
	},
	tick: function (deltaTime) {

		// Reset the state, check where the cursor is
		this.resetState();

		var that = this;
		var checkCursorOverHand = function () {

			// Some variables that will be used often
			var radius = canvas.width / 4;
			var mousePosition = createVector(mouseX, mouseY, 0);
			var handCenter = createVector(canvas.width / 2, canvas.height + radius / 2, 0);

			// Determine the angle between the different cards
			var handSize = that.hand.length;
			var angleBetweenCards = UnoClientConfiguration.maxAngleBetweenCards;
			if (handSize * angleBetweenCards > UnoClientConfiguration.maxHandAngle) {
				angleBetweenCards = UnoClientConfiguration.maxHandAngle / handSize;
			}

			// The angle used to rotate the system to the left-most card
			var startAngle = (angleBetweenCards * ((handSize - 1) / 2 + 1));

			// Determine whether the player's cursor is in range to be over some of the cards
			var cursorInRange = false;
			var cursorAngle = 0;
			var distance = p5.Vector.sub(handCenter, mousePosition).mag();
			if ((mouseY < canvas.height)
				&& (distance > (radius - UnoClientConfiguration.cardHeight / 2))
				&& (distance < (radius + UnoClientConfiguration.cardHeight / 2))) {
				cursorInRange = true;

				var mouseCursorDirection = p5.Vector.sub(mousePosition, handCenter).normalize();
				cursorAngle = acos(mouseCursorDirection.x);

				// Check in which "pie-slice" the cursor rests
				for (var i = 0; i < handSize; ++i) {
					var angle1 = startAngle + Math.PI / 2 - i * angleBetweenCards;
					var angle2 = 0;
					if (i < (handSize - 1)) {
						angle2 = startAngle + Math.PI / 2 - (i + 1) * angleBetweenCards;
					} else {
						var finalAngle = atan2(UnoClientConfiguration.cardWidth, radius);
						angle2 = startAngle + Math.PI / 2 - i * angleBetweenCards - finalAngle;
					}

					if ((cursorAngle < angle1) && (cursorAngle > angle2)) {
						that.state.card = i;
					}
				}
			}
		};
		var checkCursorOverDeck = function () {
			var deckLocation = createVector(canvas.width / 4, (canvas.height - UnoClientConfiguration.deckHeight) / 2, 1);

			if ((mouseX > deckLocation.x) && (mouseX < deckLocation.x + UnoClientConfiguration.deckWidth)
				&& (mouseY > deckLocation.y) && (mouseY < deckLocation.y + UnoClientConfiguration.deckHeight)) {
				that.state.deck = true;
			} else {
				that.state.deck = false;
			}
		};
		checkCursorOverHand();
		checkCursorOverDeck();

		// Get the card suggestions when its this player's turn
		if (this.playerTurn === true) {
			this.state.suggestions = unoGameClient.cardSuggestions(this.hand);
		}
	},
	draw: function () {

		var that = this;
		var drawHand = function () {

			// Some variables that will be used often
			var radius = canvas.width / 4;
			var mousePosition = createVector(mouseX, mouseY, 0);
			var handCenter = createVector(canvas.width / 2, canvas.height + radius / 2, 0);

			// Determine the angle between the different cards
			var handSize = that.hand.length;
			var angleBetweenCards = UnoClientConfiguration.maxAngleBetweenCards;
			if (handSize * angleBetweenCards > UnoClientConfiguration.maxHandAngle) {
				angleBetweenCards = UnoClientConfiguration.maxHandAngle / handSize;
			}

			// The angle used to rotate the system to the left-most card
			var startAngle = (angleBetweenCards * ((handSize - 1) / 2 + 1));

			// Start drawing the cards
			push();
			translate(handCenter.x, handCenter.y);
			rotate(-startAngle); // For some weird reason, positive and negative angles are reversed in the P5 system

			for (var i = 0; i < handSize; ++i) {

				push();
				rotate(angleBetweenCards * i);

				// When the player's cursor over this card, then we let it slide out
				if (that.state.card === i) {
					translate(0, -(radius + UnoClientConfiguration.cardHeight / 1.2));
				} else {
					translate(0, -(radius + UnoClientConfiguration.cardHeight / 2));
				}

				if ((that.playerTurn === true) && (that.state.suggestions[i] === false)) {
					tint(255, 127);
				}

				if (that.hand[i].image != null) {
					image(that.hand[i].image);
				} else {
					fill(127);
					rect(0, 0, UnoClientConfiguration.cardWidth, UnoClientConfiguration.cardHeight);
				}
				pop();
			}

			pop();
		};
		var drawAvatar = function () {
			var center = createVector((canvas.width - UnoClientConfiguration.avatarWidth) / 2, canvas.height - 10 - UnoClientConfiguration.avatarHeight, 0);
			push();
			translate(center.x, center.y);
			
			fill(50);
			rect(0, 0, UnoClientConfiguration.avatarWidth, UnoClientConfiguration.avatarHeight);
			pop();
		};

		this.animator.draw();
		drawHand();
		drawAvatar();
	},
	resetState: function() {
		this.state.card = null;
		this.state.deck = null;
		this.state.suggestions = new Array();
	},

	animator: null,
	state: {
		card: null,
		deck: null,
		suggestions: null
	}
});

// Representation of other players
var UnoOtherPlayer = UnoPlayer.extend({
	constructor: function (side, id, name) {
		this.base(id, name);
		this.hand = 0;
		this.side = side;
		this.animator = new UnoAnimator();
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
	tick: function(deltaTime) {

	},
	draw: function () {

		var that = this;
		var drawHand = function () {

			var radius = canvas.width / 4;
			var startAngle;
			var handCenter;

			switch (that.side) {
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
			if (that.hand * angleBetweenCards > UnoClientConfiguration.maxHandAngle) {
				angleBetweenCards = UnoClientConfiguration.maxHandAngle / that.hand;
			}

			startAngle += (-angleBetweenCards * ((that.hand - 1) / 2 + 1));

			// Draw the hand of the other player
			// These cards are always with their back turned

			push();
			translate(handCenter.x, handCenter.y);
			rotate(startAngle);

			var cards = unoGameClient.deck.cards;
			var backSideCard = cards[cards.length - 1].image;
			for (var i = 0; i < that.hand; ++i) {

				push();
				rotate(angleBetweenCards * i);
				translate(0, -(radius + UnoClientConfiguration.cardHeight / 2));

				if (backSideCard != null) {
					image(backSideCard);
				} else {
					fill(127);
					rect(0, 0, UnoClientConfiguration.cardWidth, UnoClientConfiguration.cardHeight);
				}
				pop();
			}

			pop();
		};
		var drawAvatar = function () {
			var handcenter;
			switch (that.side) {
				case "none":
					center = createVector((canvas.width - UnoClientConfiguration.avatarWidth) / 2, canvas.height - 10 - UnoClientConfiguration.avatarHeight, 0);
					break;
				case "top":
					center = createVector(canvas.width / 2, 20, 0);
					break;
				case "left":
					center = createVector(20, canvas.height / 2, 0);
					break;
				case "right":
					center = createVector(canvas.width - 20, canvas.height / 2, 0);
					break;
			}

			push();
			translate(center.x, center.y);

			
			pop();
		};

		this.animator.draw();
		drawHand();
		drawAvatar();
		
	},

	side: "none",
	animator: null
});

// Manages all Uno animations
var UnoAnimator = Base.extend({
	constructor: function () {
		this.animations = new Array();
	},
	tick: function(deltaTime) {

	},
	draw: function() {

	},

	animations: null
});

// The heap of played Uno cards
var UnoHeapClient = UnoHeap.extend({
	constructor: function () {
		this.cards = new Array();
		this.animator = new UnoAnimator();
	},
	addCard: function (card, color) {
		this.base(card, color);
		this.cards.push({ card: card, angle: radians(random(-45, 45)) });
	},
	tick: function(deltaTime) {
	},
	draw: function () {

		var heapLocation = createVector(canvas.width * 5 / 8, (canvas.height) / 2, 1);

		push();
		translate(heapLocation.x, heapLocation.y);
		scale(1.2);

		for (var i = 0; i < this.cards.length; ++i) {
			push();
			rotate(this.cards[i].angle);
			translate(-UnoClientConfiguration.cardWidth / 2, -UnoClientConfiguration.cardHeight / 2);

			if (this.cards[i].card.image != null) {
				image(this.cards[i].card.image);
			} else {
				fill(127);
				rect(0, 0, UnoClientConfiguration.cardWidth, UnoClientConfiguration.cardHeight);
			}

			pop();
		}

		pop();
	},

	cards: null,
	animator: null
});

// A visual representation of the deck of cards.
// Does not contain any information about the sequence of cards in the deck (=> server only!!!)
var UnoDeckClient = Base.extend({
	constructor: function () {
		
		var that = this;
		this.cards = UnoCards();
	
		loadImage("img/unodeck.png", function (image) {
			that.deckSprite = image;
		});
		loadImage("img/unodeck_highlight.png", function (image) {
			that.deckHighlightSprite = image;
		});
		loadImage("img/unocards.png", function (image) {
			that.cardsSprite = image;
			UnoCardsClient(image, that.cards);
		});
		
		this.cursorOverDeck = false;
	},
	tick: function (deltaTime) {
		
	},
	draw: function() {
		push();

		var deckLocation = createVector(canvas.width / 4, (canvas.height - UnoClientConfiguration.deckHeight) / 2, 1);
		translate(deckLocation.x, deckLocation.y);

		if ((this.deckSprite != null) && (this.deckHighlightSprite != null)) {

			if (unoGameClient.thisPlayer.state.deck === true) {
				image(this.deckHighlightSprite);
			} else {
				image(this.deckSprite);
			}

		} else {
			fill(127);
			rect(0, 0, UnoClientConfiguration.deckWidth, UnoClientConfiguration.deckHeight);
		}

		pop();
	},

	cards: null,
	cardsSprite: null,
	deckSprite: null,
	deckHighlightSprite: null
});

// Client which manages all communication with the server
// and drawing the game onto the canvas
var UnoGameClient = UnoGame.extend({
	constructor: function () {
		this.base();
		this.heap = new UnoHeapClient();
		this.deck = new UnoDeckClient();
	},
	receivedMessage: function (event) {

		var that = this;
		var msg = JSON.parse(event.data);

		// Changes the game state
		var processGameStateChange = function (msg) {
			that.state = msg;
		};

		// Creates the different players,
		// Assigns the cards shuffled by the server,
		// and assigns the sequence of players
		var processGameSetup = function (msg, currentPlayerIndex) {

			// Player info structure:
			// [id, name, hand]

			for (var i = 0; i < msg.length; ++i) {

				var playerInfo = msg[i];
				var player = null;
				if (i === 0) {
					player = new UnoThisPlayer(playerInfo[0], playerInfo[1]);
					
					// Find this player's cards
					for (var j = 0; j < playerInfo[2].length; ++j) {
						player.hand.push(that.deck.cards[playerInfo[2][j]]);
					}

					player.hand.sort(UnoCard.prototype.compare);
					that.thisPlayer = player;

				} else {
					player = new UnoOtherPlayer(UnoOtherPlayerLocations[i], playerInfo[0], playerInfo[1]);
					player.hand = playerInfo[2];
				}

				player.playerTurn = false;
				that.players.push(player);

			}

			that.currentPlayerIndex = currentPlayerIndex;
			that.players[currentPlayerIndex].playerTurn = true;

		};

		switch (msg[0]) {
			case UnoMessageCodes[0]:
				processGameStateChange(msg[1]);
				break;
			case UnoMessageCodes[1]:
				processGameSetup(msg[1], msg[2]);
				break;
		}

	},
	sendMessage: function (msg) {

	},
	tick: function (deltaTime) {

		switch (this.state) {
			case UnoGameStates[0]:

				break;
			case UnoGameStates[1]:

				for (var i = 0; i < this.players.length; ++i) {
					this.players[i].tick(deltaTime);
				}

				this.heap.tick(deltaTime);
				this.deck.tick(deltaTime);

				break;
		}

		
	},
	draw: function () {
		background(255, 204, 0);

		switch (this.state) {
			case UnoGameStates[0]:
				fill(127);
				textSize(32);
				text("Waiting for other players...", canvas.width / 2, canvas.height / 2);
				break;
			case UnoGameStates[1]:
				for (var i = 0; i < this.players.length; ++i) {
					this.players[i].draw();
				}

				this.heap.draw();
				this.deck.draw();
				break;
			case UnoGameStates[2]:

				break;
		}
		
	},
	mouseClicked: function() {

		if ((this.thisPlayer.playerTurn === true) && (this.currentPlayerIndex === 0)) {

			// Check whether he clicked either on the deck, or a certain card
			if (this.thisPlayer.state.deck === true) {
				console.log("clicked deck");
			} else if (this.thisPlayer.state.card !== null) {
				console.log("clicked on card " + JSON.stringify(this.thisPlayer.state.card));
			}

		}

		return false;
	},

	heap: null,
	deck: null,
	thisPlayer: null
});