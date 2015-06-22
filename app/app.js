/*
  app.js

  This is the main file of the app.

  */

var fs = require('fs');
var readdirp = require('readdirp');
var ui = require('./ui.js');
var path = require('path');

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

// Read the example files
global.app.example_files = [];

readdirp({
    root: './examples/',
    depth: 3
}).on('data', function(entry) {
    if (entry.parentDir.split(path.sep).length > 2) {
        global.app.example_files.push(entry.parentDir.toString());
    };
});

// Create the initial UI
ui.setupUi();