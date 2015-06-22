/*
  > win_live_documentation.js
  
  Codepoems live documentation window

  */

// Dependencies
var gui = require('nw.gui');
var ui = require('./ui.js');
var win = gui.Window.get();

// Set the window as active
global.app.live_documentation_window_active = true;

// Handle the close of the window
win.on('close', function() {
    this.hide();
    global.app.live_documentation_window_active = false;
    this.close(true);
});