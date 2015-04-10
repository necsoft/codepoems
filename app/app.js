/*
  app.js

  Es el archivo principal de la aplicación, lo primero que se ejecuta. 

 */

var gui = require('nw.gui');
var ui = require("./ui.js");

// Llama a la ventana actual
global.win = gui.Window.get();

// Aqui vamos a guardar informacion de la aplicación
var app = {};

// Esto se puede llamar desde cualquier project
global.culo = "algo compartido";

// Capturamos el click en el "New Project"
$('.new_project').click(function() {
    //Abrimos un project
    var new_win = gui.Window.open('project.html', {
        "always-on-top": true
    });
});


ui.createUI();