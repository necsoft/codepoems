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

    // Set the groups
    for (var i = 0; i < global.app.examples.length; i++) {
        var this_group = global.app.examples[i];

        $('.examples').append('<div class="examples_group"></div>');
        $('.examples_group').last().append("<h1>" + this_group.name + "</h1>");

        // Set the categories
        for (var j = 0; j < global.app.examples[i].categories.length; j++) {
            var this_category = global.app.examples[i].categories[j];
            $('.examples_group').last().append('<div class="examples_category"></div>');
            $('.examples_category').last().append("<h2>" + this_category.name + "</h2>");
            $('.examples_category').last().append('<div class="category_sketches"></div>');
            // Set the sketches
            for (var k = 0; k < global.app.examples[i].categories[j].sketchs.length; k++) {
                var this_sketch = global.app.examples[i].categories[j].sketchs[k];
                $('.category_sketches').last().append("<h5 class='sketch_button' data-path='" + this_sketch.full_path + "'>" + this_sketch.name + "</h5>");
            }
        }
    }

    // Category handler
    $('.examples_category h2').click(function() {
        $(this).parent().find(".category_sketches").slideToggle();
    });

    // Sketch handler
    $('.sketch_button').click(function() {
        p5manager.openProject($(this).data("path") + path.sep + $(this).text() + ".pde");
    });

});