/*
  * Get connected to Espruino as on http://www.espruino.com/Quick+Start
  * Copy/paste this into the right-hand side of the IDE
  * Upload, and on the left-hand side, type 'onInit()' to start it up
  * Now connect something to WiFi network 'WiFi_Leds', password 0123456789
  * Go to http://192.168.4.1
  * Click and drag on the canvas, and make sure you release the mouse button on the canvas
  * The LEDs should update!
  
  To modify you can copy changed code from the right-hand side to the left to replace functions on the fly, or re-upload (but then you have to type `onInit()` again and the network connection will drop out).
  
  When done, upload, then type `save()` and everything will be saved in to Flash and loaded at startup.
  
*/

var WIFI_NAME = "WiFi_Leds";
var WIFI_OPTIONS = {
  password: "0123456789",
  authMode : "wpa2"
};

var wifi;
var g = Graphics.createArrayBuffer(16,16,24,{zigzag:true});

var HTML = `<html>
  <head><title>WiFi Leds</title></head>
  <body style="margin:0px">
    <canvas id="canv" width="16" height="16" style="border:1px solid black"></canvas>
    <script>
      var canvas = document.getElementById('canv');
      var ctx = canvas.getContext("2d");
      ctx.fillRect(0,0,16,16);
      ctx.fillStyle = "white";
  
      canvas.addEventListener("mousemove", function (e) {
        if (e.buttons)
          ctx.fillRect(e.clientX, e.clientY,1,1);
      }, false);
      canvas.addEventListener("mouseup", function (e) {
        var pixels = ctx.getImageData(0, 0, 16, 16);
        var data = "";
        for (var i=0;i<16*16;i++) {
          data += String.fromCharCode(
            pixels.data[i*4],
            pixels.data[i*4+1],
            pixels.data[i*4+2]);
        }
        httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', '/set?data='+btoa(data), true);
        httpRequest.send(null);
      }, false);
    </script>
  </body>
</html>`;


function setLeds(data) {  
  var img = {
    width : 16, height : 16, bpp : 24,
    buffer : E.toArrayBuffer(data)
  };
  g.drawImage(img,0,0);
  require("neopixel").write(B15, g.buffer);
}

function pageHandler(req, res) {
  var u = url.parse(req.url, true);
  if (u.pathname=="/") {    
    res.writeHead(200);
    res.end(HTML);
  } else if (u.pathname=="/set") {
    if (u.query && u.query.data)
      setLeds(atob(u.query.data));
    res.writeHead(200);
    res.end(HTML);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("404: Page not found");    
  }
}

function onInit() {
  // reset the neopixels
  g.clear();
  require("neopixel").write(B15, g.buffer);
  wifi = require("EspruinoWiFi");
  // init wifi
  wifi.startAP(WIFI_NAME, WIFI_OPTIONS, function(err) {
    if (err) {
      console.log("Connection error: "+err);
      return;
    }
    console.log("WiFi ok - please connect to http://192.168.1.4");
    require("http").createServer(pageHandler).listen(80);
  });
}