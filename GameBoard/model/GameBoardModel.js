/**
 * GameBoardModel Class
 */
var GameBoardModel = function () {
	// Constante de velocidad del reproductor
	this.SPEED = 1800;
	
	// Define los estados del modelo
	this.states = {
		DEALING: "dealing",
		PLAYING: "playing",
		PAUSED: "paused"
	};
	
	// Define los multiplicadores de velocidad
	this.speedMultipliers = {
		NORMAL: 1,
		FAST: 0.6,
		FASTER: 0.3
	}
	
	// Define los distintos tipos de eventos
	// TO-DO: Deben tomarse desde el mismo namespace que lo hace el server.
	this.eventTypes = {
		HAND_START: "HandStart",
		HAND_ENDED: "HandEnded",
		CARD: "Card"
	};

	this._match;
	this._events = new Array();
	this._curEvent = 0;
	this._state = this.states.PAUSED;
	this._speedMultiplier = this.speedMultipliers.NORMAL;
	this._players = new Array();
	
	this._animate = false;
		
	var _this = this;
	
	// Crea los eventos necesarios
	this.matchLoaded = new Event(this);
	this.update = new Event(this);
	this.play = new Event(this);
	this.pause = new Event(this);
	
	this.timerTick = function() {
		var event = _this._curEvent + 1;
		_this.setEvent(event);
		
		if (event >= _this._events.length)
			_this.setState(_this.states.PAUSED);
	};
	
	this._timer = new Timer(this.SPEED * this._speedMultiplier, this.timerTick);
};

GameBoardModel.prototype = {
	loadMatch: function(matchId) {
		$.ajax({
			url: 'http://aitruco.com.ar/get.php?jsoncallback=?',
			dataType: "jsonp",
			data: { id: matchId },
			context: this,
			success: function(data) {
				this._match = data;
				this.init();
			}
		});
	},
	
	init: function() {
		var len = this._match.body.length;
		var stckLen;
		var hand;
		var dealer;
		for (var i=0; i < len; i++) {
			stckLen = this._match.body[i].actionStack.length;
			hand = this._match.body[i].player1.isHand ? this._match.body[i].player1.name : this._match.body[i].player2.name;
			dealer = this._match.body[i].player1.isHand ? this._match.body[i].player2.name : this._match.body[i].player1.name;
			this._events.push({ action: { type: this.eventTypes.HAND_START }, playerName: dealer });
			for (var j=0; j < stckLen; j++)
				this._events.push(this._match.body[i].actionStack[j]);
			this._events.push({ action: { type: this.eventTypes.HAND_ENDED }, playerName: hand });
		}
		
		this._players = new Array(this._match.head.player1, this._match.head.player2);
		this.matchLoaded.notify();
	},
	
	getCurrentEvent: function() {
		return this._curEvent;
	},
		
	getState: function() {
		return this._state;
	},
	
	getTotalEvents: function() {
		return this._events.length;
	},
	
	getSpeedMultiplier: function() {
		return this._speedMultiplier;
	},
	
	getPlayers: function() {
		return this._players;
	},
	
	getPlayerIdByName: function(name) {
		var len = this._players.length;
		for (var i=0; i < len; i++)
			if (this._players[i] == name)
				return i;

		return -1;
	},
	
	setState: function(state) {
		var oldState = this._state;
		
		if (this._state != state) {
			this._state = state;
			
			switch(this._state) {
				case this.states.PLAYING:
					if (this._curEvent >= this._events.length)
						this._curEvent = 0;

					this._timer.start();					
					if (oldState != this.states.DEALING)
						this.play.notify();
					
					break;
				
				case this.states.PAUSED:
					this._timer.stop();
					this.pause.notify();
					
					break;

				case this.states.DEALING:
					this._timer.stop();
					
					break;
			}

			this.update.notify();
		}
	},
	
	setEvent: function(num) {
		if (this._curEvent != num && (num >= 0 && num <= this._events.length)) {
			this._curEvent = num;
			this.update.notify();
		}		
	},
	
	setSpeedMultiplier: function(multiplier) {
		this._speedMultiplier = multiplier;
		this._timer.update(this.SPEED * this._speedMultiplier);
		this.update.notify();
	},
	
	getEvent: function() {
		return this._events[this._curEvent];
	},
	
	showAnimation: function() {
		return this._animate;
	}
	
};