var HTTPLoader = function(url,method,scope,func){
    var _ready, _cancel;
    var _cnn    =  window.XMLHttpRequest ? new XMLHttpRequest( ) : new ActiveXObject("Microsoft.XMLHTTP");    
    this.method =  method || "Post";  
    
    this.data = function(){
        return _cnn.responseText;
    }
    
    this.load  = function(url){
        url = url || _url;
        if(!url)return;
        _cnn.open(this.method,url,true);
        _cnn.send(null);
    }
    
    this.setReadyCallback = function(scope,func){
       _ready = {handler:func,scope:scope};
    }
    
    this.setCancelCallback = function(scope,func){
        _cancel = {handler:func,scope:scope};
    }
    
    this.addRequestHeader = function(type,content){
        _cnn.setRequestHeader( type, content );
    }
    
    var callbackHandler = function(){
        var req        
        if(_ready.handler && _cnn.readyState == 4){
            req = _cnn.status && /200|304/.test( _cnn.status ) ? _ready : _cancel;
            req.handler.call(req.scope,_cnn.responseText);
        }
    }
    
    _url     = url;    
    _cnn.onreadystatechange = callbackHandler;
    this.setReadyCallback(scope,func);
    this.setCancelCallback(scope,function(){alert("Error")});
    
}


var Log = new function () {
    var _output = document.createElement("div");    
    _output.style.fontFamily = "Courier New";
    _output.style.fontSize   = "11px";
    document.body.appendChild(_output);
    
    var addColumn = function (str) {
        var len = 20 - (str+'').length;
        var pipePos = 15 - (str+'').length;
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

    this.save = function(p1,p2){        
        new HTTPLoader("http:/www.trucoai.com.ar?data="+escape(_output.innerHTML)+"&p1="+p1+"&p2="+p2,"Get").load();        
    }
}


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
	
	this.copyObject = function (obj, obj2) {
		for(var i in obj2) {
			if(obj2.hasOwnProperty(i)) {
				obj[i] = obj2[i];
			}
		}
		return obj;
	};
	
	this.EventManager = function () {
		var _events = {};
		this.add = function (eventName, callback) {
			if(!_events[eventName])
				_events[eventName] = [];
			_events[eventName].push(callback);
		}
		this.fire = function (eventName) {
			if(_events[eventName]) {
				for (var i=0; i < _events[eventName].length; i++) {
					_events[eventName][i]();
				};
			}
		}
	}
}

/*
 * API
 */
var CommonAPI = new function () {
	this.ENVIDO 		= "Envido"
	this.REAL_ENVIDO	= "RealEnvido";
	this.FALTA_ENVIDO 	= "FaltaEnvido";
	this.TRUCO 		= "Truco";
	this.RE_TRUCO	 	= "ReTruco";
	this.VALE_CUATRO	= "ValeCuatro";
	this.QUIERO 		= "Quiero";
	this.NO_QUIERO 		= "NoQuiero";
	this.GO_TO_DECK		= "GoToDeck";
	this.POST_SCORE 	= "PostScore";
	this.PLAY_CARD 		= "PlayCard";
	this.SON_BUENAS		= "SonBuenas";

	this.ActionFactory = new function () {

		this.createEnvido = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.Envido);
		}
		
		this.createRealEnvido = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.RealEnvido);
		}
		
		this.createFaltaEnvido = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.FaltaEnvido);
		}
		
		
		this.createSonBuenas = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.SonBuenas);
		}
		
		
		this.createTruco = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.Truco);
		}
		
		
		this.createReTruco = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.ReTruco);
		}
		
		
		this.createValeCuatro = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.ValeCuatro);
		}
	
		this.createQuiero = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.Quiero);
		}
		
		this.createNoQuiero = function () {
			return new Server.Action(Server.ActionType.Message, Server.Messages.NoQuiero);
		}
		
		this.createPostScore = function (score) {
			return new Server.Action(Server.ActionType.PostScore, score);
		}
		
		this.createPlayCard = function (card) {
			return new Server.Action(Server.ActionType.Card, card);
		}
		
		this.createGoingToDeck = function (cards) {
			return new Server.Action(Server.ActionType.GoingToDeck,cards);
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
	
	this.CardSet = function (cards) {
		
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