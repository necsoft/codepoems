//
// Gruntfile.js
// -------------------------------------------------------
//
// Actualmente la única tarea que estamos corriendo es la de compilar
// el stylus que tenemos en /static/styl/*
//

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //Stylus
        stylus: {
            compile: {
                options: {
                    paths: ['static/styl'],
                    use: [
                        require('fluidity') // use stylus plugin at compile time
                    ],
                },
                files: {
                    'app/static/stylesheets/style.css': 'app/static/stylesheets/style.styl'
                }
            }
        }
    });

    // Cargamos grunt-contrib-stylus
    grunt.loadNpmTasks('grunt-contrib-stylus');

    // Default task(s).
    grunt.registerTask('default', ['stylus']);
};
