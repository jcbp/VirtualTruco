/**
 * Balloon Class
 */
var Balloon = function (bgBalloon, bgStem, sPosition, depth) {
	
	// Crea el contenedor general
	var el = document.createElement("div");
	el.style.position = "absolute";	
	el.style.zIndex = depth;
	
	// Crea el sector del contenido
	var content = document.createElement("div");
	content.style.backgroundColor = "transparent";
	content.style.backgroundImage = "url(" + bgBalloon + ")";
	content.style.backgroundPosition = "left top";
	content.style.backgroundRepeat = "no-repeat";
	content.style.paddingTop = "40px";
	content.style.paddingLeft = "40px";

	// Crea el contenedor del mensaje.
	var contentWrapper = document.createElement("div");
	contentWrapper.style.fontSize = "16pt";
	content.appendChild(contentWrapper);
	
	// Crea el corner superior derecho
	var topRight = document.createElement("div");
	topRight.style.position = "absolute";
	topRight.style.top = 0;
	topRight.style.right = "-40px";
	topRight.style.backgroundColor = "transparent";
	topRight.style.backgroundImage = "url(" + bgBalloon + ")";
	topRight.style.backgroundPosition = "right top";
	topRight.style.backgroundRepeat = "no-repeat";
	topRight.style.width = "40px";
	topRight.style.height = "100%";
	
	// Crea el corner inferior derecho
	var bottomRight = document.createElement("div");
	bottomRight.style.position = "absolute";
	bottomRight.style.bottom = "-40px";
	bottomRight.style.right = "-40px";
	bottomRight.style.backgroundColor = "transparent";
	bottomRight.style.backgroundImage = "url(" + bgBalloon + ")";
	bottomRight.style.backgroundPosition = "right bottom";
	bottomRight.style.backgroundRepeat = "no-repeat";
	bottomRight.style.width = "40px";
	bottomRight.style.height = "40px";

	// Crea el corner inferior izquierdo
	var bottomLeft = document.createElement("div");
	bottomLeft.style.position = "absolute";
	bottomLeft.style.bottom = "-40px";
	bottomLeft.style.left = 0;
	bottomLeft.style.backgroundColor = "transparent";
	bottomLeft.style.backgroundImage = "url(" + bgBalloon + ")";
	bottomLeft.style.backgroundPosition = "left bottom";
	bottomLeft.style.backgroundRepeat = "no-repeat";
	bottomLeft.style.width = "100%";
	bottomLeft.style.height = "40px";
	
	// Crea el puntero
	var stem = document.createElement("div");
	stem.style.position = "absolute";
	stem.style.backgroundColor = "transparent";
	stem.style.backgroundRepeat = "no-repeat";
	stem.style.width = "60px";
	stem.style.height = "36px";
	stem.style.backgroundImage = "url(" + bgStem + ")";
	
	if (sPosition) {
		if (sPosition.top)
			stem.style.top = sPosition.top;
		if (sPosition.bottom)
			stem.style.bottom = sPosition.bottom;
		if (sPosition.left)
			stem.style.left = sPosition.left;
		if (sPosition.right)
			stem.style.right = sPosition.right;
	}
			
	el.appendChild(content);
	el.appendChild(topRight);
	el.appendChild(bottomRight);
	el.appendChild(bottomLeft);
	el.appendChild(stem);
	
	el.setContent = function(content) {
		contentWrapper.innerHTML = content;
	};
	
	el.setPosition = function(position) {
		contentWrapper.style.left = position.left;
		contentWrapper.style.top = position.top;
	};
	
	el.setFontSize = function(size) {
		contentWrapper.style.fontSize = size;
	}
	
	return el;
};