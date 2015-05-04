/*
  p5process.js

  ejecuta el spawn de processing-java 

 */


var childProcess = require('child_process').spawn,
    p5;
var fs = require("fs");
var path = require("path");


// ---------------------------------------------------------------------------
// run_sketch()
//
// Se encarga de correr los undeclared project.
//
// ---------------------------------------------------------------------------

exports.run_sketch = function(sketch_dir, sketch_build) {
    console.log(process.cwd());
    var child = childProcess('processing-java', ["--sketch=" + process.cwd() + sketch_dir, "--output=" + process.cwd() + sketch_build, "--run", "--force"]);
};


// ---------------------------------------------------------------------------
// run_temporal_sketch()
//
// Se encarga de correr los unsaved project.
//
// ( ) Copia el valor del archivo a una variable.
//
// ---------------------------------------------------------------------------

exports.run_temporal_sketch = function(sketch_dir, sketch_build, project, editor_value) {
    var the_file = project.dir + path.sep + project.name + ".pde";
    fs.readFile(the_file, function(err, data) {
        last_file = data;
        fs.writeFile(the_file, editor_value, function(err) {
            if (err) {
                return;
            }
            childProcess.exec('processing-java --sketch=' + sketch_dir + ' --output=' + sketch_build + ' --run --force ', function(error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log('Error code: ' + error.code);
                    console.log('Signal received: ' + error.signal);

                }
                //  console.log('Child Process STDOUT: '+stdout);
                //  console.log('Child Process STDERR: '+stderr);
                fs.writeFile(the_file, last_file, function(err) {
                    //console.log("Listorti!!!");
                });
            });
        });
    });
};