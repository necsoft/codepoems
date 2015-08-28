/*
  > win_p5_modules.js
  
  Codepoems p5 modules window.

  THIS IS AN EXPERIMENTAL FEATURE.

  */

// Dependencies
var gui = require('nw.gui');
var ui = require('./ui.js');
var win = gui.Window.get();
var request = require('request');
var modules_url = "http://raw.githubusercontent.com/necsoft/P5M/master/modules.json";
var modules;

// Set the window as active
global.app.p5_modules_window_active = true;

// Handle the close of the window
win.on('close', function() {
    this.hide();
    global.app.p5_modules_window_active = false;
    this.close(true);
});

$(document).ready(function() {

    for (var i = 0; i < global.app.p5m_list.length; i++) {
        $('.modules').append('<div class="module"></div>');
        var $module = $('.module').last();

        var the_name = global.app.p5m_list[i].name;
        var the_description = global.app.p5m_list[i].description;
        var the_repository = global.app.p5m_list[i].repository;
        var the_file = global.app.p5m_list[i].raw_main;

        $module.append("<h1>" + the_name + "</h1>");
        $module.append("<p>" + the_description + "</p>");

        $module.append('<button class="install_button" data-file="' + the_file + '" data-name=' + the_name + '>Add to project</button>');
        $module.append('<button class="view_on_github" data-repository="' + the_repository + '">View on github</button>');

    }


    // Handle view on github
    $(".view_on_github").click(function() {
        gui.Shell.openExternal($(this).data("repository"));
    })

});



function addModuleToProject() {

}