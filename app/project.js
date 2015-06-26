/*
  > project.js

  This is a simple instance of a project.

  */

// Dependencies
var fs = require('fs');
var path = require('path');
var ui = require('./ui.js');

// Nwjs window
var gui = window.require("nw.gui");
var win = gui.Window.get();

// Empty object for this project
var project = {};

// CodeMirror editor default config
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
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    viewportMargin: Infinity,
}

// Save this context
var ctx = this;

// Document ready
$(document).ready(function() {

    // Get the project
    project = global.app.projects[global.app.projects.length - 1].project;

    // Project info
    project.running = false;
    project.running_pid = "";
    project.ctx = ctx;

    global.app.focused_project = project;

    // Handle the app on focus
    win.on('focus', function() {
        global.app.focused_project = project;
        ui.setFocusedWin(ctx, win);
    });

    // Fix for the drag topbar
    $(".upnav").click(function() {
        $(".upnav").css('-webkit-app-region', 'drag');
    });

    // Codemirror Stuff
    initCodeMirrorDocs();

    // Create the sidebar
    refreshSidebar();

    // Initialize handlers
    ui.setupHandlers(window, win, ctx);

    // Check the actual size of the windows and set the style for that size
    responsiveComponents();

    // Welcome message :)
    writeToConsole("Welcome to Codepoems!", "message");

    // Handle the editor on change
    CodeMirror.on(project.editor, "change", function() {
        project.saved = false;
    });

    // Get the selected text
    CodeMirror.on(project.editor, "cursorActivity", function() {
        // Sanitized version
        // ui.refresh_live_documentation(project.editor.getSelection().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        ui.refresh_live_documentation(project.editor.getSelection());
    });

});

// Handle the resize of the window
$(window).resize(function() {
    responsiveComponents();
});

/*
  responsiveComponents()

  I use this one for create the proportions of the DOM elements.

 */

function responsiveComponents() {
    var height_topbar = $("#upnav").height() + $("#mainNav").height();
    $("#centerBlock,.CodeMirror, #mainEditor").height(($(window).height() - height_topbar) * 0.70);
    $("#consoleWrap").height(($(window).height() - height_topbar) * 0.30);
}

/*
  getMainFile()

  Returns the main PDE file.
 
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

  Returns the secondary PDE files
 
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

  Returns the image files.
 
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

  Returns the shader files
 
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

  Returns the audio files.
 
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

  Return the plain files (TXT, JSON, XML)
 
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

  Returns the files with a CodeMirror buffer associated.
 
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

  Creates the CodeMirrror buffers.

  */


function initCodeMirrorDocs() {
    // Main file buffer
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

    // Create the secondary 
    for (var i = 0; i < getSecondaryFiles().length; i++) {
        var file_content = fs.readFileSync(project.directory + path.sep + getSecondaryFiles()[i].rel_path);
        getSecondaryFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "processing");
    }

    // Create the shader buffers
    for (var i = 0; i < getShaderFiles().length; i++) {
        var file_content = fs.readFileSync(project.directory + path.sep + getShaderFiles()[i].rel_path);
        getShaderFiles()[i].doc = CodeMirror.Doc(file_content.toString(), "x-shader/x-fragment");
    }

    // Create the plain buffers (TXT, XML & JSON)
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

    // Set the text area as a CodeMirror editor
    project.editor = CodeMirror.fromTextArea(window.document.getElementById("editor"), codemirror_config);

    //Swap the default doc
    project.editor.swapDoc(getMainFile().doc, "processing");

}


/*
  swapDoc();

  Swaps the actual editor.

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

  Swap by name, I use this one when we check the errors of the project.

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

  Add and validate a buffer to the project.

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

  Refresh the sidebar DOM elements.

  */

function refreshSidebar() {

    // Clean the sidebar
    $(".sidebarFiles").empty();

    // Create the mainFile group
    $(".sidebarFiles").append('<div class="groupMainFile"></div>');

    // Create the groups if there are files
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

    // Create the mainFile
    var main_file = getMainFile();
    $(".groupMainFile").append("<li class='mainFile active'><i class='icon-002'></i> " + main_file.name + "</li>");

    // Create the secondary files
    var secondary_files = getSecondaryFiles();
    for (var i = 0; i < secondary_files.length; i++) {
        $(".groupSecondaryFiles").append("<li class='secondaryFile'><i class='icon-002'></i> " + secondary_files[i].name + "</li>");
    }

    // Create the images
    var images_files = getImageFiles();
    for (var i = 0; i < images_files.length; i++) {
        $(".groupImageFiles").append("<li class='imageFile'><i class='icon-004'></i> " + images_files[i].name + "</li>");
    }

    // Create the shaders
    var shader_files = getShaderFiles();
    for (var i = 0; i < shader_files.length; i++) {
        $(".groupShaderFiles").append("<li class='shaderFile'><i class='icon-008'></i> " + shader_files[i].name + "</li>");
    }

    // Create the plain files
    var plain_files = getPlainFiles();
    for (var i = 0; i < plain_files.length; i++) {
        // Check the extensions
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

    // Create the plain files
    var audio_files = getAudioFiles();
    for (var i = 0; i < audio_files.length; i++) {
        $(".groupAudioFiles").append("<li class='audioFile'><i class='icon-007'></i> " + audio_files[i].name + "</li>");
    }

    // Refresh the sidebar
    ui.refreshSidebarHandlers(window, win, ctx);
}




/*
  writeToConsole();

  Write a message to the console, it can be an error mesasge or a normal message.

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

  Clean the sonsole.

*/

function clearConsole() {
    $("#console").empty();
}



/*
  errorHighlighter();

  Here I check the error messages and highlight the correct line using
  regex. There are differents levels of highlighting, some errors 

 */



function errorHighlighter(msg) {


    // Kind of errors (There are more, I have to improve this)
    var missing_semicolon = /Syntax error, maybe a missing semicolon/;
    var missing_parenthesis = /maybe a missing right parenthesis/;
    var missing_argument = /is not applicable for the arguments/;
    var too_many_brackets = /found one too many {/;
    var unexpected_token = /unexpected token/;
    var too_much_push = /more than 32 times/;
    var hex_error = /must be exactly 6 hex digits/;

    // Search for the file name in the log message
    var r_error_file = /([^\s]+)(.pde)/;

    // Search for the location of the error  in the log message
    var r_error_location = /([0-9]+)(:[0-9]+)(:[0-9]+)(:[0-9]+)/;



    // MISSING SEMICOLON ERROR
    if (missing_semicolon.test(msg)) {
        var error_location = msg.match(r_error_location)[0];
        var error_line = error_location.split(":")[0];
        var error_file = msg.match(r_error_file)[0];
        // Swap the document
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
        // Swap the document
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
        // Swap the document
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
        // Swap the document
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
        // Swap the document
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
        // Swap the document
        swapByName(error_file, function() {
            project.editor.addLineClass(parseInt(error_line - 1), "gutter", "error");
            project.last_error_line = parseInt(error_line - 1);
            project.last_error_file = error_file;
        });
    }

}



/*
  clearErrors();
  
  Clear the highlighted errores, I HAVE TO IMPROVE THIS because it doesn't clean
  the whole tree of files.

 */


function clearErrors() {
    if (project.last_error_line) {
        project.editor.removeLineClass(project.last_error_line, "gutter", "error");
    }
}