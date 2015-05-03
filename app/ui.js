/*
  ui.js
  
  tiene que manejar todos los handlers y crear todos los elementos/componentes
  del sistema operativo 

  */

var gui = window.require("nw.gui");
var p5manager = require('./p5manager.js');
var win = gui.Window.get();

var focus_ctx;
var focused_win;
var current_editor;

/*
  setupUi()

  Se llama desde el app.js para configurar las cosas nativas de la UI.

 */

exports.setupUi = function() {
    clipboardFix(); // Add cliboard functionalities.
    actions_startInitialProject(); // Create an initial project.
    //win.hide(); // Hide current window.
}

/*
  setupHandlers()

  Esta función se llama desde afuera para setear los handlers de una ventana.

 */


exports.setupHandlers = function(window, win, editor, ctx) {
    var $ = ctx.window.$;
    focused_win = ctx.window.win;
    focus_ctx = ctx;

    /*
      UI Nodes
     */

    $button_run = $(".button_run");
    $button_open = $(".button_open");
    $button_exit = $(".exit_button");
    $button_new = $(".button_new");
    $button_chrome_dev_tool = $(".button_chrome_dev_tool");

    /*
      UI Handlers
     */

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
        actions_devTool();
    });

    $button_new.click(function() {
        actions_newProject();
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
    var menu;
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
  Actions
  
  Here starts the actions.

 */


/*
  actions_startInitialProject()

  Abre la primer ventana de proyecto, en esta instancia no hay NADA
  creado todavía.

 */


function actions_startInitialProject() {
    var initial_win = gui.Window.open('project.html', {
        "frame": false,
        "width": 600,
        "height": 700,
        "resizable": false
    });
};

/*
  actions_newProject()

  Este botón se llama cuando se toca desde un project el boton de crear un nuevo project.
  
 */

function actions_newProject() {
    var new_win = focus_ctx.window.gui.Window.open('project.html', {
        "frame": false,
        "width": 600,
        "height": 700,
        "resizable": false
    });

};



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

}


/*
  actions_stop()

  Detiene el proyecto en focus.

 */

function actions_stop() {

}


/*
  actions_devTool()

 */

function actions_devTool() {
    // focused_win.showDevTools();
    console.log("Mostrar el debug tool.");
    focus_ctx.window.win.showDevTools();
}