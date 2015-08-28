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
var request = require('request');

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

// Read examples directory
read_examples_directory();

// Download P5M Modules list
download_p5m_list();

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

};


/*

  download_p5m_list();

  Download the latest P5M list of Modules.

 */

function download_p5m_list() {
    global.app.p5m_list = [];
    var the_file = "http://raw.githubusercontent.com/necsoft/P5M/master/modules.json";
    request(the_file, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            global.app.p5m_list = JSON.parse(body);
        }
    });
}