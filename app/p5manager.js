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
}