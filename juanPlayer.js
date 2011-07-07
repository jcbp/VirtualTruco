/*
 * IA of Juan
 */
var Player2 = function () {
	var _cardSet = [];
	
	this.name = "Juan";

	this.initGameSet = function (cards) {
		_cardSet = cards;
	}
	
	var i = 0;

	this.play = function (moves) {
		
		i++;
		var action;
		switch(i) {
			case 1:
				action = CommonAPI.ActionFactory.createEnvido();
				break;
			case 2:
				action = CommonAPI.ActionFactory.createPostScore(28); 
				break;
			case 4:
				action = CommonAPI.ActionFactory.createTruco(); 
				break;
			default:
				action = CommonAPI.ActionFactory.createPlayCard(_cardSet.pop());
				break;
		}
		return action;
	}
}