/*
 * IA of Juan
 */
var Player2 = function () {
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
		
		i++;
		var action;

		switch(i) {
			case 1:
				action = CommonAPI.ActionFactory.createEnvido();
				break;
			case 2:
				action = CommonAPI.ActionFactory.createQuiero();
				break;
			case 3:
				action = CommonAPI.ActionFactory.createPostScore(28); 
				break;
			case 5:
				action = CommonAPI.ActionFactory.createTruco();
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