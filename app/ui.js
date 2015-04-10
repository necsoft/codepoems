/*
  ui.js
  
  tiene que manejar todos los handlers y crear todos los elementos/componentes
  del sistema operativo 

 */

// Este es el project que vamos a considerar como "Activo"
var project;

/*
  createUI()

  Se encarga de crear las cosas basicas de UI

 */


exports.createUI = function() {

    var menu = new nw.Menu({
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

    /*
      Menu bar items
     */

    var file = new nw.Menu();
    var sketch = new nw.Menu();

    // FILE
    win.menu.insert(new nw.MenuItem({
        label: 'File',
        //submenu: file
    }), 1);

    // File -> New
    file.append(new nw.MenuItem({
        label: 'New',
        //click: new_project
    }));

    // File -> Save
    file.append(new nw.MenuItem({
        label: 'Save',
        //click: save
    }));

    // SKETCH
    win.menu.insert(new nw.MenuItem({
        label: 'Sketch',
        //submenu: sketch
    }), 2);

    // Sketch -> Run
    sketch.append(new nw.MenuItem({
        label: 'Run',
        //click: run
    }));

};


/*
  activeProject()

  Lo usamos para setear 

 */

exports.activeProject = function(project) {

}