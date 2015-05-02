/*
  app.js

  This is the main nw.js file.

  */

var ui = require('./ui.js');

// App information
global.app = {};
global.app.name = "Codepoems";
global.app.platform = process.platform;
global.app.projects = [];
global.app.focused_project = {};

// Create the initial UI
ui.setupUi();