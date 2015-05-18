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

// Default variables for projects
var default_project_label = "sketch";
var new_window_width = 900;
var new_window_height = 700;


/*
  initialProject()

  La diferencia entre el initialProject y el newProject es que este primero
  se crea en base al gui inicial, los otros son creados en base a la app que esta
  en foco, esto permite que no tengamos que tener un window escondido

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
        name: default_project_label + project.id,
        extension: ".pde",
        abs_path: "",
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
    project.direcoty = "";
    project.files = [];

    // Pusheo el main file
    project.files.push({
        type: "main",
        name: default_project_label + project.id,
        extension: ".pde",
        abs_path: "",
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
                abs_path: entry.fullPath,
                saved: true,
                declared: true
            });
        } else {
            analyzed_project.files.push({
                type: "secondary",
                name: entry.name,
                extension: ".pde",
                abs_path: entry.fullPath,
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
        //console.log(entry);
        analyzed_project.files.push({
            type: "image",
            name: entry.name,
            extension: "." + entry.name.split(".")[1],
            abs_path: entry.fullPath,
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
            abs_path: entry.fullPath,
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
            abs_path: entry.fullPath,
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
            abs_path: entry.fullPath,
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
            abs_path: entry.fullPath,
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
            abs_path: entry.fullPath,
            saved: true,
            declared: true
        });
    });

    console.log("El analized project:");
    console.log(analyzed_project);

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

exports.runProject = function(project) {

};




/*
  saveProject()

  Es el save directo, sin abrir la ventana de dialogo.

 */


exports.saveProject = function(project) {
    var main_file = project.mainFile.abs_path;
    var main_path = path.dirname(project.mainFile.abs_path) + path.sep;
    writeFiles(global.app.focused_project, main_file, main_path);
}


/*
  saveAsProject()

  Esto es todo lo que ocurre cuando alguien hace saveAs:

    * Se analiza el path de save
    * Se crea la carpeta

  */

exports.saveAsProject = function(save_path, project) {

    // En base al path que nos pasan extraemos el nombre del proyecto.
    var name_saved = save_path.split(path.sep).reverse()[0];
    var main_path = save_path + path.sep;
    var main_file = main_path + name_saved + ".pde";

    // Creamos la carpeta con mkdirp porque encontré en varios post de stackoverflow
    // que era mejor que usar el mkdir nativo de node.

    mkdirp(save_path, function(err) {
        if (err) {
            console.error(err);
        } else {
            writeFiles(project, main_file, main_path);
        }
    });

}



/*
  writeFiles()

  Se encarga de crear los archivos, es llamado tanto por save como por saveAs.

 */

function writeFiles(project, main_file, main_path) {

    // Escribe el mainFile
    fs.writeFile(main_file, project.mainFile.doc.getValue(), function(err) {
        if (err) {
            console.log(err);
        } else {
            // Se crea el archivo primario
        };
    });

    // Escribe los secondaryFiles
    for (var i = 0; i < project.secondaryFiles.length; i++) {
        console.log(project.secondaryFiles[i].name);
        var the_file = project.secondaryFiles[i].name;
        fs.writeFile(main_path + the_file, project.secondaryFiles[i].doc.getValue(), function(err) {
            if (err) {
                console.log(err);
            } else {
                // Se crea el archivo secundario
            }
        });
    }

}




/*
  addFileToProject
 */

exports.addFileToProject = function(name, ctx, project, next) {
    console.log("Bueno, voy a agregar este archivo porque es valido.");
    console.log(project);
    console.log(project.secondaryFiles);

    if (!project.saved) {
        var this_file = {};
        this_file.name = name;
        this_file.saved = true;
        this_file.declared = true;
        this_file.abs_path = "";
        this_file.doc = focused_ctx.CodeMirror.Doc("\n//Welcome to codepoems!\n\n void setup(){\n\n}\n\n void draw(){\n\n}", "processing");
        project.secondaryFiles.push(this_file);
    }
    // if (project.declared) {
    //     this_file.abs_path = p_dir + path.sep + files[i];
    // } else {

    // }
    // secondaryFiles.push(this_file);

    return next();
};