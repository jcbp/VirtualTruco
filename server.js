
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
	 * Tipos de respuestas...
	 */
	var ReplyType = {
		FirstSectionQuiero: "FirstSectionQuiero",
		FirstSectionNoQuiero: "FirstSectionNoQuiero",
		SecondSectionQuiero: "SecondSectionQuiero",
		SecondSectionNoQuiero: "SecondSectionNoQuiero"
	};
	
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
	 * Define una respuesta de apuesta (Quiero, NoQuiero)
	 */
	var ReplyNode = function (value, playCardBranch, trucoBranch) {
		BaseNode.apply(this, arguments);
		this.name = "Reply";
		this.value = value;
		
		this.addBranch(playCardBranch);
		this.addBranch(trucoBranch);
	}
	
	/*
	 * Concrete Quiero (First Section)
	 */
	var FirstSectionQuieroNode = function (value, playCardBranch, trucoBranch) {
		ReplyNode.apply(this, arguments);
		this.type = this.name = ReplyType.FirstSectionQuiero;
	}
	
	/*
	 * Concrete NoQuiero (First Section)
	 */
	var FirstSectionNoQuieroNode = function (value, playCardBranch, trucoBranch) {
		ReplyNode.apply(this, arguments);
		this.type = this.name = ReplyType.FirstSectionNoQuiero;
	}
	
	/*
	 * Concrete Quiero (Second Section)
	 */
	var SecondSectionQuieroNode = function (value, playCardBranch, trucoBranch) {
		ReplyNode.apply(this, arguments);
		this.type = this.name = ReplyType.SecondSectionQuiero;
	}
	
	/*
	 * Concrete NoQuiero (Second Section)
	 */
	var SecondSectionNoQuieroNode = function (value, playCardBranch, trucoBranch) {
		// end hand: empty node
		BaseNode.apply(this, arguments);
		this.type = this.name = ReplyType.SecondSectionNoQuiero;
		this.value = value;
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
		
		this.setValues = function (acceptedValue, declinedValue) {
			this.addNodes({
				Quiero: new FirstSectionQuieroNode(acceptedValue, playCardBranch, trucoBranch),
				NoQuiero: new FirstSectionNoQuieroNode(declinedValue, playCardBranch, trucoBranch)
			});
		}
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
		
		this.setValues = function (acceptedValue, declinedValue) {
			this.addNodes({
				Quiero: new SecondSectionQuieroNode(acceptedValue, playCardBranch, trucoBranch),
				NoQuiero: new SecondSectionNoQuieroNode(declinedValue, playCardBranch, trucoBranch)
			});
		}
	}
	
	/*
	 * Concrete Node Envido
	 */
	var EnvidoNode = function (previousValue, playCardBranch, trucoBranch) {
		FirstSectionChallengeNode.apply(this, arguments);
		this.name = "Envido";
		
		var _intrinsicValue = 2;
		var _acceptedValue = previousValue + _intrinsicValue;
		var _declinedValue = previousValue || 1;
		
		this.setValues(_acceptedValue, _declinedValue);
		
		var _messageNode = {
			RealEnvido: new RealEnvidoNode(_acceptedValue, playCardBranch, trucoBranch),
			FaltaEnvido: new FaltaEnvidoNode(_acceptedValue, playCardBranch, trucoBranch)
		};
		if(previousValue==0)
			_messageNode.Envido = new EnvidoNode(_acceptedValue, playCardBranch, trucoBranch);

		this.addNodes(_messageNode);
		this.setAsEnumerable();
	}
	
	/*
	 * Concrete Node RealEnvido
	 */
	var RealEnvidoNode = function (previousValue, playCardBranch, trucoBranch) {
		FirstSectionChallengeNode.apply(this, arguments);
		this.name = "RealEnvido";
		
		var _intrinsicValue = 3;
		var _acceptedValue = previousValue + _intrinsicValue;
		var _declinedValue = previousValue || 1;
		
		this.setValues(_acceptedValue, _declinedValue);
		
		this.addNodes({
			FaltaEnvido: new FaltaEnvidoNode(_acceptedValue, playCardBranch, trucoBranch)
		});
		this.setAsEnumerable();
	}
	
	/*
	 * Concrete Node FaltaEnvido
	 */
	var FaltaEnvidoNode = function (previousValue, playCardBranch, trucoBranch) {
		FirstSectionChallengeNode.apply(this, arguments);
		this.name = "FaltaEnvido";
		
		var _intrinsicValue = 6;
		var _acceptedValue = previousValue + _intrinsicValue;
		var _declinedValue = previousValue || 1;
		
		this.setValues(_acceptedValue, _declinedValue);
		
		this.setAsEnumerable();
	}
	
	/*
	 * Concrete Node Truco
	 */
	var TrucoNode = function (previousValue, playCardBranch, trucoBranch, envidoBranch) {
		SecondSectionChallengeNode.apply(this, arguments);
		this.name = "Truco";

		var _intrinsicValue = 2;
		var _acceptedValue = previousValue + _intrinsicValue;
		var _declinedValue = previousValue || 1;
		
		this.setValues(_acceptedValue, _declinedValue);
		
		this.addNodes({
			ReTruco: new ReTrucoNode(_acceptedValue, playCardBranch, trucoBranch, envidoBranch)
		});
		this.setAsEnumerable();
		this.addBranch(envidoBranch);
	}
	
	/*
	 * Concrete Node ReTruco
	 */
	var ReTrucoNode = function (previousValue, playCardBranch, trucoBranch, envidoBranch) {
		SecondSectionChallengeNode.apply(this, arguments);
		this.name = "ReTruco";
		
		var _intrinsicValue = 1;
		var _acceptedValue = previousValue + _intrinsicValue;
		var _declinedValue = previousValue || 1;
		
		this.setValues(_acceptedValue, _declinedValue);
		
		this.addNodes({
			ValeCuatro: new ValeCuatroNode(_acceptedValue, playCardBranch, trucoBranch, envidoBranch)
		});
		this.setAsEnumerable();
	}
	
	/*
	 * Concrete Node ValeCuatro
	 */
	var ValeCuatroNode = function (previousValue, playCardBranch, trucoBranch, envidoBranch) {
		SecondSectionChallengeNode.apply(this, arguments);
		this.name = "ValeCuatro";

		var _intrinsicValue = 1;
		var _acceptedValue = previousValue + _intrinsicValue;
		var _declinedValue = previousValue || 1;
		
		this.setValues(_acceptedValue, _declinedValue);
		
		this.setAsEnumerable();
	}
	
	/*
	 * Concrete Node PlayCard
	 */
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

	/*
	 * Concrete Node Root
	 */
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

	/*
	 * Representa una rama en el flujo del juego
	 */
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
	
	/*
	 * Se realiza el seguimiento de puntos de cada apuesta.
	 * Los puntos no son asignados a ningun jugador, solo se va guardando hasta donde se levantó las apuestas
	 */
	var PointTracker = function () {
		var _firstSectionPoints = 0;
		var _secondSectionPoints = 1;
		
		this.evaluateNode = function (node) {
			switch(node.type) {
				case ReplyType.FirstSectionQuiero:
				case ReplyType.FirstSectionNoQuiero:
					_firstSectionPoints = node.value;
					break;
				case ReplyType.SecondSectionQuiero:
				case ReplyType.SecondSectionNoQuiero:
					_secondSectionPoints = node.value;
					break;
			}
		}
		
		this.getFirstSectionPoints = function () {
			return _firstSectionPoints;
		}
		
		this.getSecondSectionPoints = function () {
			return _secondSectionPoints;
		}
	}
	
	/*
	 * Ejecuta las acciones realizadas por los jugadores
	 */
	var ActionRunner = function (playerManager, cardProcessor, envidoProcessor, pointTracker) {
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
						pointTracker.evaluateNode(_currentNode);
						if(action.message.type==MessageType.SecondSectionChallenge) {
							_trucoBranch.setNodes(_currentNode.getNodes());
							playerManager.setupQuiero(_currentPlayer);
						}
						else if(action.message.type==MessageType.FirstSectionChallenge) {
							playerManager.openFirstSection(_currentPlayer);
						}
						else if(action.message.type==MessageType.Reply) {
							envidoProcessor.playEnvido(_currentPlayer, _currentNode);
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
	
	/*
	 * Procesamiento de apuestas de la primer sección (envido)
	 */
	var EnvidoProcessor = function (playerManager, pointTracker) {
		
		var setWinner = function (player) {
			
			Log.add({"Gano el tanto": player.handler.name});
			var log={};
			log[player.handler.name] = (new CommonAPI.CardSet(player.cards)).calculateEnvido();
			var opponent = playerManager.getOpponent(player);
			log[opponent.handler.name] = (new CommonAPI.CardSet(opponent.cards)).calculateEnvido();
			Log.add(log);
			
			player.pointsEarned += pointTracker.getFirstSectionPoints();
		}
		
		var evalEnvido = function (player) {
			var opponent = playerManager.getOpponent(player);
			var playerCardSet = new CommonAPI.CardSet(player.cards);
			var opponentCardSet = new CommonAPI.CardSet(opponent.cards);
			var playerScore = playerCardSet.calculateEnvido();
			var opponentScore = opponentCardSet.calculateEnvido();
			
			if(playerScore > opponentScore) {
				setWinner(player);
			}
			else if(playerScore < opponentScore) {
				setWinner(opponent);
			}
			else {
				setWinner(playerManager.getHandPlayer());
			}
		}
		
		this.playEnvido = function (player, node) {
			if(node.type == ReplyType.FirstSectionQuiero) {
				evalEnvido(player);
			}
			else if(node.type == ReplyType.FirstSectionNoQuiero) {
				setWinner(playerManager.getOpponent(player));
			}
		}
	}
	
	/*
	 * Procesamiento del juego de cartas
	 */
	var CardPlayingProcessor = function (playerManager, pointTracker) {
		var _cardSet = new CommonAPI.CardSet();
		var _handPoints = [100, 50, 100];
		var _nextPlayer = playerManager.getHandPlayer();
		var _lastPlayer = null;
		
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
				_nextPlayer = playerManager.getHandPlayer();
			}
		}
		
		var evalWinner = function (player1, player2) {
			var max = Math.max(player1.trucoCicle.score, player2.trucoCicle.score);
			if(max >= 150) {
				var player = player1.trucoCicle.score==max? player1: player2;
				setWinner(player);
				_nextPlayer = null;
			}
		}
		
		var setWinner = function (player) {
			Log.add({"Gano segunda parte": player.handler.name});
			player.pointsEarned += pointTracker.getSecondSectionPoints();
			_lastPlayer = null;
		}
		
		this.playCard = function (player, card) {
			player.trucoCicle.currentCard = card;
			
			if(_lastPlayer && (playerManager.getOpponent(_lastPlayer) != player)) {
				Log.add({Error: "error en el cambio de turnos"});
			}
			
			if(_lastPlayer) {
				evalHand(_lastPlayer, player);
				evalWinner(_lastPlayer, player);
				_lastPlayer = null;
			}
			else {
				_lastPlayer = player;
				_nextPlayer = playerManager.getOpponent(_nextPlayer);
			}
		}
		
		this.closeHand = function (player) {
			setWinner(player);
		}
		
		this.getNextPlayer = function () {
			return _nextPlayer;
		}
	}
	
	/*
	 * Datos de estado del jugador
	 */
	var PlayerData = function (playerHandler) {

		/*
		 * datos generales
		 */ 
		this.pointsEarned = 0;
		this.isHand = false;
		this.cards = [];

		
		/*
		 * datos para uso interno en el procesamiento de la segunda sección (truco)
		 */
		this.trucoCicle = {
			score: 0,
			currentCard: null
		};
		
		/*
		 * estados para los requerimientos o filtros de los nodos
		 */
		this.state = {
			hasQuiero: true,
			firstSectionIsOpen: true
		}
		
		/*
		 * jugador concreto
		 */
		this.handler = playerHandler;
		
		/*
		 * establece al jugador como mano
		 */
		this.setAsHand = function () {
			this.isHand = true;
			this.trucoCicle.score = 1;
		}
		
		this.revokeHand = function () {
			this.isHand = false;
			this.trucoCicle.score = 0;
		}
		
		this.setCards = function (cards) {
			this.cards = _utils.copyArray(cards);
		}
		
		this.clearHand = function () {
			this.trucoCicle = {
				score: 0,
				currentCard: null
			};
			this.state = {
				hasQuiero: true,
				firstSectionIsOpen: true
			};
			this.cards = [];
		}
	}
	
	/*
	 * Maneja los estados del jugador (PlayerData.state)
	 * Centraliza el manejo de turnos
	 */
	var PlayerManager = function (player1, player2) {
		
		var _currentPlayer;

		var init = function () {
			_currentPlayer = getHandPlayer();
			if(!_currentPlayer) {
				throw new Error("No hand player");
			}
		}
		
		var switchHandPlayer = function () {
			var currentHand = getHandPlayer();
			var nextHand = getOpponent(currentHand);
			currentHand.revokeHand();
			nextHand.setAsHand();
		}
		
		var getOpponent = function (player) {
			return player==player1? player2: (player==player2? player1: null);
		}
		
		var getHandPlayer = getHandPlayer = function () {
			return player1.isHand? player1: (player2.isHand? player2: null);
		}
		init();

		this.setNextPlayer = function (player) {
			_currentPlayer = player;
		}
		
		this.getHandPlayer = getHandPlayer;
		
		this.getOpponent = getOpponent;
		
		this.switchPlayer = function () {
			_currentPlayer = getOpponent(_currentPlayer);
		}
		
		this.getNextPlayer = function () {
			return _currentPlayer;
		}
		
		this.setupQuiero = function (player) {
			player.state.hasQuiero = false;
			getOpponent(player).state.hasQuiero = true;
		}
		
		this.closeFirstSection = function (player) {
			player.state.firstSectionIsOpen = false;
		}
		
		this.openFirstSection = function (player) {
			getOpponent(player).state.firstSectionIsOpen = true;
		}
		
		this.closeSecondSection = function () {
			_currentPlayer = null;
		}
		
		this.getPlayer1 = function () {
			return player1;
		}
		
		this.getPlayer2 = function () {
			return player2;
		}
		
		this.newHand = function () {
			player1.clearHand();
			player2.clearHand();
			switchHandPlayer();
			init();
		}
	}
	
	this.GameManager = function (playerHandler1, playerHandler2) {
		var _player1 = new PlayerData(playerHandler1);
		var _player2 = new PlayerData(playerHandler2);
		_player1.setAsHand();
		
		var _pointCount = new PointTracker();
		var _playerManager = new PlayerManager(_player1, _player2);
		var _cardProcessor = new CardPlayingProcessor(_playerManager, _pointCount);
		var _envidoProcessor = new EnvidoProcessor(_playerManager, _pointCount);
		var _runner = new ActionRunner(_playerManager, _cardProcessor, _envidoProcessor, _pointCount);
		
		
		var dealCards = function () {
			var _deck = new NSDeck.SpanishDeck(new NSDeck.DeckShuffler());
			_deck.shuffle();
			var cards1 = _deck.takeCard(3);
			var cards2 = _deck.takeCard(3);
			_player1.handler.initHand(cards1);
			_player2.handler.initHand(cards2);
			_player1.setCards(cards1);
			_player2.setCards(cards2);
		}
		dealCards();


		var endOfHand = function () {
			showLog();
			_playerManager.newHand();
			var _pointCount = new PointTracker();
			var _cardProcessor = new CardPlayingProcessor(_playerManager, _pointCount);
			_runner = new ActionRunner(_playerManager, _cardProcessor, _envidoProcessor, _pointCount);
			dealCards();
			//clearInterval(interval);
		}
		var interval = setInterval(function() {
			var nextPlayer = _playerManager.getNextPlayer();
			if(nextPlayer) {
				_runner.setNextPlayer(nextPlayer);
				var actions = _runner.getActions();
				if(actions.isEmpty()) {
					endOfHand();
				}
				else {
					var action = nextPlayer.handler.play(actions);
					if(!_runner.execute(action)) {
						endOfHand();
					}
				}
			}
			else {
				endOfHand();
			}
		}, 500);
		

		var showLog = function () {
			var log = {};
			log["-----------------------"] = "------------------------------<br>";
			log["--" + _player1.handler.name] = _player1.pointsEarned;
			log["--" + _player2.handler.name] = _player2.pointsEarned;
			Log.add(log);
			Log.add({"-----------------------": "------------------------------<br>"});
		}
		
	}
}
	
new Server.GameManager(new RandomPlayer("Randomio"), new RandomPlayer("Randamia"));
