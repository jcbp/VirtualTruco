$(function () {
	$(document).title = "VT &raquo; Player1 vs Player2";
	
	var i = 0;
	var resources = ["libs/jquery-ui-1.8.14.custom.min.js", "utils/Event.js", "utils/Timer.js", "model/GameBoardModel.js", "controller/TimeLineController.js", "view/TimeLineView.js"];
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
    view = new TimeLineView(model, controller, {
      'playBtn': $('#playBtn'), 
      'pauseBtn': $('#pauseBtn'),
			'nextMoveBtn': $('#nextMoveBtn'),
			'prevMoveBtn': $('#prevMoveBtn'),
			'nextHandBtn': $('#nextHandBtn'),
			'prevHandBtn': $('#prevHandBtn'),
			'timeLine': $('#timeLine div')
		});
		view.show();
	}
});