/*
  > win_live_documentation.js
  
  Codepoems live documentation window

  */

// Dependencies
var gui = require('nw.gui');
var ui = require('./ui.js');
var win = gui.Window.get();

// Set the window as active
global.app.live_documentation_window_active = true;

// Handle the close of the window
win.on('close', function() {
    this.hide();
    global.app.live_documentation_window_active = false;
    this.close(true);
});

//win.showDevTools();

var doc_data;

$(document).ready(function() {

    // Load the documentation
    $.getJSON("./../doc/p5doc.json", function(data) {
        doc_data = data;
    });

});

function searchInDocumentation(selectedText) {
    // 20 chars limit
    if (selectedText != "" && selectedText.length < 20) {
        var test_reg = new RegExp(selectedText, "g");
        var matches = [];
        // Search for matches
        for (var i = 0; i < doc_data.length; i++) {
            if (doc_data[i].name.match(test_reg)) {
                // Push the match
                matches.push(i);
            }
        }

        if (matches.length > 0) {
            placeDocumentation(doc_data[matches[0]]);
        }

    }
}

function placeDocumentation(data) {

    // Clean the div
    $('.title').empty();
    $('.description').empty();
    $('.examples').empty();


    // Set the title
    $('.title').text(data.name);

    // Set the description
    $('.description').html(data.description.replace(/\n/g, "<br>"));


    // Set the examples + imgs
    for (var i = 0; i < data.examples.length; i++) {


        if (data.examples_img[i]) {
            $('.examples').append("<div class='example'> <div class='example_img'><img width='100' height='100' src='" + data.examples_img[i] + "'></div> <div class='example_code'><p>" + data.examples[i] + "</p></div></div>");
        } else {
            $('.examples').append("<div class='example'><div class='example_code'><p>" + data.examples[i] + "</p></div></div>");
        }

    }




}