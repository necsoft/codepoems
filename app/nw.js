// nw.gui initialization
var nw = window.require("nw.gui");
var win = nw.Window.get();

$(document).keyup(function(e) {

    // esc = close the program
    if (e.keyCode == 27) {
        win.close();
    }
    // tab = show dev tool
    if (e.keyCode == 9) {
        win.showDevTools();
    }
});

//Clipboard FIX OS X
var nativeMenuBar = new nw.Menu({
    type: "menubar"
});
try {
    nativeMenuBar.createMacBuiltin("My App");
    win.menu = nativeMenuBar;
} catch (ex) {
    console.log(ex.message);
}