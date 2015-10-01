/*
  > p5manager.js
  
  Deals with the Processing projects

  */


// Dependencies.
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var util = require('util');
var readdirp = require('readdirp');
var es = require('event-stream');
var ncp = require('ncp').ncp;
var rimraf = require('rimraf');
var spawn = require('child_process').spawn;
var p5process;
var ps = require('ps-node');
var kill = require('tree-kill'); // Kill dependency for windows
var child;

// Default variables for projects
var default_project_label = "sketch";

/*
  initialProject()

  The initial project is the first project when we open Codepoems.

  */

exports.initialProject = function() {

    // Create the project object
    var project = {};
    project.id = new Date().getTime(); // Id -> Timestamp
    project.saved = false;
    project.declared = false;
    project.directory = "";
    project.files = [];


    // Push the main file
    project.files.push({
        type: "main",
        name: default_project_label + project.id + ".pde",
        extension: ".pde",
        rel_path: default_project_label + project.id + ".pde",
        saved: false,
        declared: false
    });

    // Add to the global list of projects.
    global.app.projects.push({
        project
    });

    // Open the window
    var gui = window.require("nw.gui");
    var new_win = gui.Window.open('project.html', global.app.default_window);
}

/*
  newProject()

  Create a new project.

  */

exports.newProject = function() {

    // Create the project object
    var project = {};
    project.id = new Date().getTime(); // Id -> Timestamp
    project.saved = false;
    project.declared = false;
    project.directory = "";
    project.files = [];

    // Push the main file
    project.files.push({
        type: "main",
        name: default_project_label + project.id + ".pde",
        extension: ".pde",
        rel_path: default_project_label + project.id + ".pde",
        saved: false,
        declared: false
    });

    // Push the project
    global.app.projects.push({
        project
    });

    // Open the window
    var gui = global.app.focused_win.window.require("nw.gui");
    var new_win = gui.Window.open('project.html', global.app.default_window);
}


/*
  open_project()

  Open a project, first check if it is valid.

  */

exports.openProject = function(project_path) {
    check_project(project_path, analyze_project);
};


/*
  check_project()

  Check if the path is a valid project.

  */

function check_project(p_path, callback) {

    // Parsing the path 
    var p_parsed = path.parse(p_path);
    // Name of the father folder
    var p_father = p_parsed.dir.split(path.sep).reverse()[0];
    // Name of the dir
    var p_dir = p_parsed.dir;
    // This is the tentative file
    var mainFile = p_dir + path.sep + p_father + ".pde";

    // If the tentative file exists, this is a valid project
    fs.access(mainFile, fs.R_OK | fs.W_OK, function(err) {
        if (err) {
            window.alert("This isn't a valid project.");
        } else {
            // If this is a valid project we call analyze_project()
            callback(p_dir, p_father, mainFile);
        };
    });

};

/*
  analyze_project()

  Analyze and create the project 

  */

function analyze_project(p_dir, p_father, main_file) {

    var analyzed_project = {};
    analyzed_project.id = new Date().getTime();
    analyzed_project.name = p_father;
    analyzed_project.saved = true;
    analyzed_project.declared = true;
    analyzed_project.files = [];
    analyzed_project.directory = p_dir;
    p_dir = p_dir + path.sep;

    // Ignored folders
    var filtered_folders = ['!.git', '!node_modules', '!backup'];

    // Searching for PDE
    readdirp({
        root: analyzed_project.directory,
        fileFilter: ['*.pde'],
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        if (entry.name === analyzed_project.name + ".pde") { // Detect main file
            analyzed_project.files.push({
                type: "main",
                name: entry.name,
                extension: ".pde",
                rel_path: entry.fullPath.replace(p_dir, ""),
                saved: true,
                declared: true
            });
        } else if (entry.name.indexOf("P5M_") === 0) { // Detect modules
            analyzed_project.files.push({
                type: "module",
                name: entry.name,
                extension: ".pde",
                rel_path: entry.fullPath.replace(p_dir, ""),
                saved: true,
                declared: true
            });
        } else {
            analyzed_project.files.push({ // Detect secondary files
                type: "secondary",
                name: entry.name,
                extension: ".pde",
                rel_path: entry.fullPath.replace(p_dir, ""),
                saved: true,
                declared: true
            });
        }
    });

    // Searching for Images
    readdirp({
        root: analyzed_project.directory,
        fileFilter: ['*.png', '*.jpg'],
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "image",
            name: entry.name,
            extension: "." + entry.name.split(".")[1],
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });


    // Searching for Shaders
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.glsl',
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "shader",
            name: entry.name,
            extension: ".glsl",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for JSON
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.json',
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "json",
            name: entry.name,
            extension: ".json",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for XML
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.xml',
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "xml",
            name: entry.name,
            extension: ".xml",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for txt
    readdirp({
        root: analyzed_project.directory,
        fileFilter: '*.txt',
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "txt",
            name: entry.name,
            extension: ".txt",
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Searching for audio
    readdirp({
        root: analyzed_project.directory,
        fileFilter: ['*.mp3', '*.wav', '*.ogg'],
        directoryFilter: filtered_folders
    }).on('data', function(entry) {
        analyzed_project.files.push({
            type: "audio",
            name: entry.name,
            extension: "." + entry.name.split(".")[1],
            rel_path: entry.fullPath.replace(p_dir, ""),
            saved: true,
            declared: true
        });
    });

    // Open the window with the analyzed project
    open_project_window(analyzed_project);
}


/*
  open_project_window()

  Here we push the analyzed project and open the new window.

  */

function open_project_window(project) {

    // Push the project to the list of projects
    global.app.projects.push({
        project
    });

    // Open the window
    var gui = global.app.focused_win.window.require("nw.gui");
    var new_win = gui.Window.open('project.html', global.app.default_window);

}


/*
  runProject()

  Runs a processing project.

  */

exports.runProject = function(project, ctx) {

    // Check if it is a 
    if (project.declared) {
        runDeclaredProject(project, ctx);
    } else {
        runUndeclaredProject(project, ctx);
    }
};

/*
  runDeclaredProject()

  This is the run for the declared projects (with a folder in the filesystem).

  1. Backup the actual old files.
  2. Save
  3. Spawn the processing-java in the directory
  4. Catch the stop and revert the backup.

  */

function runDeclaredProject(project, ctx) {
    // Create the backup directory
    mkdirp(project.directory + path.sep + "backup", function() {
        // Get the buffered files
        var buffered_files = ctx.getBufferedFiles();
        // Save the backup directory
        var backup_directory = project.directory + path.sep + "backup" + path.sep;
        // Iterate the buffered files
        for (var i = 0; i < buffered_files.length; i++) {
            // Read the old files
            var file_content = fs.readFileSync(project.directory + path.sep + buffered_files[i].rel_path);
            // Guardamos esos archivos en la carpeta de backup
            fs.writeFileSync(backup_directory + buffered_files[i].rel_path, file_content);
        };
        // Silence save
        writeAllDocToFiles(project);
        // Spawn the processing-java process
        runP5process(ctx, project, project.directory, project.directory + path.sep + "build");
    });

};

/*
  runUndeclaredProject()

  This is the run for undeclared project (with no declared folders in the filesystem)

  */

function runUndeclaredProject(project, ctx) {

    // Create the temporal folder
    mkdirp('./app/tmp/' + ctx.getMainFile().name.split(".")[0], function(err) {
        // Get the buffered files
        var buffered_files = ctx.getBufferedFiles();
        // Iterate the buffered files
        for (var i = 0; i < buffered_files.length; i++) {
            // Write the temporal file
            fs.writeFile('./app/tmp/' + ctx.getMainFile().name.split(".")[0] + path.sep + buffered_files[i].rel_path, buffered_files[i].doc.getValue(), function(err) {
                if (err) {
                    console.log(err);
                }
            });
        };

        // Temporal dirs
        var temporal_dir = process.cwd() + '/app/tmp/' + ctx.getMainFile().name.split(".")[0];
        var temporal_dir_build = process.cwd() + '/app/tmp/' + ctx.getMainFile().name.split(".")[0] + "/build/";

        // Spawn the processing-java process
        runP5process(ctx, project, temporal_dir, temporal_dir_build);

    });

};




/*

  runP5process()

  Run the processing-java CLI and catch the incoming messages.

 */


function runP5process(ctx, project, sketch_dir, build_dir) {

    // Spawn processing-java
    p5process = spawn('processing-java', ['--sketch=' + sketch_dir, '--output=' + build_dir, '--force', '--run'], {
        detached: true
    });

    // Set the actual status of the project
    project.running = true;

    // Here I save the PID, this is a fix for the stop process.
    // I have to improve this, but I can't find a relationship beetween this
    // process and the processing-java
    project.running_pid = (p5process.pid + 2);



    // Handle the incoming data
    p5process.stdout.on('data',
        function(data) {
            ctx.writeToConsole(data.toString(), "message");
        }
    );

    // Handle the incoming errors
    p5process.stderr.on('data',
        function(data) {
            var not_error = /(using the default display instead|other error)/;
            if (not_error.test(data) === false) {
                ctx.writeToConsole(data.toString(), "error");
            } else {
                ctx.writeToConsole(data.toString(), "message");
            }
        }
    );

    // Handle the close of the app
    p5process.on('close',
        function() {
            project.running = false;
            project.running_pid = "";

            // If it is a declared projects, restore the backup files.
            if (project.declared) {
                var backup_directory = project.directory + path.sep + "backup" + path.sep;
                var buffered_files = ctx.getBufferedFiles();
                for (var i = 0; i < buffered_files.length; i++) {
                    // Read the backup files
                    var file_content = fs.readFileSync(project.directory + path.sep + "backup" + path.sep + buffered_files[i].rel_path);
                    // Write the files
                    fs.writeFileSync(project.directory + path.sep + buffered_files[i].rel_path, file_content);
                    // Delete the backup file
                    rimraf(backup_directory, function() {});
                    rimraf(project.directory + path.sep + "build", function() {});
                };
            }


        }
    );


}

/*
  silenceSave()

  Save without dialog boxes.

 */


exports.silenceSave = function(project, ctx) {
    writeAllDocToFiles(project);
};


/*
  writeAllDocToFiles();

  Write the associated file with the buffer contents.

 */


function writeAllDocToFiles(project) {
    for (var i = 0; i < project.files.length; i++) {
        // Check if it is file with an associated buffer
        var the_type = project.files[i].type;
        if (the_type === "shader" ||
            the_type === "main" ||
            the_type === "secondary" ||
            the_type === "json" ||
            the_type === "xml" ||
            the_type === "txt") {
            // Write the file
            fs.writeFile(project.directory + path.sep + project.files[i].rel_path, project.files[i].doc.getValue(), function(err) {
                if (err) {
                    console.log(err);
                }
            });

        };
    };
    project.saved = true;
}


/*
  saveAsProject()

  Save as the project

  */

exports.saveAsProject = function(save_path, project, ctx) {

    // Parse the save path
    var name_saved = save_path.split(path.sep).reverse()[0];
    var main_path = save_path + path.sep;
    var main_file = main_path + name_saved + ".pde";

    if (project.declared === false) {
        // Create a folder and write the files
        saveAsUndeclared();
    } else {
        // Copy the folder and rename the main file
        saveAsDeclared();
    }

    /*
      saveAsUndeclared()
      
      This is the save when the project hasn't an associated folder.

      1. Create the folder
      2. Create the files

     */

    function saveAsUndeclared() {
        // Create the folder
        mkdirp(save_path, function(err) {
            if (err) {
                console.log(err);
            } else {
                for (var i = 0; i < project.files.length; i++) {
                    // Create the main file
                    if (project.files[i].type === "main") {
                        // Set the rel path of this file
                        project.files[i].rel_path = name_saved + ".pde";
                        // Write the file
                        fs.writeFile(main_path + name_saved + ".pde", project.files[i].doc.getValue(), function(err) {
                            ctx.getMainFile().name = name_saved + ".pde";
                            project.declared = true;
                            // Refrescamos el sidebar para que se vea el cambio.
                            ctx.refreshSidebar();
                        });
                    } else {
                        // Save the new relative path
                        project.files[i].rel_path = project.files[i].name;
                        fs.writeFile(main_path + project.files[i].name, project.files[i].doc.getValue(), function(err) {

                        });
                    }
                };
                // Refresh the project status
                project.directory = save_path;
                project.saved = true;
                project.declared = true;
            };
        });
    };

    /*
    saveAsDeclared()
      
      This is the save for declared projects.

      1. Copy the folder
      2. Rename the main file
      3. Write the files

     */

    function saveAsDeclared() {
        // Copy the folder
        ncp(project.directory, main_path, function(err) {
            if (err) {
                return console.error(err);
            }

            // Una vez que se termina de copiar la carpeta, cambia el project.directory,
            // le hago el substring porque le saco el ultimo carecter.
            project.directory = main_path.substring(0, main_path.length - 1);

            //Rename the file
            fs.rename(project.directory + path.sep + ctx.getMainFile().name, project.directory + path.sep + name_saved + ".pde", function(err) {
                if (err) throw err;
                // Update the main file
                ctx.getMainFile().name = name_saved + ".pde";
                ctx.getMainFile().rel_path = path.sep + name_saved + ".pde";
                // Save the files
                writeAllDocToFiles(project);
                // Refresh the sidebar
                ctx.refreshSidebar();

            });
        });
    }

}


/*
  stopProcess()

  Stop the processing-java process by PID

  */

exports.stopProcess = function(project) {

    // Windows:
    // kill(p5process.pid, 'SIGKILL');

    ps.kill(project.running_pid, function(err) {
        if (err) {
            throw new Error(err);
        } else {
            console.log('Process %s has been killed!', pid);
        }
    });
    project.running = false;
    project.running_pid = "";
}