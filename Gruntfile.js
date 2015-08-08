'use strict';

module.exports = function(grunt) {

	require('jit-grunt')(grunt);
	require('time-grunt')(grunt);
	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;'+
			'*/\n\n',
		
		uglify: {
			options: {
				banner:  '<%= banner %>'
			},
			
			build: {
				src: 'js/planet-positions.js',
				dest: 'js/planet-positions.min.js'
			}			
		},
		
		browserify : {
			options : {
				external: [],
				browserifyOptions : {
					debug: true
				},
				//
			},
			build : {
				files: {'js/planet-positions.js' : './src/App.js'},
				options : {
					transform: [],
					browserifyOptions : {
						debug: true
					},
				}
			}
		},
		
		watch: {
			js: {
				files: 'src/**/*.js',
				tasks: ['browserify:build'/*, 'uglify:prod'*/]
			},			
			scss: {
				files: '**/*.scss',
			
				tasks: ['sass'],
				options: {
					spawn: false,
					interrupt: true
				}
			
			},
		},

		sass: {
			development: {
				options: {
					style : 'compressed'
				},
				files: {
					"css/main.css": "scss/main.scss",
					"modules/views/email/css/main.css": "modules/views/email/scss/main.scss"
				}
			},
		},	
	});

	grunt.registerTask('default', ['browserify:build', 'uglify:build']);	
	
};
