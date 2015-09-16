/*
  > ui.js

  It handles the UI of Codepoems, every window with this file. Here I define the
  actual focused project

  */

var gui = window.require("nw.gui");
var fs = require("fs");
var path = require("path");
var sizeOf = require('image-size');
var p5manager = require('./p5manager.js');
var win = gui.Window.get();
var focused_ctx;
var focused_win;

/*
  setupUi()

  This is the first method we call when we open Codepoems.

  */

exports.setupUi = function() {
    clipboardFix(); // Add clipboard functionalities.
    p5manager.initialProject(); // Create an initial project.
    win.close(); // Hide the debug window
}

/*
  installProcessingJava();

  Help window if user doesn't have processing-java

 */

exports.installProcessingJava = function() {
    var gui = window.require("nw.gui");
    gui.Window.open('win_install_processing_java.html', {
        "width": 600,
        "height": 400,
        "toolbar": false,
        "resizable": false
    });
}

/*
  setupHandlers()

  Setup the initial handlers of the current project.
  
  */


exports.setupHandlers = function(window, win, ctx) {

    var $ = ctx.window.$;
    focused_win = ctx.window.win;
    focused_ctx = ctx;

    // Read the settings.json
    setDefaultSettings($);

    global.app.focused_ctx = ctx;
    global.app.focused_win = focused_win;

    // Keymaps (only for OS X)
    var map = {
        "Cmd-R": actions_run,
        "Cmd-O": actions_open,
        "Cmd-S": save_keymap,
        "Cmd-N": p5manager.newProject,
        "Cmd-W": actions_quit,
        "Cmd-T": actions_indent,
        "F12": actions_devTool
    };

    // Add the actual keymap
    global.app.focused_project.editor.addKeyMap(map);

    /*
      UI selectors
     */

    $button_run = $(".button_run");
    $button_stop = $(".button_stop");
    $button_open = $(".button_open");
    $button_save = $(".button_save");
    $button_save_as = $(".button_save_as");
    $button_min = $(".min_button");
    $button_max = $(".max_button");
    $button_exit = $(".exit_button");
    $button_new = $(".button_new");
    $button_settings = $(".button_settings");
    $button_live_documentation = $(".button_live_documentation");
    $button_p5_modules = $(".button_p5_modules");
    $button_examples = $(".button_examples");
    $button_chrome_dev_tool = $(".button_chrome_dev_tool");
    $button_log_project = $(".button_log_project");
    $button_add_file = $(".button_add_file");

    /*
      UI Handlers  
     */

    $button_exit.click(function() {
        actions_quit();
    });

    $button_min.click(function() {
        actions_min();
    });

    $button_max.click(function() {
        actions_max();
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

    $button_stop.click(function() {
        actions_stop();
    });

    $button_chrome_dev_tool.click(function() {
        actions_devTool();
    });

    $button_new.click(function() {
        p5manager.newProject();
    });

    $button_live_documentation.click(function() {
        actions_live_documentation();
    });

    $button_examples.click(function() {
        actions_examples();
    });

    $button_p5_modules.click(function() {
        actions_p5_modules();
    });

    $button_settings.click(function() {
        actions_settings();
    });

    $button_add_file.click(function() {
        actions_add_file();
    });

}


/*
  refreshSidebarHandlers()
  
  Refresh all the sidebar handlers.

  */


exports.refreshSidebarHandlers = function(window, win, ctx) {
    var $ = ctx.window.$;

    $button_sidebar_main_file = $(".mainFile");
    $button_sidebar_secondary_file = $(".secondaryFile");
    $button_sidebar_shader_file = $(".shaderFile");
    $button_sidebar_plain_file = $(".plainFile");
    $button_sidebar_image_file = $(".imageFile");
    $button_sidebar_audio_file = $(".audioFile")

    $button_sidebar_main_file.click(function() {
        actions_sidebar_swap_main_file();
    });

    $button_sidebar_secondary_file.click(function() {
        actions_sidebar_swap_secondary_file($(this).index());
    });

    $button_sidebar_shader_file.click(function() {
        actions_sidebar_swap_shader_file($(this).index());
    });

    $button_sidebar_plain_file.click(function() {
        actions_sidebar_swap_plain_file($(this).index());
    });

    $button_sidebar_image_file.click(function() {
        actions_sidebar_view_image($(this).index());
    })

    $button_sidebar_audio_file.click(function() {
        actions_sidebar_view_audio($(this).index());
    });




};


/*
  setDefaultSettings()

  Set the default settings of the editor, we get this info from the settings.json

 */

function setDefaultSettings($) {
    exports.actions_change_font_size(global.app.settings.font_size);
    global.app.focused_project.editor.setOption("theme", global.app.settings.theme);
    $("#active_theme").attr("href", "../app/static/stylesheets/theme_" + global.app.settings.theme + ".css");
}

/*
  removeThisProject()

  Remove this project

 */

function removeThisProject(id, callback) {
    for (var i = 0; i < global.app.projects.length; i++) {
        if (global.app.projects[i].project.id == id) {
            global.app.projects.splice(i, 1);
            callback();
        }
    }
}



/*
  setFocusedWin()

  It is called when the project is in focus.

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
  save_keymap()

  Temporal path for the save keymap.

  */

function save_keymap() {
    var $ = global.app.focused_ctx.window.$;
    actions_save($);
}

/*
  Actions
  
  Here starts the actions.

  */


/*
  actions_open()

  It triggers the hidden input file in the project html.

  */


function actions_open($) {
    // Open the file dialog box
    $("#fileDialog").trigger("click");

    // Handle the change of the dialog box
    $("#fileDialog").change(function(evt) {
        // Save the absolute path
        var file_path = $(this).val();
        // Send the path to p5manager
        p5manager.openProject(file_path);
        // Reset the input value
        $(this).val("");
    });

};



/*
  actions_quit()
  
  Quits the current focused project.

  */

function actions_quit() {
    if (global.app.focused_project.saved) {
        removeThisProject(global.app.focused_project.id, function() {
            if (global.app.projects.length < 1) {
                action_close_secondary_windows();
                focused_win.close();
            } else {
                focused_win.close();
            }

        });
    } else {
        var confirm_exit = focused_ctx.confirm("Este proyecto no ha sido guardado, quieres descartarlo?");
        if (confirm_exit) {
            removeThisProject(global.app.focused_project.id, function() {
                if (global.app.projects.length < 1) {
                    action_close_secondary_windows();
                    focused_win.close();
                } else {
                    focused_win.close();
                }
            })
        }
    }
}

/*
  actions_min()
  
  Minimize the focused project.

  */

function actions_min() {
    focused_win.minimize();
}

/*
  actions_max()
  
  Maximize the focused project

  */

function actions_max() {
    focused_win.maximize();
}



/*
  actions_run()

  Run the focused project

  */

function actions_run() {
    // Validates if there is a project running
    if (global.app.focused_project.running === false) {
        p5manager.runProject(global.app.focused_project, focused_ctx);
        focused_ctx.clearConsole();
        focused_ctx.clearErrors();
    } else {
        console.log("There is a project running.");
        actions_stop();
        actions_run();
    }
}


/*
  actions_stop()

  Stops the focused project.

  */

function actions_stop() {
    // Validates if there is a project running
    if (global.app.focused_project.running === true) {
        p5manager.stopProcess(global.app.focused_project);
    } else {
        console.log("There is no project running.");
    }
}


/*
  actions_save()

  This is the save action, it validates if we need a silence save or a
  save as dialog.

  */

function actions_save($) {
    if (global.app.focused_project.declared) {
        p5manager.silenceSave(global.app.focused_project, focused_ctx);
    } else if (global.app.focused_project.declared === false) {
        actions_save_as($);
    }
}

/*
  actions_save_as()

  Save as action. 

  */

function actions_save_as($) {

    // Triggers the save dialog box
    $("#fileSaveDialog").trigger("click");

    // Handles the change of the dialog
    $("#fileSaveDialog").change(function(evt) {
        // Save the abs path
        var the_path = $(this).val();
        // Calls the p5manager action
        p5manager.saveAsProject(the_path, global.app.focused_project, focused_ctx);
        // Reset the value
        $(this).val("");
    });

}

/*
  actions_settings()

  Open the setting windows.

  */

function actions_settings() {

    // Check if the window is actually opened
    if (global.app.settings_window_active === true) {
        // If the window is opened, show it
        global.app.settings_window.show();
    } else {
        // Open the window
        var gui = global.app.focused_win.window.require("nw.gui");
        global.app.settings_window = gui.Window.open('win_settings.html', {
            "toolbar": false,
            "width": 430,
            "height": 600,
            "resizable": false
        });
    }

}


/*
  actions_examples()

 */

function actions_examples() {

    if (global.app.examples_window_active === true) {
        global.app.examples_window.show();
    } else {
        // Open the window
        var gui = global.app.focused_win.window.require("nw.gui");
        global.app.examples_window = gui.Window.open('win_examples.html', {
            "toolbar": false,
            "width": 400,
            "height": 600,
            "resizable": false
        });
    }

}


/*
  actions_p5_modules()

*/

function actions_p5_modules() {

    if (global.app.p5_modules_window_active === true) {
        global.app.p5_modules_window.show();
    } else {
        // Open the window
        var gui = global.app.focused_win.window.require("nw.gui");
        global.app.p5_modules_window = gui.Window.open('win_p5_modules.html', {
            "toolbar": false,
            "width": 430,
            "height": 600,
            "resizable": false
        });
    }


}


/*
  actions_live_documentation()

*/

function actions_live_documentation() {

    if (global.app.live_documentation_window_active === true) {
        global.app.live_documentation_window.show();
    } else {
        // Open the window
        var gui = global.app.focused_win.window.require("nw.gui");
        global.app.live_documentation_window = gui.Window.open('win_live_documentation.html', {
            "toolbar": false,
            "width": 500,
            "min_width": 500,
            "min_height": 500,
            "height": 700,
            "resizable": true
        });
    }

}


/*
  actions_devTool()

  Open the Chrome Developer Tool, this is very useful for me because I am using a frameless button
  and I don't have the button.

  */

function actions_devTool() {
    focused_win.showDevTools();
}


/*
  actions_add_file()

  Validate the action of creating a file.

  */

function actions_add_file() {
    var prompt_value = focused_ctx.prompt("Please put the name of the file, you can create:\n \nPDE\nGLSL\nJSON\nXML\nTXT\n");

    // If the prompt is canceled
    if (prompt_value === null) {
        return false;
    }

    var is_empty;
    var start_with_number;
    var is_main_file_name;
    var has_extension;
    var is_duplicated = false;
    var is_module = false;
    var has_spaces = false;

    // Validates presence
    if (prompt_value === "") {
        is_empty = true;
        focused_ctx.alert("You have to write something");
        actions_add_file();
    } else {
        is_empty = false;
    }

    // Validates if not start with a number
    var start_numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    var start_with_number = start_numbers.indexOf(prompt_value.charAt(0)) > -1;

    if (start_with_number) {
        focused_ctx.alert("You can't name a file with a number in the first character.");
        actions_add_file();
    };

    // Validates if the name is different to the main file
    if (global.app.focused_ctx.getMainFile().name + ".pde" === prompt_value) {
        focused_ctx.alert("That is the name of the main file. Please choose other name");
        actions_add_file();
        is_main_file_name = true;
    } else {
        is_main_file_name = false;
    }

    // Validates presence of the extension
    if (prompt_value.split(".").length > 1 && prompt_value.split(".")[1].length > 1) {
        has_extension = true;
    } else {
        has_extension = false;
        focused_ctx.alert("You have to write an extension.");
        actions_add_file();
    }

    // Validates duplication
    for (var i = 0; i < global.app.focused_project.files.length; i++) {
        if (global.app.focused_project.files[i].name === prompt_value) {
            is_duplicated = true;
            focused_ctx.alert("Duplicated file.");
            actions_add_file();
        }
    };

    // Validate spaces
    if (prompt_value.indexOf(' ') >= 0) {
        has_spaces = true;
        focused_ctx.alert("Name it without spaces.");
        actions_add_file();
    };


    // Validates if module name
    if (prompt_value.indexOf('P5M_') >= 0) {
        is_module = true;
        focused_ctx.alert("That's a reserved word for P5M");
        actions_add_file();
    }

    // Validates all
    if (!is_empty && !start_with_number && !is_main_file_name && has_extension && !is_duplicated && !has_spaces && !is_module) {
        the_extension = prompt_value.split(".")[1];
        global.app.focused_ctx.addFileToProject(prompt_value, the_extension);
    }

}

/*
  actions_sidebar_swap
  
  I use the swapDoc for change CodeMirror doc and the mode.

  */

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

/*
  actions_sidebar_view_image

  Media viewer image action.
  
 */

function actions_sidebar_view_image(index) {
    var images = focused_ctx.window.getImageFiles();
    var the_image = images[index];
    var abs_path_to_image = global.app.focused_project.directory + path.sep + the_image.rel_path;
    var gui = global.app.focused_win.window.require("nw.gui");

    sizeOf(abs_path_to_image, function(err, dimensions) {
        global.app.examples_window = gui.Window.open("file://" + abs_path_to_image, {
            "toolbar": false,
            "width": dimensions.width,
            "height": dimensions.height
        });
    });

}

/*
  actions_sidebar_view_audio

  Media viewer audio action.
  
 */

function actions_sidebar_view_audio(index) {
    var audios = focused_ctx.window.getAudioFiles();
    var the_audio = audios[index];
    var abs_path_to_audio = global.app.focused_project.directory + path.sep + the_audio.rel_path;
    var gui = global.app.focused_win.window.require("nw.gui");

    global.app.examples_window = gui.Window.open("file://" + abs_path_to_audio, {
        "toolbar": false,
        "width": 300,
        "height": 90
    });

}


/*
  actions_change_font_size();

  It injects the font-size of the editor.

 */


exports.actions_change_font_size = function(px) {
    for (var i = 0; i < global.app.projects.length; i++) {
        var this_ctx = global.app.projects[i].project.ctx.$('.CodeMirror-lines').css('font-size', px + 'px');
    }
}


/*
  actions_change_theme();

  It injects the stylesheet of the theme.

 */

exports.actions_change_theme = function(theme) {
    for (var i = 0; i < global.app.projects.length; i++) {
        global.app.projects[i].project.editor.setOption("theme", theme);
        global.app.projects[i].project.ctx.$("#active_theme").attr("href", "../app/static/stylesheets/theme_" + theme + ".css");
    }
}


/*
  action_save_default_settings();

  Here we write the setting.json with the actual settings.

 */

exports.action_save_default_settings = function() {
    fs.writeFileSync("app/settings.json", JSON.stringify(global.app.settings));
}


/*
  action_close_secondary_windows();

  Here we write the setting.json with the actual settings.

 */

function action_close_secondary_windows() {

    if (global.app.settings_window) {
        global.app.settings_window.close();
    }

    if (global.app.live_documentation_window) {
        global.app.live_documentation_window.close();
    }

    if (global.app.examples_window) {
        global.app.examples_window.close();
    }

    if (global.app.p5_modules_window) {
        global.app.p5_modules_window.close();
    }

}


/*

  refresh_live_documentation()

 */

exports.refresh_live_documentation = function(selectedText) {
    if (global.app.live_documentation_window) {
        global.app.live_documentation_window.window.searchInDocumentation(selectedText);
    }
}

/*

  actions_indent()

 */

function actions_indent() {
    global.app.focused_project.editor.indentDocument();
}