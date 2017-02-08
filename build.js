({
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
		})