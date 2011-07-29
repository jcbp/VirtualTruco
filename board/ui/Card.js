/**
 * Card Class
 */
var Card = function (rank, suit, depth, backImg) {
	var el = document.createElement("div");
	el.rank = rank;
	el.suit = suit;
	el.setAttribute("id", rank + "_" + suit);
	el.style.position = "absolute";
	el.style.top = 0;
	el.style.left = 0;
	el.style.zIndex = depth;
	el.style.backgroundImage = "url(img/baraja.png)";
	el.style.backgroundRepeat = "no-repeat";
	el.style.width = "112px";
	el.style.height = "172px";
	
	el.getDepth = function() {
		return this.style.zIndex;
	};
	
	el.setDepth = function(depth) {
		this.style.zIndex = depth;
	};
	
	el.setToFront = function() {
		var r = rank > 6 ? rank + 2 : rank;
		this.style.backgroundPosition = -r * 112 + "px " + -suit * 172 + "px";
	};
	
	el.setToBack = function() {
		this.style.backgroundPosition = -1344 + "px " + -backImg * 172 + "px";
	};
	
	el.setToBack();

	return el;
};