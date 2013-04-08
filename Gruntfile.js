
module.exports = function(grunt) {

  grunt.initConfig({
    qunit: {
      punt: ['test/test.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('default', 'qunit');

};

