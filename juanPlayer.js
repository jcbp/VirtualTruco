/*
 * IA of Juan
 */
var Player2 = function () {
	var _cards = null;
	
	this.name = "Juan";

	this.initGameSet = function (cards) {
		_cards = cards;
	}

	this.play = function () {
		return new Server.Action(Server.ActionType.ReplyChallenge, Server.Messages.Quiero);
	}
}