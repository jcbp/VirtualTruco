/*
 * IA of Juan
 */
var Player2 = function () {
	var _cards = null;
	
	this.name = "Juan";

	this.initGameSet = function (cards) {
		_cards = cards;
	}
	
	var i = 0;
	this.play = function (gameDataSet) {
		i++;
		var action;
		switch(i) {
			case 1:
				action = new Server.Action(Server.ActionType.ClimbBet, Server.Messages.Envido);
				break;
			case 2:
				action = new Server.Action(Server.ActionType.PostScore, 28); 
				break;
			case 4:
				action = new Server.Action(Server.ActionType.PostSecondPartChallenge, Server.Messages.Truco); 
				break;
			default:
				action = new Server.Action(Server.ActionType.PlayCard, _cards.pop());
				break;
		}
		return action;
	}
}