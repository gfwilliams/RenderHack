/** Write this file using https://www.espruino.com/ide/

http://www.espruino.com/Puck.js+Quick+Start to get connected.

However - this code is already pre-programmed, so no need to
program it if you don't want to change it.
*/
function goto(x) {
  var n = 50;
  var int = setInterval(function() {
    digitalPulse(D1,1,2.2-E.clip(x,0,1)*1.4);
    if (n-- <= 0)
      clearInterval(int);
  },20); 
}
