/**
 * CardsController Class
 */
var CardsController = function(model) {
	this._model = model;
};

CardsController.prototype = {
	dealStart: function() {
		if (this._model.showAnimation())
			this._model.setState(this._model.states.DEALING);
	},
	
	dealEnded: function() {
		if (this._model.showAnimation())
			this._model.setState(this._model.states.PLAYING);
	}
};