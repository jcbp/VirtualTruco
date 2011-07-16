/*
 * IA of Randomio
 */
var Player2 = function () {
	/*var actionMove = [
	CommonAPI.PLAY_CARD,
	CommonAPI.PLAY_CARD,
	CommonAPI.PLAY_CARD,


	CommonAPI.ENVIDO,
	CommonAPI.REAL_ENVIDO,
	CommonAPI.PLAY_CARD,
	CommonAPI.RE_TRUCO,
	CommonAPI.PLAY_CARD,
	CommonAPI.QUIERO,
	CommonAPI.PLAY_CARD
];*/
	
	var _cardSet = [];
	var _utils = new Utils();
	
	this.name = "Randomio";

	this.initHand = function (cardSet) {
		_cardSet = cardSet;
	}
	this.endHand = function () {

	}
	this.setScorePoints = function (scorePoints) {
		_scorePoints = scorePoints;
	}
	
	var i = 0;
	
	this.getRandomOption = function(opts)
	{
		return opts[_utils.random(0,opts.length-1)];
		
	
	}
	this.play = function (actions) {
		var _allMyOptions = [];

		var objLog = {"Opciones de": "Randomio"};
		actions.each(function (nodeName, node) {
			objLog[nodeName] = node;
			_allMyOptions.push(node.name);
		});
		
		Log.add(objLog);
		
		var _randOption = this.getRandomOption(_allMyOptions);

		switch(_randOption) {
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
			Juega: "Randomio",
			Message: action.message? action.message.name: action.card
		});
		
		return action;
	}
}