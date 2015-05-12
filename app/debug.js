$(document).ready(function() {

    // Refresh Loop
    setInterval(function() {
        $(".debug_currentPlatform").text(global.app.platform);
        $(".debug_projectsOpened").text(global.app.projects.length);
        $(".debug_focusedProject").text(global.app.focused_project.id);
        try {
            $(".debug_focusedProjectText").text(global.app.focused_project.editor.getValue());
        } catch (err) {}
    }, 300);

});