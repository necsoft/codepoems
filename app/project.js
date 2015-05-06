/*
  project.js

  Se encarga de gestionar un proyecto de processing. 

  */


// Dependencias

var fs = require('fs');
var ui = require('./ui.js');


// Esta ventana se la vamos a pasar a ui.js
var gui = window.require("nw.gui");
var win = gui.Window.get();

// Empty object for this project
var project = {};

// Save this context
var ctx = this;


$(document).ready(function() {

    // Get the project
    project = global.app.projects[global.app.projects.length - 1].project;

    // Set the focus app
    win.on('focus', function() {
        console.log('Project ' + project.id + ' is now focused.');
        global.app.focused_project = project;
        ui.setFocusedWin(ctx, win);
    });

    // Codemirror Stuff
    initCodeMirrorEditor();
    initCodeMirrorDocs();

    // Initialize handlers
    ui.setupHandlers(window, win, editor, ctx);
    // Setup the sidebar
    ui.setSidebar();

});

/*
  initCodeMirrorEditor();

  Crea la configuración de CodeMirror.

 */

function initCodeMirrorEditor() {
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


/*
  initCodeMirrorDocs

  Le agrega a nuestro MainFile y a nuestros SecondaryFiles un Doc
  de Codemirror asociado.

*/


function initCodeMirrorDocs() {

    if (project.secondaryFiles) {
        for (var i = 0; i < project.secondaryFiles.length; i++) {
            //console.log("HOLA");
        }
    }



}