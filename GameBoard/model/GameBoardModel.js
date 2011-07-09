/**
 * GameBoardModel Class
 */
var GameBoardModel = new function (gameDataSet) {
	
	// Constante que determina la velocidad en la que se reproduce la partida.
	// NOTA: Solamente debe ser alterada utilizando el multiplicador de velocidad.
	var SPEED = 6000;
	
	var states = this.states = {
		PLAY: "play",
		PAUSE: "pause"
	};

	var _gameDataSet = gameDataSet;
	var _curHand = 0;
	var _curMove = 0;
	var _state = states.PAUSE;
	var _speedMultiplier = 1;

	this.getCurrentMove = function() {
		return _curMove;
	}
		
	this.getCurrentHand = function() {
		return _curHand;
	}
	
	this.getState = function() {
		return _state;
	}
	
	this.getSpeed = function() {
		return SPEED * _speedMultiplier;
	}
	
	this.setSpeedMultiplier = function(multiplier) {
		_speedMultiplier = multiplier;
	}
	
	/*
	 * Retorna una jugada por numero
	 */
	this.getMove = function(num) {
		
	}
	
	/*
	 * Retorna una mano por numero
	 */
	this.getHand = function(num) {
		
	}
	
	/*
	 * Establece el estado del reproductor en play
	 */
	this.play = function() {
		_state = states.PLAY;
	}
	
	/*
	 * Establece el estado del reproductor en pausa
	 */
	this.pause = function() {
		_state = states.PAUSE;
	}
	
	/*
	 * Avanza a la siguiente jugada
	 */
	this.nextMove = function() {
		// TO-DO: Chequear con la cantidad total de jugadas
		_curMove++;
	}
	
	/*
	 * Retrocede a la jugada anterior
	 */
	this.prevMove = function() {
		if (--_curMove < 0)
			_curMove = 0;
	}
	
	/*
	 * Situa en una jugada por numero
	 */
	this.seekMove = function(num) {
		// TO-DO: Chequear que el numero de jugada este dentro del rango permitido
		_curMove = num;
	}
	
	/* 
	 * Avanza a la siguiente mano
	 */
	this.nextHand = function() {
		// TO-DO: Chequear con la cantidad total de manos
		_curHand++;
	}
	
	/*
	 * Retrocede a la mano anterior
	 */
	this.prevHand = function() {
		if (--_curHand < 0)
			_curHand = 0;
	}
	
	/*
	 * Situa en una mano por numero
	 */
	this.seekHand = function(num) {
		// TO-DO: Chequear que el numero de mano este dentro del rango permitido
		_curHand = num;
	}
}