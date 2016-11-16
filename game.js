"use strict";
var disp = $('.disp'),
    msg = $('.msg');

//每邊40個畫素
var dispWidthInPixels = 40;

var DIR_DOWN = 'd',
	DIR_UP = 'u',
	DIR_LEFT = 'l',
	DIR_RIGHT = 'r';

var BAD_MOVE = 1, ACE_MOVE = 2, GOOD_MOVE = 3;

var gameRunning;
var gameInterval;
var timeStep; // 一段時間的間距，每隔多少時間做一次事
var currTime; // 記錄現在的時間
var frameStep; // 用來設定一段時間，讓蛇加速用
var availablePixels; // 可使用畫素

var beep = document.createElement('audio'),
	gameover = document.createElement('audio');
if (!!(beep.canPlayType && beep.canPlayType('audio/mpeg;').replace(/no/, ''))) {
	beep.src = 'beep.mp3';
	gameover.src = 'gameover.mp3';
} else {
	beep.src = 'beep.ogg';
	gameover.src = 'gameover.ogg'
}

for (var i = 0; i < dispWidthInPixels; i++){
	for (var j = 0; j < dispWidthInPixels; j++) {
		//在每個pixel上綁上x座標與y座標，方便之後抓到要進行操作的畫素
		var tmp = $('<div class="pixel" data-x="' + j + '" data-y="' + i + '"></div>');
		disp.append(tmp);
	}
}

var showMessage = function(ma, mb) {
	msg.find('.msg-a').text(ma);
	msg.find('.msg-b').text(mb);
};

// showMessage('Hello', 'world');

var adjustSpeed = function(l) {
	if (l >= 500) {
		frameStep = 50;
	} else if (l >= 400) {
		frameStep = 100;
	} else if (l >= 300) {
		frameStep = 150;
	} else if (l >= 200) {
		frameStep = 200;
	}
};

var releasePixel = function(x, y) {
	$('div.pixel[data-x="' + x + '"][data-y="' + y + '"]').removeClass('taken');
	availablePixels.push(x + '|' + y);
};

var snake = {
	direction: 'l',
	bodyPixels: [],
	move: function() {
		var head = this.bodyPixels[this.bodyPixels.length - 1];
		var nextHead = [];
		if (this.direction === DIR_LEFT) {
			nextHead.push(head[0] - 1);
		} else if (this.direction === DIR_RIGHT) {
			nextHead.push(head[0] + 1);
		} else {
			nextHead.push(head[0]);
		}

		if (this.direction === DIR_UP) {
			nextHead.push(head[1] - 1);
		} else if (this.direction === DIR_DOWN) {
			nextHead.push(head[1] + 1);
		} else {
			nextHead.push(head[1]);
		}

		if (nextHead[0] == currentCoin[0] && nextHead[1] == currentCoin[1]) {
			this.bodyPixels.push(nextHead);
			beep.play();
			adjustSpeed(this.bodyPixels.length); // 依據蛇的長度，調整速度
			if (useNextRandomPixelForCoin()) {
				return GOOD_MOVE;
			} else {
				return ACE_MOVE;
			}
		} else if (tryAllocatingPixel(nextHead[0], nextHead[1])) {
			this.bodyPixels.push(nextHead);
			var tail = this.bodyPixels.splice(0, 1)[0];
			releasePixel(tail[0], tail[1]);
			return GOOD_MOVE;
		} else {
			return BAD_MOVE;
		}
	}
};

var currentCoin; //食物所在位置

var useNextRandomPixelForCoin = function() {
	var ap = availablePixels;
	if (ap.length === 0) {
		return false;
	}
	var idx = Math.floor(Math.random() * ap.length);
	currentCoin = ap.splice(idx, 1)[0].split('|');
	$('div.pixel[data-x="' + currentCoin[0] + '"][data-y="' + currentCoin[1] + '"]').addClass('taken');
	return true;
};

var tryAllocatingPixel = function(x, y) {
	var ap = availablePixels;
	var p = x + '|' + y;
	var idx = ap.indexOf(p);
	if (idx !== -1) {
		ap.splice(idx, 1);
		$('div.pixel[data-x="' + x + '"][data-y="' + y + '"]').addClass('taken');
		return true;
	} else {
		return false;
	}
}

var initializeGame = function() {
	frameStep = 250;
	timeStep = 50;
	currTime = 0;

	availablePixels = [];
	for (var i = 0; i < dispWidthInPixels; i++) {
		for (var j = 0; j< dispWidthInPixels; j++) {
			availablePixels.push(i + '|' + j);
		}
	}

	snake.direction = 'l';
	snake.bodyPixels = [];
	for (var i = 29, end = 29 - 6; i > end; i--) {
		tryAllocatingPixel(i, 25);
		snake.bodyPixels.push([i, 25]);
	}

	//隨機取一個畫素塞食物
	useNextRandomPixelForCoin();
};

var startMainLoop = function() {
	gameInterval = setInterval(function() {
		//推進蛇
		currTime += timeStep;
		if (currTime >= frameStep) {
			var m = snake.move();
			if (m === BAD_MOVE) {
				clearInterval(gameInterval);
				gameRunning = false;
				gameover.play();
				showMessage('GameOver', 'Press space to start again');
			} else if (m === ACE_MOVE){
				clearInterval(gameInterval);
				gameRunning = false;
				showMessage('You Won', 'Press space to start again');
			}
			currTime %= frameStep;
		}
	}, timeStep);
	showMessage('', '');
};

$(window).keydown(function(e) {
	console.log(e.which);
	var k = e.which;
	// e.preventDefault();
	//up
	if (k === 38) {
		if (snake.direction !== DIR_DOWN)
			snake.direction = DIR_UP;
	//down
	} else if(k === 40) {
		if (snake.direction !== DIR_UP)
			snake.direction = DIR_DOWN;
	//left
	} else if(k === 37) {
		if (snake.direction !== DIR_RIGHT)
			snake.direction = DIR_LEFT;
	//right
	} else if(k === 39) {
		if (snake.direction !== DIR_LEFT)
			snake.direction = DIR_RIGHT;
	//space -> start
	} else if(k === 32) {
		if(!gameRunning) {
			for (var i = 0; i < dispWidthInPixels; i++){
				for (var j = 0; j < dispWidthInPixels; j++) {
					$('div.pixel[data-x="' + j + '"][data-y="' + i + '"]').removeClass('taken');
				}
			}
			initializeGame();
			startMainLoop();
			gameRunning = true;
		}
	//p -> pause
	} else if(k === 80) {
		if(gameRunning) {
			if (!gameInterval) {
				startMainLoop();
			} else {
				clearInterval(gameInterval);
				gameInterval = null;
				showMessage('Pause', '');
			}
		}
	// //f, for left turn
	// } else if(k === 70) {
	// 	if (snake.direction === DIR_DOWN) {
	// 		snake.direction = DIR_RIGHT;
	// 	} else if (snake.direction === DIR_RIGHT) {
	// 		snake.direction = DIR_UP;
	// 	} else if (snake.direction === DIR_UP) {
	// 		snake.direction = DIR_LEFT;
	// 	} else if (snake.direction === DIR_LEFT) {
	// 		snake.direction = DIR_DOWN;
	// 	}
	// //j, for right turn
	// } else if(k === 74) {
	// 	if (snake.direction === DIR_DOWN) {
	// 		snake.direction = DIR_LEFT;
	// 	} else if (snake.direction === DIR_RIGHT) {
	// 		snake.direction = DIR_DOWN;
	// 	} else if (snake.direction === DIR_UP) {
	// 		snake.direction = DIR_RIGHT;
	// 	} else if (snake.direction === DIR_LEFT) {
	// 		snake.direction = DIR_UP;
	// 	}
	}
});

showMessage('貪吃蛇', 'Press space to start');
