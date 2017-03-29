/*
  * Get connected to Espruino as on http://www.espruino.com/Quick+Start
  * Copy/paste this into the right-hand side of the IDE
  * Upload, and on the left-hand side, type 'onInit()' to start it up
  
  To modify you can copy changed code from the right-hand side to the left to replace functions on the fly, or re-upload (but then you have to type `onInit()` again).
  
  When done, upload, then type `save()` and everything will be saved in to Flash and loaded at startup.
  
*/
var pins = {A:B15, B:B14, C:B13, D:B10,
            nG:B1, L:A6, S:A5, nEN:A8, nR:A7};
var BIG_BUTTON = B4;
var BIG_LED = LED1;
var pinAddr = {
  nR : pins.nR.getInfo().out_addr,
  nG : pins.nG.getInfo().out_addr,
  S : pins.S.getInfo().out_addr,
  L : pins.L.getInfo().out_addr,
  A : pins.A.getInfo().out_addr,
  B : pins.B.getInfo().out_addr,
  C : pins.C.getInfo().out_addr,
  D : pins.D.getInfo().out_addr,
  nEN : pins.nEN.getInfo().out_addr
};
var g = require("LPD6416").connect(pins);

// On initialisation...
require("Font8x16").add(Graphics);

// When drawing...
g.setFont8x16();


// ----------------------------------------------------------------------

var lastTime = getTime();
var lastBtnPress = getTime();
var pos = 0;
var testStarted = 0;
var testScore = 0;

function onInit() {
  lastTime = getTime();
  lastBtnPress = getTime();
  pos = 0;
  drawFunc = drawMaker;
}



function drawMaker(d) {
  pos += d*32;
  g.clear();
  g.setColor(1);
  g.drawString("@render_conf", 64-pos, 0);  
  g.setColor(2);  
  g.drawString("Hack", 64+80 - pos, 0);
  if (pos>240) {
    pos=0;
    drawFunc = drawTestTitle;
  }
}

function drawTestTitle(d) {
  pos += d*32;
  g.clear();
  g.setColor(1);
  g.drawString("Test", 64-pos, 0);
  g.setColor(2);  
  g.drawString("your", 64+40 - pos, 0);
  g.setColor(1);
  g.drawString("reactions!", 64+80-pos, 0);
  if (pos>240) {
    pos=0;
    drawFunc = drawMaker;
  }
}

function drawIntro(d) {
  pos += d*1.2;
  g.clear();
  var txt = "";
  if (pos<1) {
    g.setColor(1);  
    txt = "When";  
  } else if (pos<2) {
    g.setColor(2);  
    txt = "screen";  
  } else if (pos<3) {
    g.setColor(1);  
    txt = "flashes,";  
  } else if (pos<4) {
    g.setColor(2);  
    txt = "press";  
  } else if (pos<6) {
    g.setColor(1);  
    txt = "button!";  
  } else {
    startTest();
  }
  g.drawString(txt, (64-g.stringWidth(txt))/2, 0);  
}

function drawFlasher(d) {
  pos += d;  
  g.clear();
  var txt = "";
  if (pos<0) {
    g.clear();
  } else if (pos<4) {
    if ((pos*10)&1) {
      g.setBgColor(3);
      g.setColor(1);
      digitalWrite(BIG_LED, 1);
    } else {
      g.setBgColor(0);
      g.setColor(0);
      digitalWrite(BIG_LED, 0);
    }
    g.clear();
    g.drawString("Now!", (64-g.stringWidth("Now!"))/2, 0);  
  } else {
    g.setBgColor(3);
    g.setColor(1);
    g.clear();
    stopTest();
  }
  g.drawString(txt, (64-g.stringWidth(txt))/2, 0);  
}

function drawScore(d) {
  pos += d*1.2;
  g.clear();
  var txt = "";
  if (pos<1) {
    g.setColor(1);  
    txt = "You";  
  } else if (pos<2) {
    g.setColor(2);  
    txt = "took";  
  } else if (pos<5) {
    g.setColor(1);  
    txt = testScore+"ms";
  } else {
    pos=0;
    drawFunc = drawMaker;
  }
  g.drawString(txt, (64-g.stringWidth(txt))/2, 0);  
}

function drawTooEarly(d) {
  pos += d*1.2;
  g.clear();
  var txt = "";
  if (pos<1) {
    g.setColor(1);  
    txt = "Too";  
  } else if (pos<3) {
    g.setColor(2);  
    txt = "Early!";  
  } else {
    pos=0;
    drawFunc = drawMaker;
  }
  g.drawString(txt, (64-g.stringWidth(txt))/2, 0);  
}


function drawTooSlow(d) {
  pos += d*1.2;
  g.clear();
  var txt = "";
  if (pos<1) {
    g.setColor(1);  
    txt = "Too";  
  } else if (pos<3) {
    g.setColor(2);  
    txt = "Slow!";  
  } else {
    pos=0;
    drawFunc = drawMaker;
  }
  g.drawString(txt, (64-g.stringWidth(txt))/2, 0);  
}



function startTest() {  
  pos=-(2+Math.random()*5);  
  drawFunc = drawFlasher;
  testStarted = getTime()-pos;
  console.log(pos);
  console.log("Test Started at "+testStarted);
}

function stopTest(time) {
  g.setBgColor(3);
  g.setColor(1);
  pos=0;
  
  if (time) console.log("Button pressed at "+time);
    
  if (!time) {
    drawFunc = drawTooSlow;
  } else if (time <= testStarted) { 
    drawFunc = drawTooEarly;
  } else {
    testScore = ((time-testStarted)*1000).toFixed();
    drawFunc = drawScore;
  }
}

var drawFunc = drawMaker;



function animate() {
  var t = getTime();
  var d = t-lastTime;
  lastTime= t;
  drawFunc(d);

  g.scan();
  g.scan();
}

setInterval(animate,10);

pinMode(BIG_BUTTON, "input_pullup");

setWatch(function(e) {
  if (e.time<lastBtnPress+0.2) return;
  lastBtnPress = e.time;
  digitalWrite(BIG_LED, 0);
  if (drawFunc == drawMaker ||
      drawFunc == drawTestTitle) {
    pos = 0;
    drawFunc = drawIntro;
  } else if (drawFunc==drawIntro) {
    startTest();
  } else if (drawFunc==drawFlasher) {    
    stopTest(e.time);
  } else if (drawFunc==drawScore) {
    // don't do anything - always show score
  } else {
    pos = 0;
    drawFunc = drawIntro;
  }
}, BIG_BUTTON, {repeat:true, edge:"falling"});
