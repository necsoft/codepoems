// ---------------------------------------------------------------------------
// DEPENDENCIES
// ---------------------------------------------------------------------------

var gui = require("nw.gui");
var win = nw.Window.get();
var fs = require("fs");
var p5p = require("./p5p.js");
var path = require("path");
var clipboard = gui.Clipboard.get();


// ---------------------------------------------------------------------------
// READY
// ---------------------------------------------------------------------------

$(document).ready(function(){

  // PROJECT VARS
  var first_open = true,
      project = {};

  project.unsaved_project = true;

  // DOM Nodes
  $button_new = $("#button_new");
  $button_open = $("#button_open");
  $button_save = $("#button_save");
  $button_run = $("#button_run");
  $button_exit = $("#button_exit");

  // Initialize the editor
  var editor = CodeMirror.fromTextArea(document.getElementById("editor"),{
    lineNumbers: true,
    lineWrapping: true,
    mode:  "processing",
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    theme: "paraiso-dark",
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
  });

  // ---------------------------------------------------------------------------
  // EXIT
  // ---------------------------------------------------------------------------

  // Exit button
  $button_exit.click(function(){
    win.close(0);
  });

  // ---------------------------------------------------------------------------
  // OPEN
  // ---------------------------------------------------------------------------

  // Open button
  $button_open.click(function(){
    $("#openFile").trigger("click");
  });

  // Recibo la ruta
  $("#openFile").change(function(evt) {
    read_file($(this).val());
  });

  // Read File
  function read_file(file_entry){
    fs.readFile(file_entry, function (err, data) {

      project.project_name = path.basename(file_entry, '.pde');
      project.extension = path.extname(file_entry);
      project.separators = file_entry.split(path.sep);
      project.parent_folder = project.separators[project.separators.length - 2];
      var errors = false;

      // Error exception
      if (err) {
        console.log("Read failed: " + err);
      }

      // Check extension
      if(project.extension !== ".pde" && errors === false){
        console.log("Esto no es un archivo de processing!");
        errors = true;
        alert("Abri un archivo de processing pelotudo!");
      }

      //Check parent equality
      if(project.project_name !== project.parent_folder && errors === false){
        console.log("El proyecto no esta ubicado en una carpeta correcta.");
        errors = true;
        alert("Sos boludo? Que te pasa?");
      }

      if(errors!==true){
        editor.setValue(String(data));
        project.unsaved_project = false;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // RUN
  // ---------------------------------------------------------------------------

  $button_run.click(function(){
    console.log("Voy a ejecutar esto");
    //El contenido del editor actual
    var str = editor.getValue();
    //Lo escribe a una archivo temporal
    fs.writeFile("app/tmp/sketch/sketch.pde", editor.getValue(), function (err) {
      if (err) {
        console.log("Write failed: " + err);
        return;
      }
      console.log("Write completed.");
      p5p.run_sketch(process.cwd()+"/app/tmp/sketch/",process.cwd()+"/app/tmp/sketch/build");
    });
  });



}); // END READY
