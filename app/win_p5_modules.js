/*
  > win_p5_modules.js
  
  Codepoems p5 modules window

  */

// Dependencies
var gui = require('nw.gui');
var ui = require('./ui.js');
var win = gui.Window.get();

// Set the window as active
global.app.p5_modules_window_active = true;

// Handle the close of the window
win.on('close', function() {
    this.hide();
    global.app.p5_modules_window_active = false;
    this.close(true);
});