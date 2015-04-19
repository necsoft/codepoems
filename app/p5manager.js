/*
  p5manager.js
  
  Se encarga del IO de los proyectos de processing:

    * Correr proyectos
    * Abrir proyectos
    * Guardar proyectos
    * Validar proyectos
  
  Básicamente recibe un project y se encarga de hacer lo correspondiente con el.

  */

var p5process = require('./p5process.js');
var fs = require('fs');
var path = require('path');


/*
  new_project()

  Crea una ventana y un proyecto nuevo.

  */

exports.new_project = function() {

}


/*
  open_project()

  */

exports.open_project = function(project_path) {
    if (check_project(project_path)) {
        console.log("ES UN PROYECTO VALIDO");
    } else {
        console.log("NO ES UN PROYECTO VALIDO");
    };
};


/*
  check_project()

  Chequea si en el path pasado hay un proyecto válido 

  */

function check_project(file_path) {
    var p_project = path.parse(file_path);

    console.log(p_project);
    console.log("Archivo relativo: " + p_project.base);
    console.log("Carpeta absoluta padre: " + p_project.dir);
    console.log("Nombre Carpeta padre: " + p_project.dir.split(path.sep).reverse()[0]);

    if (p_project.base.split(".")[0] === p_project.dir.split(path.sep).reverse()[0]) {
        console.log("Abriste el archivo central");
        return true;
    } else {
        return false;
    }

}


/*
  run_project()

  Ejecuta un proyecto de processing.

  */

exports.run_project = function(project, editor) {
    var str = editor.getValue();
    fs.writeFile("app/tmp/sketch/sketch.pde", str, function(err) {
        if (err) {
            console.log("Write failed: " + err);
            return;
        }
        //Las tres formas posibles de run
        // if (project.undeclared_project) {
        //     p5p.run_sketch($, process.cwd() + "/app/tmp/sketch/", process.cwd() + "/app/tmp/sketch/build");
        // } else if (project.undeclared_project === false && project.unsaved_project === false) {
        //     p5p.run_sketch($, project.dir, project.dir + "/build/");
        // } else if (project.undeclared_project === false && project.unsaved_project) {
        //     p5p.run_temporal_sketch(project.dir, project.dir + "/build/", project, editor.getValue());
        // } else {
        //     console.log("Some shit happens");
        // }

        p5process.run_sketch('/app/tmp/sketch/', '/app/tmp/sketch/build/');

    });
};