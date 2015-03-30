// nw.gui initialization
var nw = window.require("nw.gui");
var win = nw.Window.get();

$(document).keyup(function(e) {

    // esc = close the program
    if (e.keyCode == 27) {
        win.close();
    }
});


//Clipboard FIX OS X
var menu = new nw.Menu({
    type: "menubar"
});


//Inicializo los botones del menubar
var file = new nw.Menu();
var sketch = new nw.Menu();

try {
    menu.createMacBuiltin("Codepoems", {
        hideWindow: true
    });
    win.menu = menu;

    // Inserto los items del menubar
    win.menu.insert(new nw.MenuItem({
        label: 'File',
        submenu: file
    }), 1);
    win.menu.insert(new nw.MenuItem({
        label: 'Sketch',
        submenu: sketch
    }), 2);


} catch (ex) {
    console.log(ex.message);
}