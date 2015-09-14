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

var doc_data;

$(document).ready(function() {

    // Load the documentation
    $.getJSON("./../doc/p5doc.json", function(data) {
        doc_data = data;
    });

});

/*

  searchInDocumentation();

  Search for the current selected text.

 */

function searchInDocumentation(selectedText) {

    // 20 chars limit
    if (selectedText != "" && selectedText.length < 20) {

        //
        // Filtering exceptions in the documentation
        // 

        if (selectedText === "(" || selectedText === ")" || selectedText === "()") {
            selectedText = "() (parentheses)"
        };

        if (selectedText === "{" || selectedText === "}" || selectedText === "{}") {
            selectedText = "{} (curly braces)"
        };

        if (selectedText === "[" || selectedText === "]" || selectedText === "[]") {
            selectedText = "[] (array access)"
        };

        if (selectedText === ".") {
            selectedText = ". (dot)"
        };

        if (selectedText === ",") {
            selectedText = ", (comma)"
        };

        if (selectedText === "/*" || selectedText === "*/" || selectedText === "/**/") {
            selectedText = "/* */ (multiline comment)"
        };

        if (selectedText === "/**") {
            selectedText = "/** */ (doc comment)"
        };

        if (selectedText === "//") {
            selectedText = "// (comment)"
        };

        if (selectedText === ";") {
            selectedText = "; (semicolon)";
        };

        if (selectedText === "=") {
            selectedText = "= (assign)";
        };

        if (selectedText === "=") {
            selectedText = "= (assign)";
        };

        if (selectedText === "!=") {
            selectedText = "!= (inequality)";
        };

        if (selectedText === "<") {
            selectedText = "< (less than)";
        };

        if (selectedText === "<=") {
            selectedText = "<= (less than or equal to)";
        };

        if (selectedText === "==") {
            selectedText = "== (equality)";
        };

        if (selectedText === ">") {
            selectedText = "> (greater than)";
        };

        if (selectedText === ">=") {
            selectedText = ">= (greater than or equal to)";
        };

        if (selectedText === "?:") {
            selectedText = "?: (conditional)";
        };

        if (selectedText === "!") {
            selectedText = "! (logical NOT)";
        };

        if (selectedText === "&&") {
            selectedText = "&& (logical AND)";
        };

        if (selectedText === "||") {
            selectedText = "|| (logical OR)";
        };

        if (selectedText === "&") {
            selectedText = "& (bitwise AND)";
        };

        if (selectedText === "<<") {
            selectedText = "<< (left shift)";
        };

        if (selectedText === ">>") {
            selectedText = ">> (right shift)";
        };

        if (selectedText === "|") {
            selectedText = "| (bitwise OR)";
        };

        if (selectedText === "%") {
            selectedText = "% (modulo)";
        };

        if (selectedText === "*") {
            selectedText = "* (multiply)";
        };

        if (selectedText === "*=") {
            selectedText = "*= (multiply assign)";
        };

        if (selectedText === "+") {
            selectedText = "+ (addition)";
        };

        if (selectedText === "++") {
            selectedText = "++ (increment)";
        };

        if (selectedText === "+=") {
            selectedText = "+= (add assign)";
        };

        if (selectedText === "-") {
            selectedText = "- (minus)";
        };

        if (selectedText === "--") {
            selectedText = "-- (decrement)";
        };

        if (selectedText === "-=") {
            selectedText = "-= (subtract assign)";
        };

        if (selectedText === "/") {
            selectedText = "/ (divide)";
        };

        if (selectedText === "/=") {
            selectedText = "/= (divide assign)";
        };

        //
        // Note:
        // 
        // I have to create a filter for the int / int()
        //

        // If not a filtered word, test the original one.
        var test_reg = new RegExp(escapeRegExp(selectedText), "g");
        var matches = [];

        // Search for match
        for (var i = 0; i < doc_data.length; i++) {
            if (doc_data[i].name.match(test_reg)) {
                if (doc_data[i].name === selectedText || doc_data[i].name === selectedText + "()") {
                    matches.push(i);
                }
            }
        }

        if (matches.length > 0) {
            placeDocumentation(doc_data[matches[0]]);
        }

    }
}

// escapeRegExp one-liner
function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}



/* 
  
  placeDocumention()

  Show the documentation for the selected data.

*/

function placeDocumentation(data) {

    $(".title_name").fadeIn();

    // Clean the div
    $('.title').empty();
    $('.description').empty();
    $('.examples').empty();
    $('.syntax').empty();
    //$('.parameters').empty();
    $('.parameters_table').empty();

    // Set the title
    $('.title').text(data.name);

    // Set the description
    var description = data.description.replace(/\r?\n/g, '<br>');
    description = description.replace("<br>", "");

    $('.description').html(description);

    // Set the examples + imgs
    for (var i = 0; i < data.examples.length; i++) {

        var text_to_apply = data.examples[i].replace(/\n/g, "<br>");
        // Remove first break line
        text_to_apply = text_to_apply.replace("<br>", "");

        if (data.examples_img[i]) {

            var external_link = data.examples_img[i].toString();
            var file_name = external_link.split('https://www.processing.org/reference/images/')[1];
            var local_path = "../doc/imgs/" + file_name;

            $('.examples').append("<div class='example'><div class='example_img'><img width='100' height='100' src='" + local_path + "'></div> <div class='example_code'><p>" + text_to_apply + "</p></div></div>");
        } else {
            $('.examples').append("<div class='example'><div class='example_code'><p>" + text_to_apply + "</p></div></div>");
        }
    }

    // Set the syntax
    var syntax_to_apply = data.syntax.replace(/\n/g, "<br>");
    $('.syntax').append(syntax_to_apply);

    for (var i = 0; i < data.parameters.length; i++) {
        $('.parameters_table').append("<tr><td class='td_name'>" + data.parameters[i].name + "</td><td class='td_description'>" + data.parameters[i].description + "</td></tr>");
    }

}