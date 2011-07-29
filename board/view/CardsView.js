/**
 * CardsView Class
 */
var CardsView = function (model, controller, elements) {

	this.random = {
		DEAL: "deal",
		STACK: "stack",
		THROW: "throw"
	};

	this.DEPTH = 100;
	this.THROW_DEPTH = 200;
	this.QTY_CARDS_DEAL = 6;
	this.POSITION_RANDOM_MIN = -3;
	this.POSITION_RANDOM_MAX = 3;
	this.ROTATION_RANDOM_MIN = -3;
	this.ROTATION_RANDOM_MAX = 3;
	
	this._model = model;
	this._controller = controller;
	this._elements = elements;

	this._ranks = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
	this._suits = ["Club", "Sword", "Cup", "Coin"];
	
	this._history = new Array();
	this._deck = new Array();
	this._thrownCounter = 0;
	
	var _this = this;

	// Agrega listeners del modelo
	this._model.matchLoaded.attach(function(e, o) {
		_this.show();
	});
	this._model.update.attach(function(e, o) {
		_this.updateCards();
	});
	this._model.play.attach(function(e, o) {
		//_this.updateCards();
	});
	this._model.pause.attach(function(e, o) {
		
	});
};

CardsView.prototype = {
	show: function() {
		this.remove();
		this.buildCards(this._model.getEvents());
	},
	
	remove: function() {
		while (this._deck.length > 0)
			this._deck.pop().remove();
	},
	
	buildCards: function(match) {
		// Construye el mazo
		for (var i = 0; i < this._suits.length; i++)
			for (var j = 0; j < this._ranks.length; j++) {
				card = new Card(j, i, this.DEPTH + this._ranks.length*i + j, 0);
				this._deck.push(card);
			}
		
		var cards1;
		var cards2;
		var dealer;
		for (i=0; i < match.length; i++) {
			switch(match[i].type) {
				case this._model.eventTypes.HAND_START:
					dealer = match[i].player1.isHand ? match[i].player2.name : match[i].player1.name;
					if (match[i].player1.isHand) {
						cards1 = match[i].player1.cards;
						cards2 = match[i].player2.cards;
					} else {
						cards1 = match[i].player2.cards;
						cards2 = match[i].player1.cards;
					}
					
					this._history.push(this.dealCards(this._model.getPlayerIdByName(dealer), cards1, cards2));
					break;
				
				case this._model.eventTypes.HAND_ENDED:
					this._history.push(this.collectCards());
					break;
				
				case this._model.eventTypes.CARD:
					this._history.push(this.throwCard(this._model.getPlayerIdByName(match[i].action.player), match[i].action.card));
					break;
				
				default:
					this._history.push(this._history[this._history.length - 1]);
					break;
			}
		}
				
		// Agrega las cartas al container
		for (i=0; i < this._deck.length; i++)
			this._elements.container.append(this._deck[i]);
		
		// Aplica la posicion inicial
		this.showCardsEventByCards(this.collectCards());
	},
	
	randomize: function(type, position, rotation) {
		var posX;
		var posY;
		
		switch(type) {
			case this.random.STACK:
				rotation = rotation + Math.floor(Math.random() * (this.ROTATION_RANDOM_MIN - this.ROTATION_RANDOM_MAX + 1) + this.ROTATION_RANDOM_MAX);
				posX = position.left + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN - this.POSITION_RANDOM_MAX + 1) + this.POSITION_RANDOM_MAX);
				posY = position.top + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN - this.POSITION_RANDOM_MAX + 1) + this.POSITION_RANDOM_MAX);

				break;
			
			case this.random.DEAL:
			case this.random.THROW:
				rotation = rotation + Math.floor(Math.random() * (this.ROTATION_RANDOM_MIN*8 - this.ROTATION_RANDOM_MAX*8 + 1) + this.ROTATION_RANDOM_MAX*8);
				posX = position.left + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN*10 - this.POSITION_RANDOM_MAX*10 + 1) + this.POSITION_RANDOM_MAX*10);
				posY = position.top + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN*10 - this.POSITION_RANDOM_MAX*10 + 1) + this.POSITION_RANDOM_MAX*10);

				break;
		}
		
		return { left: Math.round(posX), top: Math.round(posY), rotation: Math.round(rotation) };
	},
	
	stackingCards: function(position, rotation) {
		var stack = new Array();
		var ran;
		for (var i=0; i < this._deck.length; i++) {
			ran = this.randomize(this.random.STACK, position, rotation);
			stack.push({
				position: { left:ran.left, top:ran.top },
				rotation: ran.rotation,
				depth: this.DEPTH + i,
				isFaceUp: false
			});
		}

		return stack;
	},
		
	dealCards: function(player, cards1, cards2) {
		var e = this._elements;
		var card = $(this._deck[0]);
		var centerX = e.container.width()*0.5 - card.width()*0.5;
		var centerY = e.container.height()*0.5 - card.height()*0.5;
		var targetRotation;
		var targetPos1;
		var targetPos2;
		var targetDeck;
		
		if (player == 0) {
			targetRotation = 180;
			targetPos1 = { top: e.container.height() - card.height() - 20, left: centerX };
			targetPos2 = { top: 20, left: centerX };
			targetDeck = { top: centerY, left: 200 };
		} else {
			targetRotation = 0;
			targetPos1 = { top: 20, left: centerX };
			targetPos2 = { top: e.container.height() - card.height() - 20, left: centerX };
			targetDeck = { top: centerY, left: e.container.width() - card.width() - 20 };
		}

		// Genera la pila de cartas dependiendo el repartidor
		var cards = this.stackingCards(targetDeck, targetRotation);
				
		// Intercambia el indice de profundidad de las cartas a repartir y
		// fija las posiciones y rotaciones.
		var lastId = cards.length - 1;
		var ran;
		var cardId;
		var aux;
		for (var i=0; i < 3; i++) {
			ran = this.randomize(this.random.DEAL, targetPos1, targetRotation + 180);
			cardId = this.getCardIdByRankAndSuit(cards1[i].value, cards1[i].suit);
			aux = cards[lastId - i*2].depth;
			cards[lastId - i*2].depth = cards[cardId].depth;
			cards[cardId] = {
				position: { left:ran.left, top:ran.top },
				rotation: ran.rotation,
				depth: aux,
				isFaceUp: false
			};
			
			ran = this.randomize(this.random.DEAL, targetPos2, targetRotation);
			cardId = this.getCardIdByRankAndSuit(cards2[i].value, cards2[i].suit);
			aux = cards[lastId -(i*2 + 1)].depth;
			cards[lastId - (i*2 + 1)].depth = cards[cardId].depth;
			cards[cardId] = {
				position: { left:ran.left, top:ran.top },
				rotation: ran.rotation,
				depth: aux,
				isFaceUp: false
			};
		}
		
		return cards;
	},
	
	collectCards: function() {
		this._thrownCounter = 0;

		var e = this._elements;
		var card = $(this._deck[0]);
		var centerX = e.container.width()*0.5 - $(card).width()*0.5;
		var centerY = e.container.height()*0.5 - $(card).height()*0.5;

		return this.stackingCards( { top: centerY, left: centerX }, 0);
	},
	
	throwCard: function(player, card) {
		var cards = new Array();
		for (var i=0; i < this._history[this._history.length - 1].length; i++)
			cards.push(this._history[this._history.length - 1][i]);
			
		var e = this._elements;
		
		var cardId = this.getCardIdByRankAndSuit(card.value, card.suit);
		var centerX = e.container.width()*0.5 - $(this._deck[0]).width()*0.5;
		var centerY = e.container.height()*0.5 - $(this._deck[0]).height()*0.5;
		var position = player == 0 ? { left: centerX, top: centerY - 100 } : { left: centerX, top: centerY + 100 };
		var rotation = player == 0 ? 180 : 0;
		var ran = this.randomize(this.random.THROW, position, rotation);
		
		cards[cardId] = {
			position: { left:ran.left, top:ran.top },
			rotation: rotation,
			depth: this.THROW_DEPTH + this._thrownCounter++,
			isFaceUp: true
		};

		return cards;
	},
		
	/*dealCardAnimation: function(i, td, t1, t2, r) {
		var _this = this;
		var e = this._elements;
		var duration = 500;
		var multiplier = this._model.getSpeedMultiplier();
		var rtd = this.randomizePosition(td, card, this.random.DEAL);
		var rt1 = this.randomizePosition(t1, this.random.DEAL);
		var rt2 = this.randomizePosition(t2, this.random.DEAL);
		
		i++;
		
		var card = $(this._deck.pop());
		this._dealt.push(card[0]);
		
		if (i%2 != 0) {
			card
				.animate({ left: rtd.left }, duration * multiplier * 0.5, "easeInCirc", function() {
					this.setDepth(this.getDepth() - (_this.QTY_CARDS_DEAL - i) + (i + 1));
					$(this).rotate({ animateTo: 540 + rt1.rotation, easing: $.easing.easeOutQuad, duration: duration * multiplier });
				})
				.animate({ left: rt1.left, top: rt1.top }, duration * multiplier, function() {
					_this.dealCardAnimation(i, td, t1, t2); 
				});
		} else {
			card
				.animate({ left: rtd.left }, duration * multiplier * 0.5, "easeInCirc", function() {
					this.setDepth(this.getDepth() - (_this.QTY_CARDS_DEAL - i) + (i + 1));
				})
				.animate({ left: rt2.left, top: rt2.top }, duration * multiplier * 0.5, function() {
					if (i < _this.QTY_CARDS_DEAL)
						_this.dealCardAnimation(i, td, t1, t2);
					else {
						_this._dealing = false;
						_this._controller.dealEnded();
					}
				});
		}
	},*/
	
	showCardsEventByCards: function(cards) {
		for (var i=0; i < this._deck.length; i++) {
			$(this._deck[i]).css({ left:cards[i].position.left, top:cards[i].position.top });
			$(this._deck[i]).rotate(cards[i].rotation);
			this._deck[i].setDepth(cards[i].depth);
			if (cards[i].isFaceUp)
				this._deck[i].setToFront();
			else
				this._deck[i].setToBack();
		}
	},
	
	showCardsEventByIndex: function(index) {
		var cards = this._history[index];
		
		for (var i=0; i < this._deck.length; i++) {
			$(this._deck[i]).css({ left:cards[i].position.left, top:cards[i].position.top });
			$(this._deck[i]).rotate(cards[i].rotation);
			this._deck[i].setDepth(cards[i].depth);
			if (cards[i].isFaceUp == true)
				this._deck[i].setToFront();
			else
				this._deck[i].setToBack();
		}
	},

	updateCards: function() {
		this.showCardsEventByIndex(this._model.getCurrentEvent());
	},
	
	getRankIdByRank: function(rank) {
		var len = this._ranks.length;
		for (var i=0; i < len; i++)
			if (this._ranks[i] == rank)
				return i;
		
		return null;
	},
	
	getSuitIdBySuit: function(suit) {
		var len = this._suits.length;
		for (var i=0; i < len; i++)
			if (this._suits[i] == suit)
				return i;
		
		return null;
	},
	
	getCardIdByRankAndSuit: function(rank, suit) {
		for (var i=0; i < this._deck.length; i++)
			if (this._deck[i].rank == this.getRankIdByRank(rank) && this._deck[i].suit == this.getSuitIdBySuit(suit))
				return i;
		return null;
	}
	
};