/*
  > win_settings.js
  
  Codepoems settings window

  */

// Dependencies
var gui = require('nw.gui');
var ui = require('./ui.js');
var win = gui.Window.get();

// Set the window as active
global.app.settings_window_active = true;

// Handle the close of the window
win.on('close', function() {
    this.hide();
    global.app.settings_window_active = false;
    this.close(true);
});

$(document).ready(function() {

    // Set the default values
    var actual_font_size = global.app.settings.font_size;
    $(".default_template_textarea").val(global.app.settings.default_template);
    $(".font_size_input").val(global.app.settings.font_size);
    $(".select_theme").val(global.app.settings.theme);


    // Handle plus button
    $(".plus_button").click(function() {
        if (actual_font_size < 32) {
            actual_font_size++;
            change_font_size();
        }
    });

    // Handle minus button
    $(".minus_button").click(function() {
        if (actual_font_size > 7) {
            actual_font_size--;
            change_font_size();
        }
    });

    // Select the theme
    $('.select_theme').on('change', function() {
        ui.actions_change_theme(this.value);
        global.app.settings.theme = this.value;
        ui.action_save_default_settings();
    });

    // Change and save the font size
    function change_font_size() {
        $(".font_size_input").val(actual_font_size);
        global.app.settings.font_size = actual_font_size;
        ui.actions_change_font_size(actual_font_size);
        ui.action_save_default_settings();
    }

    // Save the default template
    $(".save_default_template").click(function() {
        global.app.settings.default_template = $(".default_template_textarea").val();
        ui.action_save_default_settings();
    })

});