/**
 * MessagesView Class
 */
var MessagesView = function (model, controller, elements) {

	// Define los distintos mensajes
	// TO-DO: Deben tomarse desde el mismo namespace que lo hace el server.
	this.messages = {
		Envido: "¡Envido!",
		RealEnvido: "¡Real Envido!",
		FaltaEnvido: "¡Falta Envido!",
		Truco: "¡Truco!",
		ReTruco: "¡Retruco!",
		ValeCuatro: "¡Vale Cuatro!",
		Quiero: "¡Quiero!",
		NoQuiero: "¡No quiero!",
		SonBuenas: "¡Son buenas!"
	};
	
	this.DEPTH = 500;
	
	this._model = model;
	this._controller = controller;
	this._elements = elements;
	
	this._balloons = new Array();
	this.showMessages = false;

	var _this = this;

	// Agrega listeners del modelo
	this._model.matchLoaded.attach(function(e, o) {
		_this.show();
	});
	this._model.update.attach(function(e, o) {
		_this.updateControls();
	});
	this._model.play.attach(function(e, o) {
		
	});
	this._model.pause.attach(function(e, o) {
		
	});
	
};

MessagesView.prototype = {
	show: function() {
		this._showMessages = false;
		this.buildMessages();
	},
	
	hide: function() {
		this._showMessages = false;
	},
	
	buildMessages: function() {
		var e = this._elements;
		var bgBalloon = "img/balloon_green.png";
		var bgStem = "img/pointer_green_top_right.png";
		var sPos = { top: "-11px", right: "-30px" };
		var balloon = new Balloon(bgBalloon, bgStem, sPos, this.DEPTH);
		this._balloons.push(balloon);
		e.container.append($(this._balloons[0]).hide());
		$(balloon).css({ left:300, top:100 });
		
		bgBalloon = "img/balloon_blue.png";
		bgStem = "img/pointer_blue_bottom_left.png";
		sPos = { bottom: "-51px", left: "8px" };
		balloon = new Balloon(bgBalloon, bgStem, sPos, this.DEPTH);
		this._balloons.push(balloon);
		e.container.append($(this._balloons[1]).hide());
		$(balloon).css({ right:300, bottom:100 });
	},
	
	updateControls: function() {
		var event = this._model.getEvent();
		var multiplier = this._model.getSpeedMultiplier();
		var len = this._balloons.length;
		var balloon;
		
		for (var i=0; i < len; i++) {
			//$(this._balloons[i]).fadeOut(300 * multiplier, "easeInCirc");
			$(this._balloons[i]).hide();
		}
		
		if (event.type == this._model.eventTypes.MESSAGE) {
			balloon = this._balloons[this._model.getPlayerIdByName(event.action.player)];
			balloon.setContent(this.messages[event.action.message.name]);
			//$(balloon).fadeIn(300 * multiplier, "easeInCirc");
			$(balloon).show();
		}
	},
	
	play: function() {
		
	},
	
	pause: function() {
		
	}

};