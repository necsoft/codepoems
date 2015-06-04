var gui = require('nw.gui');
var win = gui.Window.get();

global.app.settings_window_active = true;

// Cuando la ventana de settings se cierra
win.on('close', function() {
    this.hide();
    global.app.settings_window_active = false;
    this.close(true);
});