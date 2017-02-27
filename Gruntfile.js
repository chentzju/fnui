/*
 * FNUI Gruntfile
 *
 * Licensed under the MIT license.
 */

'use strict';
//wrapper
module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
  
		// 读取package配置,pkg作为该json对象的引用
		pkg:grunt.file.readJSON('package.json'),

		banner: '/*!\n' +
            ' * FNUI v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * Copyright 2013-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * Licensed under the <%= pkg.license %> license\n' +
            ' */\n',



		// 开始任务配置


		// 代码检验
		jshint: {
		  options: {
				"bitwise": false, // 位运算符
				"curly": true,  // 循环必须用花括号包围
				"eqeqeq":true, // 必须用三等号
				"es3":true,  // 兼容低等浏览器
				"freeze":true,// 禁止重写原生对象
				"indent":true, // 代码进缩
				"latedef":true,// 禁止定义之前使用变量
				"noarg":false,
				"globals": {
					  jQuery: true
					}
		  },
		  core: {
			src: ['src/js/fnui.js','src/js/fnui/*.js']
		  }
		},


		clean:{
			css: {
				src: ['dist/css/*']
			},

			fonts:{
				src:['dist/fonts']
			},
			js:{
				src:['dist/js/*']
			},

			doc:{
				src:['doc/download/*.zip']
			},

			zip:{
				src:['*.zip']
			}
		},
		

		
		// 配置requirejs
		requirejs: {
		  noamd: {
			options: {
			  findNestedDependencies: true,
			  baseUrl: "src/js",
			  paths:{
				  jquery: 'empty:'
			  },
			  optimize: 'none',
			  mainConfigFile: "src/js/fnui.js",
			  removeCombined: true,
			  preserveLicenseComments: true,
			  name: 'fnui',
			  out: 'dist/js/fnui.js',
			  onModuleBundleComplete: function (data) {            
				  var fs = require('fs'),              
				  amdclean = require('amdclean'),              
				  outputFile = data.path;             
				  fs.writeFileSync(outputFile, amdclean.clean({
					  'filePath': outputFile            
					  }));
			  	}
			}
		  },
		  withamd: {
			options: {
				findNestedDependencies: true,
				baseUrl: "src/js",
				paths:{
					jquery: 'empty:'
				},
				optimize: 'none',
				mainConfigFile: "src/js/fnui.js",
				removeCombined: true,
				preserveLicenseComments: true,
				name: 'fnui',
				out: 'dist/js/fnuiamd.js'
			}
		  }
		},


		// replace吧jquery替换为jQuery
		replace:{
			fnui:{
				src : 'dist/js/fnui.js',
				overwrite : true,
				replacements : [{from:'jquery',to:'jQuery'}]
			}
		},
		


		// uglify压缩任务
		uglify:{
			dist:{
				files:[
				       {src:'dist/js/fnui.js',
				    	dest:'dist/js/fnui.min.js'
				       },
				       {src:'dist/js/fnuiamd.js',
				    	dest:'dist/js/fnuiamd.min.js'
				       },
				       {src:'dist/js/fnuiloader.js',
					    	dest:'dist/js/fnuiloader.min.js'}
				       ]
			}
		},



		
		// less编译任务
		less:{
			options: {
				banner:  '<%= banner %>\n'
			},
			compileCore: {
				files:[
						{src: 'src/less/fnuitheme.less',dest:'dist/css/<%= pkg.name %>theme.css'},
				        {src: 'src/less/fnuiall.less',dest: 'dist/css/<%= pkg.name %>.css'}
				       ]

			}
		},


		// cssmin 压缩css
		cssmin:{
			dist: {
				files:[
				  {src: 'dist/css/<%= pkg.name %>theme.css',dest: 'dist/css/<%= pkg.name %>theme.min.css'},
				  {src: 'dist/css/<%= pkg.name %>.css',dest: 'dist/css/<%= pkg.name %>.min.css'}
				]
			}
		},


		// copy 直接拷贝的文件
		copy: {
			fonts:{
				files : [
							{
								expand : true,
								cwd : 'src/fonts',
								src : [ '*' ],
								dest : 'dist/fonts/'
							}
				        ]
			},
			js:{
						files : [
								{
									expand : true,
									cwd : 'src/js',
									src : [ 'fnuiloader.js' ],
									dest : 'dist/js/'
								}
								 ]
			},
			zip:{
				files:[{
					expand : true,
					src : ['*.zip'],
					dest : 'doc/download/'
				}]
			}
		},



		// watch 检测文件变化
		watch: {
		  src: {
			files: '<%= jshint.core.src %>',
			tasks: ['requirejs']
		  },
		  less: {
			files: 'less/**/*.less',
			tasks: 'less'
		  }
		},

		// compress 打压缩包
		compress: {
			  main: {
				options: {
				  archive: 'fnui-<%= pkg.version %>-dist.zip',
				},
				files:[
				       {
				    	   expand:true,
				    	   cwd:'dist/',
				    	   src:['css/*','fonts/*','js/*'],
				    	   dest:'dist/'
				       }
				     ]
			  }
		}
	  
	});
	
	// 加载插件
	require('load-grunt-tasks')(grunt, {
		pattern: 'grunt-contrib-*',
		config: 'package.json',
		scope: 'devDependencies',
		requireResolution: true
	});
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-contrib-compress');
	


	//task
	var buildtask = [];
	buildtask.push('clean');

	buildtask.push('copy:fonts');
	buildtask.push('copy:js');

	buildtask.push('requirejs');
	buildtask.push('replace');
	buildtask.push('uglify');


	buildtask.push('less');
	buildtask.push('cssmin');

	buildtask.push('compress');
	buildtask.push('copy:zip');
	
	// 代码检验任务
	grunt.registerTask('test',['jshint']);
	// 构建任务
	grunt.registerTask('build',buildtask);

	// 默认被执行的任务列表
	grunt.registerTask('default',['build']);

	//css 构建任务
	grunt.registerTask('build-css',['clean:css','clean:zip','less','cssmin','compress','copy:zip']);
};
