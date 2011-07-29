/**
 * TimelineController Class
 */
var TimeLineController = function(model) {
	this._model = model;
};

TimeLineController.prototype = {
	play: function() {
		this._model.setState(this._model.states.PLAYING);
	},
	
	pause: function() {
		this._model.setState(this._model.states.PAUSED);
	},
	
	previousEvent: function() {
		var event = this._model.getCurrentEvent();
		this._model.setEvent(--event);
	},
	
	nextEvent: function() {
		var event = this._model.getCurrentEvent();
		this._model.setEvent(++event);
	},
	
	seekEvent: function(event) {
		this._model.setEvent(event);
	},
	
	normalSpeed: function() {
		this._model.setSpeedMultiplier(this._model.speedMultipliers.NORMAL);
	},

	fastSpeed: function() {
		this._model.setSpeedMultiplier(this._model.speedMultipliers.FAST);
	},
	
	fasterSpeed: function() {
		this._model.setSpeedMultiplier(this._model.speedMultipliers.FASTER);
	}
};