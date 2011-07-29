
/*
 * Random IA
 */
var RandomPlayer = function (name) {
	CommonAPI.AbstractPlayer.call(this);
	
	var _cardSet = [];
	var _utils = new Utils();
	
	var getRandomOption = function (opts) {
		return opts[_utils.random(0, opts.length-1)];
	}
	
	var getAction = function (randOption) {
		var action;
		if(randOption==CommonAPI.PLAY_CARD) {
			action = new Server.Action(Server.ActionType.Card, _cardSet.getCards().pop());
		}
		else {
			action = new Server.Action(Server.ActionType.Message, Server.Messages[randOption]);
		}
		return action;
	}

	this.setName(name);
	
	this.addEventListener("handInit", function (event) {
		_cardSet = this.getCardSet();
	});
	this.addEventListener("handEnd", function (event) {
		// event.cardShowing
	});
	this.addEventListener("play", function (event) {
		var _randOption = null;
		var _allMyOptions = [];

		event.options.each(function (nodeName, node) {
			_allMyOptions.push(nodeName);
		});
		_randOption = getRandomOption(_allMyOptions);
		var action = getAction(_randOption);
		
		Log.add({
			Juega: name,
			Message: action.message? action.message.name: action.card
		});

		this.postAction(action);
	});
}