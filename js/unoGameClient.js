/// <reference path="unoGameShared.js" />
/// <reference path="p5.js" />

var unoClient = (function () {

    var clientObj = {};
    
    // Client-specific configuration values
    var configValues = {
        maxHandAngle: Math.PI / 180 * 75,
        maxAngleBetweenCards: Math.PI / 15,
        cardWidth: 86,
        cardHeight: 128,
        deckWidth: 216,
        deckHeight: 180,
        avatarWidth: 64,
        avatarHeight: 64
    };
    
    // Offset values used in the tileset of Uno cards
    var colorYOffset = [
        0 * configValues.cardHeight,	// Red
        1 * configValues.cardHeight,	// Green
        2 * configValues.cardHeight,	// Blue
        3 * configValues.cardHeight,	// Yellow
        4 * configValues.cardHeight	// Neutral
    ];
    
    // Locations where player hands are drawn
    var otherPlayerLocations = [
        "none",
        "left",
        "top",
        "right"
    ];
    
    // Takes an existing set of cards, loads and attaches
    // the corresponding image to each card.
    var generateCards = function (tileset, cards) {
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
    
    // Class that represents this client player
    var ThisPlayer = function (id, name) {
        unoShared.Card.call(this, id, name);

        this.state = {};
        this.resetState();
    };
    ThisPlayer.prototype = Object.create(unoShared.Player.prototype);
    ThisPlayer.prototype.tick = function (deltaTime) {
        // Reset the state
        this.resetState();
        
        var that = this;
        var checkCursorOverHand = function () {
            
            // Some variables that will be used often
            var radius = canvas.width / 4;
            var mousePosition = createVector(mouseX, mouseY, 0);
            var handCenter = createVector(canvas.width / 2, canvas.height + radius / 2, 0);
            
            // Determine the angle between the different cards
            var handSize = that.hand.length;
            var angleBetweenCards = configValues.maxAngleBetweenCards;
            if (handSize * angleBetweenCards > configValues.maxHandAngle) {
                angleBetweenCards = configValues.maxHandAngle / handSize;
            }
            
            // The angle used to rotate the system to the left-most card
            var startAngle = (angleBetweenCards * ((handSize - 1) / 2 + 1));
            
            // Determine whether the player's cursor is in range to be over some of the cards
            var cursorInRange = false;
            var cursorAngle = 0;
            var distance = p5.Vector.sub(handCenter, mousePosition).mag();
            if ((mouseY < canvas.height) 
				&& (distance > (radius - configValues.cardHeight / 2)) 
				&& (distance < (radius + configValues.cardHeight / 2))) {
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
                        var finalAngle = atan2(configValues.cardWidth, radius);
                        angle2 = startAngle + Math.PI / 2 - i * angleBetweenCards - finalAngle;
                    }
                    
                    if ((cursorAngle < angle1) && (cursorAngle > angle2)) {
                        that.state.card = i;
                    }
                }
            }
        };
        var checkCursorOverDeck = function () {
            var deckLocation = createVector(canvas.width / 4, (canvas.height - configValues.deckHeight) / 2, 1);
            
            if ((mouseX > deckLocation.x) && (mouseX < deckLocation.x + configValues.deckWidth) 
				&& (mouseY > deckLocation.y) && (mouseY < deckLocation.y + configValues.deckHeight)) {
                that.state.deck = true;
            } else {
                that.state.deck = false;
            }
        };
        checkCursorOverHand();
        checkCursorOverDeck();
        
        // Get the card suggestions when its this player's turn
        if (this.playerTurn === true) {
            this.state.suggestions = clientObj.manager.cardSuggestions(this.hand);
        }
    };
    ThisPlayer.prototype.draw = function () {
        var that = this;
        var drawHand = function () {
            
            // Some variables that will be used often
            var radius = canvas.width / 4;
            var mousePosition = createVector(mouseX, mouseY, 0);
            var handCenter = createVector(canvas.width / 2, canvas.height + radius / 2, 0);
            
            // Determine the angle between the different cards
            var handSize = that.hand.length;
            var angleBetweenCards = configValues.maxAngleBetweenCards;
            if (handSize * angleBetweenCards > configValues.maxHandAngle) {
                angleBetweenCards = configValues.maxHandAngle / handSize;
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
                    translate(0, -(radius + configValues.cardHeight / 1.2));
                } else {
                    translate(0, -(radius + configValues.cardHeight / 2));
                }
                
                if ((that.playerTurn === true) && (that.state.suggestions[i] === false)) {
                    tint(255, 127);
                }
                
                if (that.hand[i].image != null) {
                    image(that.hand[i].image);
                } else {
                    fill(127);
                    rect(0, 0, configValues.cardWidth, configValues.cardHeight);
                }
                pop();
            }
            
            pop();
        };
        var drawAvatar = function () {
            var center = createVector((canvas.width - configValues.avatarWidth) / 2, canvas.height - 10 - configValues.avatarHeight, 0);
            push();
            translate(center.x, center.y);
            fill(50);
            rect(0, 0, configValues.avatarWidth, configValues.avatarHeight);
            pop();
        };
        drawHand();
        drawAvatar();
    };
    ThisPlayer.prototype.resetState = function () {
        this.state.card = null;
        this.state.deck = null;
        this.state.suggestions = new Array();
    };
    
    // Class that represents one of the other players
    var OtherPlayer = function (side, id, name) {
        unoShared.Card.call(this, id, name);
        
        // We only need to know how many cards the other players have.
        // So we don't keep track of each individual card.
        this.hand = 0;
        this.side = side;
    };
    OtherPlayer.prototype = Object.create(unoShared.Player.prototype);
    OtherPlayer.prototype.addCard = function () {
        this.hand += 1;
    };
    OtherPlayer.prototype.playCard = function (cardIndex) {
        this.hand -= 1;
        
        if (this.hand < 0) {
            this.hand = 0;
        }

        // TODO: Que the animator to play the card-playing animation
    };
    OtherPlayer.prototype.tick = function (deltaTime) {

    };
    OtherPlayer.prototype.draw = function () {
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
            var angleBetweenCards = configValues.maxAngleBetweenCards;
            if (that.hand * angleBetweenCards > configValues.maxHandAngle) {
                angleBetweenCards = configValues.maxHandAngle / that.hand;
            }
            
            startAngle += (-angleBetweenCards * ((that.hand - 1) / 2 + 1));
            
            // Draw the hand of the other player
            // These cards are always with their back turned
            
            push();
            translate(handCenter.x, handCenter.y);
            rotate(startAngle);
            
            var cards = clientObj.manager.deck.cards;
            var backSideCard = cards[cards.length - 1].image;
            for (var i = 0; i < that.hand; ++i) {
                
                push();
                rotate(angleBetweenCards * i);
                translate(0, -(radius + configValues.cardHeight / 2));
                
                if (backSideCard != null) {
                    image(backSideCard);
                } else {
                    fill(127);
                    rect(0, 0, configValues.cardWidth, configValues.cardHeight);
                }
                pop();
            }
            
            pop();
        };
        var drawAvatar = function () {
            var handcenter;
            switch (that.side) {
                case "none":
                    center = createVector((canvas.width - configValues.avatarWidth) / 2, canvas.height - 10 - configValues.avatarHeight, 0);
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
            fill(50);
            rect(0, 0, configValues.avatarWidth, configValues.avatarHeight);
            pop();
        };
        drawHand();
        drawAvatar();
    };
    
    // Class that represents the heap of played cards
    var Heap = function () {
        unoShared.Heap.call(this);
        this.cards = new Array();
    };
    Heap.prototype = Object.create(unoShared.Heap.prototype);
    Heap.prototype._addCard = unoShared.Heap.prototype.addCard;
    Heap.prototype.addCard = function (card, color) {
        this._addCard(card, color);
        this.cards.push({ card: card, angle: radians(random(-45, 45)) });
    };
    Heap.prototype.tick = function (deltaTime) { };
    Heap.prototype.draw = function () {
        var heapLocation = createVector(canvas.width * 5 / 8, (canvas.height) / 2, 1);
        
        push();
        translate(heapLocation.x, heapLocation.y);
        scale(1.2);
        
        for (var i = 0; i < this.cards.length; ++i) {
            push();
            rotate(this.cards[i].angle);
            translate(-configValues.cardWidth / 2, -configValues.cardHeight / 2);
            
            if (this.cards[i].card.image != null) {
                image(this.cards[i].card.image);
            } else {
                fill(127);
                rect(0, 0, configValues.cardWidth, configValues.cardHeight);
            }
            
            pop();
        }
        
        pop();
    };
    
    // Visual representation of the deck. It does not keep track of the
    // sequence of cards available for drawing. Only the server should
    // have access to this information to prevent cheating.
    var Deck = function () {
        
        this.cards = unoShared.generateCards();
        this.cardsSprite = null;
        this.deckSprite = null;
        this.deckHLSprite = null;

        var that = this;

        loadImage("img/unodeck.png", function (image) {
            that.deckSprite = image;
        });
        loadImage("img/unodeck_highlight.png", function (image) {
            that.deckHLSprite = image;
        });
        loadImage("img/unocards.png", function (image) {
            that.cardsSprite = image;
            generateCards(image, that.cards);
        });
    };
    Deck.prototype.tick = function (deltaTime) { };
    Deck.prototype.draw = function () {
        push();
        
        var deckLocation = createVector(canvas.width / 4, (canvas.height - configValues.deckHeight) / 2, 1);
        translate(deckLocation.x, deckLocation.y);
        
        if ((this.deckSprite != null) && (this.deckHighlightSprite != null)) {
            
            if (clientObj.manager.thisPlayer.state.deck === true) {
                image(this.deckHighlightSprite);
            } else {
                image(this.deckSprite);
            }

        } else {
            fill(127);
            rect(0, 0, configValues.deckWidth, configValues.deckHeight);
        }
        
        pop();
    };
    
    // Manages the game on the client-side
    var GameManager = function () {
        unoShared.GameManager.call(this);
        this.heap = new Heap();
        this.deck = new Deck();
        this.thisPlayer = null;
    };
    GameManager.prototype = Object.create(unoShared.GameManager.prototype);
    GameManager.prototype.tick = function (deltaTime) {
        for (var i = 0; i < this.players.length; ++i) {
            this.players[i].tick(deltaTime);
        }
        this.heap.tick(deltaTime);
        this.deck.tick(deltaTime);
    };
    GameManager.prototype.draw = function () {
        background(255, 204, 0);

        for (var i = 0; i < this.players.length; ++i) {
            this.players[i].draw();
        }
        
        this.heap.draw();
        this.deck.draw();
    };
    GameManager.prototype.mouseClicked = function () {
        if ((this.thisPlayer.playerTurn === true) && (this.currentPlayerIndex === 0)) {
            
            // Check whether he clicked either on the deck, or a certain card
            if (this.thisPlayer.state.deck === true) {
                console.log("clicked deck");
            } else if (this.thisPlayer.state.card !== null) {
                console.log("clicked on card " + JSON.stringify(this.thisPlayer.state.card));
            }

        }
        
        return false;
    };
    
    var initialize = function () {
        clientObj.manager = new GameManager();
    };
    
    var tick = function (deltaTime) {

        if (clientObj.manager != null) {
            clientObj.manager.tick(deltaTime);
        }

    };

    var draw = function () {
        if (clientObj.manager != null) {
            clientObj.manager.draw();
        }
    };
    
    clientObj.initialize = initialize;
    clientObj.tick = tick;
    clientObj.draw = draw;
    clientObj.manager = null;

    return clientObj;
})();