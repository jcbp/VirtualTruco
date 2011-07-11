/**
 * Timer Class
 */
var Timer = function(interval, tick) {
	this.interval = interval;
	this.enable = false;
	this.tick = tick;
		
	var _timerId = 0;
	var _this = this;
};

Timer.prototype = {
	start: function() {
		this.enable = true;
		_this = this;	
		if (_this.enable) {
			_this.timerId = setInterval(function() {
				_this.tick();
			}, _this.interval);
		}
	},
		
	stop: function() {			
		_this.enable = false;
		clearInterval(_this.timerId);
	}
};