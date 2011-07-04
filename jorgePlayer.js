/*
 * IA of Jorge
 */
var Player1 = function () {
	var _cards = null;
	
	this.name = "Jorge";

	this.initGameSet = function (cards) {
		_cards = cards;
	}

	this.play = function () {
		return eval(prompt("asdf", "sdasda"));
		return new Server.Action(Server.ActionType.PostChallenge, Server.Messages.Envido);
	}
}