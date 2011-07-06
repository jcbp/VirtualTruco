/*
 * Utils
 */
var Utils = function () {
	this.getLastElement = function (elements) {
		return elements[elements.length - 1];
	}
}
/*
 * API
 */


var PlayerAPI = new function () {
	
	this.ChallengeFactory = function () {
		this.createEnvido = function () {
			return new Server.Action(Server.ActionType.PostFirstPartChallenge, Server.Messages.Envido);
		}
		this.createRealEnvido = function () {
			return new Server.Action(Server.ActionType.PostFirstPartChallenge, Server.Messages.RealEnvido);
		}
		this.createTruco = function () {
			return new Server.Action(Server.ActionType.PostSecondPartChallenge, Server.Messages.Truco);
		}
	}
	
	this.GameDataSet = function (moves) {
		this.getOpponentMoves = function () {

		}
		this.getOwnMoves = function () {
			
		}
		this.getOpponentCardsPlayed = function () {

		}
		this.getOwnCardsPlayed = function () {

		}
		this.getLastMovePlayer = function () {
			
		}
	}
	
	this.CardManager = function (cards) {
		// el mas alto
		this.calculateEnvido = function () {
			
		}
		// peso de la carta
		this.getCardWeight = function (card) {
	
		}
		// ordenadas por peso ascendente
		this.getWinnerCards = function (opponentCard) {
			
		}
	}
}
