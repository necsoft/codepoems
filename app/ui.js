/*
  ui.js
  
  tiene que manejar todos los handlers y crear todos los elementos/componentes
  del sistema operativo 

  */

var gui = window.require("nw.gui");
var p5manager = require('./p5manager.js');
var win = gui.Window.get();
var menu;
var focused_win;
var current_editor;


/*
  setupUi()

  Se llama desde el app.js para configurar las cosas nativas de la UI.

 */

exports.setupUi = function() {
    menu = new gui.Menu({
        type: "menubar"
    });

    clipboardFix();
    //createMenuItems();
    actions_newProject();
    win.hide();
}

/*
  setupHandlers()

  Esta función se llama desde afuera para setear los handlers de una ventana.

 */


exports.setupHandlers = function(window, win, editor) {
    var $ = window.$;
    focused_win = win;
    current_editor = editor;

    //Catch Nodes
    $button_run = $(".button_run");
    $button_open = $(".button_open");
    $button_exit = $(".exit_button");
    $button_new = $(".button_new");
    $button_chrome_dev_tool = $(".button_chrome_dev_tool");

    //Handlers

    $button_exit.click(function() {
        actions_quit();
    });

    $button_open.click(function() {
        actions_open($);
    });

    $button_run.click(function() {
        actions_run();
    });

    $button_chrome_dev_tool.click(function() {
        actions_chrome_dev_tool();
    });

    $button_new.click(function() {
        actions_newProject_2();
        //p5manager.new_project();
    })

}


/*
  setFocusedWin()

  Se llama cada vez que el project esta en focus.

 */


exports.setFocusedWin = function(win) {
    focused_win = win;
}


/*
  clipboardFix()

  Esto lo tengo que pulir después pero básicamente es para solucionar el problema de
  no poder tener copy paste en los textArea.

 */

function clipboardFix() {
    try {
        menu.createMacBuiltin("Codepoems", {
            hideWindow: true
        });
        win.menu = menu;
    } catch (ex) {
        console.log(ex.message);
    }
}

/*
  createMenuItems()

  Crea los elementos de la UI.

 */

function createMenuItems() {
    fileMenu();
    sketchMenu();
}

/*
  fileMenu()

  Botones de la pestaña de File

 */

function fileMenu() {
    var file = new gui.Menu();
    //Create the menu
    win.menu.insert(new gui.MenuItem({
        label: 'File',
        submenu: file
    }), 1);

    // File -> New Project
    file.append(new gui.MenuItem({
        label: 'New Project',
        click: actions_newProject
    }));

    // File -> Quit
    file.append(new gui.MenuItem({
        label: 'Quit',
        click: actions_quit
    }));
}

/*
  sketchMenu()

  Los botones de la pestaña de Sketch.

 */

function sketchMenu() {
    var sketch = new gui.Menu();
    win.menu.insert(new gui.MenuItem({
        label: 'Sketch',
        submenu: sketch
    }), 2);

    // Sketch -> Run
    sketch.append(new gui.MenuItem({
        label: 'Run',
        click: actions_run
    }));

    // Sketch -> Stop
    sketch.append(new gui.MenuItem({
        label: 'Stop',
        click: actions_stop
    }));

}



/*
  actions_newProject()

  Abre una ventana y crea un proyecto nuevo de Processing.

 */


function actions_newProject() {
    var new_win = gui.Window.open('project.html', {
        "frame": false,
        "width": 600,
        "height": 700,
        "resizable": false
    });
    //p5manager.new_project();
};



function actions_newProject_2() {
    focused_win.window.abrirVentana();
}


/*
  actions_open()

  Usa el input oculto para abrir el trigger 

 */


function actions_open($) {
    //Activa el dialogo.
    $("#fileDialog").trigger("click");

    $("#fileDialog").change(function(evt) {
        var file_path = $(this).val()
        p5manager.open_project(file_path);
    });
};



/*
  actions_quit()
  
  Cierra todas las ventanas abiertas.

 */

function actions_quit() {
    focused_win.close();
}



/*
  actions_run()

  Ejecuta el proyecto en focus.

 */

function actions_run() {
    console.log(global.app.focused_project.editor);
    //p5manager.run_project(global.app.focused_project, current_editor);
}


/*
  actions_stop()

  Detiene el proyecto en focus.

 */

function actions_stop() {

}


/*
  actions_chrome_dev_tool()

 */

function actions_chrome_dev_tool() {
    // focused_win.showDevTools();
    // win.showDevTools();
}