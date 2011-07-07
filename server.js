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
			_currentPlayer = _player1.playedCards.length > _player2.playedCards.length? _player2: _player1;
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
 		this.executeAction = function (action) {
 			var nextState = null;
 			var player;
 			switch(action.type) {
 				case ActionType.PostFirstSectionChallenge:
 					if(BetHierarchy[action.message.name]) {
		 				player = playerManager.switchPlayer();
						nextState = new FirstPartReplyChallengeState(playerManager, BetHierarchy[action.message.name]);
					}
 					break;
 				case ActionType.PostSecondSectionChallenge:
 					if(BetHierarchy[action.message.name]) {
 						player = playerManager.switchPlayer();
						nextState = new SecondPartReplyChallengeState(playerManager, BetHierarchy[action.message.name]);
 					}
 					break;
 				case ActionType.PlayCard:
 					
 					// ...
 					
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * FirstPart: envido, real envido, etc...
	 */
	var FirstPartReplyChallengeState = function (playerManager, challenge) {
		this.executeAction = function (action) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.ReplyChallenge:
 					if(action.message==Messages.Quiero) {
 						player = playerManager.getHandPlayer();
 						nextState = new PostScoreState(playerManager, challenge);
 					}
 					else if(action.message==Messages.NoQuiero) {
 						player = playerManager.switchPlayer();
 						player.addScorePoints(challenge.declinedValue);
						nextState = new PostScoreState(playerManager);
 					}
 					break;
 				case ActionType.PostFirstSectionChallenge:
 					if(challenge[action.message.name]) {
	 					player = playerManager.switchPlayer();
						nextState = new FirstPartReplyChallengeState(playerManager, challenge[action.message.name]);
					}
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * SecondPart: truco, re truco, etc...
	 */
	var SecondPartReplyChallengeState = function (playerManager, challenge) {
		this.executeAction = function (action) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.ReplyChallenge:
 					if(action.message==Messages.Quiero) {
 					
 					}
 					else if(action.message==Messages.NoQuiero) {
 					
 					}
 					break;
 				// case ActionType.PostFirstSectionChallenge:
 					// if(BetHierarchy[action.message.name]) {
		 				// player = playerManager.switchPlayer();
						// nextState = new FirstPartReplyChallengeState(playerManager, BetHierarchy[action.message.name]);
					// }
 					// break;
 				case ActionType.PostSecondSectionChallenge:
 					if(challenge[action.message.name]) {
	 					player = playerManager.switchPlayer();
						nextState = new SecondPartReplyChallengeState(playerManager, challenge[action.message.name]);
					}
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * Estado: "cantar el tanto"
	 */
	var PostScoreState = function (playerManager, challenge, envidoScore) {
		var getEnvidoWinner = function (pl1, pl2) {
			var _winner = pl1.isHand? pl1: pl2;
			if(pl1.score>pl2.score)
				_winner = pl1;
			else if(pl1.score<pl2.score) {
				_winner = pl2;
			}
			return _winner.player;
		}
		this.executeAction = function (action) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.PostScore:
 					if(!envidoScore) {
			 			player = playerManager.switchPlayer();
			 			nextState = new PostScoreState(playerManager, challenge, action.envidoScore);
 					}
 					else {
 						getEnvidoWinner({
 							player: playerManager.getCurrentPlayer(),
 							score: envidoScore
 						}, {
 							player: player = playerManager.nextCardPlayer(),
 							score: action.envidoScore
 						}).addScorePoints(challenge.acceptedValue);
 						nextState = new PlayCardState(playerManager);
 					}
 					break;
 			}
			return nextState;
		}
	}
	
	var PlayCardState = function (playerManager, challenge) {
		this.executeAction = function (action) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.PlayCard:
 					player = playerManager.switchPlayer();
 					nextState = new PlayCardState(playerManager);
 					break;
 				case ActionType.PostSecondSectionChallenge:
 					
 					break;
 			}
			return nextState;
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
	var Moves = function (playerName, action) {
		this.playerName = playerName;
		this.action = action;
	}

	var TableContext = function (playerManager) {
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
			
			_moves.push(new Moves(playerManager.getCurrentPlayer().handler.name, action));
			return _state = _state.executeAction(action);
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
			_player1.initGameSet(_deck.takeCard(3));
			_player2.initGameSet(_deck.takeCard(3));
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
			do {
				action = _playerManager.getCurrentPlayer().handler.play(_context.getMoves());
				state = _context.play(action);
			}
			while(state);
		}
	}
}

Server.GameManager.setPlayer1(new Player1());
Server.GameManager.setPlayer2(new Player2());
Server.GameManager.start();

