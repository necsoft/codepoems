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
    clipboardFix(); // Add cliboard functionalities.
    actions_newProject(); // Create new project.
    win.hide(); // Hide current window.
}

/*
  setupHandlers()

  Esta función se llama desde afuera para setear los handlers de una ventana.

 */


exports.setupHandlers = function(window, win, editor) {
    var $ = window.$;
    focused_win = win;
    current_editor = editor;

    //UI Nodes

    $button_run = $(".button_run");
    $button_open = $(".button_open");
    $button_exit = $(".exit_button");
    $button_new = $(".button_new");
    $button_chrome_dev_tool = $(".button_chrome_dev_tool");

    //UI Events

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

  Fix the clipboard issue in Mac.

 */

function clipboardFix() {
    menu = new gui.Menu({
        type: "menubar"
    });
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