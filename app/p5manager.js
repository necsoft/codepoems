/*
  p5manager.js
  
  Se encarga de crear , abrir y guardar proyectos de processing.

  El workflow es el siguiente:

  [1] Recibimos una petición desde ui.js
  [2] Creamos las validaciones correspondientes
  [3] Creamos un proyecto 


  Antes estaba trabajando con un p5process pero creo que no va a ser necesario,
  ya que aca se va a hacer todo el trabajo duro con lo protocolar de un proyecto
  en processing. Aqui solamente se hacen tareas de IO y validaciones. Una vez hecho
  esto, creamos 

  */

// Dependencies.
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var util = require('util');

// Default variables for projects
var default_project_label = "sketch";
var new_window_width = 900;
var new_window_height = 700;


/*
  initialProject()

  La diferencia entre el initialProject y el newProject es que este ptimero
  se crea en base al gui inicial, los otros son creados en base a la app que esta
  en foco, esto permite que no tengamos que tener un window escondido

  */

exports.initialProject = function() {

    // Creamos un proyecto vacio
    var project = {};
    project.id = new Date().getTime();
    project.mainFile = {};
    project.mainFile.name = default_project_label + project.id;
    project.mainFile.abs_path = "";
    project.mainFile.saved = false;
    project.mainFile.declared = true;
    project.secondaryFiles = [];
    project.saved = false;
    project.declared = false;

    // Agregamos el proyecto a la lista de proyectos.
    global.app.projects.push({
        project
    });

    // Abrimos la ventana
    var gui = window.require("nw.gui");
    // var win = gui.Window.get();
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

    // Creamos un proyecto vacio
    var project = {};
    project.id = new Date().getTime();
    project.mainFile = {};
    project.mainFile.name = default_project_label + project.id;
    project.mainFile.abs_path = "";
    project.mainFile.saved = false;
    project.mainFile.declared = true;
    project.secondaryFiles = [];
    project.saved = false;
    project.declared = false;


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

    var secondaryFiles = [];

    // Busco los secondaryFiles
    fs.readdir(p_dir, function(err, files) {
        for (var i = 0; i < files.length; i++) {
            // Filtro los archivos de sistema y el main.
            var ignored_files = ['.DS_Store', 'sketch.properties', p_father + ".pde"];
            var is_ignored = ignored_files.indexOf(files[i]) > -1;
            // Filtro las carpetas
            var is_directory = fs.statSync(p_dir + path.sep + files[i]).isDirectory();
            // Si cumple las condiciones es un 
            if (is_ignored === false && is_directory === false) {
                // Creamos el objeto en base al path, esto es util despues para cuando
                // tengamos que saber si el archivo ha sido modificado o no.
                var this_file = {};
                this_file.name = files[i];
                this_file.saved = true;
                this_file.declared = true;
                this_file.abs_path = p_dir + path.sep + files[i];
                secondaryFiles.push(this_file);
            }
        }
    });

    // Creamos el object temporal para pasarle al window.
    var analyzed_project = {};
    analyzed_project.name = p_father;
    analyzed_project.id = new Date().getTime();
    analyzed_project.saved = true;
    analyzed_project.declared = true;
    analyzed_project.mainFile = {};
    analyzed_project.mainFile.name = p_father;
    analyzed_project.mainFile.saved = true;
    analyzed_project.mainFile.declared = true;
    analyzed_project.mainFile.abs_path = main_file;
    analyzed_project.secondaryFiles = secondaryFiles;

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

  Save As -> Guarda un proyecto en una carpeta
  Save -> Guarda en 

  */

exports.saveProject = function(save_path, project) {

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
            writeMainFile();
            writeSecondaryFiles();
        }
    });

    function writeMainFile() {
        fs.writeFile(main_file, project.mainFile.doc.getValue(), function(err) {
            if (err) {
                console.log(err);
            } else {
                // Se crea el archivo primario
            };
        });
    }

    function writeSecondaryFiles() {
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

}