//Importamos el paquete que usamos para la gui
var nw = window.require("nw.gui");
//Creamos una variable para llamar a la ventana
var win = nw.Window.get();

// Este es el fix del clipboard para OSX
var nativeMenuBar = new nw.Menu({ type: "menubar" });
try {
nativeMenuBar.createMacBuiltin("My App");
win.menu = nativeMenuBar;
} catch (ex) {
console.log(ex.message);
}

// Si pasamos el param devmode nos da la chrome developer tool.
if(nw.App.argv.slice(0) == "devmode"){
  win.showDevTools();
}
