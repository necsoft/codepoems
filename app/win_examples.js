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

$(document).ready(function() {

    // Set the DOM
    // for (var i = 0; i < global.app.example_files.length; i++) {
    //     $('.examples').append("<div class='example_button'><h5>" + global.app.example_files[i] + "</h5><h1>Holis<h1></div>");
    // }

    // Handle click
    // $('.example_button').click(function() {
    //     var the_folder = process.cwd() + path.sep + "examples" + path.sep + $(this).text();
    //     var the_name = the_folder.split(path.sep).reverse()[0];
    //     var the_path = the_folder + path.sep + the_name + ".pde";
    //     p5manager.openProject(the_path);
    // });



    // Set the groups
    for (var i = 0; i < global.app.examples.length; i++) {
        var this_group = global.app.examples[i];
        $('.examples').append("<h1>" + this_group.name + "</h1>");
        // Set the categories
        for (var j = 0; j < global.app.examples[i].categories.length; j++) {
            var this_category = global.app.examples[i].categories[j];
            $('.examples').append("<h3>" + this_category.name + "</h3>");
            // Set the sketches
            for (var k = 0; k < global.app.examples[i].categories[j].sketchs.length; k++) {
                var this_sketch = global.app.examples[i].categories[j].sketchs[k];
                $('.examples').append("<h5>" + this_sketch.name + "</h5>");
            }
        }
    }

});