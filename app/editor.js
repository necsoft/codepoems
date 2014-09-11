// Dependencies
var gui = require("nw.gui");
var fs = require("fs");
var p5p = require("./p5p.js");


$(document).ready(function(){

  // Save the elementary nodes
  $button_new = $("#button_new");
  $button_open = $("#button_open");
  $button_save = $("#button_save");
  $button_run = $("#button_run");

  // Initialize the editor
  var editor = CodeMirror(document.getElementById("editor"),{
    value: "void setup(){\n\n};\n\nvoid draw(){\n\n};\n",
    lineNumbers: true,
    mode:  "processing",
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    theme: "paraiso-dark",
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
  });


  // Open button
  $button_open.click(function(){
    $("#openFile").trigger("click");
  });

  // Recibo la ruta
  $("#openFile").change(function(evt) {
    read_file($(this).val());
  });

  //Read File
  function read_file(file_entry){
    fs.readFile(file_entry, function (err, data) {
      if (err) {
        console.log("Read failed: " + err);
      }
      //handleDocumentChange(theFileEntry);
      editor.setValue(String(data));
    });
  }


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


});
