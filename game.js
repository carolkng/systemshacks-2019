// Start the game!
window.onload = function() {
	var butt = document.getElementById("start");
	var nextbutt = document.getElementById("next");
	var popup = document.getElementById("popup");
	var popupHeader = popup.querySelector('h1');
	var popupContent = popup.querySelector('p');
	var overlay = document.getElementById("overlay");
	var overlayParent = overlay.parentNode;
	var gameArea = document.getElementById("gameArea");
	var textArea = document.getElementById("textArea");
	var scoreArea = document.getElementById("score");
	//var levelArea = document.getElementById("level");
	var timerArea = document.getElementById("timer");
	var purposeArea = document.getElementById("purpose");
	var outputArea = document.getElementById("output");
	var getHacking = document.getElementById("getHacking");
	var getHackingText = document.getElementById("getHackingInner");
	var emitter = new EventEmitter();

	var gameStarted = false;
	var cursor = 0;

	var GET_HACKING_TIME = 300; // Show get hacking notification for 200ms
	var LEVEL_TIME = 10;
	var SECONDS = 750; // change back to 1000 for normal time, shorten for testing
	var KEY_SCORE = 30;
	var BONUS_SCORE = 20; // bonus score per letter pressed in the keyword list or whatever
	var ENDING_BG = "https://media.giphy.com/media/MGaacoiAlAti0/giphy.gif";

	var GAME = {
		"score": 0,
		"level": 0,
		"timer": LEVEL_TIME
	}

	var LEVELS = [
		"YOUR COMPUTER",
		"THE MATRIX",
		"PHOTOSYNTHESIS",
		"THE 90s"
	];

	var KEYWORDS = [
		["for", "while", "hack++", "hack", "++", ";"],
		["keanu", "robot", "bullet time", "hacker", "neo"],
		["mitochondria", "powerhouse", "cell"],
		["nostalgia", "fresh", "prince", "will", "smith"]
	];

	var BACKGROUND_LINKS = [
	"https://media.giphy.com/media/MF1kR4YmC2Z20/giphy.gif",
	"https://media.giphy.com/media/vZd3ILDXxBiRq/giphy.gif",
	"https://media.giphy.com/media/3oz8xxsp7ryA3iXpvO/giphy.gif",
	"https://media.giphy.com/media/svw5mZJdFB41G/giphy.gif"
	];

	var POPUPS = [
`Your computer is busted, and it looks like someone else hacked into your mainframe.`,
`Your world is the computer, and you're sick of the world. It's time to end it all.`,
`You're sick of hemorrhaging money for food, especially when the Sun exists as a source of energy. What if you became a plant?`,
`You decide to go back to the best decade ever and make it better. You decide to imbue the world with your hacker groove.`
	]

	var OUTPUTS = [
`#!/bin/bash

PASSWORD_FILE="/tmp/secret"
MD5_HASH=$(cat /tmp/secret)
PASSWORD_WRONG=1

while [ $PASSWORD_WRONG -eq 1 ]
 do
    echo "Enter your password:"
    read -s ENTERED_PASSWORD
    if [ "$MD5_HASH" != "$(echo $ENTERED_PASSWORD | md5sum | cut -d '-' -f 1)" ]; then
        echo "Access Denied: Incorrenct password!. Try again"
    else
        echo "Access Granted"
    	echo "you have been hacked"
        PASSWORD_WRONG=0
    fi
done
`,
`The Matrix is everywhere, it is all around us.
Even now, in this very room.
You can see it when you look out your window, or when you turn on your television.
You can feel it when you go to work, or when go to church or when you pay your taxes.
It is the world that has been pulled over your eyes to blind you from the truth.

Like everyone else, you were born into bondage, born inside a prison that you cannot smell, taste, or touch.
A prison for your mind.
Unfortunately, no one can be told what the Matrix is.
You have to see it for yourself. This is your last chance.
After this, there is no turning back.
You take the blue pill and the story ends.
You wake in your bed and believe whatever you want to believe.
You take the red pill and you stay in Wonderland and I show you how deep the rabbit-hole goes.
Remember -- all I am offering is the truth, nothing more.
`,
"The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. The mitochondria is the powerhouse of the cell. THE MITOCHONDRIA IS THE POWERHOUSE OF THE CELL. ",
`Now this is a story all about how
My life got flipped-turned upside down
And I'd like to take a minute
Just sit right there
I'll tell you how I became the prince of a town called Bel-Air

In west Philadelphia born and raised
On the playground was where I spent most of my days
Chillin' out maxin' relaxin' all cool
And all shooting some b-ball outside of the school
When a couple of guys who were up to no good
Started making trouble in my neighborhood
I got in one little fight and my mom got scared
She said, "You're movin' with your auntie and uncle in Bel-Air."

I begged and pleaded with her day after day
But she packed my suitcase and sent me on my way
She gave me a kiss and then she gave me my ticket.
I put my Walkman on and said, "I might as well kick it."

First class, yo, this is bad
Drinking orange juice out of a champagne glass.
Is this what the people of Bel-Air living like?
Hmm, this might be alright.

But wait I hear they're prissy, bourgeois, all that
Is this the type of place that they just send this cool cat?
I don't think so
I'll see when I get there
I hope they're prepared for the prince of Bel-Air

Well, the plane landed and when I came out
There was a dude who looked like a cop standing there with my name out
I ain't trying to get arrested yet
I just got here
I sprang with the quickness like lightning, disappeared

I whistled for a cab and when it came near
The license plate said "Fresh" and it had dice in the mirror
If anything I could say that this cab was rare
But I thought, "Nah, forget it."
– "Yo, home to Bel-Air."

I pulled up to the house about 7 or 8
And I yelled to the cabbie, "Yo home smell ya later."
I looked at my kingdom
I was finally there
To sit on my throne as the Prince of Bel-Air 
`
	]

	var OUTPUT_WORDS = [];

	function preInit() {
		initializeWords();

		butt.addEventListener("click", function() {
			overlay.setAttribute("hidden", "true");
			gameInit();
		});
		nextbutt.addEventListener("click", function() {
			overlay.setAttribute("hidden", "true");
			actuallyNextLevel();
		});
		window.addEventListener("click", function() {
			// console.log("clicked window");
			textArea.focus();
		});
	}

	function gameInit() {
		gameStarted = true;
		setScore(0);
		GAME.level = 0;

		nextLevel();
		emitter.subscribe('event:timer-over', function(data) {
			(function (t) {
				computeEndScore(t);
			})(textArea.value);
			GAME.level++;
			if (GAME.level >= LEVELS.length) {
				gameOver();
			} else {
				// console.log("game level: " + GAME.level);
				nextLevel();
			}
		});
		// console.log("gamestarted");
	}

	function timerInit(seconds) {
		for (var i = seconds; i >= 0; i--) {
			(function(i) {
				setTimeout(function() {
					timerArea.innerHTML = i;
				}, (seconds - i)*SECONDS);
			}(i));
		}

		setTimeout(function() {
			emitter.emit('event:timer-over', {});
		}, seconds*SECONDS);

		// console.log("timer init");
	}

	// Solely focused on level transition, garbage pickup for later.
	function nextLevel() {
		gameStarted = false;
		textArea.value = "";
		textArea.focus();

		outputArea.innerHTML = "";

		//levelArea.innerHTML = GAME.level;
		purposeArea.innerHTML = LEVELS[GAME.level];

		cursor = 0;
		// TODO: Animation/transition to between levels stat
		showPopup();
	}

	function actuallyNextLevel() {
		showGetHacking("HACK " + LEVELS[GAME.level]);
		var b_url = BACKGROUND_LINKS[GAME.level];
		gameArea.setAttribute("style", "background-image: url(" + b_url + ")")
 
 		gameStarted = true;
 		timerInit(LEVEL_TIME);
	}

	function gameOver() {
		gameStarted = false;
		// console.log("GAME OVER");

		overlay.removeAttribute("hidden");
		popupHeader.innerHTML = "FINAL SCORE: " + GAME.score;
		popupContent.innerHTML = "";
		butt.innerHTML = "PLAY AGAIN";
		nextbutt.setAttribute("hidden", "true");
		butt.removeAttribute("hidden");
		// TODO: dsplay some kind of game over/submit score message
	}

	function computeEndScore(text) {
		// TODO: add bonus animation flourish
		function regex_escape(str) {
		    return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
		}
		function indexes(str, find) {
		  var regex = new RegExp(regex_escape(find), "g");
		  var result;
		  var indices = [];
		  while ((result = regex.exec(str))) {
		    indices.push(result.index);
		  }
		  return indices;
		}
		
		var words = KEYWORDS[GAME.level];
		var word;
		var bonus = 0;
		for (var i = 0; i < words.length; i++) {
			word = words[i];
			bonus += BONUS_SCORE * (indexes(text, word).length) * word.length;
		}
		addScore(bonus);
	}

	function addScore(score) {
		// TODO: add score animation if necessary
		GAME.score += score;
		scoreArea.innerHTML = GAME.score;
	}

	function setScore(score) {
		GAME.score = score;
		scoreArea.innerHTML = GAME.score;
	}

	function addOutput(len) {
		//var currOut = OUTPUTS[GAME.level];
		var currOut = OUTPUT_WORDS[GAME.level];
		if (currOut[(cursor % currOut.length)] === "\n") {
			outputArea.innerHTML += "<br>";
		} else {
			outputArea.innerHTML += currOut[(cursor % currOut.length)].replace("\n", "<br>") + " ";
		}
		cursor++;
		if ((cursor % 50) === 0)
			outputArea.scrollTop = outputArea.scrollHeight;
	}

	textArea.onkeydown = function(e) {
		// Hacky way to prevent backspaces from being pressed
		// IN theory should allow the right letters from the KEYWORDS
		// to be pushed to the hacker output
		if (e.key === "Backspace") {
			e.preventDefault();
		}
	}

	textArea.onkeyup = function(e) {
		if (!gameStarted) { return; }
		if (e.key === "Backspace") {
			e.preventDefault();
		}
		// Ignore if game hasn't started
		addScore(KEY_SCORE);

		// Push the right letter to the thing
		addOutput(textArea.value.length);
	}

	function showGetHacking(text) {
		getHackingText.innerHTML = text;
		for (var i = 0; i <= 4; i++) {
			setTimeout(function() {
				getHacking.removeAttribute("hidden");
			}, GET_HACKING_TIME * (2*i));
			setTimeout(function() {
				getHacking.setAttribute("hidden", "true");
			}, GET_HACKING_TIME * (2*i+1));
		}
		setTimeout(function() {
			getHacking.setAttribute("hidden", "true");
		}, GET_HACKING_TIME);
	}

	function showPopup() {
		popupHeader.innerHTML = "OH NO!"
		popupContent.innerHTML = POPUPS[GAME.level];
		butt.setAttribute("hidden", "true");
		nextbutt.removeAttribute("hidden");
		nextbutt.innerHTML = "HACK " + LEVELS[GAME.level];

		overlay.removeAttribute("hidden");
	}
	function initializeWords() {
		var word_list;
		for (var i = 0; i < OUTPUTS.length; i++) {
			OUTPUT_WORDS.push(OUTPUTS[i].split(" "));
		}
	}
	preInit();
}