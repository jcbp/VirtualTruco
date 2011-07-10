/*
 * IA of Jorge
 */
var Player1 = function () {
	var _cardSet = [];
	var _scorePoints = 0;
	var _utils = new Utils();
	
	this.name = "Jorge";

	this.initHand = function (cardSet) {
		_cardSet = cardSet;
	}
	this.endHand = function () {

	}
	this.setScorePoints = function (scorePoints) {
		_scorePoints = scorePoints;
	}
	
	
	var i = 0; // tmp
	
	this.play = function (actions) {
		
		var objLog = {"Opciones de": "Jorge"};
		actions.each(function (nodeName, node) {
			objLog[nodeName] = node;
		});
		Log.add(objLog);
		
		
		var action;
	
		i++;
		switch(i) {
			case 1:
				action = CommonAPI.ActionFactory.createEnvido(); 
				break;
			case 2:
				action = CommonAPI.ActionFactory.createRealEnvido(); 
				break;
			case 3:
				action = CommonAPI.ActionFactory.createPostScore(30);
				break;
			case 6:
				action = CommonAPI.ActionFactory.createQuiero();
				break;
			default:
				action = CommonAPI.ActionFactory.createPlayCard(_cardSet.pop());
				break;
		}

		Log.add({
			Juega: "Jorge",
			Message: action.message.name
		});

		
		return action;
	}
}