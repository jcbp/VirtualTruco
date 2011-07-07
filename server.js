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

	var Card = function (value, suit, data) {
		this.value = value;
		this.suit = suit;
        this.data = data || value;
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
	var Deck = function (suits, shuffler) {
		var _cards = [];
		
		var init = function () {
			var card;
			var deck;
			var cards;			
			
			for (var i = 0; i < suits.length; i++) {
				deck  = suits[i];
				cards = deck.cards;
				for (var j = 0; j < cards.length; j++) {
					card = cards[j];					
					_cards.push(new Card(card.rank, deck.suit,card.data));
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
	
	var SpanishDeck = function (shuffler) {
		var _deckSuits = [
		{suit:"cup",  cards:[{rank:1,data:14},{rank:2,data:15},{rank:3,data:16},{rank:4},{rank:5},{rank:6},{rank:7},		 {rank:10},{rank:11},{rank:12}]},
		{suit:"Coin", cards:[{rank:1,data:14},{rank:2,data:15},{rank:3,data:16},{rank:4},{rank:5},{rank:6},{rank:7,data:20},{rank:10},{rank:11},{rank:12}]},
		{suit:"Club", cards:[{rank:1,data:40},{rank:2,data:15},{rank:3,data:16},{rank:4},{rank:5},{rank:6},{rank:7},		 {rank:10},{rank:11},{rank:12}]},
		{suit:"Sword",cards:[{rank:1,data:50},{rank:2,data:15},{rank:3,data:16},{rank:4},{rank:5},{rank:6},{rank:7,data:30},{rank:10},{rank:11},{rank:12}]}]
		Deck.call(this, _deckSuits, shuffler);
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
		Resign: "Resign"
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
		SonBuenas: new Message("SonBuenas", MessageType.Resign)
	};
	
	/*
	 * Define las relaciones para subir la apuesta, con sus respectivos valores acumulados por combinacion (queridos y no-queridos)
	 */
	var EnvidoChallenage = function (previousValue) {
		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		if(previousValue==0)
			this.Envido = new EnvidoChallenage(this.acceptedValue);
		this.RealEnvido = new RealEnvidoChallenage(this.acceptedValue);
		this.FaltaEnvido = new FaltaEnvidoChallenage(this.acceptedValue);
	}
	
	var RealEnvidoChallenage = function (previousValue) {
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.FaltaEnvido = new FaltaEnvidoChallenage(this.acceptedValue);
	}
	
	var FaltaEnvidoChallenage = function (previousValue) {
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
	}
	
	var TrucoChallenage = function (previousValue) {
		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.ReTruco = new ReTrucoChallenage(this.acceptedValue);
	}
	
	var ReTrucoChallenage = function (previousValue) {
		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.ValeCuatro = new ValeCuatroChallenage(this.acceptedValue);
	}
	
	var ValeCuatroChallenage = function (previousValue) {
		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
	}
	
	/*
	 * Es el nodo raiz de las relaciones jerarquicas definidas anteriormente
	 */
	var ChallenageHierarchy = {
		Envido: new EnvidoChallenage(0),
		RealEnvido: new RealEnvidoChallenage(0),
		FaltaEnvido: new FaltaEnvidoChallenage(0),
		Truco: new TrucoChallenage(0)
	}
	
	/*
	 * Agrupa los datos relevantes de cada jugador
	 */
	var PlayerProfile = function (handler, isHand) {
		this.score = 0;
		this.isHand = isHand;
		this.addScore = function (value) {
			this.score += value;
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
		PostFirstPartChallenge: "PostFirstPartChallenge",
		PostSecondPartChallenge: "PostSecondPartChallenge",
		ReplyChallenge: "ReplyChallenge",
		ClimbBet: "ClimbBet",
		PlayCard: "PlayCard",
		PostResign: "PostResign",
		PostScore: "PostScore"
	};
	
	/*
	 * Este objeto es el que se espera que envie cada jugador para interactuar
	 */
	var Action = this.Action = function (type, argument) {
		this.type = type;
		this.message =	type==ActionType.PostFirstPartChallenge ||
						type==ActionType.PostSecondPartChallenge ||
						type==ActionType.ReplyChallenge ||
						type==ActionType.ClimbBet ||
						type==ActionType.PostResign
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
 				case ActionType.PostFirstPartChallenge:
 					if(ChallenageHierarchy[action.message.name]) {
		 				player = playerManager.switchPlayer();
						nextState = new FirstPartReplyChallengeState(playerManager, ChallenageHierarchy[action.message.name]);
					}
 					break;
 				case ActionType.PostSecondPartChallenge:
 					if(ChallenageHierarchy[action.message.name]) {
 						player = playerManager.switchPlayer();
						nextState = new SecondPartReplyChallengeState(playerManager, ChallenageHierarchy[action.message.name]);
 					}
 					break;
 				case ActionType.PlayCard:
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * FirstPart: envido, real envido, etc...
	 */
	var FirstPartReplyChallengeState = function (playerManager, challenage) {
		this.executeAction = function (action) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.ReplyChallenge:
 					if(action.message==Messages.Quiero) {
 						player = playerManager.getHandPlayer();
 						nextState = new PostScoreState(playerManager, challenage);
 					}
 					else if(action.message==Messages.NoQuiero) {
 						player = playerManager.switchPlayer();
 						player.addScore(challenage.declinedValue);
						nextState = new PostScoreState(playerManager);
 					}
 					break;
 				case ActionType.ClimbBet:
 					if(challenage[action.message.name]) {
	 					player = playerManager.switchPlayer();
						nextState = new FirstPartReplyChallengeState(playerManager, challenage[action.message.name]);
					}
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * SecondPart: truco, re truco, etc...
	 */
	var SecondPartReplyChallengeState = function (playerManager, challenage) {
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
 				// case ActionType.PostFirstPartChallenge:
 					// if(ChallenageHierarchy[action.message.name]) {
		 				// player = playerManager.switchPlayer();
						// nextState = new FirstPartReplyChallengeState(playerManager, ChallenageHierarchy[action.message.name]);
					// }
 					// break;
 				case ActionType.ClimbBet:
 					if(challenage[action.message.name]) {
	 					player = playerManager.switchPlayer();
						nextState = new SecondPartReplyChallengeState(playerManager, challenage[action.message.name]);
					}
 					break;
 			}
			return nextState;
		}
	}
	
	/*
	 * Estado: "cantar el tanto"
	 */
	var PostScoreState = function (playerManager, challenage, envidoScore) {
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
			 			nextState = new PostScoreState(playerManager, challenage, action.envidoScore);
 					}
 					else {
 						getEnvidoWinner({
 							player: playerManager.getCurrentPlayer(),
 							score: envidoScore
 						}, {
 							player: player = playerManager.nextCardPlayer(),
 							score: action.envidoScore
 						}).addScore(challenage.acceptedValue);
 						nextState = new PlayCardState(playerManager);
 					}
 					break;
 			}
			return nextState;
		}
	}
	
	var PlayCardState = function (playerManager, challenage) {
		this.executeAction = function (action) {
			var nextState = null;
			var player;
 			switch(action.type) {
 				case ActionType.PlayCard:
 					player = playerManager.switchPlayer();
 					nextState = new PlayCardState(playerManager);
 					break;
 				case ActionType.PostSecondPartChallenge:
 					
 					break;
 			}
			return nextState;
		}
	}
	
	var Log = new function () {
		var _output = document.createElement("div");
		document.body.appendChild(_output);
		_output.style.fontFamily = "Courier New";
		_output.style.fontSize = "12px";
		var addColumn = function (str) {
			var len = 28 - (str+'').length;
			var pipePos = 23 - (str+'').length;
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
		var _deck = new SpanishDeck(new DeckShuffler());
		var _player1, _player2;
		var _hand = _player1;
		
		this.setPlayer1 = function (player) {
			_player1 = player;
		}
		this.setPlayer2 = function (player) {
			_player2 = player;
		}
		this.start = function () {
			_deck.shuffle();
			_player1.initGameSet(_deck.takeCard(3));
			_player2.initGameSet(_deck.takeCard(3));
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
