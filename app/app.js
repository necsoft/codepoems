/*
  app.js

  This is the main file of the app.

  */

var fs = require('fs');
var ui = require('./ui.js');

// App information
global.app = {};
global.app.platform = process.platform;
global.app.projects = [];
global.app.focused_project = {};

// Windows
global.app.settings_window_active = false;
global.app.live_documentation_window_active = false;
global.app.examples_window_active = false;
global.app.p5_modules_window_active = false;

// Write the default settings
global.app.settings = require('./settings.json');

// Create the initial UI
ui.setupUi();