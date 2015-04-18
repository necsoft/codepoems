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
    // $console = $("#console");
    // $console.append("<p>Running sketch...</p>");


    // processing-java --sketch=/Users/necsoft/MIND/PROJECTS/builder-codepoems/codepoems/app/tmp/sketch/ --output=/Users/necsoft/MIND/PROJECTS/builder-codepoems/codepoems/app/tmp/sketch/build/ --force --run


    console.log(process.cwd());

    var child = childProcess('processing-java', ["--sketch=" + process.cwd() + sketch_dir, "--output=" + process.cwd() + sketch_build, "--run", "--force"]);

    // child.stdout.on('data',
    //     function(data) {
    //         $console.append("<p> > " + data + "</p>");
    //         $console.scrollTop(9999999)
    //     }
    // );
    // child.stderr.on('data',
    //     function(data) {
    //         $console.append("<p class='consoleError'>" + data + "</p>");
    //         $console.scrollTop(9999999)
    //     }
    // );
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