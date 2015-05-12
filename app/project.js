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

// Save this context
var ctx = this;



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
    // Initialize Codemirror
    initCodeMirrorDocs();
}


/*
  initCodeMirrorDocs();

  Le agrega a nuestro MainFile y a nuestros SecondaryFiles un Doc
  de Codemirror asociado.

  */


function initCodeMirrorDocs() {

    // Creando el doc del mainFile en caso de que no sea un proyecto declarado
    // cre
    if (project.mainFile.abs_path !== "") {
        var main_file_content = fs.readFileSync(project.mainFile.abs_path);
        var doc = CodeMirror.Doc(main_file_content.toString(), "processing");
        project.mainFile.doc = doc;
    } else {
        // Doc default si el 
        var doc = CodeMirror.Doc("\n//Welcome to codepoems!\n\n void setup(){\n\n}\n\n void draw(){\n\n}", "processing");
        project.mainFile.doc = doc;
    }

    // Creando los docs secundarios
    for (var i = 0; i < project.secondaryFiles.length; i++) {
        var file_content = fs.readFileSync(project.secondaryFiles[i].abs_path);
        project.secondaryFiles[i].doc = CodeMirror.Doc(file_content.toString(), "processing");
    }

    // Editor default config
    var default_config = {
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

    project.editor = CodeMirror.fromTextArea(window.document.getElementById("editor"), default_config);

    //Swap the default doc
    project.editor.swapDoc(project.mainFile.doc);
}





function swapDoc(type, index) {
    console.log("Voy a swappear un doc secundario");

    if (type === "main") {
        project.editor.swapDoc(project.mainFile.doc);
    }

    if (type === "secondary") {
        project.editor.swapDoc(project.secondaryFiles[index].doc);
    }

}