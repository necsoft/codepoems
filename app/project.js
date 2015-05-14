/*
  project.js

  Una instancia concreta de un proyecto.

  */


// Dependencias
var fs = require('fs');
var ui = require('./ui.js');

// Esta ventana se la vamos a pasar a ui.js
var gui = window.require("nw.gui");
var win = gui.Window.get();

// Empty object for this project
var project = {};

// Editor default config
var codemirror_config = {
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
}

// Save this context
var ctx = this;

// Document ready
$(document).ready(function() {

    // Get the project
    project = global.app.projects[global.app.projects.length - 1].project;

    // Set the focus app
    win.on('focus', function() {
        // console.log('Project ' + project.id + ' is now focused.');
        global.app.focused_project = project;
        ui.setFocusedWin(ctx, win);
    });

    // Codemirror Stuff
    initCodeMirror();

    // Initialize handlers
    ui.setupHandlers(window, win, editor, ctx);

    // Setup the sidebar
    ui.setSidebar();

});

/*
  initCodeMirror();

  Crea la configuración de CodeMirror.

  */

function initCodeMirror() {
    initCodeMirrorDocs();
}


/*
  initCodeMirrorDocs();

  Le agrega a nuestro MainFile y a nuestros SecondaryFiles un Doc
  de Codemirror asociado.

  */


function initCodeMirrorDocs() {

    // Creamos el doc del mainFile
    if (project.declared) {
        // Proyecto declarado
        var main_file_content = fs.readFileSync(project.mainFile.abs_path);
        var doc = CodeMirror.Doc(main_file_content.toString(), "processing");
        project.mainFile.doc = doc;
    } else {
        // Proyecto no declarado (el default cuando se abre codepoems)
        var doc = CodeMirror.Doc("\n//Welcome to codepoems!\n\n void setup(){\n\n}\n\n void draw(){\n\n}", "processing");
        project.mainFile.doc = doc;
    }

    // Creando los docs secundarios
    for (var i = 0; i < project.secondaryFiles.length; i++) {
        var file_content = fs.readFileSync(project.secondaryFiles[i].abs_path);
        project.secondaryFiles[i].doc = CodeMirror.Doc(file_content.toString(), "processing");
    }

    // Creamos el CodeMirror en base al textarea
    project.editor = CodeMirror.fromTextArea(window.document.getElementById("editor"), codemirror_config);

    //Swap the default doc
    project.editor.swapDoc(project.mainFile.doc);
}


/*
  swapDoc();

  Se encarga de hacer swap en el editor de CodeMirror.

  */


function swapDoc(type, index) {
    if (type === "main") {
        project.editor.swapDoc(project.mainFile.doc);
    }
    if (type === "secondary") {
        project.editor.swapDoc(project.secondaryFiles[index].doc);
    }
}