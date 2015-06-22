/*
  > win_examples.js
  
  Codepoems examples window

  */

// Dependencies
var gui = require('nw.gui');
var ui = require('./ui.js');
var p5manager = require('./p5manager.js');
var path = require('path');
var win = gui.Window.get();
var readdirp = require('readdirp');

// Set the window as active
global.app.examples_window_active = true;

// Handle the close of the window
win.on('close', function() {
    this.hide();
    global.app.examples_window_active = false;
    this.close(true);
});

//win.showDevTools();

$(document).ready(function() {

    // Set the DOM
    for (var i = 0; i < global.app.example_files.length; i++) {
        $('.examples').append("<div class='example_button'>" + global.app.example_files[i] + "</div>")
    }

    // Handle click
    $('.example_button').click(function() {
        var the_folder = process.cwd() + path.sep + "examples" + path.sep + $(this).text();
        var the_name = the_folder.split(path.sep).reverse()[0];
        var the_path = the_folder + path.sep + the_name + ".pde";
        p5manager.openProject(the_path);
    })

});