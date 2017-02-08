/*==================================================
*	FNUI 2.0  
*   core 定义一些基础的浏览器事件和特性
*===================================================*/

define(['jquery'],function($){

	'use strict';

	var FNUI,UI ={};
	UI.VERSION = '2.0';

	UI.support = {};

	
	
  // CSS TRANSITION SUPPORT 
  // ============================================================
	UI.support.transition = (function transitionEnd() {
    var el = document.createElement('fnui');

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  })();

  $.fn.emulateTransitionEnd = function (duration) {
	    var called = false
	    var $el = this
	    $(this).one('fnTransitionEnd', function () { called = true })
	    var trigger = function () { if (!called) $($el).trigger(UI.support.transition.end) }
	    setTimeout(trigger, duration)
	    return this
  };

  $(function () {
    if (!UI.support.transition) return

    $.event.special.fnTransitionEnd = {
      bindType: UI.support.transition.end,
      delegateType: UI.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  });

	// CSS ANIMATION SUPPORT
 	// ============================================================
	UI.support.animation = (function() {
		var el = document.createElement('fnui');
		var animEndEventNames = {
	      WebkitAnimation: 'webkitAnimationEnd',
	      MozAnimation: 'animationend',
	      OAnimation: 'oAnimationEnd oanimationend',
	      animation: 'animationend'
	    };

		for (var name in animEndEventNames) {
	      if (el.style[name] !== undefined) {
	        return { end: animEndEventNames[name] }
	      }
	    }
   		return false   //ie8 again god kill me
	})();

	$.fn.emulateAnimationEnd = function (duration) {
	    var called = false
	    var $el = this
	    $(this).one('fnAnimationEnd', function () { called = true })
	    var trigger = function () { if (!called) $($el).trigger(UI.support.animation) }
	    setTimeout(trigger, duration)
	    return this
  	};

	$(function () {
	    if (!UI.support.animation) return
	    $.event.special.fnAnimationEnd = {
	      bindType: UI.support.animation.end,
	      delegateType: UI.support.animation.end,
	      handle: function (e) {
	        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
	      }
	    }
	 });


	//animation interface
	//=============================================================
	UI.rAF = (function() {
	  return window.requestAnimationFrame ||
	    window.webkitRequestAnimationFrame ||
	    window.mozRequestAnimationFrame ||
	    window.oRequestAnimationFrame ||
	      // if all else fails, use setTimeout
	    function(callback) {
	      return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
	    };
	})();
	
	UI.cancelAF = (function() {
	  return window.cancelAnimationFrame ||
	    window.webkitCancelAnimationFrame ||
	    window.mozCancelAnimationFrame ||
	    window.oCancelAnimationFrame ||
	    function(id) {
	      window.clearTimeout(id);
	    };
	})();


	/**
	 * Plugin FNUI Component to jQuery
	 *
	 * @param {String} name - plugin name
	 * @param {Function} Component - plugin constructor
	 * @param {Object} [pluginOption]
	 * @param {String} pluginOption.dataOptions
	 * @param {Function} pluginOption.methodCall - custom method call
	 * @param {Function} pluginOption.before
	 * @param {Function} pluginOption.after
	 */
	UI.plugin = function UIPlugin(name, Component, pluginOption) {
	  var old = $.fn[name];
	  pluginOption = pluginOption || {};

	  $.fn[name] = function(option) {
	    var allArgs = Array.prototype.slice.call(arguments, 0);
	    var args = allArgs.slice(1);
	    var propReturn;
	    var $set = this.each(function() {
	      var $this = $(this);
	      var dataName = 'fnui.' + name;
	      var dataOptionsName = pluginOption.dataOptions || ('data-fn-' + name);
	      var instance = $this.data(dataName);
	      var options = $.extend({},
	        UI.utils.parseOptions($this.attr(dataOptionsName)),
	        typeof option === 'object' && option);

	      if (!instance && option === 'destroy') {
	        return;
	      }

	      if (!instance) {
	        $this.data(dataName, (instance = new Component(this, options)));
	      }

	      // custom method call
	      if (pluginOption.methodCall) {
	        pluginOption.methodCall.call($this, allArgs, instance);
	      } else {
	        // before method call
	        pluginOption.before &&
	        pluginOption.before.call($this, allArgs, instance);

	        if (typeof option === 'string') {
	          propReturn = typeof instance[option] === 'function' ?
	            instance[option].apply(instance, args) : instance[option];
	        }

	        // after method call
	        pluginOption.after && pluginOption.after.call($this, allArgs, instance);
	      }
	    });

	    return (propReturn === undefined) ? $set : propReturn;
	  };

	  $.fn[name].Constructor = Component;

	  // no conflict
	  $.fn[name].noConflict = function() {
	    $.fn[name] = old;
	    return this;
	  };

	  UI[name] = Component;
	};


	UI.utils = {};

	/**
	 * Debounce function
	 * @param {function} func  Function to be debounced
	 * @param {number} wait Function execution threshold in milliseconds
	 * @param {bool} immediate  Whether the function should be called at
	 *                          the beginning of the delay instead of the
	 *                          end. Default is false.
	 * @desc Executes a function when it stops being invoked for n seconds
	 */
	UI.utils.debounce = function(func, wait, immediate) {
	  var timeout;
	  return function() {
	    var context = this;
	    var args = arguments;
	    var later = function() {
	      timeout = null;
	      if (!immediate) {
	        func.apply(context, args);
	      }
	    };
	    var callNow = immediate && !timeout;

	    clearTimeout(timeout);
	    timeout = setTimeout(later, wait);

	    if (callNow) {
	      func.apply(context, args);
	    }
	  };
	};
	
    UI.utils.parseOptions = function(string) {
        if ($.isPlainObject(string)) {
          return string;
        }
        var start = (string ? string.indexOf('{') : -1);
        var options = {};

        if (start != -1) {
          try {
            options = (new Function('',
              'var json = ' + string.substr(start) +
              '; return JSON.parse(JSON.stringify(json));'))();
          } catch (e) {
          }
        }
        return options;
      };
	
	UI.utils.generateGUID = function(namespace) {
	  var uid = namespace + '-' || 'fn-';

	  do {
	    uid += Math.random().toString(36).substring(2, 7);
	  } while (document.getElementById(uid));

	  return uid;
	};

	//DOM Watcher 
	// Dom mutation watchers
	//=======================================================================
	// DOM 变化检测器，在页面初始化时执行
	UI.DOMWatchers = [];
	UI.DOMReady = false;
	UI.ready = function(callback) {
	  UI.DOMWatchers.push(callback);
	  if (UI.DOMReady) {
	    callback(document);
	  }
	};

	UI.DOMObserve = function(elements, options, callback) {
	  var Observer = UI.support.mutationobserver;
	  if (!Observer) {
	    return;
	  }

	  options = $.isPlainObject(options) ?
	    options : {childList: true, subtree: true};

	  callback = typeof callback === 'function' && callback || function() {
	  };

	  $(elements).each(function() {
	    var element = this;
	    var $element = $(element);

	    if ($element.data('am.observer')) {
	      return;
	    }

	    try {
	      var observer = new Observer(UI.utils.debounce(
	        function(mutations, instance) {
	        callback.call(element, mutations, instance);
	        // trigger this event manually if MutationObserver not supported
	        $element.trigger('changed.dom.fnui');
	      }, 50));

	      observer.observe(element, options);

	      $element.data('am.observer', observer);
	    } catch (e) {
	    }
	  });
	};

	$.fn.DOMObserve = function(options, callback) {
	  return this.each(function() {
	    UI.DOMObserve(this, options, callback);
	  });
	};

	if (UI.support.touch) {
	  $(html).addClass('fn-touch');
	}

	$(document).on('changed.dom.fnui', function(e) {
	  var element = e.target;
	  $.each(UI.DOMWatchers, function(i, watcher) {
	    watcher(element);
	  });
	});


	$(function() {
	  UI.DOMReady = true;
	  // Run default init
	  $.each(UI.DOMWatchers, function(i, watcher) {
	    watcher(document);
	  });
	});

   /*===============================================================
		output  as amd module
   =================================================================*/
   return FNUI = UI;
});