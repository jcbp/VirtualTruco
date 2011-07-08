/*
 * Utils
 */
var Utils = function () {
	this.getLastElement = function (elements) {
		return elements[elements.length - 1];
	}
	this.random = function (from, to) {
		return Math.floor(Math.random() * (to - from + 1)) + from;
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
		this.createNoQuiero = function () {
			return new Server.Action(Server.ActionType.ReplyChallenge, Server.Messages.NoQuiero);
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
		
		/*
		 * Se define el peso de las cartas	
		 */
		var _cardsWeight = {
			Cup: {
				1: 7,
				2: 6,
				3: 5,
				4: 14,
				5: 13,
				6: 12,
				7: 11,
				10: 10,
				11: 9,
				12: 8
			},
			Coin:  {
				1: 7,
				2: 6,
				3: 5,
				4: 14,
				5: 13,
				6: 12,
				7: 4,
				10: 10,
				11: 9,
				12: 8
			},
			Club:  {
				1: 2,
				2: 6,
				3: 5,
				4: 14,
				5: 13,
				6: 12,
				7: 11,
				10: 10,
				11: 9,
				12: 8
			},
			Sword:  {
				1: 1,
				2: 6,
				3: 5,
				4: 14,
				5: 13,
				6: 12,
				7: 3,
				10: 10,
				11: 9,
				12: 8
			}
		};
		
		/*
		 * Se definen las enumeraciones de los posibles resultados de comparar el peso de dos cartas
		 */
		var CompareWeightType = this.CompareWeightType = {
			Less: -1,
			Equal: 0,
			Higher: 1
		};

		/*
		 * Retorna el valor del envido de una carta
		 */
		var getEnvidoValue = function (card) {
			return card.value <= 7 ? card.value : 0;
		}

		/*
		 * Retorna el envido de dos cartas
		 */
		var calculatePartialEnvido = this.calculatePartialEnvido = function (firstCard, secondCard) {
			var envido;
			if(firstCard.suit == secondCard.suit) {
				envido = 20 + getEnvidoValue(firstCard) + getEnvidoValue(secondCard);
			}
			else {
				envido = Math.max(getEnvidoValue(firstCard), getEnvidoValue(secondCard));
			}
			return envido;
		}
		
		/*
		 * Retorna el envido mas alto posible evaluando todas las cartas de la mano
		 */
		 this.calculateEnvido = function() {
			var envido = 0;
			var i, j;
			for(i = 0; i < cards.length; i++) {
				for(j = i+1; j < cards.length; j++) {
					envido = Math.max(envido, calculatePartialEnvido(cards[i], cards[j]));
				}
			}
			return envido;
		}

		/*
		 * Retorna el peso de la carta
		 */
		var getCardWeight = this.getCardWeight = function (card) {
			return _cardsWeight[card.suit] && _cardsWeight[card.suit][card.value];
		}
		
		/*
		 * Retorna si la primer carta es mayor, menor o igual que la segunda
		 */
		this.compareWeight = function (firstCard, secondCard) {
			var firstWeight = getCardWeight(firstCard);
			var secondWeight = getCardWeight(secondCard);
			return firstWeight < secondWeight ? CompareWeightType.Higher : firstWeight > secondWeight ? CompareWeightType.Less : CompareWeightType.Equal;
		}

		/*
		 * Retorna las cartas ordenadas por peso en orden ascendente
		 */
		this.getWinnerCards = function () {
			var orderedCards = [].concat(cards);
			orderedCards.sort(function(firstCard, secondCard) {
				return getCardWeight(firstCard) - getCardWeight(secondCard);
			});
			return orderedCards;
		}
	}
}