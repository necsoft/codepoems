/*
  > project.js

  Una instancia concreta de un proyecto. Se crea una por cada ventana que hay de codepoems. Entendemos
  como proyecto a el conjunto de archivos de processing que forman una aplicación

  El project.js se encarga de:

  * Refrescar el sidebar
  * Agregar un archivo al proyecto (agregarlo al sidebar y pushear el doc correspondiente)
  * Hacer swap de los docs
  * Inicializar los dos 
  * Poner en foco al contexto

  */

// Dependencias
var fs = require('fs');
var path = require('path');
var ui = require('./ui.js');

// Esta ventana se la vamos a pasar a ui.js
var gui = window.require("nw.gui");
var win = gui.Window.get();

// Empty object for this project
var project = {};

// Editor default config
var codemirror_config = {
    lineNumbers: true,
    lineWrapping: false,
    mode: "processing",
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    styleActiveLine: true,
    theme: "codepoems-dark",
    foldGutter: true,
    tabSize: 2,
    extraKeys: {
        "Ctrl-Space": "autocomplete"
    },
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    viewportMargin: Infinity,
}

// Save this context
var ctx = this;

// Document ready
$(document).ready(function() {

    // Get the project
    project = global.app.projects[global.app.projects.length - 1].project;

    // Lo uso para saber si este proyecto tiene un proces corriendo.
    project.running = false;
    project.running_pid = "";
    // Me guardo el contexto para que se puedan modificar el lote
    project.ctx = ctx;

    global.app.focused_project = project;

    // Set the focus app
    win.on('focus', function() {
        // console.log('Project ' + project.id + ' is now focused.');
        global.app.focused_project = project;
        ui.setFocusedWin(ctx, win);
    });

    // Fix para el drag
    $(".upnav").click(function() {
        $(".upnav").css('-webkit-app-region', 'drag');
    });

    // Codemirror Stuff
    initCodeMirrorDocs();

    // Create the sidebar
    refreshSidebar();

    // Initialize handlers
    ui.setupHandlers(window, win, ctx);

    // Setea los elementos responsive
    responsiveComponents();

    writeToConsole("Welcome to Codepoems!", "message");

    // On change
    CodeMirror.on(project.editor, "change", function() {
        //console.log("Cambio algo!");
        project.saved = false;
    });

});

// Resize de la ventana
$(window).resize(function() {
    responsiveComponents();
});

// Se ejecuta al principio y cada vez que se hace resize de la ventana
function responsiveComponents() {
    var height_topbar = $("#upnav").height() + $("#mainNav").height();
    $("#centerBlock,.CodeMirror, #mainEditor").height(($(window).height() - height_topbar) * 0.70);
    $("#consoleWrap").height(($(window).height() - height_topbar) * 0.30);
}

/*
  getMainFile()

  Devuelve el archivo principal del proyecto.
 
 */

function getMainFile() {
    var the_file;
    $.each(project.files, function(i, file) {
        if (file.type === "main") {
            the_file = file;
        }
    });
    return the_file;
}

/*
  getSecondaryFiles()

  Devuelve los archivos secundarios de los proyectos.
 
 */

function getSecondaryFiles() {
    var the_files = [];
    $.each(project.files, function(i, file) {
        if (file.type === "secondary") {
            the_files.push(file);
        };
    });
    return the_files;
}


/*
  getImageFiles()

  Devuelve todos los assets de imagenes.
 
 */

function getImageFiles() {
    var the_files = [];
    $.each(project.files, function(i, file) {
        if (file.type === "image") {
            the_files.push(file);
        };
    });
    return the_files;
}

/*
  getShaderFiles()

  Devuelve todos los archivos de shader.
 
 */

function getShaderFiles() {
    var the_files = [];
    $.each(project.files, function(i, file) {
        if (file.type === "shader") {
            the_files.push(file);
        };
    });
    return the_files;
}


/*
  getAudioFiles()

  Devuelve los archivos secundarios de los proyectos.
 
 */

function getAudioFiles() {
    var the_files = [];
    $.each(project.files, function(i, file) {
        if (file.type === "audio") {
            the_files.push(file);
        };
    });
    return the_files;
}

/*
  getPlainFiles()

  Devuelve los archivos planos, txt, xml y json.
 
 */

function getPlainFiles() {
    var the_files = [];
    $.each(project.files, function(i, file) {
        if (file.type === "txt" || file.type === "json" || file.type === "xml") {
            the_files.push(file);
        };
    });
    return the_files;
}


/*
  getBufferedFiles()

  Devuelve todos los archivos que tienen un buffer asociado.
 
 */

function getBufferedFiles() {
    var the_files = [];
    $.each(project.files, function(i, file) {
        if (file.type === "main" || file.type === "secondary" || file.type === "shader" || file.type === "txt" || file.type === "json" || file.type === "xml") {
            the_files.push(file);
        };
    });
    return the_files;
}


/*
  initCodeMirrorDocs();

  Le agrega a nuestro MainFile y a nuestros SecondaryFiles un Doc
  de Codemirror asociado.

  */


function initCodeMirrorDocs() {
    // Creamos el doc del mainFile
    if (project.declared) {
        // Proyecto declarado (si existe en en el file system, porque fue abierto o porque se guardó)
        var main_file_content = fs.readFileSync(project.directory + path.sep + getMainFile().rel_path);
        var doc = CodeMirror.Doc(main_file_content.toString(), "processing");
        getMainFile().doc = doc;
    } else {
        // Proyecto no declarado (el default cuando se abre codepoems)
        var doc = CodeMirror.Doc(global.app.settings.default_template, "processing");
        getMainFile().doc = doc;
    }

    // Creando los docs secundarios
    for (var i = 0; i < getSecondaryFiles().length; i++) {
        var file_content = fs.readFileSync(project.directory + path.sep + getSecondaryFiles()[i].rel_path);
        getSecondaryFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "processing");
    }

    for (var i = 0; i < getShaderFiles().length; i++) {
        var file_content = fs.readFileSync(project.directory + path.sep + getShaderFiles()[i].rel_path);
        getShaderFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "x-shader/x-fragment");
    }

    for (var i = 0; i < getPlainFiles().length; i++) {
        if (getPlainFiles()[i].extension === ".json") {
            var file_content = fs.readFileSync(project.directory + path.sep + getPlainFiles()[i].rel_path);
            getPlainFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "application/ld+json");
        }

        if (getPlainFiles()[i].extension === ".xml") {
            var file_content = fs.readFileSync(project.directory + path.sep + getPlainFiles()[i].rel_path);
            getPlainFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "xml");
        }

        if (getPlainFiles()[i].extension === ".txt") {
            var file_content = fs.readFileSync(project.directory + path.sep + getPlainFiles()[i].rel_path);
            getPlainFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "");
        }
    }

    // Creamos el CodeMirror en base al textarea
    project.editor = CodeMirror.fromTextArea(window.document.getElementById("editor"), codemirror_config);

    //Swap the default doc
    project.editor.swapDoc(getMainFile().doc, "processing");

}


/*
  swapDoc();

  Se encarga de hacer swap en el editor de CodeMirror.

  */


function swapDoc(type, index) {
    if (type === "main") {
        project.editor.swapDoc(getMainFile().doc);
    }
    if (type === "secondary") {
        project.editor.swapDoc(getSecondaryFiles()[index].doc);
    }
    if (type === "shader") {
        project.editor.swapDoc(getShaderFiles()[index].doc);
    }
    if (type === "plain") {
        project.editor.swapDoc(getPlainFiles()[index].doc);
    }
}


/*

  swapDocByName()

  Recibe un nombre de archivo, se fija si esta y si esta lo swapea.

 */

function swapByName(name, callback) {

    var the_files = project.files;

    for (var i = 0; i < the_files.length; i++) {
        if (the_files[i].name === name) {
            project.editor.swapDoc(project.files[i].doc);
            callback();
        }
    }
}


/*
  addFileToProject();

  Agrega un archivo al proyecto, y luego actualiza el sidebar.
  También se encarga de la validación del tipo de archivo que tiene que agregar.

  */

function addFileToProject(name, extension) {

    if (extension === "pde") {
        project.files.push({
            type: "secondary",
            name: name,
            extension: "." + extension,
            rel_path: name,
            saved: true,
            declared: false,
            doc: CodeMirror.Doc("//" + name, "processing")
        });
        refreshSidebar();
    }

    if (extension === "glsl") {
        project.files.push({
            type: "shader",
            name: name,
            extension: "." + extension,
            rel_path: name,
            saved: true,
            declared: false,
            doc: CodeMirror.Doc("//" + name, "x-shader/x-fragment")
        });
        refreshSidebar();
    }

    if (extension === "json") {
        console.log("Voy a agregar un json");

        project.files.push({
            type: "json",
            name: name,
            extension: "." + extension,
            rel_path: name,
            saved: true,
            declared: false,
            doc: CodeMirror.Doc("//" + name, "application/ld+json")
        });
        refreshSidebar();
    }

    if (extension === "xml") {
        project.files.push({
            type: "xml",
            name: name,
            extension: "." + extension,
            rel_path: name,
            saved: true,
            declared: false,
            doc: CodeMirror.Doc("//" + name, "xml")
        });
        refreshSidebar();
    }

    if (extension === "txt") {
        project.files.push({
            type: "txt",
            name: name,
            extension: "." + extension,
            rel_path: name,
            saved: true,
            declared: false,
            doc: CodeMirror.Doc("//" + name, "")
        });
        refreshSidebar();
    }

}



/*
  refreshSidebar();

  Se encarga de crear el sidebar.

  */

function refreshSidebar() {

    // La limpiamos por las dudas
    $(".sidebarFiles").empty();

    // Creo los grupos
    $(".sidebarFiles").append('<div class="groupMainFile"></div>');

    if (getSecondaryFiles().length > 0) {
        $(".sidebarFiles").append('<div class="groupSecondaryFiles"></div>');
    }
    if (getImageFiles().length > 0) {
        $(".sidebarFiles").append('<div class="groupImageFiles"></div>');
    }
    if (getShaderFiles().length > 0) {
        $(".sidebarFiles").append('<div class="groupShaderFiles"></div>');
    }
    if (getPlainFiles().length > 0) {
        $(".sidebarFiles").append('<div class="groupPlainFiles"></div>');
    }
    if (getAudioFiles().length > 0) {
        $(".sidebarFiles").append('<div class="groupAudioFiles"></div>');
    }

    // Mostrar el archivo primario
    var main_file = getMainFile();
    $(".groupMainFile").append("<li class='mainFile active'><i class='icon-002'></i> " + main_file.name + "</li>");

    // Mostrar los archivos secundarios
    var secondary_files = getSecondaryFiles();
    for (var i = 0; i < secondary_files.length; i++) {
        $(".groupSecondaryFiles").append("<li class='secondaryFile'><i class='icon-002'></i> " + secondary_files[i].name + "</li>");
    }

    // Mostrar las imagenes
    var images_files = getImageFiles();
    for (var i = 0; i < images_files.length; i++) {
        $(".groupImageFiles").append("<li class='imageFile'><i class='icon-004'></i> " + images_files[i].name + "</li>");
    }

    // Mostrar los shaders
    var shader_files = getShaderFiles();
    for (var i = 0; i < shader_files.length; i++) {
        $(".groupShaderFiles").append("<li class='shaderFile'><i class='icon-008'></i> " + shader_files[i].name + "</li>");
    }

    // Mostrar los archivos planos
    var plain_files = getPlainFiles();
    for (var i = 0; i < plain_files.length; i++) {
        // Chequeamos las extesiones
        if (plain_files[i].name.split(".")[1] === "xml") {
            $(".groupPlainFiles").append("<li class='plainFile'><i class='icon-005'></i> " + plain_files[i].name + "</li>");
        }
        if (plain_files[i].name.split(".")[1] === "txt") {
            $(".groupPlainFiles").append("<li class='plainFile'><i class='icon-006'></i> " + plain_files[i].name + "</li>");
        }
        if (plain_files[i].name.split(".")[1] === "json") {
            $(".groupPlainFiles").append("<li class='plainFile'><i class='icon-003'></i> " + plain_files[i].name + "</li>");
        }
    }

    // Mostrar los archivos planos
    var audio_files = getAudioFiles();
    for (var i = 0; i < audio_files.length; i++) {
        $(".groupAudioFiles").append("<li class='audioFile'><i class='icon-007'></i> " + audio_files[i].name + "</li>");
    }

    // Hacemos un refresh del sidebar.
    ui.refreshSidebarHandlers(window, win, ctx);
}




/*
  writeToConsole();

  Escribe algo en la consola del proyecto, hay diferentes tipos de mensajes
  y cada uno tiene su propio estilo.

 */



function writeToConsole(msg, type) {

    // Normal messages
    if (type === "message") {
        $("#console").append("<p class='consoleMessage'>" + msg + "</p>");
    }

    // Error messages
    if (type === "error") {
        $("#console").append("<p class='consoleError'>" + msg + "</p>");
        errorHighlighter(msg);

    }

    // Set the console scrollbar to the bottom.
    $("#consoleWrap").scrollTop($("#console").height());
}



/*
  clearConsole();

  Limpia la consola, para que no queden los logs viejos del anterior run.

*/

function clearConsole() {
    $("#console").empty();
}



/*
  errorHighlighter();

  El errorHighlighter se encarga de hacer el regex para entender el error que ocurrió y aplicar el
  estilo a esa linea.

 */



function errorHighlighter(msg) {


    // Tipos de errores
    var missing_semicolon = /Syntax error, maybe a missing semicolon/;
    var missing_parenthesis = /maybe a missing right parenthesis/;
    var missing_argument = /is not applicable for the arguments/;

    var too_many_brackets = /found one too many {/;
    var unexpected_token = /unexpected token/;
    var too_much_push = /more than 32 times/;

    var hex_error = /must be exactly 6 hex digits/;

    // Este regex busca un nombre de archivo 
    var r_error_file = /([^\s]+)(.pde)/;

    // Busca el nn:nn:nn:nn que da el log
    var r_error_location = /([0-9]+)(:[0-9]+)(:[0-9]+)(:[0-9]+)/;



    // MISSING SEMICOLON ERROR
    if (missing_semicolon.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Hacemos el swap editor al archivo que tiene el error.
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line - 2), "gutter", "error");
            project.last_error_line = parseInt(error_line - 2);
            project.last_error_file = error_file;
        });
    }

    // MISSING ARGUMENT
    if (missing_argument.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Hacemos el swap editor al archivo que tiene el error.
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line - 1), "gutter", "error");
            project.last_error_line = parseInt(error_line - 1);
            project.last_error_file = error_file;
        });
    }

    // UNEXPECTED TOKEN
    if (unexpected_token.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Hacemos el swap editor al archivo que tiene el error.
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line - 1), "gutter", "error");
            project.last_error_line = parseInt(error_line - 1);
            project.last_error_file = error_file;
        });
    }


    // PUSH MATRIX LIKE ERRORS
    if (too_much_push.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Hacemos el swap editor al archivo que tiene el error.
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line), "gutter", "error");
            project.last_error_line = parseInt(error_line);
            project.last_error_file = error_file;
        });
    }

    // HEX COLOURS ERROR
    if (hex_error.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Hacemos el swap editor al archivo que tiene el error.
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line - 1), "gutter", "error");
            project.last_error_line = parseInt(error_line - 1);
            project.last_error_file = error_file;
        });
    }

    // MISSING PARENTHESIS
    if (missing_parenthesis.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Hacemos el swap editor al archivo que tiene el error.
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line - 1), "gutter", "error");
            project.last_error_line = parseInt(error_line - 1);
            project.last_error_file = error_file;
        });
    }







}






/*
  clearErrors();

  Limpia las clases error que hay en el editor.
  ESTO HAY QUE MEJORARLO!

 */


function clearErrors() {
    if (project.last_error_line) {
        project.editor.removeLineClass(project.last_error_line, "gutter", "error");
    }
}