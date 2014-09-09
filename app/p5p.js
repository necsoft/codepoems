 var childProcess = require('child_process'),p5;

 exports.run_sketch = function(sketch_dir,sketch_build){

   childProcess.exec('processing-java --sketch='+sketch_dir+' --output='+sketch_build+' --run --force', function (error, stdout, stderr) {
     if (error) {
       console.log(error.stack);
       console.log('Error code: '+error.code);
       console.log('Signal received: '+error.signal);
     }
     console.log('Child Process STDOUT: '+stdout);
     console.log('Child Process STDERR: '+stderr);
   });
 }

 // p5.on('exit', function (code) {
 //   console.log('Child process exited with exit code '+code);
 // });
