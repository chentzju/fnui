'use strict';

//wrapper函数 所有的grunt构建代码都写在这里
module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);
  // Configurable paths for the application
  var appConfig = {
    app: 'www',
    dist: 'dist'
  };

  // Project configuration.
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,


    //watche task
    watch:{
      js:{
        files:['<%= yeoman.app%>/{,*/}*.js'],
        options:{
          livereload:'<%= connect.options.livereload %>'
        }
      },
      styles:{
        files:['<%= yeoman.app%>/{,*/}*.css'],
        options:{
            livereload:'<%= connect.options.livereload %>'
          }
      },
      html:{
    	files:['<%= yeoman.app%>/{,*/}*.html'],
        options:{
            livereload:'<%= connect.options.livereload %>'
          }
      },
      livereload:{
        options:{
          livereload: '<%= connect.options.livereload %>'
        },
        files:[
          '<%= yeoman.app %>/{,*/}*.html',
          '<%= yeoman.app %>/html/{,*/}*.html',
          '<%= yeoman.app%>/js/{,*/}*.js',
          '<%= yeoman.app %>/css/{,*/}*.css}',
          '<%= yeoman.app %>/img/{,*/}*.{png,jpg}',
        ]
      }
    },

    //server setting
    connect: {
      options: {
        port: 9002,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base:'<%= yeoman.app %>'
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git{,*/}*'
          ]
        }]
      }
    },
    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '*.html',
            "html/*.*",
            "html/*/*.*",
            'img/*.*',
            'img/*/*.*',
            'css/*.css',
            "fonts/*.*",
            "js/*.js"
          ]
        }]
      }
    },

    cssmin:{
      dist: {
        files: [{
          src: '<%= yeoman.dist %>/css/main.css',
          dest: '<%= yeoman.dist %>/css/main.css'
        }]
      }
    },
    uglify:{
      dist: {
        files: [{
          src: '<%= yeoman.dist %>/js/main.js',
          dest:'<%= yeoman.dist %>/js/main.js'
        },
          {
            src:'<%= yeoman.dist %>/html/js/*.js',
            dest:'<%= yeoman.dist %>/html/js/*.js,'
          }]
      }
    },
    htmlmin:{
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    //代码检验
    jshint: {
      options: {
        "bitwise": false, //位运算符
        "curly": true,  //循环必须用花括号包围
        "eqeqeq":true, //必须用三等号
        "es3":true,  //兼容低等浏览器
        "freeze":true,//禁止重写原生对象
        "indent":true, //代码进缩
        "latedef":true,//禁止定义之前使用变量
        "noarg":false,
        "globals": {
          jQuery: true,
          require:true,
          fnui:true
        }
      },
      main: {
        src: ['<%= yeoman.app %>/js/*.js','<%= yeoman.app %>/html/js/*.js']
      }
    }
  });

  //加载插件
  require('load-grunt-tasks')(grunt, {
    pattern: 'grunt-contrib-*',
    config: 'package.json',
    scope: 'devDependencies',
    requireResolution: true
  });
  grunt.registerTask('server', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test',[
  ]);

  grunt.registerTask('build',[
    'clean:dist',
    'copy:dist',
    'cssmin',
    'uglify',
    'htmlmin'
  ]);

  grunt.registerTask('default',[
    'test',
    'build'
  ]);
};
