/*
  app.js

  Es el archivo principal de la aplicación, lo primero que se ejecuta. 

  */

var ui = require('./ui.js');

// App information
global.app = {};
global.app.name = "Codepoems";
global.app.platform = process.platform;
global.app.projects = [];
global.app.focused_project = {};

// Create the initial UI
ui.setupUi();