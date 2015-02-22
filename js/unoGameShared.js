// Code shared between the client and server

// Node.js makes use of the exports object, but this
// isn't available on the client. So on the client,
// the data is stored in a unoGameShared variable,
// while on the server it is stored in the exports object.
// Credits to Coalan McMahon
// http://caolanmcmahon.com/posts/writing_for_node_and_the_browser/
(function (exports) {
    
    ////////////
    // Objects
    ////////////
    
    // Different colors of the Uno cards.
    var cardColors = [
        "red",
        "green",
        "blue",
        "yellow",
        "neutral"
    ];
    
    // Different types of cards
    var cardTypes = [
        "back",
        "value",
        "skip",
        "reverse",
        "plus2",
        "plus4",
        "colorChange"
    ];
    
    // Message codes
    var messageCodes = [

    ];
    
    // Game states
    var gameStates = [

    ];    
    
    ////////////
    // Classes
    ////////////

    // Base class for a Uno card
    var Card = function (color, type, weight) {
        this.color = color;
        this.type = type;
        this.weight = weight;
    };
    
    // Base class for a player
    var Player = function (id, name) {
        this.id = id;
        this.name = name;
        this.hand = new Array();
        this.playerTurn = false;
    };
    
    // Adding a card to the player's hand
    // The hand is sorted afterwards, if requested
    Player.prototype.addCard = function(card, sort) {
        this.hand.push(card);
        
        if (sort === true) {
            this.hand.sort(exports.cardCompare);
        }
    };
    
    // Base class for a heap
    var Heap = function () {
        this.card = null;
        this.color = null;
    };
    
    // Adds a card to the top of the heap
    Heap.prototype.addCard = function (card, color) {
        this.card = card;

        if ((card.color === exports.cardColors[4]) && (color != null)) {
            this.color = color;
        } else {
            this.color = card.color;
        }
    };
    
    // Base class for the Uno game manager
    var GameManager = function () {
        this.heap = new Heap();
        this.players = new Array();
    };
    
    // Returns a list of cards that are playable on the top of the heap.
    GameManager.prototype.cardSuggestions = function (hand) {
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
    };
    
    ////////////
    // Functions
    ////////////
    
    // Creates a set of cards
    var generateCards = function () {
        var cards = new Array(55);
        
        // Color cards first
        var color = 0;
        for (color = 0; color < cardColors.length - 1; ++color) {
            
            for (var value = 0; value < 10; ++value) {
                cards[color * 13 + value] = new Card(cardColors[color], cardTypes[1], value);
            }
            
            cards[color * 13 + 10] = new Card(cardColors[color], cardTypes[2], 20);
            cards[color * 13 + 11] = new Card(cardColors[color], cardTypes[3], 20);
            cards[color * 13 + 12] = new Card(cardColors[color], cardTypes[4], 20);
        }
        
        
        // plus 4 and color change cards
        cards[color * 13] = new Card(cardColors[4], cardTypes[6], 50);
        cards[color * 13 + 1] = new Card(cardColors[4], cardTypes[5], 50);
        cards[color * 13 + 2] = new Card(cardColors[4], cardTypes[0], 0);
        
        return cards;
    };

    // Comparison function for cards
    var cardCompare = function (a, b) {
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
    
    ////////////
    // Exports
    ////////////
    
    exports.cardColors = cardColors;
    exports.cardTypes = cardTypes;
    exports.messageCodes = messageCodes;
    exports.gameStates = gameStates;

    exports.Card = Card;
    exports.Player = Player;
    exports.Heap = Heap;
    exports.GameManager = GameManager;

    exports.generateCards = generateCards;
    exports.cardCompare = cardCompare;

})(typeof exports === "undefined" ? this["unoShared"] = {} : exports);