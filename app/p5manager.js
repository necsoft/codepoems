/*
  > p5manager.js
  
  Se encarga de crear , abrir y guardar proyectos de processing. Las tareas de p5manager son las siguientes:

  * Abrir un proyecto de processing en base a un path pasado y crear el project pertinente.
  * Analizar los proyectos que se intenta abrir para determinar si efectivamente son proyectos válidos.
  * Hacer run (armar un spawn) de los proyectos.
  * Detener los spawn de los proyectos.

  */


// Dependencies.
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var util = require('util');
var readdirp = require('readdirp');
var es = require('event-stream');
var ncp = require('ncp').ncp;
var childProcess = require('child_process').spawn,
    p5;

// Default variables for projects
var default_project_label = "sketch";
var new_window_width = 900;
var new_window_height = 700;


/*
  initialProject()

  La diferencia entre el initialProject y el newProject es que este primero
  se crea en base al gui inicial, los otros son creados en base a la app que esta
  en foco, esto permite que no tengamos que tener un window escondido para poder 
  crear ventanas nuevas.

  */

exports.initialProject = function() {

    // Creamos el project
    var project = {};
    project.id = new Date().getTime();
    project.saved = false;
    project.declared = false;
    project.directory = "";
    project.files = [];

    // Pusheo el main file
    project.files.push({
        type: "main",
        name: default_project_label + project.id + ".pde",
        extension: ".pde",
        rel_path: default_project_label + project.id + ".pde",
        saved: false,
        declared: false
    });

    // Agregamos el proyecto a la lista de proyectos.
    global.app.projects.push({
        project
    });

    // Abrimos la ventana
    var gui = window.require("nw.gui");
    var new_win = gui.Window.open('project.html', {
        "frame": false,
        "width": new_window_width,
        "height": new_window_height,
        "resizable": false
    });
}

/*
  newProject()

  Similar al initialProject, pero trabaja en base a focused_win.

  */

exports.newProject = function() {

    // Creamos el project
    var project = {};
    project.id = new Date().getTime();
    project.saved = false;
    project.declared = false;
    project.directory = "";
    project.files = [];

    // Pusheo el main file
    project.files.push({
        type: "main",
        name: default_project_label + project.id,
        extension: ".pde",
        saved: false,
        declared: false
    });

    // Agregamos el proyecto a la lista de proyectos.
    global.app.projects.push({
        project
    });

    // Abrimos la ventana
    var gui = global.app.focused_win.window.require("nw.gui");
    // var win = gui.Window.get();
    var new_win = gui.Window.open('project.html', {
        "frame": false,
        "width": new_window_width,
        "height": new_window_height,
        "resizable": false
    });
}


/*
  open_project()

  */

exports.openProject = function(project_path) {
    check_project(project_path, analyze_project);
};


/*
  check_project()

  Chequea si en el path apunta a un proyecto válido de processing.

  */

function check_project(p_path, callback) {

    // Path 
    var p_parsed = path.parse(p_path); // Proyecto parseado
    var p_father = p_parsed.dir.split(path.sep).reverse()[0]; // Nombre de la carpeta padre
    var p_dir = p_parsed.dir; // Path absoluto a la carpeta padre.

    // Creamos el path a un archivo que debería existir.
    var mainFile = p_dir + path.sep + p_father + ".pde";

    // Chequea si ese archivo tentativo existe.
    fs.access(mainFile, fs.R_OK | fs.W_OK, function(err) {
        if (err) {
            window.alert("Este proyecto no es valido.");
        } else {
            // Llamamos al analyze_project 
            callback(p_dir, p_father, mainFile);
        };
    });

};

/*
  analyze_project()

  Se encarga de analizar el proyecto que ya sabemos que es válido, crear los archivos que lo contienen
  y dejar listo un project válido para mandarselo al nuevo window.

  */

function analyze_project(p_dir, p_father, main_file) {

    var analyzed_project = {};
    analyzed_project.id = new Date().getTime();
    analyzed_project.name = p_father;
    analyzed_project.saved = true;
    analyzed_project.declared = true;
    analyzed_project.files = [];
    analyzed_project.directory = p_dir;

    // Searching for PDE
    readdirp({
        root: analyzed_project.directory,
        fileFilter: ['*.pde']
    }).on('data', function(entry) {
        if (entry.name === analyzed_project.name + ".pde") {
            analyzed_project.files.push({
                type: "main",
                name: entry.name,
                extension: ".pde",

                rel_path: entry.fullPath.replace(p_dir, ""),
                saved: true,
                declared: true
            });
        } else {
            analyzed_project.files.push({
                type: "secondary",
                name: entry.name,
                extension: ".pde",

                rel_path: entry.fullPath.replace(p_dir, ""),
                saved: true,
                declared: true
            });
        }
    });

    // Searching for Images
    readdirp({
        root: analyzed_project.directory,
        fileFilter: ['*.png', '*.jpg']
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "image",
            name: entry.name,
            extension: "." + entry.name.split(".")[1],
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });


    // Searching for Shaders
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.glsl'
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "shader",
            name: entry.name,
            extension: ".glsl",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for JSON
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.json'
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "json",
            name: entry.name,
            extension: ".json",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for XML
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.xml'
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "xml",
            name: entry.name,
            extension: ".xml",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for txt
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.txt'
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "txt",
            name: entry.name,
            extension: ".txt",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for audio
    readdirp({
        root: analyzed_project.directory,
        fileFilter: ['*.mp3', '*.wav', '*.ogg']
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "audio",
            name: entry.name,
            extension: "." + entry.name.split(".")[1],
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Abrimos la ventana del proyecto pasándole el project.
    open_project_window(analyzed_project);
}


/*
  open_project_window()

  Abre una ventana de un proyecto nuevo, pero lo hace agregando un proyecto
  que previamente fue analizado.

  */

function open_project_window(project) {

    // Agregamos el proyecto a la lista de proyectos.
    global.app.projects.push({
        project
    });

    // Abrimos la ventana
    var gui = global.app.focused_win.window.require("nw.gui");
    var new_win = gui.Window.open('project.html', {
        "frame": false,
        "width": new_window_width,
        "height": new_window_height,
        "resizable": false
    });


}


/*
  runProject()

  Ejecuta un proyecto de processing.

  */

exports.runProject = function(project, ctx) {

    if (project.declared) {
        runDeclaredProject(project, ctx);
    } else {
        runUndeclaredProject(project, ctx);
    }
};

function runDeclaredProject(project, ctx) {
    console.log("runDeclaredProject");
}

function runUndeclaredProject(project, ctx) {
    mkdirp('./app/tmp/' + ctx.getMainFile().name.split(".")[0], function(err) {
        for (var i = 0; i < project.files.length; i++) {
            // Primero tengo que ver que sean archivos que tengan un doc de CodeMirror
            var the_type = project.files[i].type;
            if (the_type === "glsl" || the_type === "main" || the_type === "secondary" ||
                the_type === "json" || the_type === "xml" || the_type === "txt") {
                fs.writeFile('./app/tmp/' + ctx.getMainFile().name.split(".")[0] + path.sep + project.files[i].rel_path, project.files[i].doc.getValue(), function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            };
        };

        // Guardamos las carpetas temporales
        var temporal_dir = process.cwd() + '/app/tmp/' + ctx.getMainFile().name.split(".")[0];
        var temporal_dir_build = process.cwd() + '/app/tmp/' + ctx.getMainFile().name.split(".")[0] + "/build/";
        // Corremos el childprocess
        var child = childProcess('processing-java', ["--sketch=" + temporal_dir, "--output=" + temporal_dir_build, "--run", "--force"]);

        child.stdout.on('data',
            function(data) {
                console.log(data.toString());
            }
        );
        child.stderr.on('data',
            function(data) {
                console.log(data.toString());
            }
        );

    });

};





/*
  silenceSave()

  Es el save directo, sin abrir la ventana de dialogo.

 */


exports.silenceSave = function(project, ctx) {
    writeAllDocToFiles(project);
};


/*
  writeAllDocToFiles();

  Le pasas un proyecto y se encarga de transformar todos los docs con buffer de CodeMirro
  en archivo.

 */


function writeAllDocToFiles(project) {
    for (var i = 0; i < project.files.length; i++) {
        // Primero tengo que ver que sean archivos que tengan un doc de CodeMirror
        var the_type = project.files[i].type;
        if (the_type === "glsl" ||
            the_type === "main" ||
            the_type === "secondary" ||
            the_type === "json" ||
            the_type === "xml" ||
            the_type === "txt") {
            // Si es un file con doc, lo escribe.
            fs.writeFile(project.directory + project.files[i].rel_path, project.files[i].doc.getValue(), function(err) {
                if (err) {
                    console.log(err);
                }
            });

        };
    };
}







/*
  saveAsProject()

  Esto es todo lo que ocurre cuando alguien hace saveAs:

    * Se analiza el path de save
    * Se crea la carpeta

  */

exports.saveAsProject = function(save_path, project, ctx) {

    // En base al path que nos pasan extraemos el nombre del proyecto.
    var name_saved = save_path.split(path.sep).reverse()[0];
    var main_path = save_path + path.sep;
    var main_file = main_path + name_saved + ".pde";

    // Hay dos tipos de saveAs, el saveAs cuando el proyecto no existe,
    // y el saveAs cuando el proyecto existe, la mayor diferencia es que 
    // en el segundo caso, copiamos la carpeta para asegurarnos que 
    if (project.declared === false) {
        saveAsUndeclared();
    } else {
        saveAsDeclared();
    }


    function saveAsUndeclared() {
        console.log("Hago un saveAsUndeclared");

        // Creamos la carpeta nueva
        mkdirp(save_path, function(err) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < project.files.length; i++) {
                    // Creamos el main file, que va a cambiar de nombre porque estamos cambiando la carpeta
                    if (project.files[i].type === "main") {
                        project.files[i].rel_path = name_saved + ".pde";

                        fs.writeFile(main_path + name_saved + ".pde", project.files[i].doc.getValue(), function(err) {
                            ctx.getMainFile().name = name_saved + ".pde";
                            project.declared = true;
                            // Refrescamos el sidebar para que se vea el cambio.
                            ctx.refreshSidebar();
                        });
                    } else {
                        // Le guardamos el nuevo path RELATIVO
                        project.files[i].rel_path = project.files[i].name;
                        fs.writeFile(main_path + project.files[i].name, project.files[i].doc.getValue(), function(err) {
                            // Se crea el archivo
                        });
                    }
                };
                project.directory = save_path;
                project.saved = true;
                project.declared = true;
            };
        });
    };



    function saveAsDeclared() {
        console.log("Hago un saveAsDeclared");
        // Copiamos las carpetas
        ncp(project.directory, main_path, function(err) {
            if (err) {
                console.log(err);
            }
            // Una vez que se termina de copiar la carpeta, cambia el project.directory,
            // le hago el substring porque le saco el ultimo carecter.
            console.log("Estoy agegando el project.directory");
            project.directory = main_path.substring(0, main_path.length - 1);
            console.log(project.directory);

            // Rename al main file
            fs.rename(project.directory + path.sep + ctx.getMainFile().name, project.directory + path.sep + name_saved + ".pde", function(err) {

                // Cambio la información
                ctx.getMainFile().name = name_saved + ".pde";
                ctx.getMainFile().rel_path = path.sep + name_saved + ".pde";

                // Aca debería hacer un silenceSave?
                writeAllDocToFiles(project);

                ctx.refreshSidebar();
            });
        });
    }

}