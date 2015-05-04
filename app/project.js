/*
  project.js

  Se encarga de gestionar un proyecto de processing. 

  */

var ui = require('./ui.js');

// Esta ventana se la vamos a pasar a ui.js
var gui = window.require("nw.gui");
var win = gui.Window.get();

// Empty object for this project
var project = {};

// Save this context
var ctx = this;

// Reference the global app
var app = global.app;

$(document).ready(function() {

    // Project configuration
    project.id = new Date().getTime(); // Timestamp
    project.name = "sketch" + project.id;
    project.saved = false;
    project.declared = false;
    app.projects.push({
        project
    });

    console.log(project.id)

    // Set the focus app
    win.on('focus', function() {
        console.log('Project ' + project.id + ' is now focused.');
        app.focused_project = project;
        ui.setFocusedWin(win);
    });


    initCodeMirror();

    // Initialize handlers
    ui.setupHandlers(window, win, editor, ctx);


    ui.setupSidebar();


});

/*
  initCodeMirror()

  Crea la configuración de CodeMirror.

 */

function initCodeMirror() {
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
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        viewportMargin: Infinity
    });
}