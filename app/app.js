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

read_examples_directory();

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

/*

  read_examples_directory();

  Reads and classifies the examples directory. 

 */

function read_examples_directory() {

    global.app.examples = [];

    // Read the groups
    readdirp({
        root: './examples/',
        depth: 0,
        entryType: 'directories'
    }).on('data', function(entry) {

        var this_group = {};
        this_group.name = entry.name;
        this_group.categories = [];

        // Read the categories
        readdirp({
            root: entry.fullPath,
            depth: 0,
            entryType: 'directories'
        }).on('data', function(entry) {
            var this_category = {};
            this_category.name = entry.name;
            this_category.sketchs = [];
            // Read the sketchs
            readdirp({
                root: entry.fullPath,
                depth: 0,
                entryType: 'directories'
            }).on('data', function(entry) {
                var this_sketch = {};
                this_sketch.name = entry.name;
                this_sketch.full_path = entry.fullPath;
                this_category.sketchs.push(this_sketch);
            });
            this_group.categories.push(this_category);
        });

        global.app.examples.push(this_group);
    });

}