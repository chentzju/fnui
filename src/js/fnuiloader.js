/*=============================================================
requirejs按需加载原理：

	1、require的简单实用
		require(dep,callback)
	前面加载依赖，后面进行回调函数，要求依赖加载完成后才能进行回调
	
	2、如何实现：
		ajax? : 根据需要请求？ 不行 因为ajax存在跨域问题
		requirejs ：解决方案   实用script 标签进行加载
		
		ex(from requirejs): 动态创建一个对应的script标签
		req.createNode = function (config, moduleName, url) {
			var node = config.xhtml ?
					document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
					document.createElement('script');
			node.type = config.scriptType || 'text/javascript';
			node.charset = 'utf-8';
			node.async = true;
			return node;
		};
	
	3、加载器实现：
		var require = function(){}
		require.config = function(){}
		require.define = function(){}
		
		require做入口，config做路径映射，define设计模块,
		然后创建script标签 然后侦听onload事件
	
	4、简单的加载器
		define和require定义在一个require方法上
===============================================================*/

(function(){


	//存储已经加载的模块
	var moduleCache = {};
	//基本路径（默认路径，所有的模块从这里开始找）
	var baseUrl = "";
	//路径，每个名称对应一个路径
	var paths = {};
	
	var ostring = Object.prototype.toString;
	
	function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }
	
	function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }
	
	var require = function(name,deps,callback){
		var params = [];
		var depCount = 0;
		var i,isEmpty=false,moduleName;
		
		//允许匿名定义
        if (isArray(name) && typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps;
            deps = name;
            name = null;
        }else if(isFunction(name)){
			deps = [];
			callback = name;
			name = null;
		}
		
		
		
		//获取当前正在执行的js代码段，这个在onload事件之前执行
		//如果不存在，就默认为REQUIRE_MAIN
		moduleName = document.currentScript && document.currentScript.id || 'REQUIRE_MAIN';
	
		//简单实现，只考虑数组的依赖，所以定义时必须是数组
		if(deps.length){
			for(i = 0; i < deps.length; i++){
				
				//对第i个依赖调用加载
				//迭代
				(function(i){
					//依赖个数加1
					depCount++;
					
					//调用加载，
					//完成加载后解除绑定
					loadModule(deps[i],function(param){
										params[i] = param;
										depCount--;
										if(depCount === 0){
											saveModule(moduleName,params,callback);
										}
					});
				})(i);
			}
		}else{
			//没有依赖
			isEmpty = true;
		}
		
		//如果没有依赖
		if(isEmpty){
			setTimeout(function(){
				saveModule(moduleName,null,callback);
			},0);
		}
	};  //end of require -:~
	
	//config主要是把一些配置好的东西放到变量中
	var config = function(obj){
		if(obj.hasOwnProperty('baseUrl'))
			baseUrl = obj.baseUrl;
		if(obj.hasOwnProperty('paths'))
			paths = obj.paths;
	};// end of config
	
	
	//获取js文件的路径
	var getPath = function(moduleName){
		//先要去地址配置文件中检查这个dep对应的路径
		var url = moduleName;
		
		if(paths.hasOwnProperty(moduleName))
			url = paths[moduleName];
		
		//路径拼装
		if(url.indexOf('.js') === -1) url = url+'.js';
		url = baseUrl === ""?baseUrl:(baseUrl+"/") + url;
		return url;
	};
	
	//加载模块
	var loadModule = function(moduleName,callback){
		var url = getPath(moduleName),fs,module;
		
		//如果模块已加载
		if(moduleCache[moduleName]){
			module = moduleCache[moduleName];
			if(module.status === 'loaded'){
				setTimeout(callback(module.export),0);
			}else{
				//如果正在加载中状态直接往onload属性插入值，在加载好后会解除依赖
				//实际上用侦听是不是更好 requirejs用的是侦听
				module.onload.push(callback);
				//var modulescript = document.getElementById("moduleName");
				//modulescript.addEventListener("load",setTimeout(callback(module.export),0););
			}
		}else{
		
			/*
			如果未加载
			status改为加载状态
			onload事实上对应requirejs的事件回调，该模块被引用多少次变化执行多少次回调，通知被依赖项解除依赖
			*/
			module = moduleCache[moduleName] = {
				moduleName:moduleName,
				status:'loading',
				export:null,
				onload:[callback]
			};
			
			//创建script标签对象
			_script = document.createElement('script');
			_script.id = moduleName;
			_script.type = 'text/javascript';
			_script.async = true;
			_script.src=url;
			
			fs = document.getElementsByTagName('script')[0];
			fs.parentNode.insertBefore(_script,fs);
		}
	};
	
	//保存模块
	var saveModule = function(moduleName,params,callback){
		var module,func;
		
		if(moduleCache.hasOwnProperty(moduleName)){
			module = moduleCache[moduleName];
			module.status = 'loaded';
			
			//用apply方法，防止数组解析错误
			module.export = callback ? callback.apply(this,params) : null;
			
			//解除父类依赖，shift()，把数组的第一个元素删掉,返回该元素
			//使用监听更好？怎么监听？
			while(func = module.onload.shift()){
				func(module.export);
			}
			
		}else{
			callback && callback.apply(window,params);
		}
	};
	
	window.require = require;
	window.require.config = config;
	window.define = require;
	define.amd = {
        jQuery: true
    };
	
})();