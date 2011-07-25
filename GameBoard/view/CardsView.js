/**
 * CardsView Class
 */
var CardsView = function (model, controller, elements) {

	this.random = {
		DEAL: "deal",
		STACK: "stack"
	};

	this.DEPTH = 100;
	this.QTY_CARDS_DEAL = 6;
	this.POSITION_RANDOM_MIN = -3;
	this.POSITION_RANDOM_MAX = 3;
	this.ROTATION_RANDOM_MIN = -3;
	this.ROTATION_RANDOM_MAX = 3;
	
	this._model = model;
	this._controller = controller;
	this._elements = elements;

	this._ranks = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
	this._suits = ["club", "sword", "cup", "gold"];
	
	this._deck = new Array();
	this._dealt = new Array();
	this._dealing = false;	
	
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
		this.buildCards();
	},
	
	remove: function() {
		while (this._deck.length > 0)
			this._deck.pop().remove();
	},
	
	buildCards: function() {
		var e = this._elements;
		var count = 0;
		var card;
		
		for (var i = 0; i < this._suits.length; i++)
			for (var j = 0; j < this._ranks.length; j++) {
				card = new Card(this._ranks[j], i, this.DEPTH + count++, 0);
				this._deck.push(card);
				e.container.append(card);
			}
			
			this.stackingCards( { top: e.container.height()*0.5 - $(card).height()*0.5, left: e.container.width()*0.5 - $(card).width()*0.5 }, 0);
	},
	
	randomizePosition: function(position, rotation, type) {
		var posX;
		var posY;
		
		switch(type) {
			case this.random.STACK:
				rotation = rotation + Math.floor(Math.random() * (this.ROTATION_RANDOM_MIN - this.ROTATION_RANDOM_MAX + 1) + this.ROTATION_RANDOM_MAX);
				posX = position.left + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN - this.POSITION_RANDOM_MAX + 1) + this.POSITION_RANDOM_MAX);
				posY = position.top + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN - this.POSITION_RANDOM_MAX + 1) + this.POSITION_RANDOM_MAX);

				break;
			
			case this.random.DEAL:
				rotation = rotation + Math.floor(Math.random() * (this.ROTATION_RANDOM_MIN*8 - this.ROTATION_RANDOM_MAX*8 + 1) + this.ROTATION_RANDOM_MAX*8);
				posX = position.left + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN*10 - this.POSITION_RANDOM_MAX*10 + 1) + this.POSITION_RANDOM_MAX*10);
				posY = position.top + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN*10 - this.POSITION_RANDOM_MAX*10 + 1) + this.POSITION_RANDOM_MAX*10);

				break;
		}
		
		return {left: posX, top: posY, rotation: rotation};
	},
	
	stackingCards: function(position, rotation) {
		var ranPos;
		for (var i=0; i < this._deck.length; i++) {
			ranPos = this.randomizePosition(position, rotation, this.random.STACK);
			$(this._deck[i]).css({ left: ranPos.left, top: ranPos.top }).rotate(ranPos.rotation);
		}
	},
	
	dealCards: function(event) {
		console.log("deal cards");
		
		this._dealing = true;
		
		this._controller.dealStart();
		
		var _this = this;
		
		var e = this._elements;

		var card = $(this._deck[0]);
		var centerX = e.container.width()*0.5 - card.width()*0.5;
		var centerY = e.container.height()*0.5 - card.height()*0.5;
		var targetRotation;
		//var targetDeal;
		var targetPos1;
		var targetPos2;
		var targetDeck;

		if (this._model.getPlayerIdByName(event.playerName) == 0) {
			targetRotation = 180;
			this.stackingCards({ top: 0, left: 200 }, targetRotation);
			//targetDeal = { top: 0, left: card.width() + 100 };
			targetPos1 = { top: e.container.height() - card.height() - 20, left: centerX };
			targetPos2 = { top: 20, left: centerX };
			targetDeck = { top: centerY, left: 200 };
		} else {
			targetRotation = 0;
			this.stackingCards({ top: e.container.height() - card.height(), left: e.container.width() - card.width() - 20 }, targetRotation);
			//targetDeal = { top: e.container.height() - card.height(), left: e.container.width() - card.width() - 100 };
			targetPos1 = { top: 20, left: centerX };
			targetPos2 = { top: e.container.height() - card.height() - 20, left: centerX };
			targetDeck = { top: centerY, left: e.container.width() - card.width() - 20 };
		}
		
		if (this._model.showAnimation()) {
		//	this.dealCardAnimation(0, targetDeal, targetPos1, targetPos2);
		} else {
			for (var i=0; i < 6; i++)
				this.dealCard((i%2 == 0 ? targetPos1 : targetPos2), (i%2 == 0 ? targetRotation + 180 : 0 + targetRotation ));
			this.stackingCards(targetDeck, targetRotation);
		}
	},
	
	collectCards: function() {
		console.log("collect cards");
		
		var e = this._elements;
		var card;

		while (card = this._dealt.pop())
			this._deck.push(card);
	
		card = $(this._deck[0]);		
		this.stackingCards( { top: e.container.height()*0.5 - card.height()*0.5, left: e.container.width()*0.5 - card.width()*0.5 }, 0);
	},
	
	throwCard: function(card) {
		console.log("throw card -> " + card.value + " of " + card.suit);
	},
	
	dealCard: function(t, r) {
		var card = $(this._deck.pop());
		this._dealt.push(card[0]);
		var rt = this.randomizePosition(t, r, this.random.DEAL);		
		
		console.log("random rotation -> " + rt.rotation);
		
		card.css({ left: rt.left, top: rt.top }).rotate(rt.rotation);
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

	updateCards: function() {
		var event = this._model.getEvent();

		console.log("player -> " + event.playerName);

		if (event.action.type == this._model.eventTypes.HAND_START) {
			this.collectCards(event);
			this.dealCards(event);
		}
		
		if (event.action.type == this._model.eventTypes.HAND_ENDED) 
			this.collectCards(event);
		
		if (event.action.type == this._model.eventTypes.CARD)
			this.throwCard(event.action.card);
	}

};