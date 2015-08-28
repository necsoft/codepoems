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
var fs = require('fs');
var path = require('path');
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

    // Show the initial list
    showList();

    // Handle the focus and refresh
    win.on('focus', function() {
        showList();
    });

});

function showList() {

    // Clean the modules
    $('.modules').empty();

    for (var i = 0; i < global.app.p5m_list.length; i++) {

        // Module div
        $('.modules').append('<div class="module"></div>');
        var $module = $('.module').last();

        // Module data
        var the_name = global.app.p5m_list[i].name;
        var the_description = global.app.p5m_list[i].description;
        var the_repository = global.app.p5m_list[i].repository;
        var the_file = global.app.p5m_list[i].raw_main;
        var installed = $.inArray(the_name, global.app.focused_project.modules) !== -1;

        // Title
        $module.append("<h1>" + the_name + "</h1>");
        // Description
        $module.append("<p>" + the_description + "</p>");
        // Install button
        if (installed === false) {
            $module.append('<button class="install_button add_to_poject" data-file="' + the_file + '" data-name=' + the_name + '>Add to project</button>');
        } else {
            $module.append('<button class="install_button button_installed" data-file="' + the_file + '" data-name=' + the_name + '>Installed <i class="icon-done"></i></button>');
        }
        // View on github
        $module.append('<button class="view_on_github" data-repository="' + the_repository + '">View on github</button>');

    }


    // Handle view on github.
    $(".view_on_github").click(function() {
        gui.Shell.openExternal($(this).data("repository"));
        console.log("hola");
    });


    // Handle install
    $(".install_button").click(function() {
        if (global.app.focused_project.declared === true) {
            addModuleToProject($(this).data("file"), $(this).data("name"), global.app.focused_project);
        } else {
            alert("Please, save the project first.")
        }
    })



}


function addModuleToProject(raw_main, name, project) {

    // Request the file
    request(raw_main, function(err, res, body) {
        var file_location = project.directory + path.sep + name + ".pde";

        // Write the file
        fs.writeFile(file_location, body, function(err) {
            if (err) {
                console.log(err);
            }
            // Push the module to the project
            project.modules.push(name);

            // Push the file
            project.files.push({
                type: "module",
                name: name,
                extension: ".pde",
                rel_path: path.sep + name + ".pde",
                saved: true,
                declared: true
            });

            // Refresh sidebar
            project.ctx.refreshSidebar();

            // Refresh P5M
            showList();

        });


    });

}