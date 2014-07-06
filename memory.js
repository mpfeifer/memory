var canvas = document.getElementById('memcan');
var ctx = canvas.getContext('2d');

var errorLevel = 4; // 0 - log everything ; 4 - log nothing

var fieldWidth = 128;
var fieldHeight = fieldWidth;
var deckXdim = 6;
var deckYdim = 5;
var paddingLeft = 32;
var paddingTop = 32;

// deck codes
var deckCardEliminated = -1;
var deckShowBackground  = 0;
var deckShowCardVisible = 1;

var deck = [];
var images = [];
var imageSources = [ "bird2.png", "bird.png", "turtle.png" ];
var imageObjects = [];

var hInterFieldSpace = 15;
var vInterFieldSpace = 15;


var blankRGB = [128, 128, 128];
var backgroundRGB = [150, 150, 255];
var cardBackgroundRGB = [ 75, 75, 255 ];

// 0 - wait for first click
// 1 - one card visible
// 2 - second card visible
// 3 - wait for third click to revert to 0
var gameState = 0;

var firstSelection = [-1, -1];
var secondSelection = [-1, -1];

// results
var pairsFound = 0;

function debug(msg, level) {
    if (level > errorLevel) {
	alert(msg);
    }
}

function MemoryInitDeck() {
    deck = new Array(deckXdim);
    images = new Array(deckXdim);
    for (x=0; x<deckXdim; x++) {
	deck[x] = new Array(deckYdim);
	images[x] = new Array(deckYdim);
	for (y=0; y<deckYdim; y++) {
	    deck[x][y]=deckShowBackground;
	    images[x][y]=(x*deckYdim+y)%3;
	}
    }
    imageObjects = new Array(3);
    for (i=0; i<3; i++) {
	imageObjects[i] = new Image();
	imageObjects[i].src = imageSources[i];
    }
}

function MouseToCardIndex(mousex, mousey) {
    var cardIndex = [-1, -1];

    var tmpx = mousex - paddingLeft;
    var xindex = Math.floor( tmpx / ( fieldWidth + hInterFieldSpace ) );
    tmpx = tmpx - xindex * ( fieldWidth + hInterFieldSpace );

    if (tmpx <= fieldWidth) {
	cardIndex[0] = xindex;
    }

    var tmpy = mousey - paddingTop;
    var yindex = Math.floor( tmpy / ( fieldHeight + vInterFieldSpace ) );
    tmpy = tmpy - yindex * ( fieldHeight + vInterFieldSpace );

    if (tmpy <= fieldHeight) {
	cardIndex[1] = yindex;
    }

    return cardIndex;
}

function rgbstr(r, g, b) {
    return "rgb(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ")";
}

function MemoryDrawBackground() {
    ctx.fillStyle = rgbstr(backgroundRGB[0], backgroundRGB[1], backgroundRGB[2]);
    ctx.fillRect (0, 0, canvas.width, canvas.height);
}

function MemoryDrawResults() {
    var BorderOffsetLeft = paddingLeft + deckXdim * ( fieldWidth + hInterFieldSpace );
    var BorderOffsetTop = paddingTop;

    // a red box
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.rect(BorderOffsetLeft, paddingTop, canvas.width - 2 * paddingLeft - BorderOffsetLeft, canvas.height - 2 * paddingTop );
    ctx.stroke();

    var InnerOffsetLeft = 15;
    var InnerOffsetTop = 35;
    var LineHeight = 45;

    // a nice text
    ctx.font = "20px Georgia";
    ctx.fillStyle = "blue";
    ctx.fillText("Willkommen bei \"Memorie\" - Das Spiel mit", BorderOffsetLeft + InnerOffsetLeft, BorderOffsetTop + InnerOffsetTop);
    ctx.fillText("dem sie ihr Gedächtnis test können.", BorderOffsetLeft + InnerOffsetLeft, LineHeight + BorderOffsetTop + InnerOffsetTop);

    // the number of pairs already found
    ctx.font = "20px Georgia";
    ctx.fillStyle = "blue";
    ctx.fillText("Sie haben " + pairsFound + " Paare gefunden.", BorderOffsetLeft + InnerOffsetLeft, 2*LineHeight + BorderOffsetTop + InnerOffsetTop);
    ctx.fillText( ( (deckXdim * deckYdim ) / 2 - pairsFound ) + " Paare sind noch versteckt.", BorderOffsetLeft + InnerOffsetLeft, 3*LineHeight + BorderOffsetTop + InnerOffsetTop);    
    
    
//    MemoryCopyrightNotice(BorderOffsetLeft + InnerOffsetLeft, canvas.height - paddingTop - 15);
}

function MemoryCopyrightNotice(x, y) {
    ctx.font = "20px Georgia";
    ctx.fillStyle = "blue";
    ctx.fillText("\u00A9 Matthias Pfeifer", x, y);
}

function ShowEliminatedCard(rgb, currentX, currentY) {
    ctx.fillStyle = rgbstr(rgb[0], rgb[1], rgb[2]);
    ctx.fillRect (currentX, currentY, fieldWidth, fieldHeight);
}   
 
function ShowCardImage(x, y) {
    ctx.drawImage(imageObjects[images[x][y]], paddingLeft+x*(hInterFieldSpace+fieldWidth), paddingTop + y * (vInterFieldSpace + fieldHeight) );
}

function ShowCardBackground(rgb, currentX, currentY) {
    ctx.fillStyle = rgbstr(rgb[0], rgb[1], rgb[2]);
    ctx.fillRect (currentX, currentY, fieldWidth, fieldHeight);
}

function MemoryDrawDeck() {

    // background
    MemoryDrawBackground();

    // results
    MemoryDrawResults();
    
    var currentX=paddingLeft;

    // the playing cards
    for (x=0; x<deckXdim; x++) {
	var currentY=paddingTop;
	for (y=0; y<deckYdim; y++) {
	    var drawImage=0;
	    var rgb;
	    switch (deck[x][y]) {
	    case deckCardEliminated:
		ShowEliminatedCard(backgroundRGB, currentX, currentY);
		break;
	    case deckShowBackground:
		ShowCardBackground(cardBackgroundRGB, currentX, currentY);
		break;
	    case deckShowCardVisible:
		ShowCardImage(x, y);
		break;
	    }
	    currentY+=fieldHeight + vInterFieldSpace;
	}
	currentX+=fieldWidth + hInterFieldSpace;
    }
}


function MemoryOnLoadHandler() {
    // maximize canvas width and hight
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    MemoryDrawDeck();
    
    debug("OnLoadHandler reports canvas width = "
	  + canvas.width + " and canvas height = "
	  + canvas.height + ".", 4);
}

function MemoryCardSelectionHandler(event, selection) {
    var cardIndex = MouseToCardIndex(event.pageX, event.pageY);
    var x = cardIndex[0];
    var y = cardIndex[1];
    debug("X=" + x + ", Y=" + y, 1);
    if (x>-1 && y>-1 && x<deckXdim && y< deckYdim && (deck[x][y] == deckShowBackground)) {
	deck[x][y] = deckShowCardVisible;
	selection[0]=x;
	selection[1]=y;
	// if card is still available and was not yet visible
	// increment gameState to the next state.
	gameState+=1;
    }
}

function MemoryCheckResult() {
    var result;
    if (images[firstSelection[0]][firstSelection[1]] == images[secondSelection[0]][secondSelection[1]]) {
	result = deckCardEliminated;
	pairsFound++;
    } else {
	result = deckShowBackground;
    }
    deck[firstSelection[0]][firstSelection[1]] = result;
    deck[secondSelection[0]][secondSelection[1]] = result;
    gameState = 0;
}

function MemoryClickHandler(event) {
    switch (gameState) {
    case 0:
	MemoryCardSelectionHandler(event, firstSelection);
	debug("case 0 - State=" + gameState, 2);	
	break;
    case 1:
	MemoryCardSelectionHandler(event, secondSelection);
	debug("case 1 - State=" + gameState, 2);	
	break;
    case 2:
	MemoryCheckResult();
	debug("case 2 - State=" + gameState, 2);		
	break;
    }
    MemoryDrawDeck();
}

MemoryInitDeck();

window.onload=MemoryOnLoadHandler;

canvas.addEventListener('click', MemoryClickHandler);
