/*
  app.js

  Este es el archivo que se abre al principio, codepoems esta desarrollado utilizando
  tres tecnologías en complementación:

  * Node.js
  * nw.js
  * Codemirror

  */

var fs = require('fs');
var ui = require('./ui.js');

// App information
global.app = {};
global.app.platform = process.platform;
global.app.projects = [];
global.app.focused_project = {};

// Leemos los settings por default
global.app.settings = require('./settings.json');

// Create the initial UI
ui.setupUi();