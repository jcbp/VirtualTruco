/**
 * TimelineController Class
 */
var TimeLineController = function(model) {
	this._model = model;
};

TimeLineController.prototype = {
	play: function() {
		this._model.setState(this._model.states.PLAYING);
		console.log('stateChanged -> ' + this._model.getState());
	},
	
	pause: function() {
		this._model.setState(this._model.states.PAUSED);
		console.log('stateChanged -> ' + this._model.getState());
	},
	
	previousMove: function() {
		var move = this._model.getCurrentMove();
		this._model.setMove(--move);
		console.log('moveChanged -> ' + this._model.getCurrentMove());
	},
	
	nextMove: function() {
		var move = this._model.getCurrentMove();
		this._model.setMove(++move);
		console.log('moveChanged -> ' + this._model.getCurrentMove());
	},
	
	seekMove: function(move) {
		this._model.setMove(move);
		console.log('moveChanged -> ' + this._model.getCurrentMove());
	}
};