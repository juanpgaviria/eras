
module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    mkdir:
      init:
        options:
          create: ['build']

    clean:
      all:
        src: ['build/']

    mochaTest:
      test:
        options:
          require: 'coffee-script/register'
        src: ['test/*.coffee']


    shell:
      npmInstall:
        command: 'npm install'

    coffee:
      build:
        options:
          bare: true
        expand: true
        cwd: 'lib/'
        src: ['**/*.coffee']
        dest: 'build/'
        ext: '.js'

  ######################
  ##### Custom tasks ###
  ######################

  # init
  grunt.registerTask 'init', ['mkdir:init']

  # cleanup
  grunt.registerTask 'cleanup', ['clean:all']

  # mocha
  grunt.registerTask 'mocha', ['mochaTest:test']

  # build
  grunt.registerTask 'build', [
    'coffee:build'
  ]

  # Npm Tasks
  grunt.loadNpmTasks 'grunt-mkdir'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-contrib-coffee'

  return
