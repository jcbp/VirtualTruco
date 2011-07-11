/*
 * IA of Juan
 */
var Player2 = function () {
var actionMove = [CommonAPI.NO_QUIERO,
CommonAPI.QUIERO,
CommonAPI.RE_TRUCO,
CommonAPI.PLAY_CARD,
CommonAPI.PLAY_CARD,
CommonAPI.PLAY_CARD
];

	var _cardSet = [];
	var _utils = new Utils();
	
	this.name = "Juan";

	this.initHand = function (cardSet) {
		_cardSet = cardSet;
	}
	this.endHand = function () {

	}
	this.setScorePoints = function (scorePoints) {
		_scorePoints = scorePoints;
	}
	
	var i = 0;

	this.play = function (actions) {
		
		var objLog = {"Opciones de": "Juan"};
		actions.each(function (nodeName, node) {
			objLog[nodeName] = node;
		});
		Log.add(objLog);
		
		var action;

		switch(actionMove[i++]) {
			case CommonAPI.ENVIDO:
				action = CommonAPI.ActionFactory.createEnvido();
				break;
			case CommonAPI.REAL_ENVIDO:
				action = CommonAPI.ActionFactory.createRealEnvido(); 
				break;
			case CommonAPI.FALTA_ENVIDO:
				action = CommonAPI.ActionFactory.createFaltaEnvido();
				break;
			case CommonAPI.SON_BUENAS:
				action = CommonAPI.ActionFactory.createSonBuenas();
				break;
			case  CommonAPI.TRUCO:
				action = CommonAPI.ActionFactory.createTruco();
				break;
			case  CommonAPI.RE_TRUCO:
				action = CommonAPI.ActionFactory.createReTruco();
				break;
			case  CommonAPI.VALE_CAUTRO:
				action = CommonAPI.ActionFactory.createValeCuatro();
				break;
			case  CommonAPI.QUIERO:
				action = CommonAPI.ActionFactory.createQuiero(); 
				break;
			case  CommonAPI.NO_QUIERO:
				action = CommonAPI.ActionFactory.createNoQuiero();
				break;
			case CommonAPI.POST_SCORE:
				action = CommonAPI.ActionFactory.createPostScore(28);
				break;
			case CommonAPI.GO_TO_DECK:
				action = CommonAPI.ActionFactory.createGoingToDeck();
				break;
			default:
				action = CommonAPI.ActionFactory.createPlayCard(_cardSet.pop());
				break;
		}
		
		
		Log.add({
			Juega: "Juan",
			Message: action.message.name
		});
		
		return action;
	}
}