/*
  project.js

  Se encarga de gestionar un proyecto de processing. 

  */

var ui = require('./ui.js');

// Esta ventana se la vamos a pasar a ui.js
var gui = window.require("nw.gui");
var win = gui.Window.get();

$(document).ready(function() {

    // Reference the global app
    var app = global.app;

    // Create app
    var project = {};
    project.id = new Date().getTime(); // Timestamp
    project.saved_project = false;
    project.new_project = true;

    // Put this project in the global.app.projects
    app.projects.push({
        project
    });

    // Set the focus app
    win.on('focus', function() {
        console.log('Project ' + project.id + ' is now focused.');
        app.focused_project = project;
        ui.setFocusedWin(win);
    });

    // Initialize Codemirror
    project.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        lineNumbers: true,
        lineWrapping: true,
        mode: "processing",
        keyMap: "sublime",
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        theme: "paraiso-dark",
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    });

    // Initialize handlers
    ui.setupHandlers(window, win, editor);

});

function abrirVentana() {
    console.log("Voy a abrir una ventana");
    var new_win = gui.Window.open('project.html', {
        "frame": false,
        "width": 600,
        "height": 700,
        "resizable": false
    });
}