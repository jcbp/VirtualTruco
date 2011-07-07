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
var CommonAPI = new function () {
	
	this.ActionFactory = new function () {
		this.createEnvido = function () {
			return new Server.Action(Server.ActionType.PostFirstSectionChallenge, Server.Messages.Envido);
		}
		this.createRealEnvido = function () {
			return new Server.Action(Server.ActionType.PostFirstSectionChallenge, Server.Messages.RealEnvido);
		}
		this.createTruco = function () {
			return new Server.Action(Server.ActionType.PostSecondSectionChallenge, Server.Messages.Truco);
		}
		this.createQuiero = function () {
			return new Server.Action(Server.ActionType.ReplyChallenge, Server.Messages.Quiero);
		}
		this.createPostScore = function (score) {
			return new Server.Action(Server.ActionType.PostScore, score);
		}
		this.createPlayCard = function (card) {
			return new Server.Action(Server.ActionType.PlayCard, card);
		}
		// ... agregar los metodos de las acciones restantes
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
	
	this.CardPacketManager = function (cards) {
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
