/*
  app.js

  Este es el archivo que se abre al principio, codepoems esta desarrollado utilizando
  tres tecnologías en complementación:

  * Node.js
  * nw.js
  * Codemirror

  */

var ui = require('./ui.js');

// App information
global.app = {};
global.app.platform = process.platform;
global.app.projects = [];
global.app.focused_project = {};

// Create the initial UI
ui.setupUi();