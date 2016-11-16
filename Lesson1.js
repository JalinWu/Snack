// L1
var disp = $('.disp'),
    msg = $('.msg');

var showMessage = function(ma, mb) {
	msg.find('.msg-a').text(ma);
	msg.find('.msg-b').text(mb);
};
showMessage('貪吃蛇', 'Press space to start');

//每邊40個畫素
var dispWidthInPixels = 40;

for (var i = 0; i < dispWidthInPixels; i++){
	for (var j = 0; j < dispWidthInPixels; j++) {
		//在每個pixel上綁上x座標與y座標，方便之後抓到要進行操作的畫素
		var tmp = $('<div class="pixel" data-x="' + j + '" data-y="' + i + '"></div>');
		disp.append(tmp);
	}
}

var snake = {
	bodyPixels: [],
};

var gameRunning;

var tryAllocatingPixel = function(x, y) {
	$('div.pixel[data-x="' + x + '"][data-y="' + y + '"]').addClass('taken');
}

var initializeGame = function() {
	snake.bodyPixels = [];
	for (var i = 29, end = 29 - 6; i > end; i--) {
		tryAllocatingPixel(i, 25);
		snake.bodyPixels.push([i, 25]);
	}
};

var startMainLoop = function() {
	showMessage('', '');
};

$(window).keydown(function(e) {
	console.log(e.which);
	var k = e.which;
	if(k === 32) {
		if(!gameRunning) {
			initializeGame();
			startMainLoop();
			gameRunning = true;
		}
	}
});
