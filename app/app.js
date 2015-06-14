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

// Write the default settings
global.app.settings = require('./settings.json');

// Create the initial UI
ui.setupUi();