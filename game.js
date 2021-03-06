// I'm going to call the weird circle thing that grows the 'bomb' and the other bouncing circles just circles. In the middle somewhere, I played the game again, and started calling them orbs. So circles === orbs

//For scoring:
//1 cirplosion left = 50 points
//1s = 10 points
//Attempts:
//1 attempt = 100 points
//2 attempts = 50 points
//3 attempts = 25 points
//3+ attempts = 0 points

var Game = function (){
	var state = '', //4 states. '', grow, ready, boom. '' is where it just follows the mouse. The other are self-explanatory
	    circles = [], //Array to manage the circles. Each index will be an object with x and y
	    rad = 0,
	    tinyRad = 5,
	    bigRad = 15, //It's got to be 3 times the small one because it splits into three small ones.
	    canvas,
	    ctx,
	    score = 0, //Private variables ftw!
	    level = -1,
	    //Thanks to Gordan from http://irRegularGames.com for giving me the numbers of orbs and the time each level is allotted
	    orbLevels = [
	    		//1
	    		{cirp : 1, time : 15, tiny : 1},
	    		//2
	    		{cirp : 1, time : 15, tiny : 2},
	    		//3
	    		{cirp : 2, time : 15, tiny : 4},
	    		//4
	    		{cirp : 3, time : 15, tiny : 5},
	    		//5
	    		{cirp : 2, time : 4, tiny : 2},
	    		//6
	    		{cirp : 2, time : 12, tiny : 5, freeze : 1},
	    		//7
	    		{cirp : 5, time : 20, tiny : 10},
	    		//8
	    		{cirp : 5, time : 25, tiny : 12},
	    		//9
	    		{cirp : 2, time : 15, big : 1},
	    		//10
	    		{cirp : 4, time : 20, big : 1, tiny : 5},
	    		//11
	    		{cirp : 6, time : 25, big : 4, tiny : 2},
	    		//12
	    		{cirp : 5, time : 25, big : 1, tiny : 9, freeze : 1},
	    		//13
	    		{cirp : 5, time : 30, tiny : 15, freeze : 1},
	    		//14
	    		{cirp : 5, time : 25, big : 2, tiny : 6},
	    		//15
	    		{cirp : 3, time : 15, tiny : 10, freeze : 1},
	    		//16
	    		{cirp : 3, time : 10, big : 2, tiny : 1, freeze : 1},
	    		//17
	    		{cirp : 10, time : 30, tiny : 40, freeze : 1},
	    		//18
	    		{cirp : 5, time : 12, tiny : 10},
	    		//19
	    		{cirp : 10, time : 30, tiny : 25},
	    		//20
	    		{cirp : 8, time : 40, big : 9}
	    		],
	    passedLevels = [],
	    frozen = false,
	    bDisx = [],
	    bDisy = [],
	    divs = [],
	    att = 1,
	    cLeft = 0,
	    time = 0,
	    accumScore = 0;
	    failed = false,
	    playsfx = true,
	    paused = false,
	    onMenu = true,
	    failCirp = false,
	    cirpComments = ['Hey, waste all the cirplosions you want! Not like they\'re limited!', 'You know you CAN cirplode more orbs at once', 'Cirplosions are fun. Try cirploding an orb next time.', 'The unborn orb babies thank you.', 'Hah! Sucker! You\'re out of cirplosions!'],
	    timeComments = ['Try not taking all the time you have. We know you have a lot.', 'You didn\'t run out of time.....bazinga!', 'I understand. The timer on the top left is hard to see.', 'Time is limited. Unicorns are awesome. You suck at games. (Was that a haiku?)', 'Time\'s up. Go cry to your mom!'];
	
	//Easier than document.getElementById. And it's a private function, so it harms no one
	function id(a){
		return document.getElementById(a);
	}
	
	this.init = function (canvasId){
		var that = this;
		canvas = id(canvasId);
		ctx = canvas.getContext('2d');
		var touchm = ("ontouchmove" in canvas);
		if(touchm){
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight - id('top').offsetHeight - id('bottom').offsetHeight; // For touch screen devices, make it go fullscreen
			//Keep it in ratio
			tinyRad = canvas.width / 100;
			bigRad = tinyRad * 3;
			document.body.addEventListener('touchmove', function (e){
				e.preventDefault();
			}, false);
			//Note to self: Opera needs the 3rd boolean paramater in addEventListener.
			
			
		}
		else {
			canvas.width = 500;
			canvas.height = 500 - id('top').offsetHeight - id('bottom').offsetHeight;
		}
		var md = ('ontouchstart' in canvas) ? "touchstart" : "mousedown";
		var mu = ("ontouchend" in canvas) ? "touchend" : "mouseup";
		var mm = touchm ? "touchmove" : "mousemove";
		
		canvas.addEventListener(md, function (e){
			that.selectedColour = 'rgb('+Math.round(Math.random()*255)+','+Math.round(Math.random()*255)+','+Math.round(Math.random()*255)+')'; //Gives the growing bomb a random colour.
			state = (state === '') ? 'grow' : 'ready';
			//If it's just following the mouse around, start growing, else keep it ready.
			that.x = ((touchm) ? e.touches[0].pageX : e.pageX) - this.offsetLeft;
			//This is canvas, that is Cirplosion
			that.y = ((touchm) ? e.touches[0].pageY : e.pageY) - this.offsetTop;
			// On some touchscreen phones e.pageX doesn't work, so I have to use e.touches[0].pageX because that works everywhere
			e.preventDefault();
		}, false);
		
		canvas.addEventListener(mu, function (){
			state = (state === 'grow') ? 'ready' : (state === 'ready') ? 'boom' : ''; //If it was previously growing and didn't burst, make it ready. If it wasn't growing and if it was ready, BOOM!
		}, false);
		
		canvas.addEventListener(mm, function (e){
			that.x = ((touchm) ? e.touches[0].pageX : e.pageX) - this.offsetLeft;
			that.y = ((touchm) ? e.touches[0].pageY : e.pageY) - this.offsetTop;
			e.preventDefault();
		}, false);
		
		int = setInterval(function (){
			that.main(); //The function to draw and control all of those bouncing circles and the bomb
		}, 100/3);
		
		this.menu('main');
		
		var right = document.getElementsByClassName('right')
		for(var i=0, len = right.length; i < len; i++){
			right[i].style.position = 'absolute';
			right[i].style.left = canvas.offsetLeft + canvas.width - right[i].offsetWidth + 'px';
		}
		var center = document.getElementsByClassName('center')
		for(var i=0, len = center.length; i < len; i++){
			center[i].style.position = 'absolute';
			center[i].style.left = canvas.offsetLeft + (canvas.width - center[i].offsetWidth) / 2 + 'px';
		}
		
		for(var i=0, len = orbLevels.length; i < len; i++){
			passedLevels[i] = false;
		}
		
		id('next').addEventListener('click', function (){
			that.goto(level + 1);
		}, false);
		
		id('replay').addEventListener('click', function (){
			clearInterval(int);
			
			that.goto(level);
		}, false);
		
		id('track').play();
		id('music').checked = true;
		id('music').addEventListener('click', function (){
			if(this.checked){
				id('track').play();
			}
			else{
				id('track').pause();
			}
		}, false);
		
		id('sfx').checked = true;
		id('sfx').addEventListener('click', function (){
			playsfx = this.checked;
		}, false);
		
		var credits = id('credits');
		credits.style.width = canvas.width + 'px';
		credits.style.height = canvas.height + 'px';
		credits.style.left = canvas.offsetLeft + 'px';
		credits.style.top = canvas.offsetTop + 'px';
		
		id('pause').addEventListener('click', function (){
			that.pauseToggle();
		}, false);
		document.body.addEventListener('keydown', function (e){
			//Space for pause
			if(e.which === 32){
				that.pauseToggle();
			}
			//R for restart
			else if(e.which === 82){
				clearInterval(int);
				that.goto(level);
			}
		}, false);
		
		id('restart').addEventListener('click', function (){
			clearInterval(int);
			that.goto(level);
		}, false);
	
		id('tryAgain').addEventListener('click', function (){
			clearInterval(int);
			that.goto(level);
		}, false);
	};
	
	this.collide = function (obj1){
		return (Math.pow(this.x - obj1.x, 2) + Math.pow(this.y - obj1.y, 2) <= Math.pow(rad + obj1.rad, 2)) //Check if any object is colliding with the current bomb
	};
	
	//Checks if the orbs remaining are only freeze orbs. If yes, then you've won, and hence we can delete the freeze.
	onlyFreeze = function (){
		for(var i=0, len = circles.length; i < len; i++){
			if(circles[i].type !== 'freeze'){
				return false;
			}
		}
		return true;
	}
	
	//MAIN FUNCTION. DOES *EVERYTHING* BECAUSE I COULDN'T THINK OF A WAY TO CREATE SEPERATE FUNCTIONS. SORRY FOR SCREAMING!

	this.main = function (){ //n is the number of circles to draw. Changes for levels
		canvas.width = canvas.width; //Clear canvas. For some reason, clearRect won't work for me on Chrome
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height); //Set the background
		
		time -= (time > 0) ? 1/30 : 0;
		id('time').textContent = (time < 0) ? 0 : Math.round(time);
		
		var blasts = [],
		    cir = circles;
		
		// Level ends. Show score menu
		if(cir.length === 0 && level !== -1 && id('levelMenu').style.display === 'none'){
			passedLevels[level + 1] = true;
			failed = false;
			clearInterval(int);
			state = '';
			frozen = false;
			if(playsfx === true){
				id('levelComplete').play();
			}
			this.menu('level');
		}
		
		if((time < 0 || cLeft <= 0) && level !== -1 && id('levelMenu').style.display === 'none'){
			clearInterval(int);
			failed = true;
			failCirp = (cLeft <= 0);
			this.menu('level');
			att++;
		}
		
		
		else {
			//Check if only freeze circles are left. If they are, then the player's won.
			if(onlyFreeze()){
				circles = [];
			}
			for(var i=0, len = cir.length; i < len; i++){
				cir[i].disx *= (cir[i].x + cir[i].rad + cir[i].disx >= canvas.width || cir[i].x - cir[i].rad + cir[i].disx <= 0) ? -1 : 1;
				cir[i].disy *= (cir[i].y + cir[i].rad + cir[i].disy >= canvas.height || cir[i].y - cir[i].rad + cir[i].disy <= 0) ? -1 : 1;
				cir[i].x += cir[i].disx;
				cir[i].y += cir[i].disy;
				color = (cir[i].type === 'freeze') ? 'blue' : (frozen === true) ? 'white' : 'orange';
				this.circle(cir[i].x, cir[i].y, cir[i].rad, color, 1);
			
				//If it collides, check which one it is, growing, or boom-ing
				if( this.collide(cir[i]) ){
					if(state === 'grow'){
						if(cir[i].type === 'freeze'){
							cir[i] = undefined;
							frozen = true;
							if(playsfx === true){
								id('freeze').play();
							}
							break;
						}
						else {
							state = '';
							if(playsfx === true){
								id('die').play();
							}
						}
					}
					else if(state === 'boom' && cir[i].type !== 'freeze'){
						if(cir[i].type === 'big'){
							this.splitBigOrb(cir[i]);
						}
						if(cir[i].type !== 'split'){
							cir[i] = undefined;
						}
						if(playsfx === true){
							id('blast').play();
						}
					}
					
				}
			}
		}
		
		//if there are any undefined values in the array, remove them. Like a garbage collector!
		while(cir.indexOf(undefined) >= 0){
			cir.splice(cir.indexOf(undefined), 1);
		}
		
		if(frozen === true && !bDisx && !bDisy){
			bDisx = [];
			bDisy = [];
			for(var i=0, len = cir.length; i < len; i++){
				bDisx[i] = cir[i].disx;
				bDisy[i] = cir[i].disy;
				cir[i].disx = 0;
				cir[i].disy = 0;
			}
		}
		if(frozen === false && bDisx && bDisy){
			for(var i=0, len = bDisx.length; i < len; i++){
				if(cir[i]){
					cir[i].disx = bDisx[i];
					cir[i].disy = bDisy[i];
				}
			}
			bDisx = 0;
			bDisy = 0;
			frozen = 0;
		}
		
		
		switch(state){
			case '':
				rad = 5; //Reset the radius because it burst
				this.circle(this.x, this.y, 5, 'white', 0.5);
				break;
			case 'grow':
				rad += 2;
				if(	this.x + rad >= canvas.width ||
					this.x - rad <= 0 ||
					this.y + rad >= canvas.height ||
					this.y - rad <= 0
				) {
					state = '';
					if(playsfx === true){
						id('hitWall').play();
					}
				}
				else if(playsfx === true){
					id('expanding').play();
				}
				this.circle(this.x, this.y, rad, this.selectedColour);
				break;
			case 'ready':
				this.circle(this.x, this.y, rad, 'white', 0.5);
				break;
			case 'boom':
				cLeft--;
				id('cirplosions').textContent = cLeft;
				if(frozen === true){
					frozen = false;
				}
				// Have those orbs that didn't blast's speeds affected
				for(var i=0; i < cir.length; i++){
					var distance = (cir[i].type === 'split') ? canvas.width / 5 : Math.sqrt( Math.pow(cir[i].x - this.x, 2) + Math.pow(cir[i].y - this.y, 2) );
					var force = rad * 5/distance;
					var gradient = (cir[i].y - this.y) / (cir[i].x - this.x);
					var xFromImpact = force / Math.sqrt(1 + (gradient * gradient) );
					var yFromImpact = xFromImpact * Math.abs(gradient);
					xFromImpact *= (cir[i].x >= this.x) ? 3 : -3;
					yFromImpact *= (cir[i].y >= this.y) ? 3 : -3;
					cir[i].disx += xFromImpact;
					cir[i].disy += yFromImpact;
					
					//There's got to be some limit to the speed of the orbs.
					if(cir[i].disx > 10){
						cir[i].disx = 10;
					}
					if(cir[i].disy > 10){
						cir[i].disy = 10;
					}
					
					if(cir[i].type === 'split'){
						cir[i].type = 'tiny';
					}
				}
				//This probably isn't the best way to be calculating the forces, but I couldn't think of another. Tell me if you can think of a better way.
				state = ''; //Set it back to following it around
				break;
		}

		
	};
	
	//This is just the inital function used to create the circles at the beginning of each level
	drawCircles = function (n, type, obj){
		if(!isNaN(n)){ //Some levels have no tiny or big ones.
			var radius = (type === 'big') ? bigRad : tinyRad;
			for(var i=0; i < n; i++){
				circles.push(
				{
					type : type,
					rad : radius,
					x : (obj) ? obj.x : radius + Math.floor(Math.random() * (canvas.width - radius * 2)),
					y : (obj) ? obj.y : radius + Math.floor(Math.random() * (canvas.height - radius * 2)),
					disx : (obj) ? obj.disx : (1 + Math.round(Math.random() * 3)) * [1, -1][Math.round(Math.random())], //abs(4) is the max speed
					disy : (obj) ? obj.disy : (1 + Math.round(Math.random() * 3)) * [1, -1][Math.round(Math.random())], //abs(1) is the min speed
				}
				); //Put the object in an array so I can detect collisions
			}
		}
	};
	
	this.splitBigOrb = function (bigOrb){
		var gradient = -bigOrb.y / bigOrb.x,
		    xFromOrigin = bigRad / 2,
		    yFromOrigin = xFromOrigin * gradient;
		drawCircles(1, 'split', bigOrb); //Draw at the center
		drawCircles(1, 'split', {x : bigOrb.x + xFromOrigin, y : bigOrb.y + yFromOrigin, disx : bigOrb.disx, disy : bigOrb.disy});
		drawCircles(1, 'split', {x : bigOrb.x - xFromOrigin, y : bigOrb.y - yFromOrigin, disx : bigOrb.disx, disy : bigOrb.disy});
	}
	
	//Easier than ctx.arc each time
	this.circle = function (x, y, rad, colour, alpha){
		ctx.beginPath();
		ctx.fillStyle = colour || 'black';
		ctx.globalAlpha = alpha || 1;
		ctx.arc(x, y, rad, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	};
	
	this.newDiv = function (left, top, text, divId, button, callback){
		var div = document.createElement('div');
		if(button === true){
			div.className = 'button';
		}
		else {
			div.style.color = 'white';
		}
		div.className += ' transitions';
		if(("insertAdjacentHTML" in div)){
			div.insertAdjacentHTML('afterbegin', text);
		}
		else{
			div.innerHTML = text;
		}
		if(id){
			div.id = divId;
		}
		document.body.appendChild(div);
		if(div.offsetWidth > 0.9 * canvas.width){
			div.style.width = 0.9 * canvas.width + 'px';
			document.body.removeChild(div);
			document.body.appendChild(div);
			//Gotta do that to get it to overflow right and to update the offsetWidth and stuff
		}
		if(div.offsetHeight > 0.5 * canvas.width){
			div.style.fontSize = 'small';
		}
		div.style.left = left * canvas.width - div.offsetWidth/2 + canvas.offsetLeft + 'px';
		div.style.top = top * canvas.height - (div.offsetHeight + id('top').offsetHeight + id('bottom').offsetHeight)/2 + canvas.offsetTop + 'px';
		if(callback){
			div.addEventListener('click', callback, false);
		}
		divs.push(div);
	}
	this.clearDivs = function(){
		for(var i=0, len = divs.length; i < len; i++){
			document.body.removeChild(divs[i]);
		}
		divs = [];
	};
	
	this.play = function (){
		passedLevels[0] = true;
		clearInterval(int);
		
		this.goto(0);
		this.clearDivs();
	}
	
	this.menu = function (which){
		var that = this;
		this.clearDivs();
		onMenu = true;
		switch(which){
			case 'main':
				id('credits').style.display = 'none';
				this.newDiv(0.5, 0.5, 'Play!', null, true, function (){
					that.play();
				});
				this.newDiv(0.5, 0.2, '1. Hold down mouse button to expand a circle<br>2. Release mouse button before circle touches orange orbs or the edges<br>3. Position transparent circle over orbs and click to destroy!', 'helpText', true);
				this.newDiv(0.5, 0.8, 'Credits', null, true, function (){
					that.menu('credits');
				});
				break;
			case 'level':
				var levelMenu = id('levelMenu');
				if(failed === false){
					levelMenu.style.display = 'block';
					id('failMenu').style.display = 'none';
					id('attempts').textContent = att;
					id('cirpLeft').textContent = cLeft;
					//Can't round the actual value of time because then it'll become 0, and make the user fail the level.
					var tempTime = Math.round(time);
					id('timeLeft').textContent = tempTime;
					var attScore = 100 * Math.pow(0.5, att - 1);
					if(attScore < 25){
						attScore = 0;
					}
					id('attScore').textContent = attScore;
					id('cirScore').textContent = cLeft * 50;
					id('timeScore').textContent = tempTime * 10;
					//If they failed the level, just show the score they would have gotten. But the actual score they get is 0.
					var score = (failed === false) ? attScore + cLeft * 50 + tempTime * 10 : 0;
					id('score').textContent = score;
					accumScore += score;
					id('totalScore').textContent = accumScore;

					levelMenu.style.left = (canvas.width - levelMenu.offsetWidth) / 2 + 'px';
					levelMenu.style.top = (canvas.height - levelMenu.offsetHeight) / 2 + 'px';
				}
				else{
					var failmenu = id('failMenu');
					failmenu.style.display = 'block';
					id('levelMenu').style.display = 'none';
					id('failedText').textContent = failCirp ? cirpComments[Math.floor(Math.random() * cirpComments.length)] : timeComments[Math.floor(Math.random() * timeComments.length)];
					failmenu.style.left = (canvas.width - failmenu.offsetWidth) / 2 + 'px';
					failmenu.style.top = (canvas.height - failmenu.offsetHeight) / 2 + 'px';
				}
				
				if(passedLevels[level + 1] === true){
					id('next').style.display = 'block';
				}
				else{
					id('next').style.display = 'none';
				}
				break;
			case 'credits':
				id('levelMenu').style.display = 'none';
				id('credits').style.display = 'block';
				this.newDiv(0.3, 0.8, 'Back', null, true, function (){
					that.menu('main');
				});
				break;
		}
	}
	
	this.goto = function (n){
		var that = this;
		if(passedLevels[n] === true){
			circles = [];
			att = 1;
			level = n;
			//Don't let anything from the previous level be carried forward
			state = '';
			frozen = false;
			
			id('level').textContent = level;
			cLeft = orbLevels[level].cirp;
			id('cirplosions').textContent = cLeft;
			id('levelMenu').style.display = 'none';
			id('failMenu').style.display = 'none';
			drawCircles(orbLevels[level].tiny, 'tiny');
			drawCircles(orbLevels[level].big, 'big');
			drawCircles(orbLevels[level].freeze, 'freeze');
			time = orbLevels[level].time;
			int = setInterval(function (){
				that.main();
			}, 100/3);
		}
		onMenu = false;
		if(paused === true){
			paused = false;
			pause.textContent = 'Pause';
		};
	}
	
	this.pauseToggle = function (){
		if(level !== -1 && onMenu === false){
			pause = id('pause');
			if(paused === true){
				var that = this;
				int = setInterval(function (){
					that.main();
				}, 100/3);
				pause.textContent = 'Pause';
				paused = false;
			}
			else{
				clearInterval(int);
				
				pause.textContent = 'Play';
				paused = true;
			}
		}
	}
};
