/**
 * TimeLineView Class
 */
var TimeLineView = function (model, controller, elements) {

	this._model = model;
	this._controller = controller;
	this._elements = elements;

	// TO-DO: Utilizar valores reales con la informacion del modelo
	this._min = 0;
	this._max = 0;

	var _this = this;

	// Agrega listeners del modelo
	this._model.matchLoaded.attach(function(e, o) {
		_this.pause();
		_this.show();
	});
	this._model.update.attach(function(e, o) {
		_this.updateControls();
	});
	this._model.play.attach(function(e, o) {
		_this.play();
	});
	this._model.pause.attach(function(e, o) {
		_this.pause();
	});
	
	// Agrega listeners para los controles
	this._elements.timeLine.bind( "slide", function(e, o) {
		_this._controller.seekEvent(o.value);
	});
};

TimeLineView.prototype = {
	show: function() {
		this._max = this._model.getTotalEvents() - 1;
		this.buildTimeLine();
	},
	
	hide: function() {
		this._elements.container.hide();
	},
	
	buildTimeLine: function() {
		var _this = this;
		var e = this._elements;
		for (var s in e) {
			if (e[s] != e.timeLine && e[s] != e.container)
				e[s].hover(
					function() { if (!$(this).is('.ui-state-disabled')) $(this).addClass('ui-state-hover'); }, 
					function() { if (!$(this).is('.ui-state-disabled')) $(this).removeClass('ui-state-hover'); }
				);
		}
		
		this.updateControls();
		
		e.playBtn.click(function() { _this._controller.play(); } );
		e.pauseBtn.click(function() { _this._controller.pause(); } );
		e.prevEventBtn.click(function() { _this._controller.previousEvent(); } );
		e.nextEventBtn.click(function() { _this._controller.nextEvent(); } );
		e.normalSpeedBtn.click(function() { _this._controller.normalSpeed(); } );
		e.fastSpeedBtn.click(function() { _this._controller.fastSpeed(); } );
		e.fasterSpeedBtn.click(function() { _this._controller.fasterSpeed(); } );
		
		e.timeLine.slider({
			min: this._min,
			max: this._max,
		});
		e.timeLine.slider();

		e.container.show();
	},
	
	updateControls: function() {
		var e = this._elements;

		// Fija los botones como disponibles y no disponibles
		this._model.getCurrentEvent() <= this._min ? e.prevEventBtn.addClass('ui-state-disabled') : e.prevEventBtn.removeClass('ui-state-disabled');
		this._model.getCurrentEvent() >= this._max ? e.nextEventBtn.addClass('ui-state-disabled') : e.nextEventBtn.removeClass('ui-state-disabled');
		this._model.getSpeedMultiplier() == this._model.speedMultipliers.NORMAL ? e.normalSpeedBtn.addClass('ui-state-disabled') : e.normalSpeedBtn.removeClass('ui-state-disabled');
		this._model.getSpeedMultiplier() == this._model.speedMultipliers.FAST ? e.fastSpeedBtn.addClass('ui-state-disabled') : e.fastSpeedBtn.removeClass('ui-state-disabled');
		this._model.getSpeedMultiplier() == this._model.speedMultipliers.FASTER ? e.fasterSpeedBtn.addClass('ui-state-disabled') : e.fasterSpeedBtn.removeClass('ui-state-disabled');
		
		// Actualiza la linea de tiempo
		e.timeLine.slider("value", this._model.getCurrentEvent());
	},
	
	play: function() {
		var e = this._elements;
		e.playBtn.hide();
		e.pauseBtn.show();
	},
	
	pause: function() {
		var e = this._elements;
		e.playBtn.show();
		e.pauseBtn.hide();
	}

};