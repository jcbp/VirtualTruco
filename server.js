/*
 * Utils
 * 
 */
var copyObject = function (obj, obj2) {
	for(var i in obj2) {
		obj[i] = obj2[i];
	}
	return obj;
};

var copyArray = function (array) {
	var ret = [];
	for (var i=0; i < array.length; i++) {
		ret.push(array[i]);
	};
	return ret;
};

/*
 * @namespace
 */
var Server = new function () {
	
	/*
	 * Define lo que es una carta, a partir del valor y el palo
	 */
	var Card = function (value, suit) {
		this.value = value;
		this.suit = suit;
		this.toString = function () {
			return value + " of " + suit;
		}
	};
	
	/*
	 * random testeado de que sea plano
	 */
	var random = function (from, to) {
		return Math.floor(Math.random() * (to - from + 1)) + from;
	}
	
	/*
	 * Mezclador de cartas
	 */
	var DeckShuffler = function () {
		this.shuffle = function (deck) {
			var ret = [];
			while(deck.length) {
				ret.push(deck.splice(random(0, deck.length), 1)[0]);
			}
			return ret;
		}
	}
	
	/*
	 * Maso de cartas
	 */
	var Deck = function (values, suits, shuffler) {
		var _cards = [];
		
		var init = function () {
			for (var i=0; i < values.length; i++) {
				for (var j=0; j < suits.length; j++) {
					_cards.push(new Card(values[i], suits[j]));
				};
			};
		}
		init();
		
		this.shuffle = function () {
			_cards = shuffler.shuffle(_cards);
		}
		this.takeCard = function (count) {
			return _cards.splice(0, count);
		}
		this.takeBackCard = function (cards) {
			_cards.concat(cards);
		}
	}
	
	/*
	 * Se define el mazo de cartas españolas
	 */
	var LatinSuitedCard = function (shuffler) {
		var _deckValues = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
		var _deckSuits = ["Cup", "Coin", "Club", "Sword"];
		Deck.call(this, _deckValues, _deckSuits, shuffler);
	}
	
	/*
	 * Mensaje
	 */
	var Message = function(name, type) {
		this.name = name;
		this.type = type;
	};
	
	/*
	 * Tipos de mensaje
	 */
	var MessageType = this.MessageType = {
		Challenge: "Challenge",
		Reply: "Reply",
		Surrender: "Surrender"
	};
	
	/*
	 * Enumeración de mensajes
	 */
	var Messages = this.Messages = {
		Envido: new Message("Envido", MessageType.Challenge),
		RealEnvido: new Message("RealEnvido", MessageType.Challenge),
		FaltaEnvido: new Message("FaltaEnvido", MessageType.Challenge),
		Truco: new Message("Truco", MessageType.Challenge),
		ReTruco: new Message("ReTruco", MessageType.Challenge),
		ValeCuatro: new Message("ValeCuatro", MessageType.Challenge),
		Quiero: new Message("Quiero", MessageType.Reply),
		NoQuiero: new Message("NoQuiero", MessageType.Reply),
		SonBuenas: new Message("SonBuenas", MessageType.Surrender)
	};
	
	/*
	 * Define las relaciones para subir la apuesta, con sus respectivos valores acumulados por combinacion (queridos y no-queridos)
	 */
	var EnvidoBet = function (previousValue) {
		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		if(previousValue==0)
			this.Envido = new EnvidoBet(this.acceptedValue);
		this.RealEnvido = new RealEnvidoBet(this.acceptedValue);
		this.FaltaEnvido = new FaltaEnvidoBet(this.acceptedValue);
	}
	
	var RealEnvidoBet = function (previousValue) {
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.FaltaEnvido = new FaltaEnvidoBet(this.acceptedValue);
	}
	
	var FaltaEnvidoBet = function (previousValue) {
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
	}
	
	var TrucoBet = function (previousValue) {
		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.ReTruco = new ReTrucoBet(this.acceptedValue);
	}
	
	var ReTrucoBet = function (previousValue) {
		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.ValeCuatro = new ValeCuatroBet(this.acceptedValue);
	}
	
	var ValeCuatroBet = function (previousValue) {
		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
	}
	
	/*
	 * Es el nodo raiz de las relaciones jerarquicas definidas anteriormente
	 */
	var BetHierarchy = {
		Envido: new EnvidoBet(0),
		RealEnvido: new RealEnvidoBet(0),
		FaltaEnvido: new FaltaEnvidoBet(0),
		Truco: new TrucoBet(0)
	}
	
	/*
	 * Manejador de apuestas
	 */
	var BetManager = function () {
		var _firstSection = BetHierarchy;
		var _secondSection = BetHierarchy;
		this.firstSectionIncreseBet = function (bet) {
			return _firstSection = _firstSection[bet] || null;
		}
		this.secondSectionIncreseBet = function (bet) {
			return _secondSection = _secondSection[bet] || null;
		}
		this.getFirstSectionBet = function () {
			return _firstSection;
		}
		this.getSecondSectionBet = function () {
			return _secondSection;
		}
		this.closeFirstSection = function () {
			_firstSection = {};
		}
		this.closeSecondSection = function () {
			_firstSection = {};
		}
	}
	
	
	/*
	 * Agrupa los datos relevantes de cada jugador
	 */
	var PlayerProfile = function (handler, isHand) {
		this.scorePoints = 0;
		this.isHand = isHand;
		this.addScorePoints = function (value) {
			this.scorePoints += value;
			if(handler.setScorePoints)
				handler.setScorePoints(this.scorePoints);
		}
		this.handler = handler;
		this.playedCards = [];
		this.addPlayedCard = function (card) {
			this.playedCards.push(card);
		}
	}

	/*
	 * Maneja el cambio de turnos
	 */
	var PlayerManager = function (playerHandler1, playerHandler2) {
		var _player1 = new PlayerProfile(playerHandler1, true);
		var _player2 = new PlayerProfile(playerHandler2, false);
		var _currentPlayer = _player1;
		this.switchPlayer = function () {
			_currentPlayer = _currentPlayer==_player1? _player2: _player1;
			return _currentPlayer;
		}
		this.getHandPlayer = function () {
			return _currentPlayer = _player1;
		}
		this.nextCardPlayer = function () {
			return _currentPlayer = _player1.playedCards.length > _player2.playedCards.length? _player2: _player1;
		}
		this.getCurrentPlayer = function () {
			return _currentPlayer;
		}
	}

	/*
	 * Tipos de acciones...
	 */
	var ActionType = this.ActionType = {
		PostFirstSectionChallenge: "PostFirstSectionChallenge",
		PostSecondSectionChallenge: "PostSecondSectionChallenge",
		ReplyChallenge: "ReplyChallenge",
		//IncreaseChallenge: "IncreaseChallenge", // parece que no hace falta
		PlayCard: "PlayCard",
		PostSurrender: "PostSurrender",
		PostScore: "PostScore",
		GoingToDeck: "GoingToDeck"
	};
	
	/*
	 * Este objeto es el que se espera que envie cada jugador para interactuar
	 */
	var Action = this.Action = function (type, argument) {
		this.type = type;
		this.message =	type==ActionType.PostFirstSectionChallenge ||
						type==ActionType.PostSecondSectionChallenge ||
						type==ActionType.ReplyChallenge ||
						// type==ActionType.IncreaseChallenge ||
						type==ActionType.PostSurrender
						? argument: null;
		this.card = type==ActionType.PlayCard? argument: null;
		this.envidoScore = type==ActionType.PostScore? argument: null;
	}
	
	/*
	 * Comienzo del flujo del juego
	 */
	var StartGameState = function (playerManager) {
 		this.executeAction = function (action, betManager) {
 			var nextState = null;
 			var player;
 			switch(action.type) {
 				case ActionType.PostFirstSectionChallenge:
 					if(betManager.firstSectionIncreseBet(action.message.name)) {
		 				player = playerManager.switchPlayer();
						nextState = new FirstSectionReplyChallengeState(playerManager);
					}
 					break;
 				case ActionType.PostSecondSectionChallenge:
 					if(betManager.secondSectionIncreseBet(action.message.name)) {
 						player = playerManager.switchPlayer();
						nextState = new SecondSectionReplyChallengeState(playerManager);
 					}
 					break;
 				case ActionType.PlayCard:
 					if(action.card) {
	 					player = playerManager.switchPlayer();
	 					nextState = new PlayCardState(playerManager);
	 				}
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * FirstSection: envido, real envido, etc...
	 */
	var FirstSectionReplyChallengeState = function (playerManager) {
		this.executeAction = function (action, betManager) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.ReplyChallenge:
 					if(action.message==Messages.Quiero) {
 						player = playerManager.getHandPlayer();
 						nextState = new PostScoreState(playerManager);
 					}
 					else if(action.message==Messages.NoQuiero) {
 						player = playerManager.switchPlayer();
 						player.addScorePoints(betManager.getFirstSectionBet().declinedValue);
						nextState = new PlayCardState(playerManager);
 					}
 					betManager.closeFirstSection();
 					break;
 				case ActionType.PostFirstSectionChallenge:
					if(betManager.firstSectionIncreseBet(action.message.name)) {
		 				player = playerManager.switchPlayer();
						nextState = new FirstSectionReplyChallengeState(playerManager);
					}
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * SecondSection: truco, re truco, etc...
	 */
	var SecondSectionReplyChallengeState = function (playerManager) {
		this.executeAction = function (action, betManager) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.ReplyChallenge:
 					if(action.message==Messages.Quiero) {
	 					player = playerManager.switchPlayer();
	 					nextState = new PlayCardState(playerManager);
 					}
 					else if(action.message==Messages.NoQuiero) {
 						nextState = new SuccessfulConclusionState(playerManager);
 					}
 					break;
 				case ActionType.PostFirstSectionChallenge:
					if(betManager.firstSectionIncreseBet(action.message.name)) {
		 				player = playerManager.switchPlayer();
						nextState = new FirstSectionReplyChallengeState(playerManager);
					}
 				case ActionType.PostSecondSectionChallenge:
					if(betManager.secondSectionIncreseBet(action.message.name)) {
 						player = playerManager.switchPlayer();
						nextState = new SecondSectionReplyChallengeState(playerManager);
 					}
 					break;
 			}
			return nextState;
		}
	}

	/*
	 * Estado: "cantar el tanto"
	 */
	var PostScoreState = function (playerManager, envidoScore) {
		var getEnvidoWinner = function (pl1, pl2) {
			var _winner = pl1.isHand? pl1: pl2;
			if(pl1.score>pl2.score)
				_winner = pl1;
			else if(pl1.score<pl2.score) {
				_winner = pl2;
			}
			return _winner.player;
		}
		this.executeAction = function (action, betManager) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.PostScore:
 					if(!envidoScore) {
			 			player = playerManager.switchPlayer();
			 			nextState = new PostScoreState(playerManager, action.envidoScore);
 					}
 					else {
 						getEnvidoWinner({
 							player: playerManager.getCurrentPlayer(),
 							score: envidoScore
 						}, {
 							player: player = playerManager.nextCardPlayer(),
 							score: action.envidoScore
 						}).addScorePoints(betManager.getFirstSectionBet().acceptedValue);
 						nextState = new PlayCardState(playerManager);
 					}
 					break;
 			}
			return nextState;
		}
	}
	
	var PlayCardState = function (playerManager) {
		this.executeAction = function (action, betManager) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.PlayCard:
 					if(action.card) {
	 					player = playerManager.switchPlayer();
	 					nextState = new PlayCardState(playerManager);
	 				}
 					break;
 				case ActionType.PostFirstSectionChallenge:
 					if(betManager.firstSectionIncreseBet(action.message.name)) {
		 				player = playerManager.switchPlayer();
						nextState = new FirstSectionReplyChallengeState(playerManager);
					}
 					break;
 				case ActionType.PostSecondSectionChallenge:
 					if(betManager.secondSectionIncreseBet(action.message.name)) {
 						player = playerManager.switchPlayer();
						nextState = new SecondSectionReplyChallengeState(playerManager);
 					}
 					break;
 			}
			return nextState;
		}
	}
	
	var SuccessfulConclusionState = function (playerManager) {
		this.executeAction = function (action, betManager) {
			Log.add({Separator: "-----------------------------------------------------------------------------------------"});
			return new StartGameState(playerManager);
		}
	}
	
	var Log = new function () {
		var _output = document.createElement("div");
		document.body.appendChild(_output);
		_output.style.fontFamily = "Courier New";
		_output.style.fontSize = "11px";
		var addColumn = function (str) {
			var len = 30 - (str+'').length;
			var pipePos = 26 - (str+'').length;
			for (var i=0; i < len; i++) {
				str += "&nbsp;";
				if(i==pipePos)
					str += "|";
			};
			return str;
		}
		this.add = function (line) {
			var str = "";
			for(var i in line) {
				str += i + ": " + addColumn(line[i]);
			}
			_output.innerHTML += str + "<br>";
		}
	}
	
	/*
	 * Conjunto de jugadas asociadas a un jugador (playerName)
	 */
	var Move = function (playerName, action) {
		this.playerName = playerName;
		this.action = action;
	}

	var TableContext = function (playerManager) {
		var _betManager = new BetManager();
		var _state = new StartGameState(playerManager);
		var _moves = [];
		this.play = function (action) {
			
			Log.add({
				player: playerManager.getCurrentPlayer().handler.name,
				type: action.type,
				message: action.message? action.message.name: null,
				card: action.card,
				score: action.envidoScore
			});
			
			_moves.push(new Move(playerManager.getCurrentPlayer().handler.name, action));
			return _state = _state.executeAction(action, _betManager);
		}
		this.getMoves = function () {
			return copyArray(_moves);
		}
	}

	/*
	 * Clase principal
	 */
	this.GameManager = new function () {
		var _deck = new LatinSuitedCard(new DeckShuffler());
		var _player1, _player2;
		var _hand = _player1;
		
		var dealCards = function () {
			_deck.shuffle();
			_player1.initHand(_deck.takeCard(3));
			_player2.initHand(_deck.takeCard(3));
		}
		
		this.setPlayer1 = function (player) {
			_player1 = player;
		}
		this.setPlayer2 = function (player) {
			_player2 = player;
		}
		this.start = function () {
			dealCards();
			var _playerManager = new PlayerManager(_player1, _player2);
			var _context = new TableContext(_playerManager);
			
			var state, action;
			var interval = setInterval(function() {
				action = _playerManager.getCurrentPlayer().handler.play(_context.getMoves());
				state = _context.play(action);
				if(!state)
					clearInterval(interval);
			}, 10);
		}
	}
}

Server.GameManager.setPlayer1(new Player1());
Server.GameManager.setPlayer2(new Player2());
Server.GameManager.start();

