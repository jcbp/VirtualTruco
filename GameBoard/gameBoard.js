$(function () {
	$(document).title = "VT &raquo; Player1 vs Player2";
	
	/*var resources = [
		"libs/jquery-ui-1.8.14.custom.min.js",
		"utils/Event.js",
		"utils/Timer.js",
		"model/GameBoardModel.js",
		"controller/TimeLineController.js",
		"view/TimeLineView.js",
		"ui/Card.js",
		"view/CardsView.js"
	];
	
	$.getScript("utils/ScriptLoader.js", function() {
		ScriptLoader.addScript(resources);
		ScriptLoader.getScript(init);
	});*/
 	
	// TO-DO: Implementar las llamadas a scripts necesarios utilizando ScriptLoader en cada clase.
	var i = 0;
	var resources = [
		"libs/jquery-ui-1.8.14.custom.min.js",
		"libs/jQueryRotateCompressed.2.1",
		"utils/Event.js",
		"utils/Timer.js",
		"model/GameBoardModel.js",
		"controller/TimeLineController.js",
		"view/TimeLineView.js",
		"ui/Card.js",
		"view/CardsView.js"
	];
	getScripts();
	
	function getScripts() {
		$.getScript(resources[i], function() {
			if (i++ >= resources.length - 1)
				init();
			else
				getScripts();
		});
	}
	
	var model, view, controller;
	
  function init() {	
		model = new GameBoardModel([]);
		controller = new TimeLineController(model);
    timeLineView = new TimeLineView(model, controller, {
      'playBtn': $('#playBtn'), 
      'pauseBtn': $('#pauseBtn'),
			'nextMoveBtn': $('#nextMoveBtn'),
			'prevMoveBtn': $('#prevMoveBtn'),
			'normalSpeedBtn': $('#normalSpeedBtn'),
			'fastSpeedBtn': $('#fastSpeedBtn'),
			'fasterSpeedBtn': $('#fasterSpeedBtn'),
			'timeLine': $('#timeLine div')
		});
		timeLineView.show();
		
		cardsView = new CardsView(model, controller, {'container': $('#cards')});
		cardsView.show();
	}
});