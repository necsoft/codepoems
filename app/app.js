/*
  app.js

  This is the main file of the app.

  */

var fs = require('fs');
var readdirp = require('readdirp');
var ui = require('./ui.js');
var path = require('path');
var exec = require('child_process').exec;
var rimraf = require('rimraf');

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
global.app.default_window = {
    "frame": false,
    "width": 900,
    "height": 700,
    "resizable": true,
    "min_width": 700,
    "min_height": 700,
}

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

// Create the initial UI if the user has processing-java
check_processing_java(function(data) {
    if (data) {
        ui.setupUi();
    } else {
        ui.installProcessingJava();
    };
});

// Delete temporals
rimraf("./app/tmp/", function() {});

/*

  check_processing_java()

  Check if processing java exists in the 

 */

function check_processing_java(callback) {
    var child = exec('which ' + 'processing-java');
    var data = false;

    child.stdout.on('data', function() {
        data = true;
    });

    child.on('close', function() {
        callback(data);
    });
}