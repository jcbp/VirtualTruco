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
	var Challenges = new PlayerAPI.ChallengeFactory();
	this.play = function (moves) {
		var gameDataSet = new PlayerAPI.GameDataSet(moves);
		
		i++;
		var action;
		switch(i) {
			case 1:
				action = Challenges.createEnvido();
				break;
			case 2:
				action = new Server.Action(Server.ActionType.PostScore, 28); 
				break;
			case 4:
				action = Challenges.createEnvido(); 
				break;
			default:
				action = new Server.Action(Server.ActionType.PlayCard, _cards.pop());
				break;
		}
		return action;
	}
}