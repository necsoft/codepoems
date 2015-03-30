// ---------------------------------------------------------------------------
// DEPENDENCIES
// ---------------------------------------------------------------------------

var gui = require("nw.gui");
var win = nw.Window.get();
var fs = require("fs");
var p5p = require("./p5p.js");
var path = require("path");
var mkdirp = require("mkdirp");
var clipboard = gui.Clipboard.get();

var exampleCode = '\
//----------------------- \n\
// Welcome to Codepoems \n\
//----------------------- \n\
\n\
int cantidad = 200;\nboolean garlopa = false;\
\ncolor colorcito = color(#ff00ff);\
\n\nvoid setup(){\n\t\size(900,600);\n\tframeRate(10);\
\n}\n\nvoid draw(){\n\tbackground(#3D3D3D);\
\n\tfor(int i=0;i<cantidad;i++){\
\n\t\tnoStroke();\n\t\tfill(random(255),random(1,30));\n\t\tellipse(random(width),random(height),i,i);\
\n\t}\n\tprintln("aloha"+frameCount);\n}';

// ---------------------------------------------------------------------------
// IIFE
// ---------------------------------------------------------------------------

(function() {

    // PROJECT VARS
    var project = {};
    project.unsaved_project = true;
    project.undeclared_project = true;
    project.name = "sketch";
    project.dir = "app/tmp/sketch";
    project.dir_parent = "";

    // DOM Nodes
    $button_new = $("#button_new");
    $button_open = $("#button_open");
    $button_save = $("#button_save");
    $button_run = $("#button_run");
    $button_exit = $(".exit_button");

    // Initialize the editor
    var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
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

    // Pongo el ejemplo de prueba
    editor.setValue(exampleCode);

    // ---------------------------------------------------------------------------
    // EXIT
    // ---------------------------------------------------------------------------

    // Exit button
    $button_exit.click(function() {
        win.close(0);
    });


    // ---------------------------------------------------------------------------
    // NEW
    // ---------------------------------------------------------------------------

    function new_project() {
        if (project.unsaved_project) {
            if (confirm("Esta seguro que quiere descartar este proyecto?")) {
                reset_project();
            }
        } else if (project.unsaved_project === false) {
            reset_project();
        }

    }

    function reset_project() {
        editor.setValue("");
        project.unsaved_project = true;
        project.undeclared_project = true;
        project.name = "sketch";
        project.dir = "app/tmp/sketch";
        project.dir_parent = "";
    }

    // Handle new button
    $button_new.click(function() {
        new_project();
    });

    // ---------------------------------------------------------------------------
    // OPEN
    // ---------------------------------------------------------------------------

    // Open button
    $button_open.click(function() {
        $("#openFile").trigger("click");
    });

    // Recibo la ruta
    $("#openFile").change(function(evt) {
        read_file($(this).val());
    });

    // Read File
    function read_file(file_entry) {
        fs.readFile(file_entry, function(err, data) {
            console.log("file_entry" + file_entry);
            var read_errors = false,
                name = path.basename(file_entry, '.pde '),
                extension = path.extname(file_entry),
                separators = file_entry.split(path.sep),
                parent_folder = separators[separators.length - 2];

            // Error exception
            if (err) {
                console.log("Read failed: " + err);
            }

            // Check extension
            if (extension !== ".pde" && read_errors === false) {
                read_errors = true;
                alert("Este no es un archivo válido de processing.");
            }

            // Check parent equality
            if (name !== parent_folder && read_errors === false) {
                read_errors = true;
                alert("Este archivo no tiene una carpeta contenedora.");
            }

            // If there are no problems, set the editor.
            if (read_errors !== true) {
                project.undeclared_project = false;
                project.name = name;
                project.dir = path.dirname(file_entry);
                project.root_file = path.dirname(file_entry + path.sep + project.name);
                console.log(project);
                editor.setValue(String(data));
                project.unsaved_project = false;
            }
        });
    }

    // ---------------------------------------------------------------------------
    // RUN
    // ---------------------------------------------------------------------------

    $button_run.click(function() {
        run();
    });

    function run() {
        //El contenido del editor actual
        var str = editor.getValue();
        //Lo escribe a un archivo temporal
        fs.writeFile("app/tmp/sketch/sketch.pde", str, function(err) {
            if (err) {
                console.log("Write failed: " + err);
                return;
            }
            //Las tres formas posibles de run
            if (project.undeclared_project) {
                p5p.run_sketch($, process.cwd() + "/app/tmp/sketch/", process.cwd() + "/app/tmp/sketch/build");
            } else if (project.undeclared_project === false && project.unsaved_project === false) {
                p5p.run_sketch($, project.dir, project.dir + "/build/");
            } else if (project.undeclared_project === false && project.unsaved_project) {
                p5p.run_temporal_sketch(project.dir, project.dir + "/build/", project, editor.getValue());
            } else {
                console.log("Some shit happens");
            }
        });
    }

    // ---------------------------------------------------------------------------
    // SAVE & WRITE PROJECT
    // ---------------------------------------------------------------------------

    function save() {
        if (project.undeclared_project === true) {
            $("#saveFile").trigger("click");
        } else {
            saveOnly();
        }
    }

    $button_save.click(function() {
        save();
    });

    $("#saveFile").change(function(evt) {
        console.log("Ya seleccionó un lugar y un nombre");
        console.log("La ruta en la que quiere guardar es la siguiente: " + $(this).val());
        writeProject($(this).val());
    });

    function writeProject(thePlace) {
        var str = editor.getValue();
        var separators = thePlace.split(path.sep);
        var name = separators[separators.length - 1];

        mkdirp(thePlace + path.sep, function(err) {
            if (err) {
                console.error(err);
            } else {
                fs.writeFile(thePlace + path.sep + name + ".pde", str, function(err) {
                    if (err) {
                        console.log("Write failed: " + err);
                        return;
                    }
                    project.undeclared_project = false;
                    project.root_file = thePlace + path.sep + name + ".pde";
                });
            }
        });
    }


    function saveOnly() {
        console.log(project.root_file);
        fs.writeFile(project.root_file, editor.getValue(), function(err) {
            if (err) {
                console.log("Write failed: " + err);
                return;
            }
            project.undeclared_project = false;
            project.unsaved_project = false;
        });
    }

    // ---------------------------------------------------------------------------
    // EDITOR EVENTS
    // ---------------------------------------------------------------------------

    // Se ejecuta cade vez que cambia algo
    CodeMirror.on(editor, "change", function() {
        //console.log("Cambio algo!");
        project.unsaved_project = true;
    });


    // ---------------------------------------------------------------------------
    // ADD KEY MAPS
    // ---------------------------------------------------------------------------

    var map = {
        "Cmd-S": save,
        "Ctrl-S": save,
        "Cmd-R": run,
        "Ctrl-R": run,
        "Cmd-N": new_project,
        "Ctrl-N": new_project
    };
    editor.addKeyMap(map);

})(); // END IIFE