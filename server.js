
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
	var NodeCollection = function (nodes, state) {
		var _nodes = {};
		var _isEmpty = true;
		
		for(var i in nodes) {
			if(nodes.hasOwnProperty(i)) {
				if(nodes[i].evalRequirement(state)) {
					_nodes[i] = nodes[i];
					_isEmpty = false;
				}
			}
		}
		
		this.isEmpty = function () {
			return _isEmpty;
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
	var BaseNode = function () {
		var _nodes = {};
		var _requires = [];
		var _branches = [];
		var _enumerable = false;
		
		this.name = "Base";
		
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
		
		this.addBranch = function (branch) {
			if(branch) {
				_branches.push(branch);
			}
		}

		this.requires = function (func) {
			_requires.push(func);
		}
		
		this.getChildNodes = function (state) {
			var nodes = {};
			_utils.copyObject(nodes, _nodes);
			if(_branches) {
				for (var i=0; i < _branches.length; i++) {
					_utils.copyObject(nodes, _branches[i].getEnumerableNodes());
				};
			}
			return new NodeCollection(nodes, state);
		}
		
		this.setAsEnumerable = function () {
			_enumerable = true;
		}
		
		this.isEnumerable = function () {
			return !!_enumerable;
		}
		
		this.getNodes = function() {
			return _nodes;
		}
	}
	
	/*
	 * Quiero, NoQuiero
	 */
	var ReplyNode = function (playCardBranch, trucoBranch) {
		BaseNode.apply(this, arguments);
		this.name = "Reply";
		
		this.addBranch(playCardBranch);
		this.addBranch(trucoBranch);
	}
	
	var NoQuieroNode = function () {
		BaseNode.apply(this, arguments);
		this.name = "NoQuiero";
	}
	
	
	/*
	 * Nodos de la primer parte del juego (envido)
	 */
	var FirstSectionChallengeNode = function (previousValue, playCardBranch, trucoBranch) {
		BaseNode.apply(this, arguments);
		this.name = "FirstSectionChallenge";

		this.requires(function(state) {
			return !!state.firstSectionIsOpen;
		});
		this.addNodes({
			Quiero: new ReplyNode(playCardBranch, trucoBranch),
			NoQuiero: new ReplyNode(playCardBranch, trucoBranch)
		});
	}
	
	/*
	 * Nodos de la segunda parte del juego (truco)
	 */
	var SecondSectionChallengeNode = function (previousValue, playCardBranch, trucoBranch) {
		BaseNode.apply(this, arguments);
		this.name = "SecondSectionChallenge";

		this.requires(function(state) {
			return !!state.hasQuiero;
		});
		this.addNodes({
			Quiero: new ReplyNode(playCardBranch, trucoBranch),
			NoQuiero: new NoQuieroNode()
		});
	}
	
	var EnvidoNode = function (previousValue, playCardBranch, trucoBranch) {
		FirstSectionChallengeNode.apply(this, arguments);
		this.name = "Envido";
		
		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		var _messageNode = {
			RealEnvido: new RealEnvidoNode(this.accepted, playCardBranch, trucoBranch),
			FaltaEnvido: new FaltaEnvidoNode(this.acceptedValue, playCardBranch, trucoBranch)
		};
		if(previousValue==0)
			_messageNode.Envido = new EnvidoNode(this.acceptedValue, playCardBranch, trucoBranch);

		this.addNodes(_messageNode);
		this.setAsEnumerable();
	}
	
	var RealEnvidoNode = function (previousValue, playCardBranch, trucoBranch) {
		FirstSectionChallengeNode.apply(this, arguments);
		this.name = "RealEnvido";
		
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.addNodes({
			FaltaEnvido: new FaltaEnvidoNode(this.acceptedValue, playCardBranch, trucoBranch)
		});
		this.setAsEnumerable();
	}
	
	var FaltaEnvidoNode = function (previousValue, playCardBranch, trucoBranch) {
		FirstSectionChallengeNode.apply(this, arguments);
		this.name = "FaltaEnvido";
		
		this.intrinsicValue = 3;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.setAsEnumerable();
	}
	
	var TrucoNode = function (previousValue, playCardBranch, trucoBranch, envidoBranch) {
		SecondSectionChallengeNode.apply(this, arguments);
		this.name = "Truco";

		this.intrinsicValue = 2;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.addNodes({
			ReTruco: new ReTrucoNode(this.acceptedValue, playCardBranch, trucoBranch, envidoBranch)
		});
		this.setAsEnumerable();
		this.addBranch(envidoBranch);
	}
	
	var ReTrucoNode = function (previousValue, playCardBranch, trucoBranch, envidoBranch) {
		SecondSectionChallengeNode.apply(this, arguments);
		this.name = "ReTruco";
		
		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.addNodes({
			ValeCuatro: new ValeCuatroNode(this.acceptedValue, playCardBranch, trucoBranch, envidoBranch)
		});
		this.setAsEnumerable();
	}
	
	var ValeCuatroNode = function (previousValue, playCardBranch, trucoBranch, envidoBranch) {
		SecondSectionChallengeNode.apply(this, arguments);
		this.name = "ValeCuatro";

		this.intrinsicValue = 1;
		this.acceptedValue = previousValue + this.intrinsicValue;
		this.declinedValue = previousValue || 1;
		
		this.setAsEnumerable();
	}
	
	var PlayCardNode = function (cardCount, trucoBranch, envidoBranch) {
		BaseNode.apply(this, arguments);
		this.name = "PlayCard";

		// Se crea la cantidad de nodos como de cartas haya: se juegan 6 cartas (3 + 3)
		if(cardCount > 0) {
			cardCount--;
			this.addNodes({
				PlayCard: new PlayCardNode(cardCount, trucoBranch)
			});
		}
		this.addBranch(trucoBranch);
		this.addBranch(envidoBranch);
		this.setAsEnumerable();
	}

	var RootNode = function (playCardBranch, trucoBranch, envidoBranch) {
		BaseNode.apply(this, arguments);
		this.name = "Root";

		playCardBranch.setNodes({
			PlayCard: new PlayCardNode(5, trucoBranch, envidoBranch)	// de 0 a 5 => 6 cartas
		});
		trucoBranch.setNodes({
			Truco: new TrucoNode(0, playCardBranch, trucoBranch, envidoBranch)
		});
		envidoBranch.setNodes({
			Envido: new EnvidoNode(0, playCardBranch, trucoBranch),
			RealEnvido: new RealEnvidoNode(0, playCardBranch, trucoBranch),
			FaltaEnvido: new FaltaEnvidoNode(0, playCardBranch, trucoBranch)
		});

		this.addNodes(envidoBranch.getNodes());
		this.addNodes(playCardBranch.getNodes());
		this.addNodes(trucoBranch.getNodes());
	}

	var Branch = function () {
		var _nodes;
		var _enumerableNodes;
		
		this.setNodes = function (nodes) {
			_enumerableNodes = {};
			for(var i in nodes) {
				if(nodes.hasOwnProperty(i)) {
					if(nodes[i].isEnumerable()) {
						_enumerableNodes[i] = nodes[i];
					}
				}
			}
			_nodes = nodes;
		}
		
		this.getNodes = function () {
			return _nodes;
		}
		
		this.getEnumerableNodes = function () {
			return _enumerableNodes;
		}
	}
	
	var ActionRunner = function (playerManager, cardProcessor) {
		var _playCardBranch = new Branch();
		var _trucoBranch = new Branch();
		var _envidoBranch = new Branch();
		var _currentNode = new RootNode(_playCardBranch, _trucoBranch, _envidoBranch);
		var _childNodes;
		var _currentPlayer;

		this.execute = function(action) {
			playerManager.closeFirstSection(_currentPlayer);
			if(!_childNodes) {
				throw new Error("setNextPlayer must be call before the execute method");
			}
			switch(action.type) {
				case ActionType.Message:
					_currentNode = _childNodes.select(action.message.name);
					if(_currentNode) {
						if(action.message.type==MessageType.SecondSectionChallenge) {
							_trucoBranch.setNodes(_currentNode.getNodes());
							playerManager.setupQuiero(_currentPlayer);
						}
						else if(action.message.type==MessageType.FirstSectionChallenge) {
							playerManager.openFirstSection(_currentPlayer);
						}
						
						// ESTAR ATENTO DE ESTE CODIGO
						if(_currentNode.getChildNodes(_currentPlayer.state).select("PlayCard")) {
							playerManager.setNextPlayer(cardProcessor.getNextPlayer());
						}
						else {
							playerManager.switchPlayer();
						}
						// **** DEJAR DE ESTAR ATENTO
					}
					break;
				case ActionType.Card:
					_currentNode = _childNodes.select("PlayCard");
					if(_currentNode) {
						_playCardBranch.setNodes(_currentNode.getNodes());
					}
					
					cardProcessor.playCard(_currentPlayer, action.card);
					playerManager.setNextPlayer(cardProcessor.getNextPlayer());
					break;
			}
			return _currentNode;
		}
		this.setNextPlayer = function (player) {
			_currentPlayer = player;
			_childNodes = _currentNode.getChildNodes(player.state);
			if(_childNodes.isEmpty()) {
				cardProcessor.closeHand(player);
			}
		}
		this.getActions = function () {
			return _childNodes;
		}
	}
	
	var CardPlayingProcessor = function (player1, player2) {
		var _cardSet = new CommonAPI.CardSet();
		var _handPoints = [100, 50, 100];
		var _nextPlayer = player1.isHand? player1: player2;
		var _lastPlayer = null;
		
		var getHandPlayer = function () {
			return player1.isHand? player1: player2;
		}
		
		var evalHand = function (player1, player2) {
			var cardWeight1 = _cardSet.getCardWeight(player1.trucoCicle.currentCard);
			var cardWeight2 = _cardSet.getCardWeight(player2.trucoCicle.currentCard);
			var points = _handPoints.pop();
			
			if(cardWeight1 < cardWeight2) {
				player1.trucoCicle.score += points;
				_nextPlayer = player1;
			}
			else if(cardWeight1 > cardWeight2) {
				player2.trucoCicle.score += points;
				_nextPlayer = player2;
			}
			else {
				player1.trucoCicle.score += points;
				player2.trucoCicle.score += points;
				_nextPlayer = getHandPlayer();
			}
		}
		
		var evalWinner = function (player1, player2) {
			var max = Math.max(player1.trucoCicle.score, player2.trucoCicle.score);
			if(max >= 150) {
				var player = player1.trucoCicle.score==max? player1: player2;
				player.trucoCicle.isWinner = true;
				_nextPlayer = null;
			}
		}
		
		var switchPlayer = function () {
			_nextPlayer = _nextPlayer==player1? player2: player1;
		}
		
		this.playCard = function (player, card) {
			player.trucoCicle.currentCard = card;
			if(_lastPlayer) {
				evalHand(_lastPlayer, player);
				evalWinner(_lastPlayer, player);
				_lastPlayer = null;
			}
			else {
				_lastPlayer = player;
				switchPlayer();
			}
		}
		
		this.closeHand = function (player) {
			player.trucoCicle.isWinner = true;
		}
		
		this.getNextPlayer = function () {
			return _nextPlayer;
		}
	}
	
	var PlayerData = function (playerHandler) {
		this.envidoScore = 0;
		this.pointsEarned = 0;
		this.isHand = false;
		this.trucoCicle = {
			score: 0,
			isWinner: false,
			currentCard: null
		};
		this.state = {
			hasQuiero: true,
			firstSectionIsOpen: true
		}
		this.handler = playerHandler;
		this.setAsHand = function () {
			this.isHand = true;
			this.trucoCicle.score = 1;
		} 
	}
	
	var PlayerManager = function (player1, player2) {
		var _currentPlayer = player1.isHand? player1: (player2.isHand? player2: null);
		if(!_currentPlayer) {
			throw new Error("No hand player");
		}

		this.setNextPlayer = function (player) {
			_currentPlayer = player;
		}
		this.switchPlayer = function () {
			_currentPlayer = _currentPlayer==player1? player2: player1;
		}
		this.getNextPlayer = function () {
			return _currentPlayer;
		}
		this.setupQuiero = function (player) {
			player.state.hasQuiero = false;
			var theOtherPlayer = player==player1? player2: player1;
			theOtherPlayer.state.hasQuiero = true;
		}
		this.closeFirstSection = function (player) {
			player.state.firstSectionIsOpen = false;
		}
		this.openFirstSection = function (player) {
			var theOtherPlayer = player==player1? player2: player1;
			theOtherPlayer.state.firstSectionIsOpen = true;
		}
		this.closeSecondSection = function () {
			_currentPlayer = null;
		}
	}
	
	this.GameManager = function (player1, player2) {
		var _player1 = new PlayerData(player1);
		var _player2 = new PlayerData(player2);
		_player1.setAsHand();
		
		var _cardProcessor = new CardPlayingProcessor(_player1, _player2);
		var _playerManager = new PlayerManager(_player1, _player2);
		var _runner = new ActionRunner(_playerManager, _cardProcessor);
		var _deck = new NSDeck.SpanishDeck(new NSDeck.DeckShuffler());
		
		var dealCards = function () {
			_deck.shuffle();
			player1.initHand(_deck.takeCard(3));
			player2.initHand(_deck.takeCard(3));
		}
		dealCards();

		var nextPlayer;
		while(nextPlayer = _playerManager.getNextPlayer()) {
			_runner.setNextPlayer(nextPlayer);
			var actions = _runner.getActions();
			if(actions.isEmpty()) {
				break;
			}
			var action = nextPlayer.handler.play(actions);
			if(!_runner.execute(action)) {
				break;
			}
		};
		alert((_player1.trucoCicle.isWinner? _player1.handler.name: (_player2.trucoCicle.isWinner? _player2.handler.name: "ERROR")) + " Win");
	}
}
	
new Server.GameManager(new RandomPlayer("Randomio"), new RandomPlayer("Randamia"));
