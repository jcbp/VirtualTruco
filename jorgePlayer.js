/*
 * IA of Jorge
 */
var Player1 = function () {
	var _cards = null;
	
	this.name = "Jorge";

	this.initGameSet = function (cards) {
		_cards = cards;
	}
	
	var i = 0;
	var Challenges = new PlayerAPI.ChallengeFactory();
	this.play = function (moves) {
		i++;
		var action;
		switch(i) {
			case 1:
				action = Challenges.createEnvido(); 
				break;
			case 2:
				action = new Server.Action(Server.ActionType.ReplyChallenge, Server.Messages.Quiero); 
				break;
			case 3:
				action = new Server.Action(Server.ActionType.PostScore, 30);
				break;
			default:
				action = new Server.Action(Server.ActionType.PlayCard, _cards.pop());
				break;
		}
		return action;
	}
}