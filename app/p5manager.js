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
var path = require('path');
var util = require('util');

// Default variables for projects
var default_project_label = "sketch";
var new_window_width = 900;
var new_window_height = 700;


/*
  new_project()

  Crea una ventana y un proyecto nuevo.

  */

exports.newProject = function() {
    var project = {};
    project.id = new Date().getTime();
    project.name = default_project_label + project.id;
    project.saved = false;
    project.declared = false;

    global.app.projects.push({
        project
    });
    var gui = window.require("nw.gui");
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
    if (check_project(project_path)) {
        //console.log("ES UN PROYECTO VALIDO");
    } else {
        //console.log("NO ES UN PROYECTO VALIDO");
    };
};


/*
  check_project()

  Chequea si en el path apunta a un proyecto válido de processing.

  */

function check_project(p_path) {

    var p_parsed = path.parse(p_path); // Proyecto parseado
    var p_father = p_parsed.dir.split(path.sep).reverse()[0]; // Nombre de la carpeta padre
    var p_file_name = p_parsed.dir.split(path.sep).reverse()[0]; // Nombre del archivo (sin extension)
    var p_file_name_absolute = p_path; // Path absoluto al archivo abierto.
    var p_dir = p_parsed.dir;

    // En base al archivo que se aca de intentar abrir creamos el path
    // de como se debería llamar el archivo central, si este archivo existe
    // podemos deducir que el proyecto es valido.
    var mainFile = p_dir + path.sep + p_father + ".pde";
    var secondaryFiles = [];

    // Chequea si el archivo existe 
    fs.access(mainFile, fs.R_OK | fs.W_OK, function(err) {
        if (err) {
            window.alert("Este proyecto no es valido.");
        } else {
            window.alert("Congratulaciones y algarabías, el archivo que acabas de intentar abrir es UN PROYECTO VALIDO DE PROCESSING!!!! CLAP CLAP CLAP")
        };
    });

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
                secondaryFiles.push(files[i]);
            }
        }
        console.log("Archivos secundarios filtrados:");
        console.log(secondaryFiles);
    });

    return false;
};

/*
  run_project()

  Ejecuta un proyecto de processing.

  */

exports.run_project = function(project, editor) {

};