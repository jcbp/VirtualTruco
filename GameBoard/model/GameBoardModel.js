/**
 * GameBoardModel Class
 */
var GameBoardModel = function (gameDataSet) {
	this.SPEED = 1800;
	
	this.states = {
		PLAYING: "playing",
		PAUSED: "paused"
	};

	this._gameDataSet = gameDataSet;
	this._curMove = 0;
	this._state = this.states.PAUSED;
	this._speedMultiplier = 1;
	
	var _this = this;
	
	// Crea los eventos necesarios
	this.update = new Event(this);
	
	this.timerTick = function() {
		var move = _this._curMove + 1;
		_this.setMove(move);
		
		// TO-DO: Chequear con la cantidad total de jugadas
		if (move >= 100)
			_this.setState(_this.states.PAUSED);
	};
	
	this._timer = new Timer(this.SPEED * this._speedMultiplier, this.timerTick);
};

GameBoardModel.prototype = {
	getCurrentMove: function() {
		return this._curMove;
	},
		
	getState: function() {
		return this._state;
	},
	
	getSpeedMultiplier: function() {
		return this._speedMultiplier;
	},
	
	setState: function(state) {
		if (this._state != state) {
			this._state = state;
			if (this._state == this.states.PLAYING) {
				
				// TO-DO: Chequear con la cantidad total de jugadas
				if (this._curMove >= 100)
					this._curMove = 0;
				
				this._timer.start();
			} else
				this._timer.stop();
			this.update.notify();
		}
	},
	
	setMove: function(num) {
		// TO-DO: Chequear con la cantidad total de jugadas
		if (this._curMove != num && (num >= 0 && num <= 100)) {
			this._curMove = num;
			this.update.notify();
		}		
	},
	
	setSpeedMultiplier: function(multiplier) {
		this._speedMultiplier = multiplier;
	},
	
	/*
	 * Retorna una jugada por numero
	 */
	getMove: function(num) {

	},
};