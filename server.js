
/*
 * @Namespace
 */
var NSDeck = new function () {
	
	var _utils = new Utils();
	
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
	 * Mezclador de cartas
	 */
	this.DeckShuffler = function () {
		this.shuffle = function (deck) {
			var ret = [];
			while(deck.length) {
				ret.push(deck.splice(_utils.random(0, deck.length - 1), 1)[0]);
			}
			return ret;
		}
	}
	
	/*
	 * Maso de cartas
	 */
	var Deck = this.Deck = function (values, suits, shuffler) {
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
	this.SpanishDeck = function (shuffler) {
		var _deckValues = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
		var _deckSuits = ["Cup", "Coin", "Club", "Sword"];
		Deck.call(this, _deckValues, _deckSuits, shuffler);
	}
}

/*
 * @Namespace
 */
var Server = new function () {

	/*
	 * Tanto el servidor como los jugadores tienen su propia instancia de Utils
	 */
	var _utils = new Utils();
	
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
		FirstSectionChallenge: "FirstSectionChallenge",
		SecondSectionChallenge: "SecondSectionChallenge",
		Reply: "Reply",
		Surrender: "Surrender"
	};
	
	/*
	 * Enumeración de mensajes
	 */
	var Messages = this.Messages = {
		Envido: new Message("Envido", MessageType.FirstSectionChallenge),
		RealEnvido: new Message("RealEnvido", MessageType.FirstSectionChallenge),
		FaltaEnvido: new Message("FaltaEnvido", MessageType.FirstSectionChallenge),
		Truco: new Message("Truco", MessageType.SecondSectionChallenge),
		ReTruco: new Message("ReTruco", MessageType.SecondSectionChallenge),
		ValeCuatro: new Message("ValeCuatro", MessageType.SecondSectionChallenge),
		Quiero: new Message("Quiero", MessageType.Reply),
		NoQuiero: new Message("NoQuiero", MessageType.Reply),
		SonBuenas: new Message("SonBuenas", MessageType.Surrender)
	};
	
	/*
	 * Tipos de acciones...
	 */
	var ActionType = this.ActionType = {
		Message: "Message",
		Card: "Card"
	}
	
	/*
	 * Este objeto es el que se espera que envie cada jugador para interactuar
	 */
	var Action = this.Action = function (type, argument) {
		this.type = type;
		this.message = type==ActionType.Message? argument: null;
		this.card = type==ActionType.Card? argument: null;
	}
	
	/*
	 * Representa una collecion de nodos (dentro del arbol del flujo del juego)
	 * Se accede a sus nodos a través del metodo each
	 */
	var ChildNodeCollection = function (nodes, state) {
		var _nodes = {};
		for(var i in nodes) {
			if(nodes.hasOwnProperty(i)) {
				if(nodes[i].evalRequirement(state)) {
					_nodes[i] = nodes[i];
				}
			}
		}
		this.select = function (nodeName) {
			return _nodes[nodeName];
		}
		this.each = function (callback) {
			for(var nodeName in _nodes) {
				if(_nodes.hasOwnProperty(nodeName)) {
					callback(nodeName, this.select(nodeName));
				}
			}
		}
	}

	/*
	 * Clase Base que representa un nodo del flujo del juego
	 * Todos los nodos heredan de esta clase
	 */
	var GameNode = function () {
		var _nodes = {};
		var _requires = [];
		var _useFlowState = false;
		
		var _flowState = GameFlowState.getInstance();
		
		this.addNodes = this.updateNodes = function (nodes) {
			_utils.copyObject(_nodes, nodes);
		}
		
		this.evalRequirement = function (state) {
			var ret = true;
			for (var i=0; i < _requires.length; i++) {
				if(!_requires[i](state)) {
					ret = false;
					break;
				}
			};
			return ret;
		}
		
		this.requires = function (func) {
			_requires.push(func);
		}
		
		this.useFlowState = function () {
			_useFlowState = true;
		}

		this.getChildNodes = function (state) {
			var nodes = _useFlowState? _flowState.getNodes(): _nodes;
			return new ChildNodeCollection(nodes, state);
		}
		
		this.getNodes = function() {
			return _nodes;
		}
	}
	
	/*
	 * Quiero, NoQuiero
	 */
	var ReplyNode = function () {
		GameNode.apply(this, arguments);

		this.useFlowState();
	}
	
	/*
	 * Define que todos los mensajes se pueden querer o no querer
	 */
	var MessageNode = function () {
		GameNode.apply(this, arguments);
		
		this.addNodes({
			Quiero: new ReplyNode(),
			NoQuiero: new ReplyNode()
		});
	}
	
	/*
	 * Nodos de la primer parte del juego (envido)
	 */
	var FirstSectionChallengeNode = function () {
		MessageNode.apply(this, arguments);

		this.requires(function(state) {
			return !!state.firstSectionChallengeAvailable;
		});
	}
	
	/*
	 * Nodos de la segunda parte del juego (truco)
	 */
	var SecondSectionChallengeNode = function () {
		MessageNode.apply(this, arguments);

		this.requires(function(state) {
			return !!state.hasQuiero;
		});
//		this.addNodes({
//			NoQuiero: new GameHandEndNode(playCard)
//		});
	}
	
	var EnvidoNode = function (previousValue) {
		FirstSectionChallengeNode.apply(this, arguments);
		
		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		var _messageNode = {
			RealEnvido: new RealEnvidoNode(this.accepted),
			FaltaEnvido: new FaltaEnvidoNode(this.acceptedValue)
		};
		if(previousValue==0)
			_messageNode.Envido = new EnvidoNode(this.acceptedValue);

		this.addNodes(_messageNode);
	}
	
	var RealEnvidoNode = function (previousValue) {
		FirstSectionChallengeNode.apply(this, arguments);
		
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.addNodes({
			FaltaEnvido: new FaltaEnvidoNode(this.acceptedValue)
		});
	}
	
	var FaltaEnvidoNode = function (previousValue) {
		FirstSectionChallengeNode.apply(this, arguments);
		
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
	}
	
	var TrucoNode = function (previousValue) {
		SecondSectionChallengeNode.apply(this, arguments);

		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.addNodes({
			ReTruco: new ReTrucoNode(this.acceptedValue)
		});
	}
	
	var ReTrucoNode = function (previousValue) {
		SecondSectionChallengeNode.apply(this, arguments);
		
		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.addNodes({
			ValeCuatro: new ValeCuatroNode(this.acceptedValue)
		});
	}
	
	var ValeCuatroNode = function (previousValue) {
		SecondSectionChallengeNode.apply(this, arguments);

		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
	}
	
	
	var PlayCardNode = function (cardCount) {
		GameNode.apply(this, arguments);
		
		this.useFlowState();
		
		// Se crea la cantidad de nodos como de cartas haya: se juegan 6 cartas (3 + 3)
		if(cardCount > 0) {
			cardCount--;
			this.addNodes({
				PlayCard: new PlayCardNode(cardCount)
			});
		}
	}
	
	var RootNode = function (lastNode) {
		GameNode.apply(this, arguments);
		
		this.addNodes({
			PlayCard: new PlayCardNode(6),
			Envido: new EnvidoNode(0),
			RealEnvido: new RealEnvidoNode(0),
			FaltaEnvido: new FaltaEnvidoNode(0),
			Truco: new TrucoNode(0)
		});
	}
	
	/*
	 * Esta clase ahora usa un singleton pero esta pensada como para que se pueda cambiar la implementacion y que
	 * getInstance pueda no devolver siempre la misma instancia, por si se quisiera tener mas de un
	 * juego en ejecución al mismo tiempo 
	 */
	var GameFlowState = new function() {
		var _instance = null;
		
		var GameFlowState = function () {
			var _firstSectionFlow;
			var _secondSectionFlow;
			var _cardPlaying;
			
			this.getNodes = function () {
				var nodes = {};
//				_utils.copyObject(nodes, this.firstSectionFlow);
				_utils.copyObject(nodes, this.secondSectionFlow);
				_utils.copyObject(nodes, this.cardPlaying);
				return nodes;
			}
			
			this.update = function (action, node) {
				switch(action.type) {
					case ActionType.Message:
						switch(action.message.type) {
							case MessageType.firstSectionChallenge:
								_firstSectionFlow = node;
								break;
							case MessageType.SecondSectionChallenge:
								_secondSectionFlow = node;
								break;
						}
					case ActionType.Card:
						_cardPlaying = node;
						break;
				}
			}
			
			this.init = function () {
				
			}
		}
		GameFlowState.getInstance = function () {
			if(!_instance) {
				_instance = new GameFlowState();
			}
			return _instance;
		}
		return GameFlowState;
	}
	
	var ActionRunner = function () {
		var _currentNode = new RootNode();
		var _gameFlowState = GameFlowState.getInstance();
		var _childNodes;

		this.execute = function(action) {
			if(!_childNodes) {
				throw new Error("setNextPlayer must be call before the execute method")
			}
			switch(action.type) {
				case ActionType.Message:
					_currentNode = _childNodes.select(action.message.name);
					break;
				case ActionType.Card:
					_currentNode = _childNodes.select("PlayCard");
					break;
			}
			_gameFlowState.update(action, _currentNode);
			return _currentNode;
		}
		this.setNextPlayer = function (player) {
			_childNodes = _currentNode.getChildNodes(player.state);
		}
		this.getActions = function () {
			return _childNodes;
		}
	}
	
	var PlayerData = function (playerHandler) {
		this.envidoScore = 0;
		this.pointsEarned = 0;
		this.state = {
			hasQuiero: true,
			firstSectionChallengeAvailable: true
		}
		this.handler = playerHandler;
	}
	
	var PlayerManager = function (player1, player2) {
		var _currentPlayer = player1;
		this.getNextPlayer = function () {
			return _currentPlayer = _currentPlayer==player1? player2: player1;
		}
	}
	
	this.GameManager = function (player1, player2) {
		var _runner = new ActionRunner();
		var _player1 = new PlayerData(player1);
		var _player2 = new PlayerData(player2);
		var _playerManager = new PlayerManager(_player1, _player2);
		var _deck = new NSDeck.SpanishDeck(new NSDeck.DeckShuffler());
		
		var dealCards = function () {
			_deck.shuffle();
			player1.initHand(_deck.takeCard(3));
			player2.initHand(_deck.takeCard(3));
		}
		dealCards();
		
		
		while(true) {
			var nextPlayer = _playerManager.getNextPlayer();
			_runner.setNextPlayer(nextPlayer);
			var action = nextPlayer.handler.play(_runner.getActions());
			if(!_runner.execute(action)) {
				break;
			}
		};
	}
}
	
new Server.GameManager(new Player1, new Player2);
