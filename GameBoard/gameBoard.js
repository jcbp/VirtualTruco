$(document).ready(function () {
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
		"libs/jquery.easing.1.3.js",
		"libs/jquery-ui-1.8.14.custom.min.js",
		"libs/jQueryRotateCompressed.2.1.js",
		"utils/Event.js",
		"utils/Timer.js",
		"model/GameBoardModel.js",
		"controller/TimeLineController.js",
		"view/TimeLineView.js",
		"ui/Card.js",
		"controller/CardsController.js",
		"view/CardsView.js"
	];
	
	function getScripts() {
		$.getScript(resources[i], function() {
			if (i++ >= resources.length - 1)
				init();
			else
				getScripts();
		});
	}
	getScripts();
	
	var model, view, controller;
	
  function init() {
		model = new GameBoardModel();
		timeLineController = new TimeLineController(model);
    timeLineView = new TimeLineView(model, timeLineController, {
			'container': $('#timeLine-controls'),
      'playBtn': $('#playBtn'), 
      'pauseBtn': $('#pauseBtn'),
			'nextEventBtn': $('#nextEventBtn'),
			'prevEventBtn': $('#prevEventBtn'),
			'normalSpeedBtn': $('#normalSpeedBtn'),
			'fastSpeedBtn': $('#fastSpeedBtn'),
			'fasterSpeedBtn': $('#fasterSpeedBtn'),
			'timeLine': $('#timeLine div')
		});
		timeLineView.hide();

		cardsController = new CardsController(model);
		cardsView = new CardsView(model, cardsController, { 'container': $('#cards') });
		
		model.loadMatch(6);
	}
});