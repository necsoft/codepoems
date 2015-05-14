/*
  ui.js
  
  tiene que manejar todos los handlers y crear todos los elementos/componentes
  del sistema operativo 

  */

var gui = window.require("nw.gui");
var p5manager = require('./p5manager.js');
var win = gui.Window.get();

var focused_ctx;
var focused_win;

/*
  setupUi()

  Se llama desde el app.js para configurar las cosas nativas de la UI.

 */

exports.setupUi = function() {
    clipboardFix(); // Add clipboard functionalities.
    p5manager.initialProject(); // Create an initial project.
    win.close(); // Hide the debug window
}

/*
  setupHandlers()

  Esta función se llama desde afuera para setear los handlers de una ventana.

 */


exports.setupHandlers = function(window, win, editor, ctx) {

    var $ = ctx.window.$;
    focused_win = ctx.window.win;
    focused_ctx = ctx;

    global.app.focused_ctx = ctx;
    global.app.focused_win = focused_win;

    /*
      UI Nodes
     */

    $button_run = $(".button_run");
    $button_open = $(".button_open");
    $button_save = $(".button_save");
    $button_save_as = $(".button_save_as");
    $button_exit = $(".exit_button");
    $button_new = $(".button_new");
    $button_chrome_dev_tool = $(".button_chrome_dev_tool");
    $button_add_file = $(".button_add_file")

    /*
      UI Handlers (Algunos se resuelven aca y otros en p5manager)
     */

    $button_exit.click(function() {
        actions_quit();
    });

    $button_open.click(function() {
        actions_open($);
    });

    $button_save.click(function() {
        actions_save($);
    });

    $button_save_as.click(function() {
        actions_save_as($);
    });

    $button_run.click(function() {
        actions_run();
    });

    $button_chrome_dev_tool.click(function() {
        actions_devTool();
    });

    $button_new.click(function() {
        p5manager.newProject();
    })

    $button_add_file.click(function() {
        actions_add_file();
    })

}


/*
  setSidebar()
  
  Se encarga de crear la barra del costado en base a la información que tenemos
  del proyecto actual. Es llamado desde el project.js correspondiente.

 */

exports.setSidebar = function() {
    var $ = focused_ctx.window.$;
    //Main File
    $(".sidebarFiles").append("<li class='mainFile active'>" + focused_ctx.project.mainFile.name + ".pde</li>");

    //Secondary Files
    if (focused_ctx.project.secondaryFiles) {
        for (var i = 0; i < focused_ctx.project.secondaryFiles.length; i++) {
            $(".sidebarFiles").append("<li class='secondaryFile'>" + focused_ctx.project.secondaryFiles[i].name + "</li>");
        }
    }

    $(".mainFile").click(function() {
        focused_ctx.window.swapDoc("main");
    });

    // Handle para los clicks en la barra lateral
    $(".secondaryFile").click(function() {
        console.log("Tocaste un boton de la barra lateral.");
        // Hacemos el -1 porque index arranca desde 1 y nosotros necesitamos que sea desde 0
        var index = $(this).index() - 1;
        focused_ctx.window.swapDoc("secondary", index);
    });
}


/*
  setFocusedWin()

  Se llama cada vez que el project esta en focus.

 */


exports.setFocusedWin = function(ctx, win) {
    focused_ctx = ctx;
    focused_win = win;
    global.app.focused_ctx = ctx;
    global.app.focused_win = win;
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
    } catch (ex) {}
}


/*
  Actions
  
  Here starts the actions.

 */


/*
  actions_open()

  Usa el input oculto para abrir el trigger 

 */


function actions_open($) {
    // Activa el File Dialog escondido en el project.html
    $("#fileDialog").trigger("click");

    // Captura el evento en el que se selecciona el archivo.
    $("#fileDialog").change(function(evt) {
        // Guarda el path absoluto del archivo.
        var file_path = $(this).val();
        // Manda el path a p5manager que se encarga de validarlo y de abrir un nuevo project.
        p5manager.openProject(file_path);
        // Reseteamos el valor del fileDialog para evitar conflictos al abrir dos veces lo mismo.
        $(this).val("");
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
  actions_save()

  Este save es el default, determina en base a si es declarado o no lo
  que tiene que hacer.

 */

function actions_save($) {

    if (global.app.focused_project.declared) {
        p5manager.saveProject(global.app.focused_project);
    } else {
        actions_save_as($);
    }

}

/*
  actions_save_as()

  Save as del proyecto, previamente hace algo que es necesario en nw
  que es hacer el trigger y escuchar el change del dialog.

 */

function actions_save_as($) {

    // Aparece la ventana de File
    $("#fileSaveDialog").trigger("click");

    // Captura el evento en el que se selecciona el lugar para guardarlo.
    $("#fileSaveDialog").change(function(evt) {
        // Guarda el path absoluto del archivo.
        var the_path = $(this).val();
        p5manager.saveAsProject(the_path, global.app.focused_project);
        $(this).val("");
    });

}


/*
  actions_devTool()

  Abre la Chrome Developer Tool para el contexto en foco.

 */

function actions_devTool() {
    focused_win.showDevTools();
}





/*
  actions_add_file()

  Agrega un archivo al sidebar.

 */

function actions_add_file(){
  var algo = focused_ctx.prompt("Name of the File");
}