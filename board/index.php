<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>Game Board</title>
<link type="text/css" href="css/board.css" rel="stylesheet" />
<link type="text/css" href="css/mint-choc/jquery-ui-1.8.14.custom.css" rel="stylesheet" />
<script type="text/javascript" language="javascript" src="jquery-1.6.2.min.js"></script>
<script type="text/javascript" language="javascript" src="gameBoard.js"></script>
</head>

<body>
<div id="loader"></div>
<div id="form-match">
	<p>Ingresá el código de paritda que querés chequear.</p>
	<input type="number" id="match-id" name="match-id" value="" />
  <button type="button" id="send-id">Get</button>
</div>
<div id="board">
  <div id="cards"></div>
  <ul id="timeLine-controls" class="ui-widget ui-helper-clearfix hidden">
    <li id="playBtn" class="ui-state-default ui-corner-all" title="Play"><span class="ui-icon ui-icon-play"></span></li>
    <li id="pauseBtn" class="ui-state-default ui-corner-all" title="Pause"><span class="ui-icon ui-icon-pause"></span></li>
    <li id="prevEventBtn" class="ui-state-default ui-corner-all" title="Previous"><span class="ui-icon ui-icon-seek-prev"></span></li>
    <li id="timeLine"><div></div></li>
    <li id="nextEventBtn" class="ui-state-default ui-corner-all" title="Next"><span class="ui-icon ui-icon-seek-next"></span></li>
    <li id="normalSpeedBtn" class="ui-state-default ui-corner-all" title="Normal"><span class="ui-icon ui-icon-arrowthick-1-e"></span></li>
    <li id="fastSpeedBtn" class="ui-state-default ui-corner-all" title="Fast"><span class="ui-icon ui-icon-arrowthick-1-ne"></span></li>
    <li id="fasterSpeedBtn" class="ui-state-default ui-corner-all" title="Faster"><span class="ui-icon ui-icon-arrowthick-1-n"></span></li>
  </ul>
</div>
</body>
</html>
