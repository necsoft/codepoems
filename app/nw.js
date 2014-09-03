//Importamos el paquete que usamos para la gui
var nw = window.require("nw.gui");
//Creamos una variable para llamar a la ventana
var win = nw.Window.get();
// Si pasamos el param devmode nos da la chrome developer tool.
if(nw.App.argv.slice(0) == "devmode"){
  win.showDevTools();
}
