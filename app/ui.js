/*
  > ui.js
  
  UI se encarga de manejarle los handlers a la aplicación que este en foco y de crear acciones
  para los eventos que pueden ocurrir. También se encarga de abrir la ventana inicial al crear
  la aplicación.

  Entre las tareas que cumple:

  * Capturar todos los handlers
  * Configurar la UI
  * Abrir la ventana inicial
  * Manejar los triggers de open y save
  * Validar el add file  

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


exports.setupHandlers = function(window, win, ctx) {

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
    $button_log_project = $(".button_log_project");
    $button_add_file = $(".button_add_file");

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
    });

    $button_log_project.click(function() {
        console.log("♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦");
        console.log("THIS IS THE ACTUAL PROJECT");
        console.log(global.app.focused_project);
        console.log("♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦♦");
    })

}

/*
  refreshSidebarHandlers()
  
  Cuando el sidebar es manipulado, los handlers tienen que volver a crearse.

  */


exports.refreshSidebarHandlers = function(window, win, ctx) {
    var $ = ctx.window.$;

    $button_sidebar_main_file = $(".mainFile");
    $button_sidebar_secondary_file = $(".secondaryFile");
    $button_sidebar_shader_file = $(".shaderFile");
    $button_sidebar_plain_file = $(".plainFile");

    $button_sidebar_main_file.click(function() {
        actions_sidebar_swap_main_file();
    });

    $button_sidebar_secondary_file.click(function() {
        actions_sidebar_swap_secondary_file($(this).index());
    })

    $button_sidebar_shader_file.click(function() {
        actions_sidebar_swap_shader_file($(this).index());
    })

    $button_sidebar_plain_file.click(function() {
        actions_sidebar_swap_plain_file($(this).index());
    })

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
    p5manager.runProject(global.app.focused_project, focused_ctx);
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
        p5manager.silenceSave(global.app.focused_project, focused_ctx);
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
        p5manager.saveAsProject(the_path, global.app.focused_project, focused_ctx);
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

  Agrega un archivo al proyecto.

  */

function actions_add_file() {
    var prompt_value = focused_ctx.prompt("Please put the name of the file, you can create:\n \nPDE\nGLSL\nJSON\nXML\nTXT\n");

    // Si cancelan el prompt
    if (prompt_value === null) {
        return false;
    }

    // Booleans de validación
    var is_empty;
    var start_with_number;
    var is_main_file_name;
    var has_extension;

    // Valida presencia
    if (prompt_value === "") {
        is_empty = true;
        focused_ctx.alert("Tienes que escribir algo");
        actions_add_file();
    } else {
        is_empty = false;
    }

    // Valida si comienza con numero
    var start_numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    var start_with_number = start_numbers.indexOf(prompt_value.charAt(0)) > -1;

    if (start_with_number) {
        focused_ctx.alert("No puedes nombrar al archivo con un número delante.");
        actions_add_file();
    };

    // Valida si el nombre es igual al nombre del mainFile
    if (global.app.focused_ctx.getMainFile().name + ".pde" === prompt_value) {
        focused_ctx.alert("No puede llamarse igual al archivo principal del proyecto.");
        actions_add_file();
        is_main_file_name = true;
    } else {
        is_main_file_name = false;
    }

    // Valida si se escribió la extensión
    if (prompt_value.split(".").length > 1 && prompt_value.split(".")[1].length > 1) {
        has_extension = true;
    } else {
        has_extension = false;
        focused_ctx.alert("Tienes que escribirle una extension.");
        actions_add_file();
    }

    // Cumple la validación básica
    if (!is_empty && !start_with_number && !is_main_file_name && has_extension) {
        the_extension = prompt_value.split(".")[1];
        global.app.focused_ctx.addFileToProject(prompt_value, the_extension);
    }

}


function actions_sidebar_swap_main_file() {
    focused_ctx.window.swapDoc("main");
}

function actions_sidebar_swap_secondary_file(index) {
    focused_ctx.window.swapDoc("secondary", index);
}

function actions_sidebar_swap_shader_file(index) {
    focused_ctx.window.swapDoc("shader", index);
}

function actions_sidebar_swap_plain_file(index) {
    focused_ctx.window.swapDoc("plain", index);
}