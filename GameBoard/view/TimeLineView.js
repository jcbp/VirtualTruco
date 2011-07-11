/**
 * TimeLineView Class
 */
var TimeLineView = function (model, controller, elements) {

	this._model = model;
	this._controller = controller;
	this._elements = elements;

	// TO-DO: Utilizar valores reales con la informacion del modelo
	this._min = 0;
	this._max = 100;
	this._step = 1;

	var _this = this;

	// Agrega listeners del modelo
	this._model.update.attach(function(e, o) {
		console.log('===== TimeLineView: UPDATE =====');
		console.log('state -> ' + _this._model.getState());
		console.log('move -> ' + _this._model.getCurrentMove());
		_this.updateControls();
	});
	
	// Agrega listeners para los controles
	this._elements.timeLine.bind( "slide", function(e, o) {
		_this._controller.seekMove(o.value);
	});
};

TimeLineView.prototype = {
	show: function() {
		this.buildTimeLine();
	},
	
	buildTimeLine: function() {
		var _this = this;
		var e = this._elements;
		for (var s in e) {
			if (e[s] != e.timeLine)
				e[s].hover(
					function() { if (!$(this).is('.ui-state-disabled')) $(this).addClass('ui-state-hover'); }, 
					function() { if (!$(this).is('.ui-state-disabled')) $(this).removeClass('ui-state-hover'); }
				);
		}
		
		this.updateControls();
		
		e.playBtn.click(function() { _this._controller.play(); } );
		e.pauseBtn.click(function() { _this._controller.pause(); } );
		e.prevMoveBtn.click(function() { _this._controller.previousMove(); } );
		e.nextMoveBtn.click(function() { _this._controller.nextMove(); } );
		
		e.timeLine.slider({
			min: this._min,
			max: this._max,
			step: this._step
		});
		e.timeLine.slider();
	},
	
	updateControls: function() {
		var e = this._elements;
		
		// Conmuta entre PLAY y PAUSE
		if (this._model.getState() == this._model.states.PAUSED) {
			e.playBtn.show();
			e.pauseBtn.hide();
		} else {
			e.playBtn.hide();
			e.pauseBtn.show();
		}
		
		// Fija los botones como disponibles y no disponibles
		if (this._model.getCurrentMove() <= this._min)
			e.prevMoveBtn.addClass('ui-state-disabled');
		else
			e.prevMoveBtn.removeClass('ui-state-disabled');

		if (this._model.getCurrentMove() >= this._max)
			e.nextMoveBtn.addClass('ui-state-disabled');
		else
			e.nextMoveBtn.removeClass('ui-state-disabled');

		// Actualiza la linea de tiempo
		e.timeLine.slider("value", this._model.getCurrentMove());
	}
};