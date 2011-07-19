/**
 * CardsView Class
 */
var CardsView = function (model, controller, elements) {

	this.POSITION_RANDOM_MIN = -3;
	this.POSITION_RANDOM_MAX = 3;
	this.ROTATION_RANDOM_MIN = -3;
	this.ROTATION_RANDOM_MAX = 3;
	
	this._model = model;
	this._controller = controller;
	this._elements = elements;
	
	this._ranks = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
	this._suits = ["club", "sword", "cup", "gold"];
	
	var _this = this;

	// Agrega listeners del modelo
	this._model.update.attach(function(e, o) {
		console.log('===== CardsView: UPDATE =====');
		console.log('state -> ' + _this._model.getState());
		console.log('move -> ' + _this._model.getCurrentMove());
		console.log('speed -> ' + _this._model.SPEED * _this._model.getSpeedMultiplier());
		_this.updateControls();
	});
};

CardsView.prototype = {
	show: function() {
		this.buildCards();
	},
	
	buildCards: function() {
		var e = this._elements;
		var card;
		
		for (var i = 0; i < this._suits.length; i++)
			for (var j = 0; j < this._ranks.length; j++) {
				card = $(new Card(this._ranks[j], i, 100 + i, 0));
				card.css({top: 20, left: 20});
				e.container.append(card);
				this.applyRandomPosition(i, this._ranks[j]);
			}
	},
	
	applyRandomPosition: function(suit, rank) {
		var e = this._elements;
		var card = $("#" + rank + "_" + suit, e.container);
		var rotation = Math.floor(Math.random() * (this.ROTATION_RANDOM_MIN - this.ROTATION_RANDOM_MAX + 1) + this.ROTATION_RANDOM_MAX);
		var posX = card.position()["left"] + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN - this.POSITION_RANDOM_MAX + 1) + this.POSITION_RANDOM_MAX);
		var posY = card.position()["top"] + Math.floor(Math.random() * (this.POSITION_RANDOM_MIN - this.POSITION_RANDOM_MAX + 1) + this.POSITION_RANDOM_MAX);
		
		card.rotate(rotation);
		card.css({
			top: posY,
			left: posX
		});
	},
	
	moveToSide: function() {
		var e = this._elements;
		var total = this._ranks.length * this._suit.length;
		var card;
		for (var i = 0; i < total; i++) {
			card = $("#" + rank + "_" + suit, e.container);
		}
	},
	
	updateControls: function() {
		
	}
};