;(function() {
/*==================================================
*	FNUI 2.0  
*   core 定义一些基础的浏览器事件和特性
*===================================================*/
var fnui_fnuicore, fnui_dimmer, fnui_alert, fnui_button, fnui_collapse, fnui_datepicker, fnui_dropdown, fnui_modal, fnui_hammer, fnui_offcanvas, fnui_popover, fnui_progress, fnui_pinchzoom, fnui_pureview, fnui_scrollspy, fnui_scrollspynav, fnui_select, fnui_slider, fnui_smoothscroll, fnui_sticky, fnui_tabs, fnui_ucheck, fnui_validator, fnui_switch, fnui_toast, fnui;
fnui_fnuicore = function ($) {
  var FNUI, UI = {};
  UI.VERSION = '2.0';
  UI.support = {};
  // CSS TRANSITION SUPPORT 
  // ============================================================
  UI.support.transition = function transitionEnd() {
    var el = document.createElement('fnui');
    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }
    return false  // explicit for ie8 (  ._.)
;
  }();
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('fnTransitionEnd', function () {
      called = true;
    });
    var trigger = function () {
      if (!called)
        $($el).trigger(UI.support.transition.end);
    };
    setTimeout(trigger, duration);
    return this;
  };
  $(function () {
    if (!UI.support.transition)
      return;
    $.event.special.fnTransitionEnd = {
      bindType: UI.support.transition.end,
      delegateType: UI.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this))
          return e.handleObj.handler.apply(this, arguments);
      }
    };
  });
  // CSS ANIMATION SUPPORT
  // ============================================================
  UI.support.animation = function () {
    var el = document.createElement('fnui');
    var animEndEventNames = {
      WebkitAnimation: 'webkitAnimationEnd',
      MozAnimation: 'animationend',
      OAnimation: 'oAnimationEnd oanimationend',
      animation: 'animationend'
    };
    for (var name in animEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: animEndEventNames[name] };
      }
    }
    return false  //ie8 again god kill me
;
  }();
  $.fn.emulateAnimationEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('fnAnimationEnd', function () {
      called = true;
    });
    var trigger = function () {
      if (!called)
        $($el).trigger(UI.support.animation);
    };
    setTimeout(trigger, duration);
    return this;
  };
  $(function () {
    if (!UI.support.animation)
      return;
    $.event.special.fnAnimationEnd = {
      bindType: UI.support.animation.end,
      delegateType: UI.support.animation.end,
      handle: function (e) {
        if ($(e.target).is(this))
          return e.handleObj.handler.apply(this, arguments);
      }
    };
  });
  //animation interface
  //=============================================================
  UI.rAF = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || // if all else fails, use setTimeout
    function (callback) {
      return window.setTimeout(callback, 1000 / 60);  // shoot for 60 fps
    };
  }();
  UI.cancelAF = function () {
    return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || function (id) {
      window.clearTimeout(id);
    };
  }();
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
    $.fn[name] = function (option) {
      var allArgs = Array.prototype.slice.call(arguments, 0);
      var args = allArgs.slice(1);
      var propReturn;
      var $set = this.each(function () {
        var $this = $(this);
        var dataName = 'fnui.' + name;
        var dataOptionsName = pluginOption.dataOptions || 'data-fn-' + name;
        var instance = $this.data(dataName);
        var options = $.extend({}, UI.utils.parseOptions($this.attr(dataOptionsName)), typeof option === 'object' && option);
        if (!instance && option === 'destroy') {
          return;
        }
        if (!instance) {
          $this.data(dataName, instance = new Component(this, options));
        }
        // custom method call
        if (pluginOption.methodCall) {
          pluginOption.methodCall.call($this, allArgs, instance);
        } else {
          // before method call
          pluginOption.before && pluginOption.before.call($this, allArgs, instance);
          if (typeof option === 'string') {
            propReturn = typeof instance[option] === 'function' ? instance[option].apply(instance, args) : instance[option];
          }
          // after method call
          pluginOption.after && pluginOption.after.call($this, allArgs, instance);
        }
      });
      return propReturn === undefined ? $set : propReturn;
    };
    $.fn[name].Constructor = Component;
    // no conflict
    $.fn[name].noConflict = function () {
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
  UI.utils.debounce = function (func, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
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
  UI.utils.parseOptions = function (string) {
    if ($.isPlainObject(string)) {
      return string;
    }
    var start = string ? string.indexOf('{') : -1;
    var options = {};
    if (start != -1) {
      try {
        options = new Function('', 'var json = ' + string.substr(start) + '; return JSON.parse(JSON.stringify(json));')();
      } catch (e) {
      }
    }
    return options;
  };
  UI.utils.generateGUID = function (namespace) {
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
  UI.ready = function (callback) {
    UI.DOMWatchers.push(callback);
    if (UI.DOMReady) {
      callback(document);
    }
  };
  UI.DOMObserve = function (elements, options, callback) {
    var Observer = UI.support.mutationobserver;
    if (!Observer) {
      return;
    }
    options = $.isPlainObject(options) ? options : {
      childList: true,
      subtree: true
    };
    callback = typeof callback === 'function' && callback || function () {
    };
    $(elements).each(function () {
      var element = this;
      var $element = $(element);
      if ($element.data('am.observer')) {
        return;
      }
      try {
        var observer = new Observer(UI.utils.debounce(function (mutations, instance) {
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
  $.fn.DOMObserve = function (options, callback) {
    return this.each(function () {
      UI.DOMObserve(this, options, callback);
    });
  };
  if (UI.support.touch) {
    $(html).addClass('fn-touch');
  }
  $(document).on('changed.dom.fnui', function (e) {
    var element = e.target;
    $.each(UI.DOMWatchers, function (i, watcher) {
      watcher(element);
    });
  });
  $(function () {
    UI.DOMReady = true;
    // Run default init
    $.each(UI.DOMWatchers, function (i, watcher) {
      watcher(document);
    });
  });
  /*===============================================================
  output  as amd module
   =================================================================*/
  return FNUI = UI;
}(jQuery);
fnui_dimmer = function ($, UI) {
  var Dimmer = function () {
    this.id = UI.utils.generateGUID('fn-dimmer');
    this.$element = $(Dimmer.DEFAULTS.tpl, { id: this.id });
    this.inited = false;
    this.scrollbarWidth = 0;
    this.$used = $([]);
  };
  Dimmer.VERSION = '2.0.0';
  Dimmer.DEFAULTS = { tpl: '<div class="fn-dimmer" data-fn-dimmer></div>' };
  Dimmer.prototype.init = function () {
    if (!this.inited) {
      $(document.body).append(this.$element);
      this.inited = true;
      $(document).trigger('init.dimmer');
      this.$element.on('touchmove.dimmer', function (e) {
        e.preventDefault();
      });
    }
    return this;
  };
  Dimmer.prototype.open = function (relatedElement) {
    if (!this.inited) {
      this.init();
    }
    var $element = this.$element;
    // 用于多重调用
    if (relatedElement) {
      this.$used = this.$used.add($(relatedElement));
    }
    this.checkScrollbar().setScrollbar();
    $element.show().trigger('open.dimmer');
    UI.support.transition && $element.off(UI.support.transition.end);
    setTimeout(function () {
      $element.addClass('fn-active');
    }, 0);
    return this;
  };
  Dimmer.prototype.close = function (relatedElement, force) {
    this.$used = this.$used.not($(relatedElement));
    if (!force && this.$used.length) {
      return this;
    }
    var $element = this.$element;
    $element.removeClass('fn-active').trigger('close.dimmer');
    function complete() {
      $element.hide();
      this.resetScrollbar();
    }
    complete.call(this);
    return this;
  };
  Dimmer.prototype.measureScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) {
      return 0;
    }
    // if ($html.width() >= window.innerWidth) return;
    // var scrollbarWidth = window.innerWidth - $html.width();
    var $measure = $('<div ' + 'style="width: 100px;height: 100px;overflow: scroll;' + 'position: absolute;top: -9999px;"></div>');
    $(document.body).append($measure);
    var scrollbarWidth = $measure[0].offsetWidth - $measure[0].clientWidth;
    $measure.remove();
    return scrollbarWidth;
  };
  Dimmer.prototype.checkScrollbar = function () {
    this.scrollbarWidth = this.measureScrollbar();
    return this;
  };
  Dimmer.prototype.setScrollbar = function () {
    var $body = $(document.body);
    var bodyPaddingRight = parseInt($body.css('padding-right') || 0, 10);
    if (this.scrollbarWidth) {
      $body.css('padding-right', bodyPaddingRight + this.scrollbarWidth);
    }
    $body.addClass('fn-dimmer-active');
    return this;
  };
  Dimmer.prototype.resetScrollbar = function () {
    $(document.body).css('padding-right', '').removeClass('fn-dimmer-active');
    return this;
  };
  UI.dimmer = new Dimmer();
  return $.dimmer = UI.dimmer;
}(jQuery, fnui_fnuicore);
fnui_alert = function ($, UI) {
  // Alert Class
  var Alert = function (element) {
    var _this = this;
    this.$element = $(element);
    this.$element.addClass('fn-fade fn-in').on('click.alert', '.fn-close', function () {
      _this.close();
    });
  };
  Alert.VERSION = '2.0.0';
  Alert.prototype.close = function () {
    var $element = this.$element;
    $element.trigger('close.alert').removeClass('fn-in');
    function processAlert() {
      $element.trigger('closed.alert').remove();
    }
    UI.support.transition && $element.hasClass('fn-fade') ? $element.one('fnTransitionEnd', processAlert).emulateTransitionEnd(200) : processAlert();
  };
  // plugin
  UI.plugin('alert', Alert);
  // Init code
  $(document).on('click.alert.data-api', '[data-fn-alert]', function (e) {
    var $target = $(e.target);
    $target.is('.fn-close') && $(this).alert('close');
  });
  return Alert;
}(jQuery, fnui_fnuicore);
fnui_button = function ($, UI) {
  var Button = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Button.DEFAULTS, options);
    this.isLoading = false;
    this.hasSpinner = false;
  };
  Button.VERSION = '2.0.0';
  Button.DEFAULTS = {
    loadingText: 'loading...',
    disabledClassName: 'fn-disabled',
    spinner: undefined
  };
  Button.prototype.setState = function (state, stateText) {
    var $element = this.$element;
    var disabled = 'disabled';
    var data = $element.data();
    var options = this.options;
    var val = $element.is('input') ? 'val' : 'html';
    var stateClassName = 'fn-btn-' + state + ' ' + options.disabledClassName;
    state += 'Text';
    if (!options.resetText) {
      options.resetText = $element[val]();
    }
    // add spinner for element with html()
    if (UI.support.animation && options.spinner && val === 'html' && !this.hasSpinner) {
      options.loadingText = '<span class="fn-icon-' + options.spinner + ' fn-icon-spin"></span>' + options.loadingText;
      this.hasSpinner = true;
    }
    stateText = stateText || (data[state] === undefined ? options[state] : data[state]);
    $element[val](stateText);
    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      // TODO: add stateClass for other states
      if (state === 'loadingText') {
        $element.addClass(stateClassName).attr(disabled, disabled);
        this.isLoading = true;
      } else if (this.isLoading) {
        $element.removeClass(stateClassName).removeAttr(disabled);
        this.isLoading = false;
      }
    }, this), 0);
  };
  Button.prototype.toggle = function () {
    var changed = true;
    var $element = this.$element;
    var $parent = this.$element.parent('[class*="fn-btn-group"]');
    if ($parent.length) {
      var $input = this.$element.find('input');
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && $element.hasClass('fn-active')) {
          changed = false;
        } else {
          $parent.find('.fn-active').removeClass('fn-active');
        }
      }
      if (changed) {
        $input.prop('checked', !$element.hasClass('fn-active')).trigger('change');
      }
    }
    if (changed) {
      $element.toggleClass('fn-active');
      if (!$element.hasClass('fn-active')) {
        $element.blur();
      }
    }
  };
  UI.plugin('button', Button, {
    dataOptions: 'data-fn-loading',
    methodCall: function (args, instance) {
      if (args[0] === 'toggle') {
        instance.toggle();
      } else if (typeof args[0] === 'string') {
        instance.setState.apply(instance, args);
      }
    }
  });
  // Init code
  $(document).on('click.button.data-api', '[data-fn-button]', function (e) {
    e.preventDefault();
    var $btn = $(e.target);
    if (!$btn.hasClass('fn-btn')) {
      $btn = $btn.closest('.fn-btn');
    }
    $btn.button('toggle');
  });
  UI.ready(function (context) {
    $('[data-fn-loading]', context).button();
  });
  return Button;
}(jQuery, fnui_fnuicore);
fnui_collapse = function ($, UI) {
  var Collapse = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Collapse.DEFAULTS, options);
    this.transitioning = null;
    if (this.options.parent) {
      this.$parent = $(this.options.parent);
    }
    if (this.options.toggle) {
      this.toggle();
    }
  };
  Collapse.VERSION = '2.0.0';
  Collapse.DEFAULTS = { toggle: true };
  Collapse.prototype.open = function () {
    if (this.transitioning || this.$element.hasClass('fn-in')) {
      return;
    }
    var startEvent = $.Event('open.collapse.fnui');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) {
      return;
    }
    var actives = this.$parent && this.$parent.find('> .fn-panel > .fn-in');
    if (actives && actives.length) {
      var hasData = actives.data('fnui.collapse');
      if (hasData && hasData.transitioning) {
        return;
      }
      Plugin.call(actives, 'close');
      hasData || actives.data('fnui.collapse', null);
    }
    this.$element.removeClass('fn-collapse').addClass('fn-collapsing').height(0);
    this.transitioning = 1;
    var complete = function () {
      this.$element.removeClass('fn-collapsing').addClass('fn-collapse fn-in').height('').trigger('opened.collapse.fnui');
      this.transitioning = 0;
    };
    if (!UI.support.transition) {
      return complete.call(this);
    }
    var scrollHeight = this.$element[0].scrollHeight;
    this.$element.one('fnTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(300).css({ height: scrollHeight });  // 当折叠的容器有 padding 时，如果用 height() 只能设置内容的宽度
  };
  Collapse.prototype.close = function () {
    if (this.transitioning || !this.$element.hasClass('fn-in')) {
      return;
    }
    var startEvent = $.Event('close.collapse.fnui');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) {
      return;
    }
    this.$element.height(this.$element.height());
    this.$element.addClass('fn-collapsing').removeClass('fn-collapse fn-in');
    this.transitioning = 1;
    var complete = function () {
      this.transitioning = 0;
      this.$element.trigger('closed.collapse.fnui').removeClass('fn-collapsing').addClass('fn-collapse');  // css({height: '0'});
    };
    if (!UI.support.transition) {
      return complete.call(this);
    }
    this.$element.height(0).one('fnTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(300);
  };
  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('fn-in') ? 'close' : 'open']();
  };
  // Collapse Plugin
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('fnui.collapse');
      var options = $.extend({}, Collapse.DEFAULTS, UI.utils.parseOptions($this.attr('data-fn-collapse')), typeof option == 'object' && option);
      if (!data && options.toggle && option === 'open') {
        option = !option;
      }
      if (!data) {
        $this.data('fnui.collapse', data = new Collapse(this, options));
      }
      if (typeof option == 'string') {
        data[option]();
      }
    });
  }
  $.fn.collapse = Plugin;
  // Init code
  $(document).on('click.collapse.fnui.data-api', '[data-fn-collapse]', function (e) {
    var href;
    var $this = $(this);
    var options = UI.utils.parseOptions($this.attr('data-fn-collapse'));
    var target = options.target || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
    var $target = $(target);
    var data = $target.data('fnui.collapse');
    var option = data ? 'toggle' : options;
    var parent = options.parent;
    var $parent = parent && $(parent);
    if (!data || !data.transitioning) {
      if ($parent) {
        // '[data-fn-collapse*="{parent: \'' + parent + '"]
        $parent.find('[data-fn-collapse]').not($this).addClass('fn-collapsed');
      }
      $this[$target.hasClass('fn-in') ? 'addClass' : 'removeClass']('fn-collapsed');
    }
    Plugin.call($target, option);
  });
  return UI.collapse = Collapse;
}(jQuery, fnui_fnuicore);
fnui_datepicker = function ($, UI) {
  var $doc = $(document);
  var $body = $(document.body);
  var Datepicker = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Datepicker.DEFAULTS, options);
    this.format = DPGlobal.parseFormat(this.options.format);
    this.$element.data('date', this.options.date);
    this.language = this.getLocale(this.options.locale);
    this.theme = this.options.theme;
    this.$picker = $(DPGlobal.template).appendTo('body').on({
      click: $.proxy(this.click, this)  // mousedown: $.proxy(this.mousedown, this)
    });
    this.isInput = this.$element.is('input');
    this.component = this.$element.is('.fn-datepicker-date') ? this.$element.find('.fn-datepicker-add-on') : false;
    if (this.isInput) {
      this.$element.on({
        'click.datepicker': $.proxy(this.open, this),
        // blur: $.proxy(this.close, this),
        'keyup.datepicker': $.proxy(this.update, this)
      });
    } else {
      if (this.component) {
        this.component.on('click.datepicker', $.proxy(this.open, this));
      } else {
        this.$element.on('click.datepicker', $.proxy(this.open, this));
      }
    }
    this.minViewMode = this.options.minViewMode;
    if (typeof this.minViewMode === 'string') {
      switch (this.minViewMode) {
      case 'months':
        this.minViewMode = 1;
        break;
      case 'years':
        this.minViewMode = 2;
        break;
      default:
        this.minViewMode = 0;
        break;
      }
    }
    this.viewMode = this.options.viewMode;
    if (typeof this.viewMode === 'string') {
      switch (this.viewMode) {
      case 'months':
        this.viewMode = 1;
        break;
      case 'years':
        this.viewMode = 2;
        break;
      default:
        this.viewMode = 0;
        break;
      }
    }
    this.startViewMode = this.viewMode;
    this.weekStart = (this.options.weekStart || Datepicker.locales[this.language].weekStart || 0) % 7;
    this.weekEnd = (this.weekStart + 6) % 7;
    this.onRender = this.options.onRender;
    this.setTheme();
    this.fillDow();
    this.fillMonths();
    this.update();
    this.showMode();
  };
  Datepicker.VERSION = '2.0.0';
  Datepicker.DEFAULTS = {
    locale: 'zh_CN',
    format: 'yyyy-mm-dd',
    weekStart: undefined,
    viewMode: 0,
    minViewMode: 0,
    date: '',
    theme: '',
    autoClose: 1,
    onRender: function (date) {
      return '';
    }
  };
  Datepicker.prototype.open = function (e) {
    this.$picker.show();
    this.height = this.component ? this.component.outerHeight() : this.$element.outerHeight();
    this.place();
    $(window).on('resize.datepicker', $.proxy(this.place, this));
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    var that = this;
    $doc.on('mousedown.datapicker touchstart.datepicker', function (ev) {
      if ($(ev.target).closest('.fn-datepicker').length === 0) {
        that.close();
      }
    });
    this.$element.trigger({
      type: 'open.datepicker',
      date: this.date
    });
  };
  Datepicker.prototype.close = function () {
    this.$picker.hide();
    $(window).off('resize.datepicker', this.place);
    this.viewMode = this.startViewMode;
    this.showMode();
    if (!this.isInput) {
      $(document).off('mousedown.datapicker touchstart.datepicker', this.close);
    }
    // this.set();
    this.$element.trigger({
      type: 'close.datepicker',
      date: this.date
    });
  };
  Datepicker.prototype.set = function () {
    var formatted = DPGlobal.formatDate(this.date, this.format);
    var $input;
    if (!this.isInput) {
      if (this.component) {
        $input = this.$element.find('input').attr('value', formatted);
      }
      this.$element.data('date', formatted);
    } else {
      $input = this.$element.attr('value', formatted);
    }
    $input.trigger('change');
  };
  Datepicker.prototype.setValue = function (newDate) {
    if (typeof newDate === 'string') {
      this.date = DPGlobal.parseDate(newDate, this.format);
    } else {
      this.date = new Date(newDate);
    }
    this.set();
    this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
    this.fill();
  };
  Datepicker.prototype.place = function () {
    var offset = this.component ? this.component.offset() : this.$element.offset();
    var $width = this.component ? this.component.width() : this.$element.width();
    var top = offset.top + this.height;
    var left = offset.left;
    var right = $body.width() - offset.left - $width;
    var isOutView = this.isOutView();
    this.$picker.removeClass('fn-datepicker-right');
    this.$picker.removeClass('fn-datepicker-up');
    if ($body.width() > 640) {
      if (isOutView.outRight) {
        this.$picker.addClass('fn-datepicker-right');
        this.$picker.css({
          top: top,
          left: 'auto',
          right: right
        });
        return;
      }
      if (isOutView.outBottom) {
        this.$picker.addClass('fn-datepicker-up');
        top = offset.top - this.$picker.outerHeight(true);
      }
    } else {
      left = 0;
    }
    this.$picker.css({
      top: top,
      left: left
    });
  };
  Datepicker.prototype.update = function (newDate) {
    this.date = DPGlobal.parseDate(typeof newDate === 'string' ? newDate : this.isInput ? this.$element.prop('value') : this.$element.data('date'), this.format);
    this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
    this.fill();
  };
  // Days of week
  Datepicker.prototype.fillDow = function () {
    var dowCount = this.weekStart;
    var html = '<tr>';
    while (dowCount < this.weekStart + 7) {
      // NOTE: do % then add 1
      html += '<th class="fn-datepicker-dow">' + Datepicker.locales[this.language].daysMin[dowCount++ % 7] + '</th>';
    }
    html += '</tr>';
    this.$picker.find('.fn-datepicker-days thead').append(html);
  };
  Datepicker.prototype.fillMonths = function () {
    var html = '';
    var i = 0;
    while (i < 12) {
      html += '<span class="fn-datepicker-month">' + Datepicker.locales[this.language].monthsShort[i++] + '</span>';
    }
    this.$picker.find('.fn-datepicker-months td').append(html);
  };
  Datepicker.prototype.fill = function () {
    var d = new Date(this.viewDate);
    var year = d.getFullYear();
    var month = d.getMonth();
    var currentDate = this.date.valueOf();
    var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0);
    var day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    var daysSelect = this.$picker.find('.fn-datepicker-days .fn-datepicker-select');
    if (this.language === 'zh_CN') {
      daysSelect.text(year + Datepicker.locales[this.language].year[0] + ' ' + Datepicker.locales[this.language].months[month]);
    } else {
      daysSelect.text(Datepicker.locales[this.language].months[month] + ' ' + year);
    }
    prevMonth.setDate(day);
    prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7) % 7);
    var nextMonth = new Date(prevMonth);
    nextMonth.setDate(nextMonth.getDate() + 42);
    nextMonth = nextMonth.valueOf();
    var html = [];
    var className;
    var prevY;
    var prevM;
    while (prevMonth.valueOf() < nextMonth) {
      if (prevMonth.getDay() === this.weekStart) {
        html.push('<tr>');
      }
      className = this.onRender(prevMonth, 0);
      prevY = prevMonth.getFullYear();
      prevM = prevMonth.getMonth();
      if (prevM < month && prevY === year || prevY < year) {
        className += ' fn-datepicker-old';
      } else if (prevM > month && prevY === year || prevY > year) {
        className += ' fn-datepicker-new';
      }
      if (prevMonth.valueOf() === currentDate) {
        className += ' fn-active';
      }
      html.push('<td class="fn-datepicker-day ' + className + '">' + prevMonth.getDate() + '</td>');
      if (prevMonth.getDay() === this.weekEnd) {
        html.push('</tr>');
      }
      prevMonth.setDate(prevMonth.getDate() + 1);
    }
    this.$picker.find('.fn-datepicker-days tbody').empty().append(html.join(''));
    var currentYear = this.date.getFullYear();
    var months = this.$picker.find('.fn-datepicker-months').find('.fn-datepicker-select').text(year);
    months = months.end().find('span').removeClass('fn-active').removeClass('fn-disabled');
    var monthLen = 0;
    while (monthLen < 12) {
      if (this.onRender(d.setFullYear(year, monthLen), 1)) {
        months.eq(monthLen).addClass('fn-disabled');
      }
      monthLen++;
    }
    if (currentYear === year) {
      months.eq(this.date.getMonth()).removeClass('fn-disabled').addClass('fn-active');
    }
    html = '';
    year = parseInt(year / 10, 10) * 10;
    var yearCont = this.$picker.find('.fn-datepicker-years').find('.fn-datepicker-select').text(year + '-' + (year + 9)).end().find('td');
    var yearClassName;
    // maybe not need now
    var viewDate = new Date(this.viewDate);
    year -= 1;
    for (var i = -1; i < 11; i++) {
      yearClassName = this.onRender(viewDate.setFullYear(year), 2);
      html += '<span class="' + yearClassName + '' + (i === -1 || i === 10 ? 'fn-datepicker-old' : '') + (currentYear === year ? 'fn-active' : '') + '">' + year + '</span>';
      year += 1;
    }
    yearCont.html(html);
  };
  Datepicker.prototype.click = function (event) {
    event.stopPropagation();
    event.preventDefault();
    var month;
    var year;
    var $dayActive = this.$picker.find('.fn-datepicker-days').find('.fn-active');
    var $months = this.$picker.find('.fn-datepicker-months');
    var $monthIndex = $months.find('.fn-active').index();
    var $target = $(event.target).closest('span, td, th');
    if ($target.length === 1) {
      switch ($target[0].nodeName.toLowerCase()) {
      case 'th':
        switch ($target[0].className) {
        case 'fn-datepicker-switch':
          this.showMode(1);
          break;
        case 'fn-datepicker-prev':
        case 'fn-datepicker-next':
          this.viewDate['set' + DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate, this.viewDate['get' + DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) + DPGlobal.modes[this.viewMode].navStep * ($target[0].className === 'fn-datepicker-prev' ? -1 : 1));
          this.fill();
          this.set();
          break;
        }
        break;
      case 'span':
        if ($target.is('.fn-disabled')) {
          return;
        }
        if ($target.is('.fn-datepicker-month')) {
          month = $target.parent().find('span').index($target);
          if ($target.is('.fn-active')) {
            this.viewDate.setMonth(month, $dayActive.text());
          } else {
            this.viewDate.setMonth(month);
          }
        } else {
          year = parseInt($target.text(), 10) || 0;
          if ($target.is('.fn-active')) {
            this.viewDate.setFullYear(year, $monthIndex, $dayActive.text());
          } else {
            this.viewDate.setFullYear(year);
          }
        }
        if (this.viewMode !== 0) {
          this.date = new Date(this.viewDate);
          this.$element.trigger({
            type: 'changeDate.datepicker',
            date: this.date,
            viewMode: DPGlobal.modes[this.viewMode].clsName
          });
        }
        this.showMode(-1);
        this.fill();
        this.set();
        break;
      case 'td':
        if ($target.is('.fn-datepicker-day') && !$target.is('.fn-disabled')) {
          var day = parseInt($target.text(), 10) || 1;
          month = this.viewDate.getMonth();
          if ($target.is('.fn-datepicker-old')) {
            month -= 1;
          } else if ($target.is('.fn-datepicker-new')) {
            month += 1;
          }
          year = this.viewDate.getFullYear();
          this.date = new Date(year, month, day, 0, 0, 0, 0);
          this.viewDate = new Date(year, month, Math.min(28, day), 0, 0, 0, 0);
          this.fill();
          this.set();
          this.$element.trigger({
            type: 'changeDate.datepicker',
            date: this.date,
            viewMode: DPGlobal.modes[this.viewMode].clsName
          });
          this.options.autoClose && this.close();
        }
        break;
      }
    }
  };
  Datepicker.prototype.mousedown = function (event) {
    event.stopPropagation();
    event.preventDefault();
  };
  Datepicker.prototype.showMode = function (dir) {
    if (dir) {
      this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
    }
    this.$picker.find('>div').hide().filter('.fn-datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
  };
  Datepicker.prototype.isOutView = function () {
    var offset = this.component ? this.component.offset() : this.$element.offset();
    var isOutView = {
      outRight: false,
      outBottom: false
    };
    var $picker = this.$picker;
    var width = offset.left + $picker.outerWidth(true);
    var height = offset.top + $picker.outerHeight(true) + this.$element.innerHeight();
    if (width > $body.width()) {
      isOutView.outRight = true;
    }
    if (height > $doc.height()) {
      isOutView.outBottom = true;
    }
    return isOutView;
  };
  Datepicker.prototype.getLocale = function (locale) {
    if (!locale) {
      locale = navigator.language && navigator.language.split('-');
      locale[1] = locale[1].toUpperCase();
      locale = locale.join('_');
    }
    if (!Datepicker.locales[locale]) {
      locale = 'en_US';
    }
    return locale;
  };
  Datepicker.prototype.setTheme = function () {
    if (this.theme) {
      this.$picker.addClass('fn-datepicker-' + this.theme);
    }
  };
  // Datepicker locales
  Datepicker.locales = {
    en_US: {
      days: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      daysShort: [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat'
      ],
      daysMin: [
        'Su',
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa'
      ],
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ],
      monthsShort: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ],
      weekStart: 0
    },
    zh_CN: {
      days: [
        '星期日',
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六'
      ],
      daysShort: [
        '周日',
        '周一',
        '周二',
        '周三',
        '周四',
        '周五',
        '周六'
      ],
      daysMin: [
        '日',
        '一',
        '二',
        '三',
        '四',
        '五',
        '六'
      ],
      months: [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月'
      ],
      monthsShort: [
        '一月',
        '二月',
        '三月',
        '四月',
        '五月',
        '六月',
        '七月',
        '八月',
        '九月',
        '十月',
        '十一月',
        '十二月'
      ],
      weekStart: 1,
      year: ['年']
    }
  };
  var DPGlobal = {
    modes: [
      {
        clsName: 'days',
        navFnc: 'Month',
        navStep: 1
      },
      {
        clsName: 'months',
        navFnc: 'FullYear',
        navStep: 1
      },
      {
        clsName: 'years',
        navFnc: 'FullYear',
        navStep: 10
      }
    ],
    isLeapYear: function (year) {
      return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    },
    getDaysInMonth: function (year, month) {
      return [
        31,
        DPGlobal.isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
      ][month];
    },
    parseFormat: function (format) {
      var separator = format.match(/[.\/\-\s].*?/);
      var parts = format.split(/\W+/);
      if (!separator || !parts || parts.length === 0) {
        throw new Error('Invalid date format.');
      }
      return {
        separator: separator,
        parts: parts
      };
    },
    parseDate: function (date, format) {
      var parts = date.split(format.separator);
      var val;
      date = new Date();
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      if (parts.length === format.parts.length) {
        var year = date.getFullYear();
        var day = date.getDate();
        var month = date.getMonth();
        for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
          val = parseInt(parts[i], 10) || 1;
          switch (format.parts[i]) {
          case 'dd':
          case 'd':
            day = val;
            date.setDate(val);
            break;
          case 'mm':
          case 'm':
            month = val - 1;
            date.setMonth(val - 1);
            break;
          case 'yy':
            year = 2000 + val;
            date.setFullYear(2000 + val);
            break;
          case 'yyyy':
            year = val;
            date.setFullYear(val);
            break;
          }
        }
        date = new Date(year, month, day, 0, 0, 0);
      }
      return date;
    },
    formatDate: function (date, format) {
      var val = {
        d: date.getDate(),
        m: date.getMonth() + 1,
        yy: date.getFullYear().toString().substring(2),
        yyyy: date.getFullYear()
      };
      var dateArray = [];
      val.dd = (val.d < 10 ? '0' : '') + val.d;
      val.mm = (val.m < 10 ? '0' : '') + val.m;
      for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
        dateArray.push(val[format.parts[i]]);
      }
      return dateArray.join(format.separator);
    },
    headTemplate: '<thead>' + '<tr class="fn-datepicker-header">' + '<th class="fn-datepicker-prev">' + '<i class="fn-datepicker-prev-icon"></i></th>' + '<th colspan="5" class="fn-datepicker-switch">' + '<div class="fn-datepicker-select"></div></th>' + '<th class="fn-datepicker-next"><i class="fn-datepicker-next-icon"></i>' + '</th></tr></thead>',
    contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
  };
  DPGlobal.template = '<div class="fn-datepicker fn-datepicker-dropdown">' + '<div class="fn-datepicker-caret"></div>' + '<div class="fn-datepicker-days">' + '<table class="fn-datepicker-table">' + DPGlobal.headTemplate + '<tbody></tbody>' + '</table>' + '</div>' + '<div class="fn-datepicker-months">' + '<table class="fn-datepicker-table">' + DPGlobal.headTemplate + DPGlobal.contTemplate + '</table>' + '</div>' + '<div class="fn-datepicker-years">' + '<table class="fn-datepicker-table">' + DPGlobal.headTemplate + DPGlobal.contTemplate + '</table>' + '</div>' + '</div>';
  // jQuery plugin
  UI.plugin('datepicker', Datepicker);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-datepicker]').datepicker();
  });
  return Datepicker;
}(jQuery, fnui_fnuicore);
fnui_dropdown = function ($, UI) {
  var animation = UI.support.animation;
  var Dropdown = function (element, options) {
    this.options = $.extend({}, Dropdown.DEFAULTS, options);
    options = this.options;
    this.$element = $(element);
    this.$toggle = this.$element.find(options.selector.toggle);
    this.$dropdown = this.$element.find(options.selector.dropdown);
    this.$boundary = options.boundary === window ? $(window) : this.$element.closest(options.boundary);
    this.$justify = options.justify && $(options.justify).length && $(options.justify) || undefined;
    !this.$boundary.length && (this.$boundary = $(window));
    this.active = this.$element.hasClass('fn-active') ? true : false;
    this.animating = null;
    this.events();
  };
  Dropdown.VERSION = '2.0.0';
  Dropdown.DEFAULTS = {
    animation: 'fn-animation-slide-top-fixed',
    boundary: window,
    justify: undefined,
    selector: {
      dropdown: '.fn-dropdown-content',
      toggle: '.fn-dropdown-toggle'
    },
    trigger: 'click'
  };
  Dropdown.prototype.toggle = function () {
    this.clear();
    if (this.animating) {
      return;
    }
    this[this.active ? 'close' : 'open']();
  };
  Dropdown.prototype.open = function (e) {
    var $toggle = this.$toggle;
    var $element = this.$element;
    var $dropdown = this.$dropdown;
    if ($toggle.is('.fn-disabled, :disabled')) {
      return;
    }
    if (this.active) {
      return;
    }
    $element.trigger('open.dropdown').addClass('fn-active');
    $toggle.trigger('focus');
    this.checkDimensions();
    var complete = $.proxy(function () {
      $element.trigger('opened.dropdown');
      this.active = true;
      this.animating = 0;
    }, this);
    if (animation) {
      this.animating = 1;
      $dropdown.addClass(this.options.animation).one('fnAnimationEnd', $.proxy(function () {
        complete();
        $dropdown.removeClass(this.options.animation);
      }, this)).emulateTransitionEnd(300);
    } else {
      complete();
    }
  };
  Dropdown.prototype.close = function () {
    if (!this.active) {
      return;
    }
    // var animationName = this.options.animation + ' fn-animation-reverse';
    var animationName = 'fn-dropdown-animation';
    var $element = this.$element;
    var $dropdown = this.$dropdown;
    $element.trigger('close.dropdown');
    var complete = $.proxy(function complete() {
      $element.removeClass('fn-active').trigger('closed.dropdown');
      this.active = false;
      this.animating = 0;
      this.$toggle.blur();
    }, this);
    if (animation) {
      $dropdown.removeClass(this.options.animation);
      $dropdown.addClass(animationName);
      this.animating = 1;
      // animation
      $dropdown.one(animation.end + '.close.dropdown', function () {
        $dropdown.removeClass(animationName);
        complete();
      });
    } else {
      complete();
    }
  };
  Dropdown.prototype.enable = function () {
    this.$toggle.prop('disabled', false);
  }, Dropdown.prototype.disable = function () {
    this.$toggle.prop('disabled', true);
  }, Dropdown.prototype.checkDimensions = function () {
    if (!this.$dropdown.length) {
      return;
    }
    var $dropdown = this.$dropdown;
    var offset = $dropdown.offset();
    var width = $dropdown.outerWidth();
    var boundaryWidth = this.$boundary.width();
    var boundaryOffset = $.isWindow(this.boundary) && this.$boundary.offset() ? this.$boundary.offset().left : 0;
    if (this.$justify) {
      // jQuery.fn.width() is really...
      $dropdown.css({ 'min-width': this.$justify.css('width') });
    }
    if (width + (offset.left - boundaryOffset) > boundaryWidth) {
      this.$element.addClass('fn-dropdown-flip');
    }
  };
  Dropdown.prototype.clear = function () {
    $('[data-fn-dropdown]').not(this.$element).each(function () {
      var data = $(this).data('fnui.dropdown');
      data && data.close();
    });
  };
  Dropdown.prototype.events = function () {
    var eventNS = 'dropdown';
    var $toggle = this.$toggle;
    $toggle.on('click.' + eventNS, $.proxy(function (e) {
      e.preventDefault();
      this.toggle();
    }, this));
    $(document).on('keydown.dropdown', $.proxy(function (e) {
      e.keyCode === 27 && this.active && this.close();
    }, this)).on('click.outer.dropdown', $.proxy(function (e) {
      // var $target = $(e.target);
      if (this.active && (this.$element[0] === e.target || !this.$element.find(e.target).length)) {
        this.close();
      }
    }, this));
  };
  // Dropdown Plugin
  UI.plugin('dropdown', Dropdown);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-dropdown]', context).dropdown();
  });
  $(document).on('click.dropdown.data-api', '.fn-dropdown form', function (e) {
    e.stopPropagation();
  });
  return Dropdown;
}(jQuery, fnui_fnuicore);
fnui_modal = function ($, UI) {
  var Modal = function (element, options) {
    this.options = $.extend({}, Modal.DEFAULTS, options || {});
    this.$element = $(element);
    this.$dialog = this.$element.find('.fn-modal-dialog');
    if (!this.$element.attr('id')) {
      this.$element.attr('id', UI.utils.generateGUID('fn-modal'));
    }
    this.isPopup = this.$element.hasClass('fn-popup');
    this.isActions = this.$element.hasClass('fn-modal-actions');
    this.isPrompt = this.$element.hasClass('fn-modal-prompt');
    this.isLoading = this.$element.hasClass('fn-modal-loading');
    this.active = this.transitioning = this.relatedTarget = null;
    this.dimmer = this.options.dimmer ? UI.dimmer : {
      open: function () {
      },
      close: function () {
      }
    };
    this.events();
  };
  Modal.DEFAULTS = {
    className: {
      active: 'fn-modal-active',
      out: 'fn-modal-out'
    },
    selector: {
      modal: '.fn-modal',
      active: '.fn-modal-active'
    },
    closeViaDimmer: true,
    cancelable: true,
    onConfirm: function () {
    },
    onCancel: function () {
    },
    closeOnCancel: true,
    closeOnConfirm: true,
    dimmer: true,
    height: undefined,
    width: undefined,
    duration: 300,
    // must equal the CSS transition duration
    transitionEnd: UI.support.transition && UI.support.transition.end + '.modal'
  };
  Modal.prototype.toggle = function (relatedTarget) {
    return this.active ? this.close() : this.open(relatedTarget);
  };
  Modal.prototype.open = function (relatedTarget) {
    var $element = this.$element;
    var options = this.options;
    var isPopup = this.isPopup;
    var width = options.width;
    var height = options.height;
    var style = {};
    if (this.active) {
      return;
    }
    if (!this.$element.length) {
      return;
    }
    // callback hook
    relatedTarget && (this.relatedTarget = relatedTarget);
    // 判断如果还在动画，就先触发之前的closed事件
    if (this.transitioning) {
      clearTimeout($element.transitionEndTimmer);
      $element.transitionEndTimmer = null;
      $element.trigger(options.transitionEnd).off(options.transitionEnd);
    }
    isPopup && this.$element.show();
    this.active = true;
    $element.trigger($.Event('open.modal', { relatedTarget: relatedTarget }));
    this.dimmer.open($element);
    $element.show();
    // apply Modal width/height if set
    if (!isPopup && !this.isActions) {
      if (width) {
        width = parseInt(width, 10);
        style.width = width + 'px';
        style.marginLeft = -parseInt(width / 2) + 'px';
      }
      if (height) {
        height = parseInt(height, 10);
        // style.height = height + 'px';
        style.marginTop = -parseInt(height / 2) + 'px';
        // the background color is styled to $dialog
        // so the height should set to $dialog
        this.$dialog.css({ height: height + 'px' });
      } else {
        style.marginTop = -parseInt($element.height() / 2, 10) + 'px';
      }
      $element.css(style);
    }
    $element.removeClass(options.className.out).addClass(options.className.active);
    this.transitioning = 1;
    var complete = function () {
      $element.trigger($.Event('opened.modal', { relatedTarget: relatedTarget }));
      this.transitioning = 0;
      // Prompt auto focus
      if (this.isPrompt) {
        this.$dialog.find('input').eq(0).focus();
      }
    };
    if (!UI.support.transition) {
      return complete.call(this);
    }
    $element.one(options.transitionEnd, $.proxy(complete, this)).emulateTransitionEnd(options.duration);
  };
  Modal.prototype.close = function (relatedTarget) {
    if (!this.active) {
      return;
    }
    var $element = this.$element;
    var options = this.options;
    var isPopup = this.isPopup;
    // 判断如果还在动画，就先触发之前的opened事件
    if (this.transitioning) {
      clearTimeout($element.transitionEndTimmer);
      $element.transitionEndTimmer = null;
      $element.trigger(options.transitionEnd).off(options.transitionEnd);
      this.dimmer.close($element, true);
    }
    this.$element.trigger($.Event('close.modal', { relatedTarget: relatedTarget }));
    this.transitioning = 1;
    var complete = function () {
      $element.trigger('closed.modal');
      isPopup && $element.removeClass(options.className.out);
      $element.hide();
      this.transitioning = 0;
      // 不强制关闭 Dimmer，以便多个 Modal 可以共享 Dimmer
      this.dimmer.close($element, false);
      this.active = false;
    };
    $element.removeClass(options.className.active).addClass(options.className.out);
    if (!UI.support.transition) {
      return complete.call(this);
    }
    $element.one(options.transitionEnd, $.proxy(complete, this)).emulateTransitionEnd(options.duration);
  };
  Modal.prototype.events = function () {
    var options = this.options;
    var _this = this;
    var $element = this.$element;
    var $ipt = $element.find('.fn-modal-prompt-input');
    var $confirm = $element.find('[data-fn-modal-confirm]');
    var $cancel = $element.find('[data-fn-modal-cancel]');
    var getData = function () {
      var data = [];
      $ipt.each(function () {
        data.push($(this).val());
      });
      return data.length === 0 ? undefined : data.length === 1 ? data[0] : data;
    };
    // close via Esc key
    if (this.options.cancelable) {
      $element.on('keyup.modal', function (e) {
        if (_this.active && e.which === 27) {
          $element.trigger('cancel.modal');
          _this.close();
        }
      });
    }
    // Close Modal when dimmer clicked
    if (this.options.dimmer && this.options.closeViaDimmer && !this.isLoading) {
      this.dimmer.$element.on('click.dimmer.modal', function (e) {
        _this.close();
      });
    }
    // Close Modal when button clicked
    $element.on('click.close.modal', '[data-fn-modal-close], .fn-modal-btn', function (e) {
      e.preventDefault();
      var $this = $(this);
      if ($this.is($confirm)) {
        options.closeOnConfirm && _this.close();
      } else if ($this.is($cancel)) {
        options.closeOnCancel && _this.close();
      } else {
        _this.close();
      }
    });
    $confirm.on('click.confirm.modal', function () {
      $element.trigger($.Event('confirm.modal', { trigger: this }));
    });
    $cancel.on('click.cancel.modal', function () {
      $element.trigger($.Event('cancel.modal', { trigger: this }));
    });
    $element.on('confirm.modal', function (e) {
      e.data = getData();
      _this.options.onConfirm.call(_this, e);
    }).on('cancel.modal', function (e) {
      e.data = getData();
      _this.options.onCancel.call(_this, e);
    });
  };
  function Plugin(option, relatedTarget) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('fnui.modal');
      var options = typeof option == 'object' && option;
      if (!data) {
        $this.data('fnui.modal', data = new Modal(this, options));
      }
      if (typeof option == 'string') {
        data[option] && data[option](relatedTarget);
      } else {
        data.toggle(option && option.relatedTarget || undefined);
      }
    });
  }
  $.fn.modal = Plugin;
  // Init
  $(document).on('click.modal.data-api', '[data-fn-modal]', function () {
    var $this = $(this);
    var options = UI.utils.parseOptions($this.attr('data-fn-modal'));
    var $target = $(options.target || this.href && this.href.replace(/.*(?=#[^\s]+$)/, ''));
    var option = $target.data('fnui.modal') ? 'toggle' : options;
    Plugin.call($target, option, this);
  });
  return Modal;
}(jQuery, fnui_fnuicore);
fnui_hammer = function ($) {
  var VENDOR_PREFIXES = [
    '',
    'webkit',
    'moz',
    'MS',
    'ms',
    'o'
  ];
  var TEST_ELEMENT = document.createElement('div');
  var TYPE_FUNCTION = 'function';
  var round = Math.round;
  var abs = Math.abs;
  var now = Date.now;
  /**
   * set a timeout with a given scope
   * @param {Function} fn
   * @param {Number} timeout
   * @param {Object} context
   * @returns {number}
   */
  function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
  }
  /**
   * if the argument is an array, we want to execute the fn on each entry
   * if it aint an array we don't want to do a thing.
   * this is used by all the methods that accept a single and array argument.
   * @param {*|Array} arg
   * @param {String} fn
   * @param {Object} [context]
   * @returns {Boolean}
   */
  function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
      each(arg, context[fn], context);
      return true;
    }
    return false;
  }
  /**
   * walk objects and arrays
   * @param {Object} obj
   * @param {Function} iterator
   * @param {Object} context
   */
  function each(obj, iterator, context) {
    var i;
    if (!obj) {
      return;
    }
    if (obj.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
      i = 0;
      while (i < obj.length) {
        iterator.call(context, obj[i], i, obj);
        i++;
      }
    } else {
      for (i in obj) {
        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
      }
    }
  }
  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge]
   * @returns {Object} dest
   */
  function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
      if (!merge || merge && dest[keys[i]] === undefined) {
        dest[keys[i]] = src[keys[i]];
      }
      i++;
    }
    return dest;
  }
  /**
   * merge the values from src in the dest.
   * means that properties that exist in dest will not be overwritten by src
   * @param {Object} dest
   * @param {Object} src
   * @returns {Object} dest
   */
  function merge(dest, src) {
    return extend(dest, src, true);
  }
  /**
   * simple class inheritance
   * @param {Function} child
   * @param {Function} base
   * @param {Object} [properties]
   */
  function inherit(child, base, properties) {
    var baseP = base.prototype, childP;
    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;
    if (properties) {
      extend(childP, properties);
    }
  }
  /**
   * simple function bind
   * @param {Function} fn
   * @param {Object} context
   * @returns {Function}
   */
  function bindFn(fn, context) {
    return function boundFn() {
      return fn.apply(context, arguments);
    };
  }
  /**
   * let a boolean value also be a function that must return a boolean
   * this first item in args will be used as the context
   * @param {Boolean|Function} val
   * @param {Array} [args]
   * @returns {Boolean}
   */
  function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
      return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
  }
  /**
   * use the val2 when val1 is undefined
   * @param {*} val1
   * @param {*} val2
   * @returns {*}
   */
  function ifUndefined(val1, val2) {
    return val1 === undefined ? val2 : val1;
  }
  /**
   * addEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function addEventListeners(target, types, handler) {
    each(splitStr(types), function (type) {
      target.addEventListener(type, handler, false);
    });
  }
  /**
   * removeEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function removeEventListeners(target, types, handler) {
    each(splitStr(types), function (type) {
      target.removeEventListener(type, handler, false);
    });
  }
  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */
  function hasParent(node, parent) {
    while (node) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }
  /**
   * small indexOf wrapper
   * @param {String} str
   * @param {String} find
   * @returns {Boolean} found
   */
  function inStr(str, find) {
    return str.indexOf(find) > -1;
  }
  /**
   * split string on whitespace
   * @param {String} str
   * @returns {Array} words
   */
  function splitStr(str) {
    return str.trim().split(/\s+/g);
  }
  /**
   * find if a array contains the object using indexOf or a simple polyFill
   * @param {Array} src
   * @param {String} find
   * @param {String} [findByKey]
   * @return {Boolean|Number} false when not found, or the index
   */
  function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
      return src.indexOf(find);
    } else {
      var i = 0;
      while (i < src.length) {
        if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) {
          return i;
        }
        i++;
      }
      return -1;
    }
  }
  /**
   * convert array-like objects to real arrays
   * @param {Object} obj
   * @returns {Array}
   */
  function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  }
  /**
   * unique array with objects based on a key (like 'id') or just by the array's value
   * @param {Array} src [{id:1},{id:2},{id:1}]
   * @param {String} [key]
   * @param {Boolean} [sort=False]
   * @returns {Array} [{id:1},{id:2}]
   */
  function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;
    while (i < src.length) {
      var val = key ? src[i][key] : src[i];
      if (inArray(values, val) < 0) {
        results.push(src[i]);
      }
      values[i] = val;
      i++;
    }
    if (sort) {
      if (!key) {
        results = results.sort();
      } else {
        results = results.sort(function sortUniqueArray(a, b) {
          return a[key] > b[key];
        });
      }
    }
    return results;
  }
  /**
   * get the prefixed property
   * @param {Object} obj
   * @param {String} property
   * @returns {String|Undefined} prefixed
   */
  function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);
    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
      prefix = VENDOR_PREFIXES[i];
      prop = prefix ? prefix + camelProp : property;
      if (prop in obj) {
        return prop;
      }
      i++;
    }
    return undefined;
  }
  /**
   * get a unique id
   * @returns {number} uniqueId
   */
  var _uniqueId = 1;
  function uniqueId() {
    return _uniqueId++;
  }
  /**
   * get the window object of an element
   * @param {HTMLElement} element
   * @returns {DocumentView|Window}
   */
  function getWindowForElement(element) {
    var doc = element.ownerDocument;
    return doc.defaultView || doc.parentWindow;
  }
  var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
  var SUPPORT_TOUCH = 'ontouchstart' in window;
  var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
  var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
  var INPUT_TYPE_TOUCH = 'touch';
  var INPUT_TYPE_PEN = 'pen';
  var INPUT_TYPE_MOUSE = 'mouse';
  var INPUT_TYPE_KINECT = 'kinect';
  var COMPUTE_INTERVAL = 25;
  var INPUT_START = 1;
  var INPUT_MOVE = 2;
  var INPUT_END = 4;
  var INPUT_CANCEL = 8;
  var DIRECTION_NONE = 1;
  var DIRECTION_LEFT = 2;
  var DIRECTION_RIGHT = 4;
  var DIRECTION_UP = 8;
  var DIRECTION_DOWN = 16;
  var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
  var PROPS_XY = [
    'x',
    'y'
  ];
  var PROPS_CLIENT_XY = [
    'clientX',
    'clientY'
  ];
  /**
   * create new input type manager
   * @param {Manager} manager
   * @param {Function} callback
   * @returns {Input}
   * @constructor
   */
  function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;
    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function (ev) {
      if (boolOrFn(manager.options.enable, [manager])) {
        self.handler(ev);
      }
    };
    this.init();
  }
  Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function () {
    },
    /**
     * bind the events
     */
    init: function () {
      this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },
    /**
     * unbind the events
     */
    destroy: function () {
      this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
  };
  /**
   * create new input type manager
   * called by the Manager constructor
   * @param {Hammer} manager
   * @returns {Input}
   */
  function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;
    if (inputClass) {
      Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
      Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
      Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
      Type = MouseInput;
    } else {
      Type = TouchMouseInput;
    }
    return new Type(manager, inputHandler);
  }
  /**
   * handle input events
   * @param {Manager} manager
   * @param {String} eventType
   * @param {Object} input
   */
  function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = eventType & INPUT_START && pointersLen - changedPointersLen === 0;
    var isFinal = eventType & (INPUT_END | INPUT_CANCEL) && pointersLen - changedPointersLen === 0;
    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;
    if (isFirst) {
      manager.session = {};
    }
    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;
    // compute scale, rotation etc
    computeInputData(manager, input);
    // emit secret event
    manager.emit('hammer.input', input);
    manager.recognize(input);
    manager.session.prevInput = input;
  }
  /**
   * extend the data with some usable properties like scale, rotate, velocity etc
   * @param {Object} manager
   * @param {Object} input
   */
  function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;
    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
      session.firstInput = simpleCloneInputData(input);
    }
    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
      session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
      session.firstMultiple = false;
    }
    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;
    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);
    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);
    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
    computeIntervalInputData(session, input);
    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
      target = input.srcEvent.target;
    }
    input.target = target;
  }
  function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};
    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
      prevDelta = session.prevDelta = {
        x: prevInput.deltaX || 0,
        y: prevInput.deltaY || 0
      };
      offset = session.offsetDelta = {
        x: center.x,
        y: center.y
      };
    }
    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
  }
  /**
   * velocity is calculated every x ms
   * @param {Object} session
   * @param {Object} input
   */
  function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input, deltaTime = input.timeStamp - last.timeStamp, velocity, velocityX, velocityY, direction;
    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
      var deltaX = last.deltaX - input.deltaX;
      var deltaY = last.deltaY - input.deltaY;
      var v = getVelocity(deltaTime, deltaX, deltaY);
      velocityX = v.x;
      velocityY = v.y;
      velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
      direction = getDirection(deltaX, deltaY);
      session.lastInterval = input;
    } else {
      // use latest velocity info if it doesn't overtake a minimum period
      velocity = last.velocity;
      velocityX = last.velocityX;
      velocityY = last.velocityY;
      direction = last.direction;
    }
    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
  }
  /**
   * create a simple clone from the input used for storage of firstInput and firstMultiple
   * @param {Object} input
   * @returns {Object} clonedInputData
   */
  function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
      pointers[i] = {
        clientX: round(input.pointers[i].clientX),
        clientY: round(input.pointers[i].clientY)
      };
      i++;
    }
    return {
      timeStamp: now(),
      pointers: pointers,
      center: getCenter(pointers),
      deltaX: input.deltaX,
      deltaY: input.deltaY
    };
  }
  /**
   * get the center of all the pointers
   * @param {Array} pointers
   * @return {Object} center contains `x` and `y` properties
   */
  function getCenter(pointers) {
    var pointersLength = pointers.length;
    // no need to loop when only one touch
    if (pointersLength === 1) {
      return {
        x: round(pointers[0].clientX),
        y: round(pointers[0].clientY)
      };
    }
    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
      x += pointers[i].clientX;
      y += pointers[i].clientY;
      i++;
    }
    return {
      x: round(x / pointersLength),
      y: round(y / pointersLength)
    };
  }
  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} x
   * @param {Number} y
   * @return {Object} velocity `x` and `y`
   */
  function getVelocity(deltaTime, x, y) {
    return {
      x: x / deltaTime || 0,
      y: y / deltaTime || 0
    };
  }
  /**
   * get the direction between two points
   * @param {Number} x
   * @param {Number} y
   * @return {Number} direction
   */
  function getDirection(x, y) {
    if (x === y) {
      return DIRECTION_NONE;
    }
    if (abs(x) >= abs(y)) {
      return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
  }
  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @param {Array} [props] containing x and y keys
   * @return {Number} distance
   */
  function getDistance(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]], y = p2[props[1]] - p1[props[1]];
    return Math.sqrt(x * x + y * y);
  }
  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @param {Array} [props] containing x and y keys
   * @return {Number} angle
   */
  function getAngle(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]], y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
  }
  /**
   * calculate the rotation degrees between two pointersets
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} rotation
   */
  function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
  }
  /**
   * calculate the scale factor between two pointersets
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} scale
   */
  function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
  }
  var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
  };
  var MOUSE_ELEMENT_EVENTS = 'mousedown';
  var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';
  /**
   * Mouse events input
   * @constructor
   * @extends Input
   */
  function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;
    this.allow = true;
    // used by Input.TouchMouse to disable mouse events
    this.pressed = false;
    // mousedown state
    Input.apply(this, arguments);
  }
  inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
      var eventType = MOUSE_INPUT_MAP[ev.type];
      // on start we want to have the left mouse button down
      if (eventType & INPUT_START && ev.button === 0) {
        this.pressed = true;
      }
      if (eventType & INPUT_MOVE && ev.which !== 1) {
        eventType = INPUT_END;
      }
      // mouse must be down, and mouse events are allowed (see the TouchMouse input)
      if (!this.pressed || !this.allow) {
        return;
      }
      if (eventType & INPUT_END) {
        this.pressed = false;
      }
      this.callback(this.manager, eventType, {
        pointers: [ev],
        changedPointers: [ev],
        pointerType: INPUT_TYPE_MOUSE,
        srcEvent: ev
      });
    }
  });
  var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
  };
  // in IE10 the pointer types is defined as an enum
  var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT  // see https://twitter.com/jacobrossi/status/480596438489890816
  };
  var POINTER_ELEMENT_EVENTS = 'pointerdown';
  var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';
  // IE10 has prefixed support, and case-sensitive
  if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
  }
  /**
   * Pointer events input
   * @constructor
   * @extends Input
   */
  function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;
    Input.apply(this, arguments);
    this.store = this.manager.session.pointerEvents = [];
  }
  inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
      var store = this.store;
      var removePointer = false;
      var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
      var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
      var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
      var isTouch = pointerType == INPUT_TYPE_TOUCH;
      // get index of the event in the store
      var storeIndex = inArray(store, ev.pointerId, 'pointerId');
      // start and mouse must be down
      if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
        if (storeIndex < 0) {
          store.push(ev);
          storeIndex = store.length - 1;
        }
      } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        removePointer = true;
      }
      // it not found, so the pointer hasn't been down (so it's probably a hover)
      if (storeIndex < 0) {
        return;
      }
      // update the event in the store
      store[storeIndex] = ev;
      this.callback(this.manager, eventType, {
        pointers: store,
        changedPointers: [ev],
        pointerType: pointerType,
        srcEvent: ev
      });
      if (removePointer) {
        // remove from the store
        store.splice(storeIndex, 1);
      }
    }
  });
  var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };
  var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
  var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';
  /**
   * Touch events input
   * @constructor
   * @extends Input
   */
  function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;
    Input.apply(this, arguments);
  }
  inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
      var type = SINGLE_TOUCH_INPUT_MAP[ev.type];
      // should we handle the touch events?
      if (type === INPUT_START) {
        this.started = true;
      }
      if (!this.started) {
        return;
      }
      var touches = normalizeSingleTouches.call(this, ev, type);
      // when done, reset the started state
      if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
        this.started = false;
      }
      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });
  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);
    if (type & (INPUT_END | INPUT_CANCEL)) {
      all = uniqueArray(all.concat(changed), 'identifier', true);
    }
    return [
      all,
      changed
    ];
  }
  var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };
  var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';
  /**
   * Multi-user touch events input
   * @constructor
   * @extends Input
   */
  function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};
    Input.apply(this, arguments);
  }
  inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
      var type = TOUCH_INPUT_MAP[ev.type];
      var touches = getTouches.call(this, ev, type);
      if (!touches) {
        return;
      }
      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });
  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;
    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
      targetIds[allTouches[0].identifier] = true;
      return [
        allTouches,
        allTouches
      ];
    }
    var i, targetTouches, changedTouches = toArray(ev.changedTouches), changedTargetTouches = [], target = this.target;
    // get target touches from touches
    targetTouches = allTouches.filter(function (touch) {
      return hasParent(touch.target, target);
    });
    // collect touches
    if (type === INPUT_START) {
      i = 0;
      while (i < targetTouches.length) {
        targetIds[targetTouches[i].identifier] = true;
        i++;
      }
    }
    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
      if (targetIds[changedTouches[i].identifier]) {
        changedTargetTouches.push(changedTouches[i]);
      }
      // cleanup removed touches
      if (type & (INPUT_END | INPUT_CANCEL)) {
        delete targetIds[changedTouches[i].identifier];
      }
      i++;
    }
    if (!changedTargetTouches.length) {
      return;
    }
    return [
      // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
      uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
      changedTargetTouches
    ];
  }
  /**
   * Combined touch and mouse input
   *
   * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
   * This because touch devices also emit mouse events while doing a touch.
   *
   * @constructor
   * @extends Input
   */
  function TouchMouseInput() {
    Input.apply(this, arguments);
    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
  }
  inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
      var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH, isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;
      // when we're in a touch event, so  block all upcoming mouse events
      // most mobile browser also emit mouseevents, right after touchstart
      if (isTouch) {
        this.mouse.allow = false;
      } else if (isMouse && !this.mouse.allow) {
        return;
      }
      // reset the allowMouse when we're done
      if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
        this.mouse.allow = true;
      }
      this.callback(manager, inputEvent, inputData);
    },
    /**
     * remove the event listeners
     */
    destroy: function destroy() {
      this.touch.destroy();
      this.mouse.destroy();
    }
  });
  var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
  var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;
  // magical touchAction value
  var TOUCH_ACTION_COMPUTE = 'compute';
  var TOUCH_ACTION_AUTO = 'auto';
  var TOUCH_ACTION_MANIPULATION = 'manipulation';
  // not implemented
  var TOUCH_ACTION_NONE = 'none';
  var TOUCH_ACTION_PAN_X = 'pan-x';
  var TOUCH_ACTION_PAN_Y = 'pan-y';
  /**
   * Touch Action
   * sets the touchAction property or uses the js alternative
   * @param {Manager} manager
   * @param {String} value
   * @constructor
   */
  function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
  }
  TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function (value) {
      // find out the touch-action by the event handlers
      if (value == TOUCH_ACTION_COMPUTE) {
        value = this.compute();
      }
      if (NATIVE_TOUCH_ACTION) {
        this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
      }
      this.actions = value.toLowerCase().trim();
    },
    /**
     * just re-set the touchAction value
     */
    update: function () {
      this.set(this.manager.options.touchAction);
    },
    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function () {
      var actions = [];
      each(this.manager.recognizers, function (recognizer) {
        if (boolOrFn(recognizer.options.enable, [recognizer])) {
          actions = actions.concat(recognizer.getTouchAction());
        }
      });
      return cleanTouchActions(actions.join(' '));
    },
    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function (input) {
      // not needed with native support for the touchAction property
      if (NATIVE_TOUCH_ACTION) {
        return;
      }
      var srcEvent = input.srcEvent;
      var direction = input.offsetDirection;
      // if the touch action did prevented once this session
      if (this.manager.session.prevented) {
        srcEvent.preventDefault();
        return;
      }
      var actions = this.actions;
      var hasNone = inStr(actions, TOUCH_ACTION_NONE);
      var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
      var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
      if (hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL) {
        return this.preventSrc(srcEvent);
      }
    },
    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function (srcEvent) {
      this.manager.session.prevented = true;
      srcEvent.preventDefault();
    }
  };
  /**
   * when the touchActions are collected they are not a valid value, so we need to clean things up. *
   * @param {String} actions
   * @returns {*}
   */
  function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
      return TOUCH_ACTION_NONE;
    }
    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
    // pan-x and pan-y can be combined
    if (hasPanX && hasPanY) {
      return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
    }
    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
      return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }
    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
      return TOUCH_ACTION_MANIPULATION;
    }
    return TOUCH_ACTION_AUTO;
  }
  /**
   * Recognizer flow explained; *
   * All recognizers have the initial state of POSSIBLE when a input session starts.
   * The definition of a input session is from the first input until the last input, with all it's movement in it. *
   * Example session for mouse-input: mousedown -> mousemove -> mouseup
   *
   * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
   * which determines with state it should be.
   *
   * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
   * POSSIBLE to give it another change on the next cycle.
   *
   *               Possible
   *                  |
   *            +-----+---------------+
   *            |                     |
   *      +-----+-----+               |
   *      |           |               |
   *   Failed      Cancelled          |
   *                          +-------+------+
   *                          |              |
   *                      Recognized       Began
   *                                         |
   *                                      Changed
   *                                         |
   *                                  Ended/Recognized
   */
  var STATE_POSSIBLE = 1;
  var STATE_BEGAN = 2;
  var STATE_CHANGED = 4;
  var STATE_ENDED = 8;
  var STATE_RECOGNIZED = STATE_ENDED;
  var STATE_CANCELLED = 16;
  var STATE_FAILED = 32;
  /**
   * Recognizer
   * Every recognizer needs to extend from this class.
   * @constructor
   * @param {Object} options
   */
  function Recognizer(options) {
    this.id = uniqueId();
    this.manager = null;
    this.options = merge(options || {}, this.defaults);
    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);
    this.state = STATE_POSSIBLE;
    this.simultaneous = {};
    this.requireFail = [];
  }
  Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},
    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function (options) {
      extend(this.options, options);
      // also update the touchAction, in case something changed about the directions/enabled state
      this.manager && this.manager.touchAction.update();
      return this;
    },
    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function (otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
        return this;
      }
      var simultaneous = this.simultaneous;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (!simultaneous[otherRecognizer.id]) {
        simultaneous[otherRecognizer.id] = otherRecognizer;
        otherRecognizer.recognizeWith(this);
      }
      return this;
    },
    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function (otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
        return this;
      }
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      delete this.simultaneous[otherRecognizer.id];
      return this;
    },
    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function (otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
        return this;
      }
      var requireFail = this.requireFail;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (inArray(requireFail, otherRecognizer) === -1) {
        requireFail.push(otherRecognizer);
        otherRecognizer.requireFailure(this);
      }
      return this;
    },
    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function (otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
        return this;
      }
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      var index = inArray(this.requireFail, otherRecognizer);
      if (index > -1) {
        this.requireFail.splice(index, 1);
      }
      return this;
    },
    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function () {
      return this.requireFail.length > 0;
    },
    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function (otherRecognizer) {
      return !!this.simultaneous[otherRecognizer.id];
    },
    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function (input) {
      var self = this;
      var state = this.state;
      function emit(withState) {
        self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
      }
      // 'panstart' and 'panmove'
      if (state < STATE_ENDED) {
        emit(true);
      }
      emit();
      // simple 'eventName' events
      // panend and pancancel
      if (state >= STATE_ENDED) {
        emit(true);
      }
    },
    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function (input) {
      if (this.canEmit()) {
        return this.emit(input);
      }
      // it's failing anyway
      this.state = STATE_FAILED;
    },
    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function () {
      var i = 0;
      while (i < this.requireFail.length) {
        if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
          return false;
        }
        i++;
      }
      return true;
    },
    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function (inputData) {
      // make a new copy of the inputData
      // so we can change the inputData without messing up the other recognizers
      var inputDataClone = extend({}, inputData);
      // is is enabled and allow recognizing?
      if (!boolOrFn(this.options.enable, [
          this,
          inputDataClone
        ])) {
        this.reset();
        this.state = STATE_FAILED;
        return;
      }
      // reset when we've reached the end
      if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
        this.state = STATE_POSSIBLE;
      }
      this.state = this.process(inputDataClone);
      // the recognizer has recognized a gesture
      // so trigger an event
      if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
        this.tryEmit(inputDataClone);
      }
    },
    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function (inputData) {
    },
    // jshint ignore:line
    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function () {
    },
    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function () {
    }
  };
  /**
   * get a usable string, used as event postfix
   * @param {Const} state
   * @returns {String} state
   */
  function stateStr(state) {
    if (state & STATE_CANCELLED) {
      return 'cancel';
    } else if (state & STATE_ENDED) {
      return 'end';
    } else if (state & STATE_CHANGED) {
      return 'move';
    } else if (state & STATE_BEGAN) {
      return 'start';
    }
    return '';
  }
  /**
   * direction cons to string
   * @param {Const} direction
   * @returns {String}
   */
  function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
      return 'down';
    } else if (direction == DIRECTION_UP) {
      return 'up';
    } else if (direction == DIRECTION_LEFT) {
      return 'left';
    } else if (direction == DIRECTION_RIGHT) {
      return 'right';
    }
    return '';
  }
  /**
   * get a recognizer by name if it is bound to a manager
   * @param {Recognizer|String} otherRecognizer
   * @param {Recognizer} recognizer
   * @returns {Recognizer}
   */
  function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
      return manager.get(otherRecognizer);
    }
    return otherRecognizer;
  }
  /**
   * This recognizer is just used as a base for the simple attribute recognizers.
   * @constructor
   * @extends Recognizer
   */
  function AttrRecognizer() {
    Recognizer.apply(this, arguments);
  }
  inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
      /**
       * @type {Number}
       * @default 1
       */
      pointers: 1
    },
    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function (input) {
      var optionPointers = this.options.pointers;
      return optionPointers === 0 || input.pointers.length === optionPointers;
    },
    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function (input) {
      var state = this.state;
      var eventType = input.eventType;
      var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
      var isValid = this.attrTest(input);
      // on cancel input and we've recognized before, return STATE_CANCELLED
      if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
        return state | STATE_CANCELLED;
      } else if (isRecognized || isValid) {
        if (eventType & INPUT_END) {
          return state | STATE_ENDED;
        } else if (!(state & STATE_BEGAN)) {
          return STATE_BEGAN;
        }
        return state | STATE_CHANGED;
      }
      return STATE_FAILED;
    }
  });
  /**
   * Pan
   * Recognized when the pointer is down and moved in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);
    this.pX = null;
    this.pY = null;
  }
  inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
      event: 'pan',
      threshold: 10,
      pointers: 1,
      direction: DIRECTION_ALL
    },
    getTouchAction: function () {
      var direction = this.options.direction;
      var actions = [];
      if (direction & DIRECTION_HORIZONTAL) {
        actions.push(TOUCH_ACTION_PAN_Y);
      }
      if (direction & DIRECTION_VERTICAL) {
        actions.push(TOUCH_ACTION_PAN_X);
      }
      return actions;
    },
    directionTest: function (input) {
      var options = this.options;
      var hasMoved = true;
      var distance = input.distance;
      var direction = input.direction;
      var x = input.deltaX;
      var y = input.deltaY;
      // lock to axis?
      if (!(direction & options.direction)) {
        if (options.direction & DIRECTION_HORIZONTAL) {
          direction = x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
          hasMoved = x != this.pX;
          distance = Math.abs(input.deltaX);
        } else {
          direction = y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
          hasMoved = y != this.pY;
          distance = Math.abs(input.deltaY);
        }
      }
      input.direction = direction;
      return hasMoved && distance > options.threshold && direction & options.direction;
    },
    attrTest: function (input) {
      return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input));
    },
    emit: function (input) {
      this.pX = input.deltaX;
      this.pY = input.deltaY;
      var direction = directionStr(input.direction);
      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }
      this._super.emit.call(this, input);
    }
  });
  /**
   * Pinch
   * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
   * @constructor
   * @extends AttrRecognizer
   */
  function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }
  inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: 'pinch',
      threshold: 0,
      pointers: 2
    },
    getTouchAction: function () {
      return [TOUCH_ACTION_NONE];
    },
    attrTest: function (input) {
      return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },
    emit: function (input) {
      this._super.emit.call(this, input);
      if (input.scale !== 1) {
        var inOut = input.scale < 1 ? 'in' : 'out';
        this.manager.emit(this.options.event + inOut, input);
      }
    }
  });
  /**
   * Press
   * Recognized when the pointer is down for x ms without any movement.
   * @constructor
   * @extends Recognizer
   */
  function PressRecognizer() {
    Recognizer.apply(this, arguments);
    this._timer = null;
    this._input = null;
  }
  inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
      event: 'press',
      pointers: 1,
      time: 500,
      // minimal time of the pointer to be pressed
      threshold: 5  // a minimal movement is ok, but keep it low
    },
    getTouchAction: function () {
      return [TOUCH_ACTION_AUTO];
    },
    process: function (input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTime = input.deltaTime > options.time;
      this._input = input;
      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (!validMovement || !validPointers || input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime) {
        this.reset();
      } else if (input.eventType & INPUT_START) {
        this.reset();
        this._timer = setTimeoutContext(function () {
          this.state = STATE_RECOGNIZED;
          this.tryEmit();
        }, options.time, this);
      } else if (input.eventType & INPUT_END) {
        return STATE_RECOGNIZED;
      }
      return STATE_FAILED;
    },
    reset: function () {
      clearTimeout(this._timer);
    },
    emit: function (input) {
      if (this.state !== STATE_RECOGNIZED) {
        return;
      }
      if (input && input.eventType & INPUT_END) {
        this.manager.emit(this.options.event + 'up', input);
      } else {
        this._input.timeStamp = now();
        this.manager.emit(this.options.event, this._input);
      }
    }
  });
  /**
   * Rotate
   * Recognized when two or more pointer are moving in a circular motion.
   * @constructor
   * @extends AttrRecognizer
   */
  function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }
  inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
      event: 'rotate',
      threshold: 0,
      pointers: 2
    },
    getTouchAction: function () {
      return [TOUCH_ACTION_NONE];
    },
    attrTest: function (input) {
      return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
  });
  /**
   * Swipe
   * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }
  inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
      event: 'swipe',
      threshold: 10,
      velocity: 0.65,
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    },
    getTouchAction: function () {
      return PanRecognizer.prototype.getTouchAction.call(this);
    },
    attrTest: function (input) {
      var direction = this.options.direction;
      var velocity;
      if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
        velocity = input.velocity;
      } else if (direction & DIRECTION_HORIZONTAL) {
        velocity = input.velocityX;
      } else if (direction & DIRECTION_VERTICAL) {
        velocity = input.velocityY;
      }
      return this._super.attrTest.call(this, input) && direction & input.direction && input.distance > this.options.threshold && abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },
    emit: function (input) {
      var direction = directionStr(input.direction);
      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }
      this.manager.emit(this.options.event, input);
    }
  });
  /**
   * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
   * between the given interval and position. The delay option can be used to recognize multi-taps without firing
   * a single tap.
   *
   * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
   * multi-taps being recognized.
   * @constructor
   * @extends Recognizer
   */
  function TapRecognizer() {
    Recognizer.apply(this, arguments);
    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;
    this._timer = null;
    this._input = null;
    this.count = 0;
  }
  inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: 'tap',
      pointers: 1,
      taps: 1,
      interval: 300,
      // max time between the multi-tap taps
      time: 250,
      // max time of the pointer to be down (like finger on the screen)
      threshold: 2,
      // a minimal movement is ok, but keep it low
      posThreshold: 10  // a multi-tap can be a bit off the initial position
    },
    getTouchAction: function () {
      return [TOUCH_ACTION_MANIPULATION];
    },
    process: function (input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTouchTime = input.deltaTime < options.time;
      this.reset();
      if (input.eventType & INPUT_START && this.count === 0) {
        return this.failTimeout();
      }
      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (validMovement && validTouchTime && validPointers) {
        if (input.eventType != INPUT_END) {
          return this.failTimeout();
        }
        var validInterval = this.pTime ? input.timeStamp - this.pTime < options.interval : true;
        var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
        this.pTime = input.timeStamp;
        this.pCenter = input.center;
        if (!validMultiTap || !validInterval) {
          this.count = 1;
        } else {
          this.count += 1;
        }
        this._input = input;
        // if tap count matches we have recognized it,
        // else it has began recognizing...
        var tapCount = this.count % options.taps;
        if (tapCount === 0) {
          // no failing requirements, immediately trigger the tap event
          // or wait as long as the multitap interval to trigger
          if (!this.hasRequireFailures()) {
            return STATE_RECOGNIZED;
          } else {
            this._timer = setTimeoutContext(function () {
              this.state = STATE_RECOGNIZED;
              this.tryEmit();
            }, options.interval, this);
            return STATE_BEGAN;
          }
        }
      }
      return STATE_FAILED;
    },
    failTimeout: function () {
      this._timer = setTimeoutContext(function () {
        this.state = STATE_FAILED;
      }, this.options.interval, this);
      return STATE_FAILED;
    },
    reset: function () {
      clearTimeout(this._timer);
    },
    emit: function () {
      if (this.state == STATE_RECOGNIZED) {
        this._input.tapCount = this.count;
        this.manager.emit(this.options.event, this._input);
      }
    }
  });
  /**
   * Simple way to create an manager with a default set of recognizers.
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
  }
  /**
   * @const {string}
   */
  Hammer.VERSION = '2.0.4';
  /**
   * default settings
   * @namespace
   */
  Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,
    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,
    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,
    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,
    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,
    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
      // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
      [
        RotateRecognizer,
        { enable: false }
      ],
      [
        PinchRecognizer,
        { enable: false },
        ['rotate']
      ],
      [
        SwipeRecognizer,
        { direction: DIRECTION_HORIZONTAL }
      ],
      [
        PanRecognizer,
        { direction: DIRECTION_HORIZONTAL },
        ['swipe']
      ],
      [TapRecognizer],
      [
        TapRecognizer,
        {
          event: 'doubletap',
          taps: 2
        },
        ['tap']
      ],
      [PressRecognizer]
    ],
    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
      /**
       * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userSelect: 'none',
      /**
       * Disable the Windows Phone grippers when pressing an element.
       * @type {String}
       * @default 'none'
       */
      touchSelect: 'none',
      /**
       * Disables the default callout shown when you touch and hold a touch target.
       * On iOS, when you touch and hold a touch target such as a link, Safari displays
       * a callout containing information about the link. This property allows you to disable that callout.
       * @type {String}
       * @default 'none'
       */
      touchCallout: 'none',
      /**
       * Specifies whether zooming is enabled. Used by IE10>
       * @type {String}
       * @default 'none'
       */
      contentZooming: 'none',
      /**
       * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userDrag: 'none',
      /**
       * Overrides the highlight color shown when the user taps a link or a JavaScript
       * clickable element in iOS. This property obeys the alpha value, if specified.
       * @type {String}
       * @default 'rgba(0,0,0,0)'
       */
      tapHighlightColor: 'rgba(0,0,0,0)'
    }
  };
  var STOP = 1;
  var FORCED_STOP = 2;
  /**
   * Manager
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Manager(element, options) {
    options = options || {};
    this.options = merge(options, Hammer.defaults);
    this.options.inputTarget = this.options.inputTarget || element;
    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);
    toggleCssProps(this, true);
    each(options.recognizers, function (item) {
      var recognizer = this.add(new item[0](item[1]));
      item[2] && recognizer.recognizeWith(item[2]);
      item[3] && recognizer.requireFailure(item[3]);
    }, this);
  }
  Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function (options) {
      extend(this.options, options);
      // Options that need a little more setup
      if (options.touchAction) {
        this.touchAction.update();
      }
      if (options.inputTarget) {
        // Clean up existing event listeners and reinitialize
        this.input.destroy();
        this.input.target = options.inputTarget;
        this.input.init();
      }
      return this;
    },
    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function (force) {
      this.session.stopped = force ? FORCED_STOP : STOP;
    },
    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function (inputData) {
      var session = this.session;
      if (session.stopped) {
        return;
      }
      // run the touch-action polyfill
      this.touchAction.preventDefaults(inputData);
      var recognizer;
      var recognizers = this.recognizers;
      // this holds the recognizer that is being recognized.
      // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
      // if no recognizer is detecting a thing, it is set to `null`
      var curRecognizer = session.curRecognizer;
      // reset when the last recognizer is recognized
      // or when we're in a new session
      if (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) {
        curRecognizer = session.curRecognizer = null;
      }
      var i = 0;
      while (i < recognizers.length) {
        recognizer = recognizers[i];
        // find out if we are allowed try to recognize the input for this one.
        // 1.   allow if the session is NOT forced stopped (see the .stop() method)
        // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
        //      that is being recognized.
        // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
        //      this can be setup with the `recognizeWith()` method on the recognizer.
        if (session.stopped !== FORCED_STOP && // 1
          (!curRecognizer || recognizer == curRecognizer || // 2
          recognizer.canRecognizeWith(curRecognizer))) {
          // 3
          recognizer.recognize(inputData);
        } else {
          recognizer.reset();
        }
        // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
        // current active recognizer. but only if we don't already have an active recognizer
        if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
          curRecognizer = session.curRecognizer = recognizer;
        }
        i++;
      }
    },
    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function (recognizer) {
      if (recognizer instanceof Recognizer) {
        return recognizer;
      }
      var recognizers = this.recognizers;
      for (var i = 0; i < recognizers.length; i++) {
        if (recognizers[i].options.event == recognizer) {
          return recognizers[i];
        }
      }
      return null;
    },
    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function (recognizer) {
      if (invokeArrayArg(recognizer, 'add', this)) {
        return this;
      }
      // remove existing
      var existing = this.get(recognizer.options.event);
      if (existing) {
        this.remove(existing);
      }
      this.recognizers.push(recognizer);
      recognizer.manager = this;
      this.touchAction.update();
      return recognizer;
    },
    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function (recognizer) {
      if (invokeArrayArg(recognizer, 'remove', this)) {
        return this;
      }
      var recognizers = this.recognizers;
      recognizer = this.get(recognizer);
      recognizers.splice(inArray(recognizers, recognizer), 1);
      this.touchAction.update();
      return this;
    },
    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function (events, handler) {
      var handlers = this.handlers;
      each(splitStr(events), function (event) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);
      });
      return this;
    },
    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function (events, handler) {
      var handlers = this.handlers;
      each(splitStr(events), function (event) {
        if (!handler) {
          delete handlers[event];
        } else {
          handlers[event].splice(inArray(handlers[event], handler), 1);
        }
      });
      return this;
    },
    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function (event, data) {
      // we also want to trigger dom events
      if (this.options.domEvents) {
        triggerDomEvent(event, data);
      }
      // no handlers, so skip it all
      var handlers = this.handlers[event] && this.handlers[event].slice();
      if (!handlers || !handlers.length) {
        return;
      }
      data.type = event;
      data.preventDefault = function () {
        data.srcEvent.preventDefault();
      };
      var i = 0;
      while (i < handlers.length) {
        handlers[i](data);
        i++;
      }
    },
    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function () {
      this.element && toggleCssProps(this, false);
      this.handlers = {};
      this.session = {};
      this.input.destroy();
      this.element = null;
    }
  };
  /**
   * add/remove the css properties as defined in manager.options.cssProps
   * @param {Manager} manager
   * @param {Boolean} add
   */
  function toggleCssProps(manager, add) {
    var element = manager.element;
    each(manager.options.cssProps, function (value, name) {
      element.style[prefixed(element.style, name)] = add ? value : '';
    });
  }
  /**
   * trigger dom event
   * @param {String} event
   * @param {Object} data
   */
  function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
  }
  extend(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,
    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,
    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,
    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,
    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,
    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,
    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
  });
  // jQuery.hammer.js
  // This jQuery plugin is just a small wrapper around the Hammer() class.
  // It also extends the Manager.emit method by triggering jQuery events.
  // $(element).hammer(options).bind("pan", myPanHandler);
  // The Hammer instance is stored at $element.data("hammer").
  // https://github.com/hammerjs/jQuery.hammer.js
  (function ($, Hammer) {
    function hammerify(el, options) {
      var $el = $(el);
      if (!$el.data('hammer')) {
        $el.data('hammer', new Hammer($el[0], options));
      }
    }
    $.fn.hammer = function (options) {
      return this.each(function () {
        hammerify(this, options);
      });
    };
    // extend the emit method to also trigger jQuery events
    Hammer.Manager.prototype.emit = function (originalEmit) {
      return function (type, data) {
        originalEmit.call(this, type, data);
        $(this.element).trigger({
          type: type,
          gesture: data
        });
      };
    }(Hammer.Manager.prototype.emit);
  }($, Hammer));
  return Hammer;
}(jQuery);
fnui_offcanvas = function ($, UI) {
  var $win = $(window);
  var $doc = $(document);
  var scrollPos;
  var OffCanvas = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, OffCanvas.DEFAULTS, options);
    this.active = null;
    this.bindEvents();
  };
  OffCanvas.DEFAULTS = {
    duration: 300,
    effect: 'overlay'  // {push|overlay}, push is too expensive
  };
  OffCanvas.prototype.open = function (relatedElement) {
    var _this = this;
    var $element = this.$element;
    if (!$element.length || $element.hasClass('fn-active')) {
      return;
    }
    var effect = this.options.effect;
    var $html = $('html');
    var $body = $('body');
    var $bar = $element.find('.fn-offcanvas-bar').first();
    var dir = $bar.hasClass('fn-offcanvas-bar-flip') ? -1 : 1;
    $bar.addClass('fn-offcanvas-bar-' + effect);
    scrollPos = {
      x: window.scrollX,
      y: window.scrollY
    };
    $element.addClass('fn-active');
    $body.css({
      width: window.innerWidth,
      height: $win.height()
    }).addClass('fn-offcanvas-page');
    if (effect !== 'overlay') {
      $body.css({ 'margin-left': $bar.outerWidth() * dir }).width();  // force redraw
    }
    $html.css('margin-top', scrollPos.y * -1);
    setTimeout(function () {
      $bar.addClass('fn-offcanvas-bar-active').width();
    }, 0);
    $element.trigger('open.offcanvas');
    this.active = 1;
    // Close OffCanvas when none content area clicked
    $element.on('click.offcanvas', function (e) {
      var $target = $(e.target);
      if ($target.hasClass('fn-offcanvas-bar')) {
        return;
      }
      if ($target.parents('.fn-offcanvas-bar').first().length) {
        return;
      }
      // https://developer.mozilla.org/zh-CN/docs/DOM/event.stopImmediatePropagation
      e.stopImmediatePropagation();
      _this.close();
    });
    $html.on('keydown.offcanvas', function (e) {
      e.keyCode === 27 && _this.close();
    });
  };
  OffCanvas.prototype.close = function (relatedElement) {
    var _this = this;
    var $html = $('html');
    var $body = $('body');
    var $element = this.$element;
    var $bar = $element.find('.fn-offcanvas-bar').first();
    if (!$element.length || !this.active || !$element.hasClass('fn-active')) {
      return;
    }
    $element.trigger('close.offcanvas');
    function complete() {
      $body.removeClass('fn-offcanvas-page').css({
        width: '',
        height: '',
        'margin-left': '',
        'margin-right': ''
      });
      $element.removeClass('fn-active');
      $bar.removeClass('fn-offcanvas-bar-active');
      $html.css('margin-top', '');
      window.scrollTo(scrollPos.x, scrollPos.y);
      $element.trigger('closed.offcanvas');
      _this.active = 0;
    }
    if (UI.support.transition) {
      setTimeout(function () {
        $bar.removeClass('fn-offcanvas-bar-active');
      }, 0);
      $body.css('margin-left', '').one('fnTransitionEnd', function () {
        complete();
      }).emulateTransitionEnd(this.options.duration);
    } else {
      complete();
    }
    $element.off('click.offcanvas');
    $html.off('.offcanvas');
  };
  OffCanvas.prototype.bindEvents = function () {
    var _this = this;
    $doc.on('click.offcanvas', '[data-fn-dismiss="offcanvas"]', function (e) {
      e.preventDefault();
      _this.close();
    });
    $win.on('resize.offcanvas orientationchange.offcanvas', function () {
      _this.active && _this.close();
    });
    this.$element.hammer().on('swipeleft swipeleft', function (e) {
      e.preventDefault();
      _this.close();
    });
    return this;
  };
  function Plugin(option, relatedElement) {
    var args = Array.prototype.slice.call(arguments, 1);
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('fnui.offcanvas');
      var options = $.extend({}, typeof option == 'object' && option);
      if (!data) {
        $this.data('fnui.offcanvas', data = new OffCanvas(this, options));
        (!option || typeof option == 'object') && data.open(relatedElement);
      }
      if (typeof option == 'string') {
        data[option] && data[option].apply(data, args);
      }
    });
  }
  $.fn.offCanvas = Plugin;
  // Init code
  $doc.on('click.offcanvas', '[data-fn-offcanvas]', function (e) {
    e.preventDefault();
    var $this = $(this);
    var options = UI.utils.parseOptions($this.data('fn-offcanvas'));
    var $target = $(options.target || this.href && this.href.replace(/.*(?=#[^\s]+$)/, ''));
    var option = $target.data('fnui.offcanvas') ? 'open' : options;
    Plugin.call($target, option, this);
  });
  return OffCanvas;
}(jQuery, fnui_fnuicore);
fnui_popover = function ($, UI) {
  var Popover = function (element, options) {
    this.options = $.extend({}, Popover.DEFAULTS, options);
    this.$element = $(element);
    this.active = null;
    this.$popover = this.options.target && $(this.options.target) || null;
    this.init();
    this._bindEvents();
  };
  Popover.DEFAULTS = {
    theme: null,
    trigger: 'click',
    content: '',
    open: false,
    target: null,
    tpl: '<div class="fn-popover">' + '<div class="fn-popover-inner"></div>' + '<div class="fn-popover-caret"></div></div>'
  };
  Popover.prototype.init = function () {
    var _this = this;
    var $element = this.$element;
    var $popover;
    if (!this.options.target) {
      this.$popover = this.getPopover();
      this.setContent();
    }
    $popover = this.$popover;
    $popover.appendTo($('body'));
    this.sizePopover();
    function sizePopover() {
      _this.sizePopover();
    }
    // TODO: 监听页面内容变化，重新调整位置
    $element.on('open.popover', function () {
      $(window).on('resize.popover', UI.utils.debounce(sizePopover, 50));
    });
    $element.on('close.popover', function () {
      $(window).off('resize.popover', sizePopover);
    });
    this.options.open && this.open();
  };
  Popover.prototype.sizePopover = function sizePopover() {
    var $element = this.$element;
    var $popover = this.$popover;
    if (!$popover || !$popover.length) {
      return;
    }
    var popWidth = $popover.outerWidth();
    var popHeight = $popover.outerHeight();
    var $popCaret = $popover.find('.fn-popover-caret');
    var popCaretSize = $popCaret.outerWidth() / 2 || 8;
    // 取不到 $popCaret.outerHeight() 的值，所以直接加 8
    var popTotalHeight = popHeight + 8;
    // $popCaret.outerHeight();
    var triggerWidth = $element.outerWidth();
    var triggerHeight = $element.outerHeight();
    var triggerOffset = $element.offset();
    var triggerRect = $element[0].getBoundingClientRect();
    var $w = $(window);
    var winHeight = $w.height();
    var winWidth = $w.width();
    var popTop = 0;
    var popLeft = 0;
    var diff = 0;
    var spacing = 2;
    var popPosition = 'top';
    $popover.css({
      left: '',
      top: ''
    }).removeClass('fn-popover-left ' + 'fn-popover-right fn-popover-top fn-popover-bottom');
    // $popCaret.css({left: '', top: ''});
    if (popTotalHeight - spacing < triggerRect.top + spacing) {
      // Popover on the top of trigger
      popTop = triggerOffset.top - popTotalHeight - spacing;
    } else if (popTotalHeight < winHeight - triggerRect.top - triggerRect.height) {
      // On bottom
      popPosition = 'bottom';
      popTop = triggerOffset.top + triggerHeight + popCaretSize + spacing;
    } else {
      // On middle
      popPosition = 'middle';
      popTop = triggerHeight / 2 + triggerOffset.top - popHeight / 2;
    }
    // Horizontal Position
    if (popPosition === 'top' || popPosition === 'bottom') {
      popLeft = triggerWidth / 2 + triggerOffset.left - popWidth / 2;
      diff = popLeft;
      if (popLeft < 5) {
        popLeft = 5;
      }
      if (popLeft + popWidth > winWidth) {
        popLeft = winWidth - popWidth - 20;  // console.log('left %d, win %d, popw %d', popLeft, winWidth, popWidth);
      }
      if (popPosition === 'top') {
        // This is the Popover position, NOT caret position
        // Popover on the Top of trigger, caret on the bottom of Popover
        $popover.addClass('fn-popover-top');
      }
      if (popPosition === 'bottom') {
        $popover.addClass('fn-popover-bottom');
      }
      diff = diff - popLeft;  // $popCaret.css({left: (popWidth / 2 - popCaretSize + diff) + 'px'});
    } else if (popPosition === 'middle') {
      popLeft = triggerOffset.left - popWidth - popCaretSize;
      $popover.addClass('fn-popover-left');
      if (popLeft < 5) {
        popLeft = triggerOffset.left + triggerWidth + popCaretSize;
        $popover.removeClass('fn-popover-left').addClass('fn-popover-right');
      }
      if (popLeft + popWidth > winWidth) {
        popLeft = winWidth - popWidth - 5;
        $popover.removeClass('fn-popover-left').addClass('fn-popover-right');
      }  // $popCaret.css({top: (popHeight / 2 - popCaretSize / 2) + 'px'});
    }
    // Apply position style
    $popover.css({
      top: popTop + 'px',
      left: popLeft + 'px'
    });
  };
  Popover.prototype.toggle = function () {
    return this[this.active ? 'close' : 'open']();
  };
  Popover.prototype.open = function () {
    var $popover = this.$popover;
    this.$element.trigger('open.popover');
    this.sizePopover();
    $popover.show().addClass('fn-active');
    this.active = true;
  };
  Popover.prototype.close = function () {
    var $popover = this.$popover;
    this.$element.trigger('close.popover');
    $popover.removeClass('fn-active').trigger('closed.popover').hide();
    this.active = false;
  };
  Popover.prototype.getPopover = function () {
    var uid = UI.utils.generateGUID('fn-popover');
    var theme = [];
    if (this.options.theme) {
      $.each(this.options.theme.split(' '), function (i, item) {
        theme.push('fn-popover-' + $.trim(item));
      });
    }
    return $(this.options.tpl).attr('id', uid).addClass(theme.join(' '));
  };
  Popover.prototype.setContent = function (content) {
    content = content || this.options.content;
    this.$popover && this.$popover.find('.fn-popover-inner').empty().html(content);
  };
  Popover.prototype._bindEvents = function () {
    var eventNS = 'popover';
    var triggers = this.options.trigger.split(' ');
    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];
      if (trigger === 'click') {
        this.$element.on('click.' + eventNS, $.proxy(this.toggle, this));
      } else {
        // hover or focus
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
        this.$element.on(eventIn + '.' + eventNS, $.proxy(this.open, this));
        this.$element.on(eventOut + '.' + eventNS, $.proxy(this.close, this));
      }
    }
  };
  Popover.prototype.destroy = function () {
    this.$element.off('.popover').removeData('fnui.popover');
    this.$popover.remove();
  };
  UI.plugin('popover', Popover);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-popover]', context).popover();
  });
  return Popover;
}(jQuery, fnui_fnuicore);
fnui_progress = function (UI) {
  var Progress = function () {
    var NProgress = {};
    NProgress.version = '0.2.0';
    var Settings = NProgress.settings = {
      minimum: 0.08,
      easing: 'ease',
      positionUsing: '',
      speed: 200,
      trickle: true,
      trickleRate: 0.02,
      trickleSpeed: 800,
      showSpinner: true,
      parent: 'body',
      barSelector: '[role="nprogress-bar"]',
      spinnerSelector: '[role="nprogress-spinner"]',
      template: '<div class="nprogress-bar" role="nprogress-bar">' + '<div class="nprogress-peg"></div></div>' + '<div class="nprogress-spinner" role="nprogress-spinner">' + '<div class="nprogress-spinner-icon"></div></div>'
    };
    /**
     * Updates configuration.
     *
     *     NProgress.configure({
     *       minimum: 0.1
     *     });
     */
    NProgress.configure = function (options) {
      var key, value;
      for (key in options) {
        value = options[key];
        if (value !== undefined && options.hasOwnProperty(key))
          Settings[key] = value;
      }
      return this;
    };
    /**
     * Last number.
     */
    NProgress.status = null;
    /**
     * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
     *
     *     NProgress.set(0.4);
     *     NProgress.set(1.0);
     */
    NProgress.set = function (n) {
      var started = NProgress.isStarted();
      n = clamp(n, Settings.minimum, 1);
      NProgress.status = n === 1 ? null : n;
      var progress = NProgress.render(!started), bar = progress.querySelector(Settings.barSelector), speed = Settings.speed, ease = Settings.easing;
      progress.offsetWidth;
      /* Repaint */
      queue(function (next) {
        // Set positionUsing if it hasn't already been set
        if (Settings.positionUsing === '')
          Settings.positionUsing = NProgress.getPositioningCSS();
        // Add transition
        css(bar, barPositionCSS(n, speed, ease));
        if (n === 1) {
          // Fade out
          css(progress, {
            transition: 'none',
            opacity: 1
          });
          progress.offsetWidth;
          /* Repaint */
          setTimeout(function () {
            css(progress, {
              transition: 'all ' + speed + 'ms linear',
              opacity: 0
            });
            setTimeout(function () {
              NProgress.remove();
              next();
            }, speed);
          }, speed);
        } else {
          setTimeout(next, speed);
        }
      });
      return this;
    };
    NProgress.isStarted = function () {
      return typeof NProgress.status === 'number';
    };
    /**
     * Shows the progress bar.
     * This is the same as setting the status to 0%, except that it doesn't go backwards.
     *
     *     NProgress.start();
     *
     */
    NProgress.start = function () {
      if (!NProgress.status)
        NProgress.set(0);
      var work = function () {
        setTimeout(function () {
          if (!NProgress.status)
            return;
          NProgress.trickle();
          work();
        }, Settings.trickleSpeed);
      };
      if (Settings.trickle)
        work();
      return this;
    };
    /**
     * Hides the progress bar.
     * This is the *sort of* the same as setting the status to 100%, with the
     * difference being `done()` makes some placebo effect of some realistic motion.
     *
     *     NProgress.done();
     *
     * If `true` is passed, it will show the progress bar even if its hidden.
     *
     *     NProgress.done(true);
     */
    NProgress.done = function (force) {
      if (!force && !NProgress.status)
        return this;
      return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
    };
    /**
     * Increments by a random amount.
     */
    NProgress.inc = function (amount) {
      var n = NProgress.status;
      if (!n) {
        return NProgress.start();
      } else {
        if (typeof amount !== 'number') {
          amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
        }
        n = clamp(n + amount, 0, 0.994);
        return NProgress.set(n);
      }
    };
    NProgress.trickle = function () {
      return NProgress.inc(Math.random() * Settings.trickleRate);
    };
    /**
     * Waits for all supplied jQuery promises and
     * increases the progress as the promises resolve.
     *
     * @param $promise jQUery Promise
     */
    (function () {
      var initial = 0, current = 0;
      NProgress.promise = function ($promise) {
        if (!$promise || $promise.state() === 'resolved') {
          return this;
        }
        if (current === 0) {
          NProgress.start();
        }
        initial++;
        current++;
        $promise.always(function () {
          current--;
          if (current === 0) {
            initial = 0;
            NProgress.done();
          } else {
            NProgress.set((initial - current) / initial);
          }
        });
        return this;
      };
    }());
    /**
     * (Internal) renders the progress bar markup based on the `template`
     * setting.
     */
    NProgress.render = function (fromStart) {
      if (NProgress.isRendered())
        return document.getElementById('nprogress');
      addClass(document.documentElement, 'nprogress-busy');
      var progress = document.createElement('div');
      progress.id = 'nprogress';
      progress.innerHTML = Settings.template;
      var bar = progress.querySelector(Settings.barSelector), perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0), parent = document.querySelector(Settings.parent), spinner;
      css(bar, {
        transition: 'all 0 linear',
        transform: 'translate3d(' + perc + '%,0,0)'
      });
      if (!Settings.showSpinner) {
        spinner = progress.querySelector(Settings.spinnerSelector);
        spinner && removeElement(spinner);
      }
      if (parent != document.body) {
        addClass(parent, 'nprogress-custom-parent');
      }
      parent.appendChild(progress);
      return progress;
    };
    /**
     * Removes the element. Opposite of render().
     */
    NProgress.remove = function () {
      removeClass(document.documentElement, 'nprogress-busy');
      removeClass(document.querySelector(Settings.parent), 'nprogress-custom-parent');
      var progress = document.getElementById('nprogress');
      progress && removeElement(progress);
    };
    /**
     * Checks if the progress bar is rendered.
     */
    NProgress.isRendered = function () {
      return !!document.getElementById('nprogress');
    };
    /**
     * Determine which positioning CSS rule to use.
     */
    NProgress.getPositioningCSS = function () {
      // Sniff on document.body.style
      var bodyStyle = document.body.style;
      // Sniff prefixes
      var vendorPrefix = 'WebkitTransform' in bodyStyle ? 'Webkit' : 'MozTransform' in bodyStyle ? 'Moz' : 'msTransform' in bodyStyle ? 'ms' : 'OTransform' in bodyStyle ? 'O' : '';
      if (vendorPrefix + 'Perspective' in bodyStyle) {
        // Modern browsers with 3D support, e.g. Webkit, IE10
        return 'translate3d';
      } else if (vendorPrefix + 'Transform' in bodyStyle) {
        // Browsers without 3D support, e.g. IE9
        return 'translate';
      } else {
        // Browsers without translate() support, e.g. IE7-8
        return 'margin';
      }
    };
    /**
     * Helpers
     */
    function clamp(n, min, max) {
      if (n < min)
        return min;
      if (n > max)
        return max;
      return n;
    }
    /**
     * (Internal) converts a percentage (`0..1`) to a bar translateX
     * percentage (`-100%..0%`).
     */
    function toBarPerc(n) {
      return (-1 + n) * 100;
    }
    /**
     * (Internal) returns the correct CSS for changing the bar's
     * position given an n percentage, and speed and ease from Settings
     */
    function barPositionCSS(n, speed, ease) {
      var barCSS;
      if (Settings.positionUsing === 'translate3d') {
        barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
      } else if (Settings.positionUsing === 'translate') {
        barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
      } else {
        barCSS = { 'margin-left': toBarPerc(n) + '%' };
      }
      barCSS.transition = 'all ' + speed + 'ms ' + ease;
      return barCSS;
    }
    /**
     * (Internal) Queues a function to be executed.
     */
    var queue = function () {
      var pending = [];
      function next() {
        var fn = pending.shift();
        if (fn) {
          fn(next);
        }
      }
      return function (fn) {
        pending.push(fn);
        if (pending.length == 1)
          next();
      };
    }();
    /**
     * (Internal) Applies css properties to an element, similar to the jQuery
     * css method.
     *
     * While this helper does assist with vendor prefixed property names, it
     * does not perform any manipulation of values prior to setting styles.
     */
    var css = function () {
      var cssPrefixes = [
          'Webkit',
          'O',
          'Moz',
          'ms'
        ], cssProps = {};
      function camelCase(string) {
        return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function (match, letter) {
          return letter.toUpperCase();
        });
      }
      function getVendorProp(name) {
        var style = document.body.style;
        if (name in style)
          return name;
        var i = cssPrefixes.length, capName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
        while (i--) {
          vendorName = cssPrefixes[i] + capName;
          if (vendorName in style)
            return vendorName;
        }
        return name;
      }
      function getStyleProp(name) {
        name = camelCase(name);
        return cssProps[name] || (cssProps[name] = getVendorProp(name));
      }
      function applyCss(element, prop, value) {
        prop = getStyleProp(prop);
        element.style[prop] = value;
      }
      return function (element, properties) {
        var args = arguments, prop, value;
        if (args.length == 2) {
          for (prop in properties) {
            value = properties[prop];
            if (value !== undefined && properties.hasOwnProperty(prop))
              applyCss(element, prop, value);
          }
        } else {
          applyCss(element, args[1], args[2]);
        }
      };
    }();
    /**
     * (Internal) Determines if an element or space separated list of class names contains a class name.
     */
    function hasClass(element, name) {
      var list = typeof element == 'string' ? element : classList(element);
      return list.indexOf(' ' + name + ' ') >= 0;
    }
    /**
     * (Internal) Adds a class to an element.
     */
    function addClass(element, name) {
      var oldList = classList(element), newList = oldList + name;
      if (hasClass(oldList, name))
        return;
      // Trim the opening space.
      element.className = newList.substring(1);
    }
    /**
     * (Internal) Removes a class from an element.
     */
    function removeClass(element, name) {
      var oldList = classList(element), newList;
      if (!hasClass(element, name))
        return;
      // Replace the class name.
      newList = oldList.replace(' ' + name + ' ', ' ');
      // Trim the opening and closing spaces.
      element.className = newList.substring(1, newList.length - 1);
    }
    /**
     * (Internal) Gets a space separated list of the class names on the element.
     * The list is wrapped with a single space on each end to facilitate finding
     * matches within the list.
     */
    function classList(element) {
      return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');
    }
    /**
     * (Internal) Removes an element from the DOM.
     */
    function removeElement(element) {
      element && element.parentNode && element.parentNode.removeChild(element);
    }
    return NProgress;
  }();
  return $.progress = UI.progress = Progress;
}(fnui_fnuicore);
fnui_pinchzoom = function ($) {
  /**
   * Pinch zoom using jQuery
   * @version 0.0.2
   * @author Manuel Stofer <mst@rtp.ch>
   * @param el
   * @param options
   * @constructor
   */
  var PinchZoom = function (el, options) {
      this.el = $(el);
      this.zoomFactor = 1;
      this.lastScale = 1;
      this.offset = {
        x: 0,
        y: 0
      };
      this.options = $.extend({}, this.defaults, options);
      this.setupMarkup();
      this.bindEvents();
      this.update();
      // default enable.
      this.enable();
    }, sum = function (a, b) {
      return a + b;
    }, isCloseTo = function (value, expected) {
      return value > expected - 0.01 && value < expected + 0.01;
    };
  PinchZoom.prototype = {
    defaults: {
      tapZoomFactor: 2,
      zoomOutFactor: 1.3,
      animationDuration: 300,
      animationInterval: 5,
      maxZoom: 5,
      minZoom: 0.5,
      lockDragAxis: false,
      use2d: false,
      zoomStartEventName: 'pz_zoomstart',
      zoomEndEventName: 'pz_zoomend',
      dragStartEventName: 'pz_dragstart',
      dragEndEventName: 'pz_dragend',
      doubleTapEventName: 'pz_doubletap'
    },
    /**
     * Event handler for 'dragstart'
     * @param event
     */
    handleDragStart: function (event) {
      this.el.trigger(this.options.dragStartEventName);
      this.stopAnimation();
      this.lastDragPosition = false;
      this.hasInteraction = true;
      this.handleDrag(event);
    },
    /**
     * Event handler for 'drag'
     * @param event
     */
    handleDrag: function (event) {
      if (this.zoomFactor > 1) {
        var touch = this.getTouches(event)[0];
        this.drag(touch, this.lastDragPosition);
        this.offset = this.sanitizeOffset(this.offset);
        this.lastDragPosition = touch;
      }
    },
    handleDragEnd: function () {
      this.el.trigger(this.options.dragEndEventName);
      this.end();
    },
    /**
     * Event handler for 'zoomstart'
     * @param event
     */
    handleZoomStart: function (event) {
      this.el.trigger(this.options.zoomStartEventName);
      this.stopAnimation();
      this.lastScale = 1;
      this.nthZoom = 0;
      this.lastZoomCenter = false;
      this.hasInteraction = true;
    },
    /**
     * Event handler for 'zoom'
     * @param event
     */
    handleZoom: function (event, newScale) {
      // a relative scale factor is used
      var touchCenter = this.getTouchCenter(this.getTouches(event)), scale = newScale / this.lastScale;
      this.lastScale = newScale;
      // the first touch events are thrown away since they are not precise
      this.nthZoom += 1;
      if (this.nthZoom > 3) {
        this.scale(scale, touchCenter);
        this.drag(touchCenter, this.lastZoomCenter);
      }
      this.lastZoomCenter = touchCenter;
    },
    handleZoomEnd: function () {
      this.el.trigger(this.options.zoomEndEventName);
      this.end();
    },
    /**
     * Event handler for 'doubletap'
     * @param event
     */
    handleDoubleTap: function (event) {
      var center = this.getTouches(event)[0], zoomFactor = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor, startZoomFactor = this.zoomFactor, updateProgress = function (progress) {
          this.scaleTo(startZoomFactor + progress * (zoomFactor - startZoomFactor), center);
        }.bind(this);
      if (this.hasInteraction) {
        return;
      }
      if (startZoomFactor > zoomFactor) {
        center = this.getCurrentZoomCenter();
      }
      this.animate(this.options.animationDuration, this.options.animationInterval, updateProgress, this.swing);
      this.el.trigger(this.options.doubleTapEventName);
    },
    /**
     * Max / min values for the offset
     * @param offset
     * @return {Object} the sanitized offset
     */
    sanitizeOffset: function (offset) {
      var maxX = (this.zoomFactor - 1) * this.getContainerX(), maxY = (this.zoomFactor - 1) * this.getContainerY(), maxOffsetX = Math.max(maxX, 0), maxOffsetY = Math.max(maxY, 0), minOffsetX = Math.min(maxX, 0), minOffsetY = Math.min(maxY, 0);
      return {
        x: Math.min(Math.max(offset.x, minOffsetX), maxOffsetX),
        y: Math.min(Math.max(offset.y, minOffsetY), maxOffsetY)
      };
    },
    /**
     * Scale to a specific zoom factor (not relative)
     * @param zoomFactor
     * @param center
     */
    scaleTo: function (zoomFactor, center) {
      this.scale(zoomFactor / this.zoomFactor, center);
    },
    /**
     * Scales the element from specified center
     * @param scale
     * @param center
     */
    scale: function (scale, center) {
      scale = this.scaleZoomFactor(scale);
      this.addOffset({
        x: (scale - 1) * (center.x + this.offset.x),
        y: (scale - 1) * (center.y + this.offset.y)
      });
    },
    /**
     * Scales the zoom factor relative to current state
     * @param scale
     * @return the actual scale (can differ because of max min zoom factor)
     */
    scaleZoomFactor: function (scale) {
      var originalZoomFactor = this.zoomFactor;
      this.zoomFactor *= scale;
      this.zoomFactor = Math.min(this.options.maxZoom, Math.max(this.zoomFactor, this.options.minZoom));
      return this.zoomFactor / originalZoomFactor;
    },
    /**
     * Drags the element
     * @param center
     * @param lastCenter
     */
    drag: function (center, lastCenter) {
      if (lastCenter) {
        if (this.options.lockDragAxis) {
          // lock scroll to position that was changed the most
          if (Math.abs(center.x - lastCenter.x) > Math.abs(center.y - lastCenter.y)) {
            this.addOffset({
              x: -(center.x - lastCenter.x),
              y: 0
            });
          } else {
            this.addOffset({
              y: -(center.y - lastCenter.y),
              x: 0
            });
          }
        } else {
          this.addOffset({
            y: -(center.y - lastCenter.y),
            x: -(center.x - lastCenter.x)
          });
        }
      }
    },
    /**
     * Calculates the touch center of multiple touches
     * @param touches
     * @return {Object}
     */
    getTouchCenter: function (touches) {
      return this.getVectorAvg(touches);
    },
    /**
     * Calculates the average of multiple vectors (x, y values)
     */
    getVectorAvg: function (vectors) {
      return {
        x: vectors.map(function (v) {
          return v.x;
        }).reduce(sum) / vectors.length,
        y: vectors.map(function (v) {
          return v.y;
        }).reduce(sum) / vectors.length
      };
    },
    /**
     * Adds an offset
     * @param offset the offset to add
     * @return return true when the offset change was accepted
     */
    addOffset: function (offset) {
      this.offset = {
        x: this.offset.x + offset.x,
        y: this.offset.y + offset.y
      };
    },
    sanitize: function () {
      if (this.zoomFactor < this.options.zoomOutFactor) {
        this.zoomOutAnimation();
      } else if (this.isInsaneOffset(this.offset)) {
        this.sanitizeOffsetAnimation();
      }
    },
    /**
     * Checks if the offset is ok with the current zoom factor
     * @param offset
     * @return {Boolean}
     */
    isInsaneOffset: function (offset) {
      var sanitizedOffset = this.sanitizeOffset(offset);
      return sanitizedOffset.x !== offset.x || sanitizedOffset.y !== offset.y;
    },
    /**
     * Creates an animation moving to a sane offset
     */
    sanitizeOffsetAnimation: function () {
      var targetOffset = this.sanitizeOffset(this.offset), startOffset = {
          x: this.offset.x,
          y: this.offset.y
        }, updateProgress = function (progress) {
          this.offset.x = startOffset.x + progress * (targetOffset.x - startOffset.x);
          this.offset.y = startOffset.y + progress * (targetOffset.y - startOffset.y);
          this.update();
        }.bind(this);
      this.animate(this.options.animationDuration, this.options.animationInterval, updateProgress, this.swing);
    },
    /**
     * Zooms back to the original position,
     * (no offset and zoom factor 1)
     */
    zoomOutAnimation: function () {
      var startZoomFactor = this.zoomFactor, zoomFactor = 1, center = this.getCurrentZoomCenter(), updateProgress = function (progress) {
          this.scaleTo(startZoomFactor + progress * (zoomFactor - startZoomFactor), center);
        }.bind(this);
      this.animate(this.options.animationDuration, this.options.animationInterval, updateProgress, this.swing);
    },
    /**
     * Updates the aspect ratio
     */
    updateAspectRatio: function () {
      // this.setContainerY(this.getContainerX() / this.getAspectRatio());
      // @modified
      this.setContainerY();
    },
    /**
     * Calculates the initial zoom factor (for the element to fit into the container)
     * @return the initial zoom factor
     */
    getInitialZoomFactor: function () {
      // use .offsetWidth instead of width()
      // because jQuery-width() return the original width but Zepto-width() will calculate width with transform.
      // the same as .height()
      return this.container[0].offsetWidth / this.el[0].offsetWidth;
    },
    /**
     * Calculates the aspect ratio of the element
     * @return the aspect ratio
     */
    getAspectRatio: function () {
      return this.el[0].offsetWidth / this.el[0].offsetHeight;
    },
    /**
     * Calculates the virtual zoom center for the current offset and zoom factor
     * (used for reverse zoom)
     * @return {Object} the current zoom center
     */
    getCurrentZoomCenter: function () {
      // uses following formula to calculate the zoom center x value
      // offset_left / offset_right = zoomcenter_x / (container_x - zoomcenter_x)
      var length = this.container[0].offsetWidth * this.zoomFactor, offsetLeft = this.offset.x, offsetRight = length - offsetLeft - this.container[0].offsetWidth, widthOffsetRatio = offsetLeft / offsetRight, centerX = widthOffsetRatio * this.container[0].offsetWidth / (widthOffsetRatio + 1),
        // the same for the zoomcenter y
        height = this.container[0].offsetHeight * this.zoomFactor, offsetTop = this.offset.y, offsetBottom = height - offsetTop - this.container[0].offsetHeight, heightOffsetRatio = offsetTop / offsetBottom, centerY = heightOffsetRatio * this.container[0].offsetHeight / (heightOffsetRatio + 1);
      // prevents division by zero
      if (offsetRight === 0) {
        centerX = this.container[0].offsetWidth;
      }
      if (offsetBottom === 0) {
        centerY = this.container[0].offsetHeight;
      }
      return {
        x: centerX,
        y: centerY
      };
    },
    canDrag: function () {
      return !isCloseTo(this.zoomFactor, 1);
    },
    /**
     * Returns the touches of an event relative to the container offset
     * @param event
     * @return array touches
     */
    getTouches: function (event) {
      var position = this.container.offset();
      return Array.prototype.slice.call(event.touches).map(function (touch) {
        return {
          x: touch.pageX - position.left,
          y: touch.pageY - position.top
        };
      });
    },
    /**
     * Animation loop
     * does not support simultaneous animations
     * @param duration
     * @param interval
     * @param framefn
     * @param timefn
     * @param callback
     */
    animate: function (duration, interval, framefn, timefn, callback) {
      var startTime = new Date().getTime(), renderFrame = function () {
          if (!this.inAnimation) {
            return;
          }
          var frameTime = new Date().getTime() - startTime, progress = frameTime / duration;
          if (frameTime >= duration) {
            framefn(1);
            if (callback) {
              callback();
            }
            this.update();
            this.stopAnimation();
            this.update();
          } else {
            if (timefn) {
              progress = timefn(progress);
            }
            framefn(progress);
            this.update();
            setTimeout(renderFrame, interval);
          }
        }.bind(this);
      this.inAnimation = true;
      renderFrame();
    },
    /**
     * Stops the animation
     */
    stopAnimation: function () {
      this.inAnimation = false;
    },
    /**
     * Swing timing function for animations
     * @param p
     * @return {Number}
     */
    swing: function (p) {
      return -Math.cos(p * Math.PI) / 2 + 0.5;
    },
    getContainerX: function () {
      // return this.container[0].offsetWidth;
      // @modified
      return window.innerWidth;
    },
    getContainerY: function () {
      // return this.container[0].offsetHeight;
      // @modified
      return window.innerHeight;
    },
    setContainerY: function (y) {
      // return this.container.height(y);
      // @modified
      var t = window.innerHeight;
      return this.el.css({ height: t }), this.container.height(t);
    },
    /**
     * Creates the expected html structure
     */
    setupMarkup: function () {
      this.container = $('<div class="pinch-zoom-container"></div>');
      this.el.before(this.container);
      this.container.append(this.el);
      this.container.css({
        'overflow': 'hidden',
        'position': 'relative'
      });
      // Zepto doesn't recognize `webkitTransform..` style
      this.el.css({
        '-webkit-transform-origin': '0% 0%',
        '-moz-transform-origin': '0% 0%',
        '-ms-transform-origin': '0% 0%',
        '-o-transform-origin': '0% 0%',
        'transform-origin': '0% 0%',
        'position': 'absolute'
      });
    },
    end: function () {
      this.hasInteraction = false;
      this.sanitize();
      this.update();
    },
    /**
     * Binds all required event listeners
     */
    bindEvents: function () {
      detectGestures(this.container.get(0), this);
      // Zepto and jQuery both know about `on`
      $(window).on('resize', this.update.bind(this));
      $(this.el).find('img').on('load', this.update.bind(this));
    },
    /**
     * Updates the css values according to the current zoom factor and offset
     */
    update: function () {
      if (this.updatePlaned) {
        return;
      }
      this.updatePlaned = true;
      setTimeout(function () {
        this.updatePlaned = false;
        this.updateAspectRatio();
        var zoomFactor = this.getInitialZoomFactor() * this.zoomFactor, offsetX = -this.offset.x / zoomFactor, offsetY = -this.offset.y / zoomFactor, transform3d = 'scale3d(' + zoomFactor + ', ' + zoomFactor + ',1) ' + 'translate3d(' + offsetX + 'px,' + offsetY + 'px,0px)', transform2d = 'scale(' + zoomFactor + ', ' + zoomFactor + ') ' + 'translate(' + offsetX + 'px,' + offsetY + 'px)', removeClone = function () {
            if (this.clone) {
              this.clone.remove();
              delete this.clone;
            }
          }.bind(this);
        // Scale 3d and translate3d are faster (at least on ios)
        // but they also reduce the quality.
        // PinchZoom uses the 3d transformations during interactions
        // after interactions it falls back to 2d transformations
        if (!this.options.use2d || this.hasInteraction || this.inAnimation) {
          this.is3d = true;
          removeClone();
          this.el.css({
            '-webkit-transform': transform3d,
            '-o-transform': transform2d,
            '-ms-transform': transform2d,
            '-moz-transform': transform2d,
            'transform': transform3d
          });
        } else {
          // When changing from 3d to 2d transform webkit has some glitches.
          // To avoid this, a copy of the 3d transformed element is displayed in the
          // foreground while the element is converted from 3d to 2d transform
          if (this.is3d) {
            this.clone = this.el.clone();
            this.clone.css('pointer-events', 'none');
            this.clone.appendTo(this.container);
            setTimeout(removeClone, 200);
          }
          this.el.css({
            '-webkit-transform': transform2d,
            '-o-transform': transform2d,
            '-ms-transform': transform2d,
            '-moz-transform': transform2d,
            'transform': transform2d
          });
          this.is3d = false;
        }
      }.bind(this), 0);
    },
    /**
     * Enables event handling for gestures
     */
    enable: function () {
      this.enabled = true;
    },
    /**
     * Disables event handling for gestures
     */
    disable: function () {
      this.enabled = false;
    }
  };
  var detectGestures = function (el, target) {
    var interaction = null, fingers = 0, lastTouchStart = null, startTouches = null, setInteraction = function (newInteraction, event) {
        if (interaction !== newInteraction) {
          if (interaction && !newInteraction) {
            switch (interaction) {
            case 'zoom':
              target.handleZoomEnd(event);
              break;
            case 'drag':
              target.handleDragEnd(event);
              break;
            }
          }
          switch (newInteraction) {
          case 'zoom':
            target.handleZoomStart(event);
            break;
          case 'drag':
            target.handleDragStart(event);
            break;
          }
        }
        interaction = newInteraction;
      }, updateInteraction = function (event) {
        if (fingers === 2) {
          setInteraction('zoom');
        } else if (fingers === 1 && target.canDrag()) {
          setInteraction('drag', event);
        } else {
          setInteraction(null, event);
        }
      }, targetTouches = function (touches) {
        return Array.prototype.slice.call(touches).map(function (touch) {
          return {
            x: touch.pageX,
            y: touch.pageY
          };
        });
      }, getDistance = function (a, b) {
        var x, y;
        x = a.x - b.x;
        y = a.y - b.y;
        return Math.sqrt(x * x + y * y);
      }, calculateScale = function (startTouches, endTouches) {
        var startDistance = getDistance(startTouches[0], startTouches[1]), endDistance = getDistance(endTouches[0], endTouches[1]);
        return endDistance / startDistance;
      }, cancelEvent = function (event) {
        event.stopPropagation();
        event.preventDefault();
      }, detectDoubleTap = function (event) {
        var time = new Date().getTime();
        if (fingers > 1) {
          lastTouchStart = null;
        }
        if (time - lastTouchStart < 300) {
          cancelEvent(event);
          target.handleDoubleTap(event);
          switch (interaction) {
          case 'zoom':
            target.handleZoomEnd(event);
            break;
          case 'drag':
            target.handleDragEnd(event);
            break;
          }
        }
        if (fingers === 1) {
          lastTouchStart = time;
        }
      }, firstMove = true;
    el.addEventListener('touchstart', function (event) {
      if (target.enabled) {
        firstMove = true;
        fingers = event.touches.length;
        detectDoubleTap(event);
      }
    });
    el.addEventListener('touchmove', function (event) {
      if (target.enabled) {
        if (firstMove) {
          updateInteraction(event);
          if (interaction) {
            cancelEvent(event);
          }
          startTouches = targetTouches(event.touches);
        } else {
          switch (interaction) {
          case 'zoom':
            target.handleZoom(event, calculateScale(startTouches, targetTouches(event.touches)));
            break;
          case 'drag':
            target.handleDrag(event);
            break;
          }
          if (interaction) {
            cancelEvent(event);
            target.update();
          }
        }
        firstMove = false;
      }
    });
    el.addEventListener('touchend', function (event) {
      if (target.enabled) {
        fingers = event.touches.length;
        updateInteraction(event);
      }
    });
  };
  return PinchZoom;
}(jQuery);
fnui_pureview = function ($, UI, PinchZoom, Hammer) {
  var animation = UI.support.animation;
  var transition = UI.support.transition;
  /**
   * PureView
   * @desc Image browser for Mobile
   * @param element
   * @param options
   * @constructor
   */
  var PureView = function (element, options) {
    this.$element = $(element);
    this.$body = $(document.body);
    this.options = $.extend({}, PureView.DEFAULTS, options);
    this.$pureview = $(this.options.tpl).attr('id', UI.utils.generateGUID('fn-pureview'));
    this.$slides = null;
    this.transitioning = null;
    this.scrollbarWidth = 0;
    this.init();
  };
  PureView.DEFAULTS = {
    tpl: '<div class="fn-pureview fn-pureview-bar-active">' + '<ul class="fn-pureview-slider"></ul>' + '<ul class="fn-pureview-direction">' + '<li class="fn-pureview-prev"><a href=""></a></li>' + '<li class="fn-pureview-next"><a href=""></a></li></ul>' + '<ol class="fn-pureview-nav"></ol>' + '<div class="fn-pureview-bar fn-active">' + '<span class="fn-pureview-title"></span>' + '<div class="fn-pureview-counter"><span class="fn-pureview-current"></span> / ' + '<span class="fn-pureview-total"></span></div></div>' + '<div class="fn-pureview-actions fn-active">' + '<a href="javascript: void(0)" class="fn-icon-chevron-left" ' + 'data-fn-close="pureview"></a></div>' + '</div>',
    className: {
      prevSlide: 'fn-pureview-slide-prev',
      nextSlide: 'fn-pureview-slide-next',
      onlyOne: 'fn-pureview-only',
      active: 'fn-active',
      barActive: 'fn-pureview-bar-active',
      activeBody: 'fn-pureview-active'
    },
    selector: {
      slider: '.fn-pureview-slider',
      close: '[data-fn-close="pureview"]',
      total: '.fn-pureview-total',
      current: '.fn-pureview-current',
      title: '.fn-pureview-title',
      actions: '.fn-pureview-actions',
      bar: '.fn-pureview-bar',
      pinchZoom: '.fn-pinch-zoom',
      nav: '.fn-pureview-nav'
    },
    shareBtn: false,
    // press to toggle Toolbar
    toggleToolbar: true,
    // 从何处获取图片，img 可以使用 data-rel 指定大图
    target: 'img',
    weChatImagePreview: true
  };
  PureView.prototype.init = function () {
    var _this = this;
    var options = this.options;
    var $element = this.$element;
    var $pureview = this.$pureview;
    this.refreshSlides();
    $('body').append($pureview);
    this.$title = $pureview.find(options.selector.title);
    this.$current = $pureview.find(options.selector.current);
    this.$bar = $pureview.find(options.selector.bar);
    this.$actions = $pureview.find(options.selector.actions);
    if (options.shareBtn) {
      this.$actions.append('<a href="javascript: void(0)" ' + 'class="fn-icon-share-square-o" data-fn-toggle="share"></a>');
    }
    this.$element.on('click.pureview', options.target, function (e) {
      e.preventDefault();
      var clicked = _this.$images.index(this);
      // Invoke WeChat ImagePreview in WeChat
      // TODO: detect WeChat before init
      if (options.weChatImagePreview && window.WeixinJSBridge) {
        window.WeixinJSBridge.invoke('imagePreview', {
          current: _this.imgUrls[clicked],
          urls: _this.imgUrls
        });
      } else {
        _this.open(clicked);
      }
    });
    $pureview.find('.fn-pureview-direction').on('click.direction.pureview', 'li', function (e) {
      e.preventDefault();
      if ($(this).is('.fn-pureview-prev')) {
        _this.prevSlide();
      } else {
        _this.nextSlide();
      }
    });
    // Nav Contorl
    $pureview.find(options.selector.nav).on('click.nav.pureview', 'li', function () {
      var index = _this.$navItems.index($(this));
      _this.activate(_this.$slides.eq(index));
    });
    // Close Icon
    $pureview.find(options.selector.close).on('click.close.pureview', function (e) {
      e.preventDefault();
      _this.close();
    });
    this.$slider.hammer().on('swipeleft.pureview', function (e) {
      e.preventDefault();
      _this.nextSlide();
    }).on('swiperight.pureview', function (e) {
      e.preventDefault();
      _this.prevSlide();
    }).on('press.pureview', function (e) {
      e.preventDefault();
      options.toggleToolbar && _this.toggleToolBar();
    });
    this.$slider.data('hammer').get('swipe').set({
      direction: Hammer.DIRECTION_HORIZONTAL,
      velocity: 0.35
    });
    // Observe DOM
    $element.DOMObserve({
      childList: true,
      subtree: true
    }, function (mutations, observer) {
    });
    // NOTE:
    // trigger this event manually if MutationObserver not supported
    //   when new images appended, or call refreshSlides()
    // if (!UI.support.mutationobserver) $element.trigger('changed.dom')
    $element.on('changed.dom', function (e) {
      e.stopPropagation();
      _this.refreshSlides();
    });
    $(document).on('keydown.pureview', $.proxy(function (e) {
      var keyCode = e.keyCode;
      if (keyCode == 37) {
        this.prevSlide();
      } else if (keyCode == 39) {
        this.nextSlide();
      } else if (keyCode == 27) {
        this.close();
      }
    }, this));
  };
  PureView.prototype.refreshSlides = function () {
    // update images collections
    this.$images = this.$element.find(this.options.target);
    var _this = this;
    var options = this.options;
    var $pureview = this.$pureview;
    var $slides = $([]);
    var $navItems = $([]);
    var $images = this.$images;
    var total = $images.length;
    this.$slider = $pureview.find(options.selector.slider);
    this.$nav = $pureview.find(options.selector.nav);
    var viewedFlag = 'data-fn-pureviewed';
    // for WeChat Image Preview
    this.imgUrls = this.imgUrls || [];
    if (!total) {
      return;
    }
    if (total === 1) {
      $pureview.addClass(options.className.onlyOne);
    }
    $images.not('[' + viewedFlag + ']').each(function (i, item) {
      var src;
      var title;
      // get image URI from link's href attribute
      if (item.nodeName === 'A') {
        src = item.href;
        // to absolute path
        title = item.title || '';
      } else {
        // NOTE: `data-rel` should be a full URL, otherwise,
        //        WeChat images preview will not work
        src = $(item).data('rel') || item.src;
        // <img src='' data-rel='' />
        src = getAbsoluteUrl(src);
        title = $(item).attr('alt') || '';
      }
      // add pureviewed flag
      item.setAttribute(viewedFlag, '1');
      // hide bar: wechat_webview_type=1
      // http://tmt.io/wechat/  not working?
      _this.imgUrls.push(src);
      $slides = $slides.add($('<li data-src="' + src + '" data-title="' + title + '"></li>'));
      $navItems = $navItems.add($('<li>' + (i + 1) + '</li>'));
    });
    $pureview.find(options.selector.total).text(total);
    this.$slider.append($slides);
    this.$nav.append($navItems);
    this.$navItems = this.$nav.find('li');
    this.$slides = this.$slider.find('li');
  };
  PureView.prototype.loadImage = function ($slide, callback) {
    var appendedFlag = 'image-appended';
    if (!$slide.data(appendedFlag)) {
      var $img = $('<img>', {
        src: $slide.data('src'),
        alt: $slide.data('title')
      });
      $slide.html($img).wrapInner('<div class="fn-pinch-zoom"></div>');
      var $pinchWrapper = $slide.find(this.options.selector.pinchZoom);
      $pinchWrapper.data('fnui.pinchzoom', new PinchZoom($pinchWrapper[0], {}));
      $slide.data('image-appended', true);
    }
    callback && callback.call(this);
  };
  PureView.prototype.activate = function ($slide) {
    var options = this.options;
    var $slides = this.$slides;
    var activeIndex = $slides.index($slide);
    var title = $slide.data('title') || '';
    var active = options.className.active;
    if ($slides.find('.' + active).is($slide)) {
      return;
    }
    if (this.transitioning) {
      return;
    }
    this.loadImage($slide, function () {
      imageLoader($slide.find('img'), function (image) {
        $slide.find('.fn-pinch-zoom').addClass('fn-pureview-loaded');
        $(image).addClass('fn-img-loaded');
      });
    });
    this.transitioning = 1;
    this.$title.text(title);
    this.$current.text(activeIndex + 1);
    $slides.removeClass();
    $slide.addClass(active);
    $slides.eq(activeIndex - 1).addClass(options.className.prevSlide);
    $slides.eq(activeIndex + 1).addClass(options.className.nextSlide);
    this.$navItems.removeClass().eq(activeIndex).addClass(options.className.active);
    if (transition) {
      $slide.one(transition.end, $.proxy(function () {
        this.transitioning = 0;
      }, this)).emulateTransitionEnd(300);
    } else {
      this.transitioning = 0;
    }
  };
  PureView.prototype.nextSlide = function () {
    if (this.$slides.length === 1) {
      return;
    }
    var $slides = this.$slides;
    var $active = $slides.filter('.fn-active');
    var activeIndex = $slides.index($active);
    var rightSpring = 'fn-animation-right-spring';
    if (activeIndex + 1 >= $slides.length) {
      // last one
      animation && $active.addClass(rightSpring).on(animation.end, function () {
        $active.removeClass(rightSpring);
      });
    } else {
      this.activate($slides.eq(activeIndex + 1));
    }
  };
  PureView.prototype.prevSlide = function () {
    if (this.$slides.length === 1) {
      return;
    }
    var $slides = this.$slides;
    var $active = $slides.filter('.fn-active');
    var activeIndex = this.$slides.index($active);
    var leftSpring = 'fn-animation-left-spring';
    if (activeIndex === 0) {
      // first one
      animation && $active.addClass(leftSpring).on(animation.end, function () {
        $active.removeClass(leftSpring);
      });
    } else {
      this.activate($slides.eq(activeIndex - 1));
    }
  };
  PureView.prototype.toggleToolBar = function () {
    this.$pureview.toggleClass(this.options.className.barActive);
  };
  PureView.prototype.open = function (index) {
    var active = index || 0;
    this.checkScrollbar();
    this.setScrollbar();
    this.activate(this.$slides.eq(active));
    this.$pureview.show().addClass(this.options.className.active);
    this.$body.addClass(this.options.className.activeBody);
  };
  PureView.prototype.close = function () {
    var options = this.options;
    this.$pureview.removeClass(options.className.active);
    this.$slides.removeClass();
    function resetBody() {
      this.$pureview.hide();
      this.$body.removeClass(options.className.activeBody);
      this.resetScrollbar();
    }
    if (transition) {
      this.$pureview.one(transition.end, $.proxy(resetBody, this)).emulateTransitionEnd(300);
    } else {
      resetBody.call(this);
    }
  };
  PureView.prototype.checkScrollbar = function () {
    this.scrollbarWidth = measureScrollbar();
  };
  PureView.prototype.setScrollbar = function () {
    var bodyPaddingRight = parseInt(this.$body.css('padding-right') || 0, 10);
    if (this.scrollbarWidth) {
      this.$body.css('padding-right', bodyPaddingRight + this.scrollbarWidth);
    }
  };
  PureView.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '');
  };
  var getAbsoluteUrl = function () {
    var a;
    return function (url) {
      if (!a) {
        a = document.createElement('a');
      }
      a.href = url;
      return a.href;
    };
  }();
  var measureScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) {
      return 0;
    }
    // if ($html.width() >= window.innerWidth) return;
    // var scrollbarWidth = window.innerWidth - $html.width();
    var $measure = $('<div ' + 'style="width: 100px;height: 100px;overflow: scroll;' + 'position: absolute;top: -9999px;"></div>');
    $(document.body).append($measure);
    var scrollbarWidth = $measure[0].offsetWidth - $measure[0].clientWidth;
    $measure.remove();
    return scrollbarWidth;
  };
  var imageLoader = function ($image, callback) {
    function loaded() {
      callback($image[0]);
    }
    function bindLoad() {
      this.one('load', loaded);
      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var src = this.attr('src');
        var param = src.match(/\?/) ? '&' : '?';
        param += 'random=' + new Date().getTime();
        this.attr('src', src + param);
      }
    }
    if (!$image.attr('src')) {
      loaded();
      return;
    }
    if ($image[0].complete || $image[0].readyState === 4) {
      loaded();
    } else {
      bindLoad.call($image);
    }
  };
  UI.plugin('pureview', PureView);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-pureview]', context).pureview();
  });
  return PureView;
}(jQuery, fnui_fnuicore, fnui_pinchzoom, fnui_hammer);
fnui_scrollspy = function ($, UI) {
  var ScrollSpy = function (element, options) {
    if (!UI.support.animation) {
      return;
    }
    this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
    this.$element = $(element);
    var checkViewRAF = function () {
      UI.rAF.call(window, $.proxy(this.checkView, this));
    }.bind(this);
    this.$window = $(window).on('scroll.scrollspy', checkViewRAF).on('resize.scrollspy orientationchange.scrollspy', UI.utils.debounce(checkViewRAF, 50));
    this.timer = this.inViewState = this.initInView = null;
    checkViewRAF();
  };
  ScrollSpy.DEFAULTS = {
    animation: 'fade',
    className: {
      inView: 'fn-scrollspy-inview',
      init: 'fn-scrollspy-init'
    },
    repeat: true,
    delay: 0,
    topOffset: 0,
    leftOffset: 0
  };
  ScrollSpy.prototype.checkView = function () {
    var $element = this.$element;
    var options = this.options;
    var inView = isInView($element, options);
    var animation = options.animation ? ' fn-animation-' + options.animation : '';
    if (inView && !this.inViewState) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (!this.initInView) {
        $element.addClass(options.className.init);
        this.offset = $element.offset();
        this.initInView = true;
        $element.trigger('init.scrollspy');
      }
      this.timer = setTimeout(function () {
        if (inView) {
          $element.addClass(options.className.inView + animation).width();
        }
      }, options.delay);
      this.inViewState = true;
      $element.trigger('inview.scrollspy');
    }
    if (!inView && this.inViewState && options.repeat) {
      $element.removeClass(options.className.inView + animation);
      this.inViewState = false;
      $element.trigger('outview.scrollspy');
    }
  };
  ScrollSpy.prototype.check = function () {
    UI.rAF.call(window, $.proxy(this.checkView, this));
  };
  function isInView(element, options) {
    var $element = $(element);
    var visible = !!($element.width() || $element.height()) && $element.css('display') !== 'none';
    if (!visible) {
      return false;
    }
    var $win = $(window);
    var windowLeft = $win.scrollLeft();
    var windowTop = $win.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;
    options = $.extend({
      topOffset: 0,
      leftOffset: 0
    }, options);
    return top + $element.height() >= windowTop && top - options.topOffset <= windowTop + $win.height() && left + $element.width() >= windowLeft && left - options.leftOffset <= windowLeft + $win.width();
  }
  // Sticky Plugin
  UI.plugin('scrollspy', ScrollSpy);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-scrollspy]', context).scrollspy();
  });
  return ScrollSpy;
}(jQuery, fnui_fnuicore);
fnui_scrollspynav = function ($, UI) {
  var $win = $(window);
  // ScrollSpyNav Class
  var ScrollSpyNav = function (element, options) {
    this.options = $.extend({}, ScrollSpyNav.DEFAULTS, options);
    this.$element = $(element);
    this.anchors = [];
    this.$links = this.$element.find('a[href^="#"]').each(function (i, link) {
      this.anchors.push($(link).attr('href'));
    }.bind(this));
    this.$targets = $(this.anchors.join(', '));
    var processRAF = function () {
      UI.rAF.call(window, $.proxy(this.process, this));
    }.bind(this);
    this.$window = $(window).on('scroll.scrollspynav', processRAF).on('resize.scrollspynav orientationchange.scrollspynav', UI.utils.debounce(processRAF, 50));
    processRAF();
    this.scrollProcess();
  };
  ScrollSpyNav.DEFAULTS = {
    className: { active: 'fn-active' },
    closest: false,
    smooth: true,
    offsetTop: 0
  };
  ScrollSpyNav.prototype.process = function () {
    var scrollTop = this.$window.scrollTop();
    var options = this.options;
    var inViews = [];
    var $links = this.$links;
    var $targets = this.$targets;
    $targets.each(function (i, target) {
      if (isInView(target, options)) {
        inViews.push(target);
      }
    });
    // console.log(inViews.length);
    if (inViews.length) {
      var $target;
      $.each(inViews, function (i, item) {
        if ($(item).offset().top >= scrollTop) {
          $target = $(item);
          return false;  // break
        }
      });
      if (!$target) {
        return;
      }
      if (options.closest) {
        $links.closest(options.closest).removeClass(options.className.active);
        $links.filter('a[href="#' + $target.attr('id') + '"]').closest(options.closest).addClass(options.className.active);
      } else {
        $links.removeClass(options.className.active).filter('a[href="#' + $target.attr('id') + '"]').addClass(options.className.active);
      }
    }
  };
  ScrollSpyNav.prototype.scrollProcess = function () {
    var $links = this.$links;
    var options = this.options;
    // smoothScroll
    if (options.smooth && $.fn.smoothScroll) {
      $links.on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        var $target = $($this.attr('href'));
        if (!$target) {
          return;
        }
        var offsetTop = options.offsetTop && !isNaN(parseInt(options.offsetTop)) && parseInt(options.offsetTop) || 0;
        $(window).smoothScroll({ position: $target.offset().top - offsetTop });
      });
    }
  };
  function isInView(element, options) {
    var $element = $(element);
    var visible = !!($element.width() || $element.height()) && $element.css('display') !== 'none';
    if (!visible) {
      return false;
    }
    var windowLeft = $win.scrollLeft();
    var windowTop = $win.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;
    options = $.extend({
      topOffset: 0,
      leftOffset: 0
    }, options);
    return top + $element.height() >= windowTop && top - options.topOffset <= windowTop + $win.height() && left + $element.width() >= windowLeft && left - options.leftOffset <= windowLeft + $win.width();
  }
  // ScrollSpyNav Plugin
  UI.plugin('scrollspynav', ScrollSpyNav);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-scrollspy-nav]', context).scrollspynav();
  });
  return ScrollSpyNav;
}(jQuery, fnui_fnuicore);
fnui_select = function ($, UI) {
  // Make jQuery :contains Case-Insensitive
  $.expr[':'].containsNC = function (elem, i, match, array) {
    return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || '').toLowerCase()) >= 0;
  };
  var Selected = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Selected.DEFAULTS, { placeholder: element.getAttribute('placeholder') || Selected.DEFAULTS.placeholder }, options);
    this.$originalOptions = this.$element.find('option');
    this.multiple = element.multiple;
    this.$selector = null;
    this.initialized = false;
    this.init();
  };
  Selected.DEFAULTS = {
    btnWidth: null,
    btnSize: null,
    btnStyle: 'default',
    dropUp: 0,
    maxHeight: null,
    maxChecked: null,
    placeholder: '点击选择...',
    selectedClass: 'fn-checked',
    disabledClass: 'fn-disabled',
    searchBox: false,
    tpl: '<div class="fn-selected fn-dropdown ' + '<%= dropUp ? \'fn-dropdown-up\': \'\' %>" id="<%= id %>" data-fn-dropdown>' + '  <button type="button" class="fn-selected-btn fn-btn fn-dropdown-toggle">' + '    <span class="fn-selected-status fn-fl"></span>' + '    <i class="fn-selected-icon fn-icon-caret-' + '<%= dropUp ? \'up\' : \'down\' %>"></i>' + '  </button>' + '  <div class="fn-selected-content fn-dropdown-content">' + '    <h2 class="fn-selected-header">' + '<span class="fn-icon-chevron-left">返回</span></h2>' + '   <% if (searchBox) { %>' + '   <div class="fn-selected-search">' + '     <input autocomplete="off" class="fn-form-field fn-input-sm" />' + '   </div>' + '   <% } %>' + '    <ul class="fn-selected-list">' + '      <% for (var i = 0; i < options.length; i++) { %>' + '       <% var option = options[i] %>' + '       <% if (option.header) { %>' + '  <li data-group="<%= option.group %>" class="fn-selected-list-header">' + '       <%= option.text %></li>' + '       <% } else { %>' + '       <li class="<%= option.classNames%>" ' + '         data-index="<%= option.index %>" ' + '         data-group="<%= option.group || 0 %>" ' + '         data-value="<%= option.value %>" >' + '         <span class="fn-selected-text"><%= option.text %></span>' + '         <i class="fn-icon-check"></i></li>' + '      <% } %>' + '      <% } %>' + '    </ul>' + '    <div class="fn-selected-hint"></div>' + '  </div>' + '</div>',
    listTpl: '<% for (var i = 0; i < options.length; i++) { %>' + '       <% var option = options[i] %>' + '       <% if (option.header) { %>' + '  <li data-group="<%= option.group %>" class="fn-selected-list-header">' + '       <%= option.text %></li>' + '       <% } else { %>' + '       <li class="<%= option.classNames %>" ' + '         data-index="<%= option.index %>" ' + '         data-group="<%= option.group || 0 %>" ' + '         data-value="<%= option.value %>" >' + '         <span class="fn-selected-text"><%= option.text %></span>' + '         <i class="fn-icon-check"></i></li>' + '      <% } %>' + '      <% } %>'
  };
  Selected.prototype.init = function () {
    var _this = this;
    var $element = this.$element;
    var options = this.options;
    $element.hide();
    var data = {
      id: Selected.generateGUID(),
      multiple: this.multiple,
      options: [],
      searchBox: options.searchBox,
      dropUp: options.dropUp,
      placeholder: options.placeholder
    };
    this.$selector = $(Selected.template(this.options.tpl, data));
    // set select button styles
    this.$selector.css({ width: this.options.btnWidth });
    if (this.$element[0].disabled) {
      this.$selector.addClass(options.disabledClass);
    }
    this.$list = this.$selector.find('.fn-selected-list');
    this.$searchField = this.$selector.find('.fn-selected-search input');
    this.$hint = this.$selector.find('.fn-selected-hint');
    var $selectorBtn = this.$selector.find('.fn-selected-btn');
    var btnClassNames = [];
    options.btnSize && btnClassNames.push('fn-btn-' + options.btnSize);
    options.btnStyle && btnClassNames.push('fn-btn-' + options.btnStyle);
    $selectorBtn.addClass(btnClassNames.join(' '));
    this.$selector.dropdown({ justify: $selectorBtn });
    // set list height
    if (options.maxHeight) {
      this.$selector.find('.fn-selected-list').css({
        'max-height': options.maxHeight,
        'overflow-y': 'scroll'
      });
    }
    // set hint text
    var hint = [];
    var min = $element.attr('minchecked');
    var max = $element.attr('maxchecked') || options.maxChecked;
    this.maxChecked = max || Infinity;
    if ($element[0].required) {
      hint.push('必选');
    }
    if (min || max) {
      min && hint.push('至少选择 ' + min + ' 项');
      max && hint.push('至多选择 ' + max + ' 项');
    }
    this.$hint.text(hint.join('\uFF0C'));
    // render dropdown list
    this.renderOptions();
    // append $selector after <select>
    this.$element.after(this.$selector);
    this.dropdown = this.$selector.data('fnui.dropdown');
    this.$status = this.$selector.find('.fn-selected-status');
    // #try to fixes #476
    setTimeout(function () {
      _this.syncData();
      _this.initialized = true;
    }, 0);
    this.bindEvents();
  };
  Selected.prototype.renderOptions = function () {
    var $element = this.$element;
    var options = this.options;
    var optionItems = [];
    var $optgroup = $element.find('optgroup');
    this.$originalOptions = this.$element.find('option');
    // 单选框使用 JS 禁用已经选择的 option 以后，
    // 浏览器会重新选定第一个 option，但有一定延迟，致使 JS 获取 value 时返回 null
    if (!this.multiple && $element.val() === null) {
      this.$originalOptions.length && (this.$originalOptions.get(0).selected = true);
    }
    function pushOption(index, item, group) {
      if (item.value === '') {
        // skip to next iteration
        // @see http://stackoverflow.com/questions/481601/how-to-skip-to-next-iteration-in-jQuery-each-util
        return true;
      }
      var classNames = '';
      item.disabled && (classNames += options.disabledClass);
      !item.disabled && item.selected && (classNames += options.selectedClass);
      optionItems.push({
        group: group,
        index: index,
        classNames: classNames,
        text: item.text,
        value: item.value
      });
    }
    // select with option groups
    if ($optgroup.length) {
      $optgroup.each(function (i) {
        // push group name
        optionItems.push({
          header: true,
          group: i + 1,
          text: this.label
        });
        $optgroup.eq(i).find('option').each(function (index, item) {
          pushOption(index, item, i);
        });
      });
    } else {
      // without option groups
      this.$originalOptions.each(function (index, item) {
        pushOption(index, item, null);
      });
    }
    this.$list.html(Selected.template(options.listTpl, { options: optionItems }));
    this.$shadowOptions = this.$list.find('> li').not('.fn-selected-list-header');
  };
  Selected.prototype.setChecked = function (item) {
    var options = this.options;
    var $item = $(item);
    var isChecked = $item.hasClass(options.selectedClass);
    if (this.multiple) {
      // multiple
      var checkedLength = this.$list.find('.' + options.selectedClass).length;
      if (!isChecked && this.maxChecked <= checkedLength) {
        this.$element.trigger('checkedOverflow.selected', { selected: this });
        return false;
      }
    } else {
      if (isChecked) {
        return false;
      }
      this.dropdown.close();
      this.$shadowOptions.not($item).removeClass(options.selectedClass);
    }
    $item.toggleClass(options.selectedClass);
    this.syncData(item);
  };
  /**
   * syncData
   * @desc if `item` set, only sync `item` related option
   * @param {Object} item
   */
  Selected.prototype.syncData = function (item) {
    var _this = this;
    var options = this.options;
    var status = [];
    var $checked = $([]);
    this.$shadowOptions.filter('.' + options.selectedClass).each(function () {
      var $this = $(this);
      status.push($this.find('.fn-selected-text').text());
      if (!item) {
        $checked = $checked.add(_this.$originalOptions.filter('[value="' + $this.data('value') + '"]').prop('selected', true));
      }
    });
    if (item) {
      var $item = $(item);
      this.$originalOptions.filter('[value="' + $item.data('value') + '"]').prop('selected', $item.hasClass(options.selectedClass));
    } else {
      this.$originalOptions.not($checked).prop('selected', false);
    }
    // nothing selected
    if (!this.$element.val()) {
      status = [options.placeholder];
    }
    this.$status.text(status.join(', '));
    // Do not trigger change event on initializing
    this.initialized && this.$element.trigger('change');
  };
  Selected.prototype.bindEvents = function () {
    var _this = this;
    var header = 'fn-selected-list-header';
    var handleKeyup = UI.utils.debounce(function (e) {
      _this.$shadowOptions.not('.' + header).hide().filter(':containsNC("' + e.target.value + '")').show();
    }, 100);
    this.$list.on('click', '> li', function (e) {
      var $this = $(this);
      !$this.hasClass(_this.options.disabledClass) && !$this.hasClass(header) && _this.setChecked(this);
    });
    // simple search with jQuery :contains
    this.$searchField.on('keyup.selected', handleKeyup);
    // empty search keywords
    this.$selector.on('closed.dropdown', function () {
      _this.$searchField.val('');
      _this.$shadowOptions.css({ display: '' });
    });
    // work with Validator
    // @since 2.5
    this.$element.on('validated.field.validator', function (e) {
      if (e.validity) {
        var valid = e.validity.valid;
        var errorClassName = 'fn-invalid';
        _this.$selector[(!valid ? 'add' : 'remove') + 'Class'](errorClassName);
      }
    });
    // observe DOM
    if (UI.support.mutationobserver) {
      this.observer = new UI.support.mutationobserver(function () {
        _this.$element.trigger('changed.selected');
      });
      this.observer.observe(this.$element[0], {
        childList: true,
        attributes: true,
        subtree: true,
        characterData: true
      });
    }
    // custom event
    this.$element.on('changed.selected', function () {
      _this.renderOptions();
      _this.syncData();
    });
  };
  // @since: 2.5
  Selected.prototype.select = function (item) {
    var $item;
    if (typeof item === 'number') {
      $item = this.$list.find('> li').not('.fn-selected-list-header').eq(item);
    } else if (typeof item === 'string') {
      $item = this.$list.find(item);
    } else {
      $item = $(item);
    }
    $item.trigger('click');
  }, // @since: 2.5
  Selected.prototype.enable = function () {
    this.$element.prop('disable', false);
    this.$selector.dropdown('enable');
  }, // @since: 2.5
  Selected.prototype.disable = function () {
    this.$element.prop('disable', true);
    this.$selector.dropdown('disable');
  }, Selected.prototype.destroy = function () {
    this.$element.removeData('fnui.selected').show();
    this.$selector.remove();
  };
  Selected.generateGUID = function (namespace) {
    var uid = namespace + '-' || 'fn-';
    do {
      uid += Math.random().toString(36).substring(2, 7);
    } while (document.getElementById(uid));
    return uid;
  };
  Selected.template = function (id, data) {
    var me = Selected.template;
    if (!me.cache[id]) {
      me.cache[id] = function () {
        var name = id;
        var string = /^[\w\-]+$/.test(id) ? me.get(id) : (name = 'template(string)', id);
        // no warnings
        var line = 1;
        var body = ('try { ' + (me.variable ? 'var ' + me.variable + ' = this.stash;' : 'with (this.stash) { ') + 'this.ret += \'' + string.replace(/<%/g, '\x11').replace(/%>/g, '\x13').replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27').replace(/^\s*|\s*$/g, '').replace(/\n/g, function () {
          return '\';\nthis.line = ' + ++line + '; this.ret += \'\\n';
        }).replace(/\x11-(.+?)\x13/g, '\' + ($1) + \'').replace(/\x11=(.+?)\x13/g, '\' + this.escapeHTML($1) + \'').replace(/\x11(.+?)\x13/g, '\'; $1; this.ret += \'') + '\'; ' + (me.variable ? '' : '}') + 'return this.ret;' + '} catch (e) { throw \'TemplateError: \' + e + \' (on ' + name + '\' + \' line \' + this.line + \')\'; } ' + '//@ sourceURL=' + name + '\n'  // source map
).replace(/this\.ret \+= '';/g, '');
        /* jshint -W054 */
        var func = new Function(body);
        var map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&#x22;',
          '\'': '&#x27;'
        };
        var escapeHTML = function (string) {
          return ('' + string).replace(/[&<>\'\"]/g, function (_) {
            return map[_];
          });
        };
        return function (stash) {
          return func.call(me.context = {
            escapeHTML: escapeHTML,
            line: 1,
            ret: '',
            stash: stash
          });
        };
      }();
    }
    return data ? me.cache[id](data) : me.cache[id];
  };
  /* jshint +W109 */
  /* jshint +W054 */
  Selected.template.cache = {};
  Selected.template.get = function (id) {
    if (id) {
      var element = document.getElementById(id);
      return element && element.innerHTML || '';
    }
  };
  UI.plugin('selected', Selected);
  UI.ready(function (context) {
    $('[data-fn-selected]', context).selected();
  });
  return Selected;
}(jQuery, fnui_fnuicore);
fnui_slider = function ($, UI) {
  // FlexSlider: Object Instance
  $.flexslider = function (el, options) {
    var slider = $(el);
    // making variables public
    slider.vars = $.extend({}, $.flexslider.defaults, options);
    var namespace = 'fn-', msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture, touch = ('ontouchstart' in window || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
      //eventType = (touch) ? "touchend" : "click",
      eventType = 'click touchend MSPointerUp', watchedEvent = '', watchedEventClearTimer, vertical = slider.vars.direction === 'vertical', carousel = slider.vars.itemWidth > 0, fade = slider.vars.animation === 'fade', methods = {}, focused = true;
    // Store a reference to the slider object
    $.data(el, 'flexslider', slider);
    // Private slider methods
    methods = {
      init: function () {
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt(slider.vars.startAt ? slider.vars.startAt : 0, 10);
        if (isNaN(slider.currentSlide)) {
          slider.currentSlide = 0;
        }
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = slider.currentSlide === 0 || slider.currentSlide === slider.last;
        slider.containerSelector = slider.vars.selector.substr(0, slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SLIDE:
        if (slider.vars.animation === 'slide') {
          slider.vars.animation = 'swing';
        }
        slider.prop = vertical ? 'top' : 'marginLeft';
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && function () {
          var obj = document.createElement('div'), props = [
              'perspectiveProperty',
              'WebkitPerspective',
              'MozPerspective',
              'OPerspective',
              'msPerspective'
            ];
          for (var i in props) {
            if (obj.style[props[i]] !== undefined) {
              slider.pfx = props[i].replace('Perspective', '').toLowerCase();
              slider.prop = '-' + slider.pfx + '-transform';
              return true;
            }
          }
          return false;
        }();
        slider.ensureAnimationEnd = '';
        slider.doMath();
        // INIT
        slider.setup('init');
        // CONTROLNAV:
        if (slider.vars.controlNav) {
          methods.controlNav.setup();
        }
        // DIRECTIONNAV:
        if (slider.vars.directionNav) {
          methods.directionNav.setup();
        }
        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) {
          methods.pauseInvisible.init();
        }
        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function () {
              if (!slider.manualPlay && !slider.manualPause) {
                slider.pause();
              }
            }, function () {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) {
                slider.play();
              }
            });
          }
          // initialize animation
          // If we're visible, or we don't use PageVisibility API
          if (!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            slider.vars.initDelay > 0 ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
          }
        }
        // TOUCH
        if (touch && slider.vars.touch) {
          methods.touch();
        }
        slider.find('img').attr('draggable', 'false');
        // API: start() Callback
        setTimeout(function () {
          slider.vars.start(slider);
        }, 200);
      },
      controlNav: {
        setup: function () {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else {
            // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function () {
          var type = slider.vars.controlNav === 'thumbnails' ? 'control-thumbs' : 'control-paging', j = 1, item, slide;
          slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');
          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              item = slider.vars.controlNav === 'thumbnails' ? '<img src="' + slide.attr('data-thumb') + '"/>' : '<a>' + j + '</a>';
              slider.controlNavScaffold.append('<li>' + item + '<i></i></li>');
              j++;
            }
          }
          // CONTROLSCONTAINER:
          slider.append(slider.controlNavScaffold);
          methods.controlNav.set();
          methods.controlNav.active();
          slider.controlNavScaffold.delegate('a, img', eventType, function (event) {
            event.preventDefault();
            if (watchedEvent === '' || watchedEvent === event.type) {
              var $this = $(this), target = slider.controlNav.index($this);
              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = target > slider.currentSlide ? 'next' : 'prev';
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }
            // setup flags to prevent event duplication
            if (watchedEvent === '') {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        setupManual: function () {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();
          slider.controlNav.bind(eventType, function (event) {
            event.preventDefault();
            if (watchedEvent === '' || watchedEvent === event.type) {
              var $this = $(this), target = slider.controlNav.index($this);
              if (!$this.hasClass(namespace + 'active')) {
                target > slider.currentSlide ? slider.direction = 'next' : slider.direction = 'prev';
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }
            // setup flags to prevent event duplication
            if (watchedEvent === '') {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function () {
          var selector = slider.vars.controlNav === 'thumbnails' ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, slider.controlsContainer ? slider.controlsContainer : slider);
        },
        active: function () {
          slider.controlNav.removeClass(namespace + 'active').eq(slider.animatingTo).addClass(namespace + 'active');
        },
        update: function (action, pos) {
          if (slider.pagingCount > 1 && action === 'add') {
            slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function () {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li class="' + namespace + 'nav-prev"><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li class="' + namespace + 'nav-next"><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');
          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }
          methods.directionNav.update();
          slider.directionNav.bind(eventType, function (event) {
            event.preventDefault();
            var target;
            if (watchedEvent === '' || watchedEvent === event.type) {
              target = $(this).hasClass(namespace + 'next') ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
            // setup flags to prevent event duplication
            if (watchedEvent === '') {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function () {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + 'prev').addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + 'next').addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function () {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');
          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }
          methods.pausePlay.update(slider.vars.slideshow ? namespace + 'pause' : namespace + 'play');
          slider.pausePlay.bind(eventType, function (event) {
            event.preventDefault();
            if (watchedEvent === '' || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }
            // setup flags to prevent event duplication
            if (watchedEvent === '') {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function (state) {
          state === 'play' ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function () {
        var startX, startY, offset, cwidth, dx, startT, scrolling = false, localX = 0, localY = 0, accDx = 0;
        if (!msGesture) {
          el.addEventListener('touchstart', onTouchStart, false);
          function onTouchStart(e) {
            if (slider.animating) {
              e.preventDefault();
            } else if (window.navigator.msPointerEnabled || e.touches.length === 1) {
              slider.pause();
              // CAROUSEL:
              cwidth = vertical ? slider.h : slider.w;
              startT = Number(new Date());
              // CAROUSEL:
              // Local vars for X and Y points.
              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;
              offset = carousel && slider.currentSlide === slider.last ? slider.limit : carousel ? (slider.itemW + slider.vars.itemMargin) * slider.move * slider.currentSlide : (slider.currentSlide + slider.cloneOffset) * cwidth;
              startX = vertical ? localY : localX;
              startY = vertical ? localX : localY;
              el.addEventListener('touchmove', onTouchMove, false);
              el.addEventListener('touchend', onTouchEnd, false);
            }
          }
          function onTouchMove(e) {
            // Local vars for X and Y points.
            localX = e.touches[0].pageX;
            localY = e.touches[0].pageY;
            dx = vertical ? startX - localY : startX - localX;
            scrolling = vertical ? Math.abs(dx) < Math.abs(localX - startY) : Math.abs(dx) < Math.abs(localY - startY);
            var fxms = 500;
            if (!scrolling || Number(new Date()) - startT > fxms) {
              e.preventDefault();
              if (!fade && slider.transitions) {
                if (!slider.vars.animationLoop) {
                  dx = dx / (slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0 ? Math.abs(dx) / cwidth + 2 : 1);
                }
                slider.setProps(offset + dx, 'setTouch');
              }
            }
          }
          function onTouchEnd(e) {
            // finish the touch by undoing the touch session
            el.removeEventListener('touchmove', onTouchMove, false);
            if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
              var updateDx = dx, target = updateDx > 0 ? slider.getTarget('next') : slider.getTarget('prev');
              if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              } else {
                if (!fade) {
                  slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
            }
            el.removeEventListener('touchend', onTouchEnd, false);
            startX = null;
            startY = null;
            dx = null;
            offset = null;
          }
        } else {
          el.style.msTouchAction = 'none';
          el._gesture = new MSGesture();
          el._gesture.target = el;
          el.addEventListener('MSPointerDown', onMSPointerDown, false);
          el._slider = slider;
          el.addEventListener('MSGestureChange', onMSGestureChange, false);
          el.addEventListener('MSGestureEnd', onMSGestureEnd, false);
          function onMSPointerDown(e) {
            e.stopPropagation();
            if (slider.animating) {
              e.preventDefault();
            } else {
              slider.pause();
              el._gesture.addPointer(e.pointerId);
              accDx = 0;
              cwidth = vertical ? slider.h : slider.w;
              startT = Number(new Date());
              // CAROUSEL:
              offset = carousel && slider.currentSlide === slider.last ? slider.limit : carousel ? (slider.itemW + slider.vars.itemMargin) * slider.move * slider.currentSlide : (slider.currentSlide + slider.cloneOffset) * cwidth;
            }
          }
          function onMSGestureChange(e) {
            e.stopPropagation();
            var slider = e.target._slider;
            if (!slider) {
              return;
            }
            var transX = -e.translationX, transY = -e.translationY;
            //Accumulate translations.
            accDx = accDx + (vertical ? transY : transX);
            dx = accDx;
            scrolling = vertical ? Math.abs(accDx) < Math.abs(-transX) : Math.abs(accDx) < Math.abs(-transY);
            if (e.detail === e.MSGESTURE_FLAG_INERTIA) {
              setImmediate(function () {
                el._gesture.stop();
              });
              return;
            }
            if (!scrolling || Number(new Date()) - startT > 500) {
              e.preventDefault();
              if (!fade && slider.transitions) {
                if (!slider.vars.animationLoop) {
                  dx = accDx / (slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0 ? Math.abs(accDx) / cwidth + 2 : 1);
                }
                slider.setProps(offset + dx, 'setTouch');
              }
            }
          }
          function onMSGestureEnd(e) {
            e.stopPropagation();
            var slider = e.target._slider;
            if (!slider) {
              return;
            }
            if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
              var updateDx = dx, target = updateDx > 0 ? slider.getTarget('next') : slider.getTarget('prev');
              if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              } else {
                if (!fade) {
                  slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
            }
            startX = null;
            startY = null;
            dx = null;
            offset = null;
            accDx = 0;
          }
        }
      },
      uniqueID: function ($clone) {
        // Append _clone to current level and children elements with id attributes
        $clone.filter('[id]').add($clone.find('[id]')).each(function () {
          var $this = $(this);
          $this.attr('id', $this.attr('id') + '_clone');
        });
        return $clone;
      },
      pauseInvisible: {
        visProp: null,
        init: function () {
          var visProp = methods.pauseInvisible.getHiddenProp();
          if (visProp) {
            var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
            document.addEventListener(evtname, function () {
              if (methods.pauseInvisible.isHidden()) {
                if (slider.startTimeout) {
                  clearTimeout(slider.startTimeout);  //If clock is ticking, stop timer and prevent from starting while invisible
                } else {
                  slider.pause();  //Or just pause
                }
              } else {
                if (slider.started) {
                  slider.play();  //Initiated before, just play
                } else {
                  if (slider.vars.initDelay > 0) {
                    setTimeout(slider.play, slider.vars.initDelay);
                  } else {
                    slider.play();  //Didn't init before: simply init or wait for it
                  }
                }
              }
            });
          }
        },
        isHidden: function () {
          var prop = methods.pauseInvisible.getHiddenProp();
          if (!prop) {
            return false;
          }
          return document[prop];
        },
        getHiddenProp: function () {
          var prefixes = [
            'webkit',
            'moz',
            'ms',
            'o'
          ];
          // if 'hidden' is natively supported just return it
          if ('hidden' in document) {
            return 'hidden';
          }
          // otherwise loop over all the known prefixes until we find one
          for (var i = 0; i < prefixes.length; i++) {
            if (prefixes[i] + 'Hidden' in document) {
              return prefixes[i] + 'Hidden';
            }
          }
          // otherwise it's not supported
          return null;
        }
      },
      setToClearWatchedEvent: function () {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function () {
          watchedEvent = '';
        }, 3000);
      }
    };
    // public methods
    slider.flexAnimate = function (target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = target > slider.currentSlide ? 'next' : 'prev';
      }
      if (slider.pagingCount === 1)
        slider.direction = slider.currentItem < target ? 'next' : 'prev';
      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(':visible')) {
        if (withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = slider.currentItem < target ? 'next' : 'prev';
          master.direction = slider.direction;
          if (Math.ceil((target + 1) / slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');
            target = Math.floor(target / slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');
            return false;
          }
        }
        slider.animating = true;
        slider.animatingTo = target;
        // SLIDESHOW:
        if (pause) {
          slider.pause();
        }
        // CONTROLNAV
        if (slider.vars.controlNav) {
          methods.controlNav.active();
        }
        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) {
          slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');
        }
        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;
        // DIRECTIONNAV:
        if (slider.vars.directionNav) {
          methods.directionNav.update();
        }
        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) {
            slider.pause();
          }
        }
        // SLIDE:
        if (!fade) {
          var dimension = vertical ? slider.slides.filter(':first').height() : slider.computedW, margin, slideString, calcNext;
          // INFINITE LOOP / REVERSE:
          if (carousel) {
            //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
            margin = slider.vars.itemMargin;
            calcNext = (slider.itemW + margin) * slider.move * slider.animatingTo;
            slideString = calcNext > slider.limit && slider.visible !== 1 ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== 'next') {
            slideString = 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== 'prev') {
            slideString = (slider.count + 1) * dimension;
          } else {
            slideString = (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, '', slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }
            // Unbind previous transitionEnd events and re-bind new transitionEnd event
            slider.container.unbind('webkitTransitionEnd transitionend');
            slider.container.bind('webkitTransitionEnd transitionend', function () {
              clearTimeout(slider.ensureAnimationEnd);
              slider.wrapup(dimension);
            });
            // Insurance for the ever-so-fickle transitionEnd event
            clearTimeout(slider.ensureAnimationEnd);
            slider.ensureAnimationEnd = setTimeout(function () {
              slider.wrapup(dimension);
            }, slider.vars.animationSpeed + 100);
          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function () {
              slider.wrapup(dimension);
            });
          }
        } else {
          // FADE:
          if (!touch) {
            slider.slides.eq(slider.currentSlide).css({ 'zIndex': 1 }).animate({ 'opacity': 0 }, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({ 'zIndex': 2 }).animate({ 'opacity': 1 }, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);
          } else {
            slider.slides.eq(slider.currentSlide).css({
              'opacity': 0,
              'zIndex': 1
            });
            slider.slides.eq(target).css({
              'opacity': 1,
              'zIndex': 2
            });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) {
          methods.smoothHeight(slider.vars.animationSpeed);
        }
      }
    };
    slider.wrapup = function (dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, 'jumpEnd');
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, 'jumpStart');
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
    };
    // SLIDESHOW:
    slider.animateSlides = function () {
      if (!slider.animating && focused) {
        slider.flexAnimate(slider.getTarget('next'));
      }
    };
    // SLIDESHOW:
    slider.pause = function () {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) {
        methods.pausePlay.update('play');
      }
      // SYNC:
      if (slider.syncExists) {
        methods.sync('pause');
      }
    };
    // SLIDESHOW:
    slider.play = function () {
      if (slider.playing) {
        clearInterval(slider.animatedSlides);
      }
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) {
        methods.pausePlay.update('pause');
      }
      // SYNC:
      if (slider.syncExists) {
        methods.sync('play');
      }
    };
    // STOP:
    slider.stop = function () {
      slider.pause();
      slider.stopped = true;
    };
    slider.canAdvance = function (target, fromNav) {
      var last = slider.last;
      return fromNav ? true : slider.currentItem === slider.count - 1 && target === 0 && slider.direction === 'prev' ? true : slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== 'next' ? false : slider.vars.animationLoop ? true : slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== 'next' ? false : slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === 'next' ? false : true;
    };
    slider.getTarget = function (dir) {
      slider.direction = dir;
      if (dir === 'next') {
        return slider.currentSlide === slider.last ? 0 : slider.currentSlide + 1;
      } else {
        return slider.currentSlide === 0 ? slider.last : slider.currentSlide - 1;
      }
    };
    // SLIDE:
    slider.setProps = function (pos, special, dur) {
      var target = function () {
        var posCheck = pos ? pos : (slider.itemW + slider.vars.itemMargin) * slider.move * slider.animatingTo, posCalc = function () {
            if (carousel) {
              return special === 'setTouch' ? pos : slider.animatingTo === slider.last ? slider.limit : posCheck;
            } else {
              switch (special) {
              case 'setTotal':
                return (slider.currentSlide + slider.cloneOffset) * pos;
              case 'setTouch':
                return pos;
              case 'jumpEnd':
                return slider.count * pos;
              case 'jumpStart':
                return pos;
              default:
                return pos;
              }
            }
          }();
        return posCalc * -1 + 'px';
      }();
      if (slider.transitions) {
        target = vertical ? 'translate3d(0,' + target + ',0)' : 'translate3d(' + target + ',0,0)';
        dur = dur !== undefined ? dur / 1000 + 's' : '0s';
        slider.container.css('-' + slider.pfx + '-transition-duration', dur);
        slider.container.css('transition-duration', dur);
      }
      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) {
        slider.container.css(slider.args);
      }
      slider.container.css('transform', target);
    };
    slider.setup = function (type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;
        if (type === 'init') {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({
            'overflow': 'hidden',
            'position': 'relative'
          }).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== 'init') {
            slider.container.find('.clone').remove();
          }
          slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true')).prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
        }
        slider.newSlides = $(slider.vars.selector, slider);
        sliderOffset = slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + '%').css('position', 'absolute').width('100%');
          setTimeout(function () {
            slider.newSlides.css({ 'display': 'block' });
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, 'init');
          }, type === 'init' ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + '%');
          slider.setProps(sliderOffset * slider.computedW, 'init');
          setTimeout(function () {
            slider.doMath();
            slider.newSlides.css({
              'width': slider.computedW,
              'float': 'left',
              'display': 'block'
            });
          }, type === 'init' ? 100 : 0);
        }
      } else {
        // FADE:
        slider.slides.css({
          'width': '100%',
          'float': 'left',
          'marginRight': '-100%',
          'position': 'relative'
        });
        if (type === 'init') {
          if (!touch) {
            slider.slides.css({
              'opacity': 0,
              'display': 'block',
              'zIndex': 1
            }).eq(slider.currentSlide).css({ 'zIndex': 2 }).animate({ 'opacity': 1 }, slider.vars.animationSpeed, slider.vars.easing);
          } else {
            slider.slides.css({
              'opacity': 0,
              'display': 'block',
              'webkitTransition': 'opacity ' + slider.vars.animationSpeed / 1000 + 's ease',
              'zIndex': 1
            }).eq(slider.currentSlide).css({
              'opacity': 1,
              'zIndex': 2
            });
          }
        }
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) {
        slider.slides.removeClass(namespace + 'active-slide').eq(slider.currentSlide).addClass(namespace + 'active-slide');
      }
      //FlexSlider: init() Callback
      slider.vars.init(slider);
    };
    slider.doMath = function () {
      var slide = slider.slides.first(), slideMargin = slider.vars.itemMargin, minItems = slider.vars.minItems, maxItems = slider.vars.maxItems;
      slider.w = slider.viewport === undefined ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();
      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.minW = minItems ? minItems * slider.itemT : slider.w;
        slider.maxW = maxItems ? maxItems * slider.itemT - slideMargin : slider.w;
        slider.itemW = slider.minW > slider.w ? (slider.w - slideMargin * (minItems - 1)) / minItems : slider.maxW < slider.w ? (slider.w - slideMargin * (maxItems - 1)) / maxItems : slider.vars.itemWidth > slider.w ? slider.w : slider.vars.itemWidth;
        slider.visible = Math.floor(slider.w / slider.itemW);
        slider.move = slider.vars.move > 0 && slider.vars.move < slider.visible ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil((slider.count - slider.visible) / slider.move + 1);
        slider.last = slider.pagingCount - 1;
        slider.limit = slider.pagingCount === 1 ? 0 : slider.vars.itemWidth > slider.w ? slider.itemW * (slider.count - 1) + slideMargin * (slider.count - 1) : (slider.itemW + slideMargin) * slider.count - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
    };
    slider.update = function (pos, action) {
      slider.doMath();
      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }
      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if (action === 'add' && !carousel || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update('add');
        } else if (action === 'remove' && !carousel || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update('remove', slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) {
        methods.directionNav.update();
      }
    };
    slider.addSlide = function (obj, pos) {
      var $obj = $(obj);
      slider.count += 1;
      slider.last = slider.count - 1;
      // append new slide
      pos !== undefined ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, 'add');
      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();
      //FlexSlider: added() Callback
      slider.vars.added(slider);
    };
    slider.removeSlide = function (obj) {
      var pos = isNaN(obj) ? slider.slides.index($(obj)) : obj;
      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;
      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        slider.slides.eq(obj).remove();
      }
      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, 'remove');
      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();
      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    };
    // Ensure the slider isn't focussed if the window loses focus.
    $(window).blur(function (e) {
      focused = false;
    }).focus(function (e) {
      focused = true;
    });
    //FlexSlider: Initialize
    methods.init();
  };
  // FlexSlider: Default Settings
  $.flexslider.defaults = {
    selector: '.fn-slides > li',
    // {NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    pauseInvisible: true,
    // {NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    animation: 'slide',
    // String: Select your animation type, 'fade' or 'slide'
    easing: 'swing',
    // {NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: 'horizontal',
    // String: Select the sliding direction, "horizontal" or "vertical"
    animationLoop: true,
    // Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    startAt: 0,
    // Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,
    // Boolean: Animate slider automatically
    slideshowSpeed: 5000,
    // Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,
    // Integer: Set the speed of animations, in milliseconds
    initDelay: 0,
    // {NEW} Integer: Set an initialization delay, in milliseconds
    // Usability features
    pauseOnAction: true,
    // Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,
    // Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    useCSS: true,
    // {NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,
    // {NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,
    // {NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches
    // Primary Controls
    controlNav: true,
    // Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
    directionNav: true,
    // Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: 'prev',
    // String: Set the text for the "previous" directionNav item
    nextText: 'next',
    // String: Set the text for the "next" directionNav item
    // Carousel Options
    itemWidth: 0,
    // {NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,
    // {NEW} Integer: Margin between carousel items.
    minItems: 1,
    // {NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,
    // {NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    // Callback API
    start: function () {
    },
    // Callback: function(slider) - Fires when the slider loads the first slide
    before: function () {
    },
    // Callback: function(slider) - Fires asynchronously with each slider animation
    after: function () {
    },
    // Callback: function(slider) - Fires after each slider animation completes
    end: function () {
    },
    // Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function () {
    },
    // {NEW} Callback: function(slider) - Fires after a slide is added
    removed: function () {
    },
    // {NEW} Callback: function(slider) - Fires after a slide is removed
    init: function () {
    }  // {NEW} Callback: function(slider) - Fires after the slider is initially setup
  };
  // FlexSlider: Plugin Function
  $.fn.flexslider = function (options) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (options === undefined) {
      options = {};
    }
    if (typeof options === 'object') {
      return this.each(function () {
        var $this = $(this);
        var selector = options.selector ? options.selector : '.fn-slides > li';
        var $slides = $this.find(selector);
        if ($slides.length === 1 || $slides.length === 0) {
          $slides.fadeIn(400);
          if (options.start) {
            options.start($this);
          }
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly pecdrform functions on the slider
      var $slider = $(this).data('flexslider');
      var methodReturn;
      switch (options) {
      case 'next':
        $slider.flexAnimate($slider.getTarget('next'), true);
        break;
      case 'prev':
      case 'previous':
        $slider.flexAnimate($slider.getTarget('prev'), true);
        break;
      default:
        if (typeof options === 'number') {
          $slider.flexAnimate(options, true);
        } else if (typeof options === 'string') {
          methodReturn = typeof $slider[options] === 'function' ? $slider[options].apply($slider, args) : $slider[options];
        }
      }
      return methodReturn === undefined ? this : methodReturn;
    }
  };
  // Init code
  UI.ready(function (context) {
    $('[data-fn-flexslider]', context).each(function (i, item) {
      var $slider = $(item);
      var options = UI.utils.parseOptions($slider.data('fnFlexslider'));
      $slider.flexslider(options);
    });
  });
  return $.flexslider;
}(jQuery, fnui_fnuicore);
fnui_smoothscroll = function ($, UI) {
  var rAF = UI.rAF;
  var cAF = UI.cancelAF;
  /**
   * Smooth Scroll
   * @param position
   */
  // only allow one scroll to top operation to be in progress at a time,
  // which is probably what you want
  var smoothScrollInProgress = false;
  var SmoothScroll = function (element, options) {
    options = UI.utils.parseOptions(options) || {};
    var $this = $(element);
    var targetY = parseInt(options.position) || SmoothScroll.DEFAULTS.position;
    var initialY = $this.scrollTop();
    var lastY = initialY;
    var delta = targetY - initialY;
    // duration in ms, make it a bit shorter for short distances
    // this is not scientific and you might want to adjust this for
    // your preferences
    var speed = options.speed || Math.min(750, Math.min(1500, Math.abs(initialY - targetY)));
    // temp variables (t will be a position between 0 and 1, y is the calculated scrollTop)
    var start;
    var t;
    var y;
    var cancelScroll = function () {
      abort();
    };
    // abort if already in progress or nothing to scroll
    if (smoothScrollInProgress) {
      return;
    }
    if (delta === 0) {
      return;
    }
    // quint ease-in-out smoothing, from
    // https://github.com/madrobby/scripty2/blob/master/src/effects/transitions/penner.js#L127-L136
    function smooth(pos) {
      if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 5);
      }
      return 0.5 * (Math.pow(pos - 2, 5) + 2);
    }
    function abort() {
      $this.off('touchstart.smoothscroll', cancelScroll);
      smoothScrollInProgress = false;
    }
    // when there's a touch detected while scrolling is in progress, abort
    // the scrolling (emulates native scrolling behavior)
    $this.on('touchstart.smoothscroll', cancelScroll);
    smoothScrollInProgress = true;
    // start rendering away! note the function given to frame
    // is named "render" so we can reference it again further down
    function render(now) {
      if (!smoothScrollInProgress) {
        return;
      }
      if (!start) {
        start = now;
      }
      // calculate t, position of animation in [0..1]
      t = Math.min(1, Math.max((now - start) / speed, 0));
      // calculate the new scrollTop position (don't forget to smooth)
      y = Math.round(initialY + delta * smooth(t));
      // bracket scrollTop so we're never over-scrolling
      if (delta > 0 && y > targetY) {
        y = targetY;
      }
      if (delta < 0 && y < targetY) {
        y = targetY;
      }
      // only actually set scrollTop if there was a change fromt he last frame
      if (lastY != y) {
        $this.scrollTop(y);
      }
      lastY = y;
      // if we're not done yet, queue up an other frame to render,
      // or clean up
      if (y !== targetY) {
        cAF(scrollRAF);
        scrollRAF = rAF(render);
      } else {
        cAF(scrollRAF);
        abort();
      }
    }
    var scrollRAF = rAF(render);
  };
  SmoothScroll.DEFAULTS = { position: 0 };
  $.fn.smoothScroll = function (option) {
    return this.each(function () {
      new SmoothScroll(this, option);
    });
  };
  // Init code
  $(document).on('click.smoothScroll.data-api', '[data-fn-smooth-scroll]', function (e) {
    e.preventDefault();
    var options = $(this).data('fn-smoothScroll');
    $(window).smoothScroll(options);
  });
  return SmoothScroll;
}(jQuery, fnui_fnuicore);
fnui_sticky = function ($, UI) {
  //Sticky Class
  var Sticky = function (element, options) {
    var _this = this;
    this.options = $.extend({}, Sticky.DEFAULTS, options);
    this.$element = $(element);
    this.sticked = null;
    this.inited = null;
    this.$holder = undefined;
    this.$window = $(window).on('scroll.sticky', UI.utils.debounce($.proxy(this.checkPosition, this), 10)).on('resize.sticky orientationchange.sticky', UI.utils.debounce(function () {
      _this.reset(true, function () {
        _this.checkPosition();
      });
    }, 50)).on('load.sticky', $.proxy(this.checkPosition, this));
    // the `.offset()` is diff between jQuery & Zepto.js
    // jQuery: return `top` and `left`
    // Zepto.js: return `top`, `left`, `width`, `height`
    this.offset = this.$element.offset();
    this.init();
  };
  Sticky.DEFAULTS = {
    top: 0,
    bottom: 0,
    animation: '',
    className: {
      sticky: 'fn-sticky',
      resetting: 'fn-sticky-resetting',
      stickyBtm: 'fn-sticky-bottom',
      animationRev: 'fn-animation-reverse'
    }
  };
  Sticky.prototype.init = function () {
    var result = this.check();
    if (!result) {
      return false;
    }
    var $element = this.$element;
    var $elementMargin = '';
    $.each($element.css([
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft'
    ]), function (name, value) {
      return $elementMargin += ' ' + value;
    });
    var $holder = $('<div class="fn-sticky-placeholder"></div>').css({
      height: $element.css('position') !== 'absolute' ? $element.outerHeight() : '',
      float: $element.css('float') != 'none' ? $element.css('float') : '',
      margin: $elementMargin
    });
    this.$holder = $element.css('margin', 0).wrap($holder).parent();
    this.inited = 1;
    return true;
  };
  Sticky.prototype.reset = function (force, cb) {
    var options = this.options;
    var $element = this.$element;
    var animation = options.animation ? ' fn-animation-' + options.animation : '';
    var complete = function () {
      $element.css({
        position: '',
        top: '',
        width: '',
        left: '',
        margin: 0
      });
      $element.removeClass([
        animation,
        options.className.animationRev,
        options.className.sticky,
        options.className.resetting
      ].join(' '));
      this.animating = false;
      this.sticked = false;
      this.offset = $element.offset();
      cb && cb();
    }.bind(this);
    $element.addClass(options.className.resetting);
    if (!force && options.animation && UI.support.animation) {
      this.animating = true;
      $element.removeClass(animation).one(UI.support.animation.end, function () {
        complete();
      }).width();
      // force redraw
      $element.addClass(animation + ' ' + options.className.animationRev);
    } else {
      complete();
    }
  };
  Sticky.prototype.check = function () {
    if (!this.$element.is(':visible')) {
      return false;
    }
    var media = this.options.media;
    if (media) {
      switch (typeof media) {
      case 'number':
        if (window.innerWidth < media) {
          return false;
        }
        break;
      case 'string':
        if (window.matchMedia && !window.matchMedia(media).matches) {
          return false;
        }
        break;
      }
    }
    return true;
  };
  Sticky.prototype.checkPosition = function () {
    if (!this.inited) {
      var initialized = this.init();
      if (!initialized) {
        return;
      }
    }
    var options = this.options;
    var scrollTop = this.$window.scrollTop();
    var offsetTop = options.top;
    var offsetBottom = options.bottom;
    var $element = this.$element;
    var animation = options.animation ? ' fn-animation-' + options.animation : '';
    var className = [
      options.className.sticky,
      animation
    ].join(' ');
    if (typeof offsetBottom == 'function') {
      offsetBottom = offsetBottom(this.$element);
    }
    var checkResult = scrollTop > this.$holder.offset().top;
    if (!this.sticked && checkResult) {
      $element.addClass(className);
    } else if (this.sticked && !checkResult) {
      this.reset();
    }
    this.$holder.css({ height: $element.is(':visible') && $element.css('position') !== 'absolute' ? $element.outerHeight() : '' });
    if (checkResult) {
      $element.css({
        top: offsetTop,
        left: this.$holder.offset().left,
        width: this.$holder.width()
      });
    }
    this.sticked = checkResult;
  };
  // Sticky Plugin
  UI.plugin('sticky', Sticky);
  // Init code
  UI.ready(function (context) {
    $('[data-fn-sticky]').sticky();
  });
  return Sticky;
}(jQuery, fnui_fnuicore);
fnui_tabs = function ($, UI) {
  var supportTransition = UI.support.transition;
  var animation = UI.support.animation;
  /**
   * Tabs
   * @param {HTMLElement} element
   * @param {Object} options
   * @constructor
   */
  var Tabs = function (element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Tabs.DEFAULTS, options || {});
    this.transitioning = this.activeIndex = null;
    this.refresh();
    this.init();
  };
  Tabs.VERSION = '2.0.0';
  Tabs.DEFAULTS = {
    selector: {
      nav: '> .fn-tabs-nav',
      content: '> .fn-tabs-bd',
      panel: '> .fn-tab-panel'
    },
    activeClass: 'fn-active'
  };
  Tabs.prototype.refresh = function () {
    var selector = this.options.selector;
    this.$tabNav = this.$element.find(selector.nav);
    this.$navs = this.$tabNav.find('a');
    this.$content = this.$element.find(selector.content);
    this.$tabPanels = this.$content.find(selector.panel);
    var $active = this.$tabNav.find('> .' + this.options.activeClass);
    // Activate the first Tab when no active Tab or multiple active Tabs
    if ($active.length !== 1) {
      this.open(0);
    } else {
      this.activeIndex = this.$navs.index($active.children('a'));
    }
  };
  Tabs.prototype.init = function () {
    var _this = this;
    var options = this.options;
    this.$element.on('click.tabs', options.selector.nav + ' a', function (e) {
      e.preventDefault();
      _this.open($(this));
    });
  };
  /**
   * Open $nav tab
   * @param {jQuery|HTMLElement|Number} $nav
   * @returns {Tabs}
   */
  Tabs.prototype.open = function ($nav) {
    var activeClass = this.options.activeClass;
    var activeIndex = typeof $nav === 'number' ? $nav : this.$navs.index($($nav));
    $nav = typeof $nav === 'number' ? this.$navs.eq(activeIndex) : $($nav);
    if (!$nav || !$nav.length || this.transitioning || $nav.parent('li').hasClass(activeClass)) {
      return;
    }
    var $tabNav = this.$tabNav;
    var href = $nav.attr('href');
    var regexHash = /^#.+$/;
    var $target = regexHash.test(href) && this.$content.find(href) || this.$tabPanels.eq(activeIndex);
    var previous = $tabNav.find('.' + activeClass + ' a')[0];
    var e = $.Event('open.tabs', { relatedTarget: previous });
    $nav.trigger(e);
    if (e.isDefaultPrevented()) {
      return;
    }
    // activate Tab nav
    this.activate($nav.closest('li'), $tabNav);
    // activate Tab content
    this.activate($target, this.$content, function () {
      $nav.trigger({
        type: 'opened.tabs',
        relatedTarget: previous
      });
    });
    this.activeIndex = activeIndex;
  };
  Tabs.prototype.activate = function ($element, $container, callback) {
    this.transitioning = true;
    var activeClass = this.options.activeClass;
    var $active = $container.find('> .' + activeClass);
    var transition = callback && supportTransition && !!$active.length;
    $active.removeClass(activeClass + ' fn-in');
    $element.addClass(activeClass);
    if (transition) {
      $element.addClass('fn-in');
    } else {
      $element.removeClass('fn-fade');
    }
    var complete = $.proxy(function complete() {
      callback && callback();
      this.transitioning = false;
    }, this);
    transition ? $active.one('fnTransitionEnd', complete) : complete();
  };
  /**
   * Go to `next` or `prev` tab
   * @param {String} direction - `next` or `prev`
   */
  Tabs.prototype.goTo = function (direction) {
    var navIndex = this.activeIndex;
    var isNext = direction === 'next';
    var spring = isNext ? 'fn-animation-right-spring' : 'fn-animation-left-spring';
    if (isNext && navIndex + 1 >= this.$navs.length || !isNext && navIndex === 0) {
      // first one
      var $panel = this.$tabPanels.eq(navIndex);
      animation && $panel.addClass(spring).on('fnAnimationEnd', function () {
        $panel.removeClass(spring);
      }).emulateAnimationEnd(300);
    } else {
      this.open(isNext ? navIndex + 1 : navIndex - 1);
    }
  };
  Tabs.prototype.destroy = function () {
    this.$element.off('.tabs');
    $.removeData(this.$element, 'fnui.tabs');
  };
  // Plugin
  function Plugin(option) {
    var args = Array.prototype.slice.call(arguments, 1);
    var methodReturn;
    this.each(function () {
      var $this = $(this);
      var $tabs = $this.is('.fn-tabs') && $this || $this.closest('.fn-tabs');
      var data = $tabs.data('fnui.tabs');
      var options = $.extend({}, $this.data('amTabs'), $.isPlainObject(option) && option);
      if (!data) {
        $tabs.data('fnui.tabs', data = new Tabs($tabs[0], options));
      }
      if (typeof option === 'string') {
        if (option === 'open' && $this.is('.fn-tabs-nav a')) {
          data.open($this);
        } else {
          methodReturn = typeof data[option] === 'function' ? data[option].apply(data, args) : data[option];
        }
      }
    });
    return methodReturn === undefined ? this : methodReturn;
  }
  $.fn.tabs = Plugin;
  // Init code
  UI.ready(function (context) {
    $('[data-fn-tabs]', context).tabs();
  });
  $(document).on('click.tabs.data-api', '[data-fn-tabs] .fn-tabs-nav a', function (e) {
    e.preventDefault();
    Plugin.call($(this), 'open');
  });
  return Tabs;
}(jQuery, fnui_fnuicore);
fnui_ucheck = function ($, UI) {
  var UCheck = function (element, options) {
    this.options = $.extend({}, UCheck.DEFAULTS, options);
    // this.options = $.extend({}, UCheck.DEFAULTS, this.$element.data(), options);
    this.$element = $(element);
    this.init();
  };
  UCheck.DEFAULTS = {
    checkboxClass: 'fn-ucheck-checkbox',
    radioClass: 'fn-ucheck-radio',
    checkboxTpl: '<span class="fn-ucheck-icons">' + '<i class="fn-icon-unchecked"></i><i class="fn-icon-checked"></i></span>',
    radioTpl: '<span class="fn-ucheck-icons">' + '<i class="fn-icon-unchecked"></i><i class="fn-icon-checked"></i></span>'
  };
  UCheck.prototype.init = function () {
    var $element = this.$element;
    var element = $element[0];
    var options = this.options;
    if (element.type === 'checkbox') {
      $element.addClass(options.checkboxClass).after(options.checkboxTpl);
    } else if (element.type === 'radio') {
      $element.addClass(options.radioClass).after(options.radioTpl);
    }
  };
  UCheck.prototype.check = function () {
    this.$element.prop('checked', true).trigger('change.ucheck').trigger('checked.ucheck');
  }, UCheck.prototype.uncheck = function () {
    this.$element.prop('checked', false).trigger('change.ucheck').trigger('unchecked.ucheck');
  }, UCheck.prototype.toggle = function () {
    this.$element.prop('checked', function (i, value) {
      return !value;
    }).trigger('change.ucheck').trigger('toggled.ucheck');
  }, UCheck.prototype.disable = function () {
    this.$element.prop('disabled', true).trigger('change.ucheck').trigger('disabled.ucheck');
  }, UCheck.prototype.enable = function () {
    this.$element.prop('disabled', false);
    this.$element.trigger('change.ucheck').trigger('enabled.ucheck');
  }, UCheck.prototype.destroy = function () {
    this.$element.removeData('fnui.ucheck').removeClass(this.options.checkboxClass + ' ' + this.options.radioClass).next('.fn-ucheck-icons').remove().end().trigger('destroyed.ucheck');
  };
  UI.plugin('uCheck', UCheck, {
    after: function () {
      // Adding 'fn-nohover' class for touch devices
      if (UI.support.touch) {
        this.parent().hover(function () {
          this.addClass('fn-nohover');
        }, function () {
          this.removeClass('fn-nohover');
        });
      }
    }
  });
  UI.ready(function (context) {
    $('[data-fn-ucheck]', context).uCheck();
  });
  return UCheck;
}(jQuery, fnui_fnuicore);
fnui_validator = function ($, UI) {
  var Validator = function (element, options) {
    this.options = $.extend({}, Validator.DEFAULTS, options);
    this.options.patterns = $.extend({}, Validator.patterns, this.options.patterns);
    var locales = this.options.locales;
    !Validator.validationMessages[locales] && (this.options.locales = 'zh_CN');
    this.$element = $(element);
    this.init();
  };
  Validator.DEFAULTS = {
    debug: false,
    locales: 'zh_CN',
    H5validation: false,
    H5inputType: [
      'email',
      'url',
      'number'
    ],
    patterns: {},
    patternClassPrefix: 'js-pattern-',
    activeClass: 'fn-active',
    inValidClass: 'fn-field-error',
    validClass: 'fn-field-valid',
    validateOnSubmit: true,
    alwaysRevalidate: false,
    // Elements to validate with allValid (only validating visible elements)
    // :input: selects all input, textarea, select and button elements.
    // @since 2.5: move `:visible` to `ignore` option (became to `:hidden`)
    allFields: ':input:not(:submit, :button, :disabled, .fn-novalidate)',
    // ignored elements
    ignore: ':hidden:not([data-fn-selected], .fn-validate)',
    // Custom events
    customEvents: 'validate',
    // Keyboard events
    keyboardFields: ':input:not(:submit, :button, :disabled, .fn-novalidate)',
    keyboardEvents: 'focusout, change',
    // keyup, focusin
    // bind `keyup` event to active field
    activeKeyup: false,
    textareaMaxlenthKeyup: true,
    // Mouse events
    pointerFields: 'input[type="range"]:not(:disabled, .fn-novalidate), ' + 'input[type="radio"]:not(:disabled, .fn-novalidate), ' + 'input[type="checkbox"]:not(:disabled, .fn-novalidate), ' + 'select:not(:disabled, .fn-novalidate), ' + 'option:not(:disabled, .fn-novalidate)',
    pointerEvents: 'click',
    onValid: function (validity) {
    },
    onInValid: function (validity) {
    },
    markValid: function (validity) {
      // this is Validator instance
      var options = this.options;
      var $field = $(validity.field);
      var $parent = $field.closest('.fn-form-group');
      $field.addClass(options.validClass).removeClass(options.inValidClass);
      $parent.addClass('fn-form-success').removeClass('fn-form-error');
      options.onValid.call(this, validity);
    },
    markInValid: function (validity) {
      var options = this.options;
      var $field = $(validity.field);
      var $parent = $field.closest('.fn-form-group');
      $field.addClass(options.inValidClass + ' ' + options.activeClass).removeClass(options.validClass);
      $parent.addClass('fn-form-error').removeClass('fn-form-success');
      options.onInValid.call(this, validity);
    },
    validate: function (validity) {
    },
    submit: null
  };
  Validator.VERSION = '{{VERSION}}';
  Validator.patterns = {
    email: /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/,
    url: /^(https?|ftp):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
    // Number, including positive, negative, and floating decimal
    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,
    dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
    integer: /^-?\d+$/
  };
  Validator.validationMessages = {
    zh_CN: {
      valueMissing: '请填写\uFF08选择\uFF09此字段',
      customError: {
        tooShort: '至少填写 %s 个字符',
        checkedOverflow: '至多选择 %s 项',
        checkedUnderflow: '至少选择 %s 项'
      },
      patternMismatch: '请按照要求的格式填写',
      rangeOverflow: '请填写小于等于 %s 的值',
      rangeUnderflow: '请填写大于等于 %s 的值',
      stepMismatch: '',
      tooLong: '至多填写 %s 个字符',
      typeMismatch: '请按照要求的类型填写'
    }
  };
  Validator.ERROR_MAP = {
    tooShort: 'minlength',
    checkedOverflow: 'maxchecked',
    checkedUnderflow: 'minchecked',
    rangeOverflow: 'max',
    rangeUnderflow: 'min',
    tooLong: 'maxlength'
  };
  // TODO: 考虑表单元素不是 form 子元素的情形
  // TODO: change/click/focusout 同时触发时处理重复
  // TODO: 显示提示信息
  Validator.prototype.init = function () {
    var _this = this;
    var $element = this.$element;
    var options = this.options;
    // using H5 form validation if option set and supported
    if (options.H5validation && UI.support.formValidation) {
      return false;
    }
    // disable HTML5 form validation
    $element.attr('novalidate', 'novalidate');
    function regexToPattern(regex) {
      var pattern = regex.toString();
      return pattern.substring(1, pattern.length - 1);
    }
    // add pattern to H5 input type
    $.each(options.H5inputType, function (i, type) {
      var $field = $element.find('input[type=' + type + ']');
      if (!$field.attr('pattern') && !$field.is('[class*=' + options.patternClassPrefix + ']')) {
        $field.attr('pattern', regexToPattern(options.patterns[type]));
      }
    });
    // add pattern to .js-pattern-xx
    $.each(options.patterns, function (key, value) {
      var $field = $element.find('.' + options.patternClassPrefix + key);
      !$field.attr('pattern') && $field.attr('pattern', regexToPattern(value));
    });
    $element.on('submit.validator', function (e) {
      // user custom submit handler
      if (typeof options.submit === 'function') {
        return options.submit.call(_this, e);
      }
      if (options.validateOnSubmit) {
        var formValidity = _this.isFormValid();
        // sync validate, return result
        if ($.type(formValidity) === 'boolean') {
          return formValidity;
        }
        if ($element.data('fnui.checked')) {
          return true;
        } else {
          $.when(formValidity).then(function () {
            // done, submit form
            $element.data('fnui.checked', true).submit();
          }, function () {
            // fail
            $element.data('fnui.checked', false).find('.' + options.inValidClass).eq(0).focus();
          });
          return false;
        }
      }
    });
    function bindEvents(fields, eventFlags, debounce) {
      var events = eventFlags.split(',');
      var validate = function (e) {
        // console.log(e.type);
        _this.validate(this);
      };
      if (debounce) {
        validate = UI.utils.debounce(validate, debounce);
      }
      $.each(events, function (i, event) {
        $element.on(event + '.validator', fields, validate);
      });
    }
    bindEvents(':input', options.customEvents);
    bindEvents(options.keyboardFields, options.keyboardEvents);
    bindEvents(options.pointerFields, options.pointerEvents);
    if (options.textareaMaxlenthKeyup) {
      bindEvents('textarea[maxlength]', 'keyup', 50);
    }
    if (options.activeKeyup) {
      bindEvents('.fn-active', 'keyup', 50);
    }  /*if (options.errorMessage === 'tooltip') {
           this.$tooltip = $('<div></div>', {
             'class': 'fn-validator-message',
             id: UI.utils.generateGUID('fn-validator-message')
           });
       
           $(document.body).append(this.$tooltip);
         }*/
  };
  Validator.prototype.isValid = function (field) {
    var $field = $(field);
    var options = this.options;
    // valid field not has been validated
    if ($field.data('validity') === undefined || options.alwaysRevalidate) {
      this.validate(field);
    }
    return $field.data('validity') && $field.data('validity').valid;
  };
  Validator.prototype.validate = function (field) {
    var _this = this;
    var $element = this.$element;
    var options = this.options;
    var $field = $(field);
    // Validate equal, e.g. confirm password
    var equalTo = $field.data('equalTo');
    if (equalTo) {
      $field.attr('pattern', '^' + $element.find(equalTo).val() + '$');
    }
    var pattern = $field.attr('pattern') || false;
    var re = new RegExp(pattern);
    var $radioGroup = null;
    var $checkboxGroup = null;
    // if checkbox, return `:chcked` length
    // NOTE: checkbox and radio should have name attribute
    var value = $field.is('[type=checkbox]') ? ($checkboxGroup = $element.find('input[name="' + field.name + '"]')).filter(':checked').length : $field.is('[type=radio]') ? ($radioGroup = this.$element.find('input[name="' + field.name + '"]')).filter(':checked').length > 0 : $field.val();
    // if checkbox, valid the first input of checkbox group
    $field = $checkboxGroup && $checkboxGroup.length ? $checkboxGroup.first() : $field;
    var required = $field.attr('required') !== undefined && $field.attr('required') !== 'false';
    var maxLength = parseInt($field.attr('maxlength'), 10);
    var minLength = parseInt($field.attr('minlength'), 10);
    var min = Number($field.attr('min'));
    var max = Number($field.attr('max'));
    var validity = this.createValidity({
      field: $field[0],
      valid: true
    });
    // Debug
    if (options.debug && window.console) {
      console.log('Validate: value -> [' + value + ', regex -> [' + re + '], required -> ' + required);
      console.log('Regex test: ' + re.test(value) + ', Pattern: ' + pattern);
    }
    // check value length
    if (!isNaN(maxLength) && value.length > maxLength) {
      validity.valid = false;
      validity.tooLong = true;
    }
    if (!isNaN(minLength) && value.length < minLength) {
      validity.valid = false;
      validity.customError = 'tooShort';
    }
    // check minimum and maximum
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input
    // TODO: 日期验证最小值和最大值 min/max
    if (!isNaN(min) && Number(value) < min) {
      validity.valid = false;
      validity.rangeUnderflow = true;
    }
    if (!isNaN(max) && Number(value) > max) {
      validity.valid = false;
      validity.rangeOverflow = true;
    }
    // check required
    if (required && !value) {
      validity.valid = false;
      validity.valueMissing = true;
    } else if (($checkboxGroup || $field.is('select[multiple="multiple"]')) && value) {
      // check checkboxes / multiple select with `minchecked`/`maxchecked` attr
      // var $multipleField = $checkboxGroup ? $checkboxGroup.first() : $field;
      // if is select[multiple="multiple"], return selected length
      value = $checkboxGroup ? value : value.length;
      // at least checked
      var minChecked = parseInt($field.attr('minchecked'), 10);
      // at most checked
      var maxChecked = parseInt($field.attr('maxchecked'), 10);
      if (!isNaN(minChecked) && value < minChecked) {
        // console.log('At least [%d] items checked！', maxChecked);
        validity.valid = false;
        validity.customError = 'checkedUnderflow';
      }
      if (!isNaN(maxChecked) && value > maxChecked) {
        // console.log('At most [%d] items checked！', maxChecked);
        validity.valid = false;
        validity.customError = 'checkedOverflow';
      }
    } else if (pattern && !re.test(value) && value) {
      // check pattern
      validity.valid = false;
      validity.patternMismatch = true;
    }
    var validateComplete = function (validity) {
      this.markField(validity);
      var event = $.Event('validated.field.validator');
      event.validity = validity;
      $field.trigger(event).data('validity', validity);
      // validate the radios/checkboxes with the same name
      var $fields = $radioGroup || $checkboxGroup;
      if ($fields) {
        $fields.not($field).data('validity', validity).each(function () {
          validity.field = this;
          _this.markField(validity);
        });
      }
      return validity;
    };
    // Run custom validate
    // NOTE: async custom validate should return Deferred project
    var customValidate;
    typeof options.validate === 'function' && (customValidate = options.validate.call(this, validity));
    // Deferred
    if (customValidate) {
      var dfd = new $.Deferred();
      $field.data('fnui.dfdValidity', dfd.promise());
      return $.when(customValidate).always(function (validity) {
        dfd[validity.valid ? 'resolve' : 'reject'](validity);
        validateComplete.call(_this, validity);
      });
    }
    validateComplete.call(this, validity);
  };
  Validator.prototype.markField = function (validity) {
    var options = this.options;
    var flag = 'mark' + (validity.valid ? '' : 'In') + 'Valid';
    options[flag] && options[flag].call(this, validity);
  };
  // check all fields in the form are valid
  Validator.prototype.validateForm = function () {
    var _this = this;
    var $element = this.$element;
    var options = this.options;
    var $allFields = $element.find(options.allFields).not(options.ignore);
    var radioNames = [];
    var valid = true;
    var formValidity = [];
    var $inValidFields = $([]);
    var promises = [];
    // for async validate
    var async = false;
    $element.trigger('validate.form.validator');
    // Filter radio with the same name and keep only one,
    //   since they will be checked as a group by validate()
    var $filteredFields = $allFields.filter(function (index) {
      var name;
      if (this.tagName === 'INPUT' && this.type === 'radio') {
        name = this.name;
        if (radioNames[name] === true) {
          return false;
        }
        radioNames[name] = true;
      }
      return true;
    });
    $filteredFields.each(function () {
      var $this = $(this);
      var fieldValid = _this.isValid(this);
      var fieldValidity = $this.data('validity');
      valid = !!fieldValid && valid;
      formValidity.push(fieldValidity);
      if (!fieldValid) {
        $inValidFields = $inValidFields.add($(this), $element);
      }
      // async validity
      var promise = $this.data('fnui.dfdValidity');
      if (promise) {
        promises.push(promise);
        async = true;
      } else {
        // convert sync validity to Promise
        var dfd = new $.Deferred();
        promises.push(dfd.promise());
        dfd[fieldValid ? 'resolve' : 'reject'](fieldValidity);
      }
    });
    // NOTE: If there are async validity, the valid may be not exact result.
    var validity = {
      valid: valid,
      $invalidFields: $inValidFields,
      validity: formValidity,
      promises: promises,
      async: async
    };
    $element.trigger('validated.form.validator', validity);
    return validity;
  };
  Validator.prototype.isFormValid = function () {
    var _this = this;
    var formValidity = this.validateForm();
    var triggerValid = function (type) {
      _this.$element.trigger(type + '.validator');
    };
    if (formValidity.async) {
      var masterDfd = new $.Deferred();
      $.when.apply(null, formValidity.promises).then(function () {
        masterDfd.resolve();
        triggerValid('valid');
      }, function () {
        masterDfd.reject();
        triggerValid('invalid');
      });
      return masterDfd.promise();
    } else {
      if (!formValidity.valid) {
        var $first = formValidity.$invalidFields.first();
        // Selected plugin support
        // @since 2.5
        if ($first.is('[data-fn-selected]')) {
          $first = $first.next('.fn-selected').find('.fn-selected-btn');
        }
        $first.focus();
        triggerValid('invalid');
        return false;
      }
      triggerValid('valid');
      return true;
    }
  };
  // customErrors:
  //    1. tooShort
  //    2. checkedOverflow
  //    3. checkedUnderflow
  Validator.prototype.createValidity = function (validity) {
    return $.extend({
      customError: validity.customError || false,
      patternMismatch: validity.patternMismatch || false,
      rangeOverflow: validity.rangeOverflow || false,
      // higher than maximum
      rangeUnderflow: validity.rangeUnderflow || false,
      // lower than  minimum
      stepMismatch: validity.stepMismatch || false,
      tooLong: validity.tooLong || false,
      // value is not in the correct syntax
      typeMismatch: validity.typeMismatch || false,
      valid: validity.valid || true,
      // Returns true if the element has no value but is a required field
      valueMissing: validity.valueMissing || false
    }, validity);
  };
  Validator.prototype.getValidationMessage = function (validity) {
    var messages = Validator.validationMessages[this.options.locales];
    var error;
    var message;
    var placeholder = '%s';
    var $field = $(validity.field);
    if ($field.is('[type="checkbox"]') || $field.is('[type="radio"]')) {
      $field = this.$element.find('[name=' + $field.attr('name') + ']').first();
    }
    // get error name
    $.each(validity, function (key, val) {
      // skip `field` and `valid`
      if (key === 'field' || key === 'valid') {
        return key;
      }
      // Amaze UI custom error type
      if (key === 'customError' && val) {
        error = val;
        messages = messages.customError;
        return false;
      }
      // W3C specs error type
      if (val === true) {
        error = key;
        return false;
      }
    });
    message = messages[error] || undefined;
    if (message && Validator.ERROR_MAP[error]) {
      message = message.replace(placeholder, $field.attr(Validator.ERROR_MAP[error]) || '规定的');
    }
    return message;
  };
  // remove valid mark
  Validator.prototype.removeMark = function () {
    this.$element.find('.fn-form-success, .fn-form-error, .' + this.options.inValidClass + ', .' + this.options.validClass).removeClass([
      'fn-form-success',
      'fn-form-error',
      this.options.inValidClass,
      this.options.validClass
    ].join(' '));
  };
  // @since 2.5
  Validator.prototype.destroy = function () {
    this.removeMark();
    // Remove data
    // - Validator.prototype.init -> $element.data('fnui.checked')
    // - Validator.prototype.validateForm
    // - Validator.prototype.isValid
    this.$element.removeData('fnui.validator fnui.checked').off('.validator').find(this.options.allFields).removeData('validity fnui.dfdValidity');
  };
  UI.plugin('validator', Validator);
  // init code
  UI.ready(function (context) {
    $('[data-fn-validator]', context).validator();
  });
  return Validator;
}(jQuery, fnui_fnuicore);
fnui_switch = function ($, UI) {
  var Switch = function (element, options) {
    if (options == null) {
      options = {};
    }
    this.$element = $(element);
    this.options = $.extend({}, Switch.DEFAULTS, {
      state: this.$element.is(':checked'),
      size: this.$element.data('size'),
      animate: this.$element.data('animate'),
      disabled: this.$element.is(':disabled'),
      readonly: this.$element.is('[readonly]'),
      indeterminate: this.$element.data('indeterminate'),
      inverse: this.$element.data('inverse'),
      radioAllOff: this.$element.data('radio-all-off'),
      onColor: this.$element.data('on-color'),
      offColor: this.$element.data('off-color'),
      onText: this.$element.data('on-text'),
      offText: this.$element.data('off-text'),
      labelText: this.$element.data('label-text'),
      handleWidth: this.$element.data('handle-width'),
      labelWidth: this.$element.data('label-width'),
      baseClass: this.$element.data('base-class'),
      wrapperClass: this.$element.data('wrapper-class')
    }, options);
    this.$wrapper = $('<div>', {
      'class': function (_this) {
        return function () {
          var classes;
          classes = ['' + _this.options.baseClass].concat(_this._getClasses(_this.options.wrapperClass));
          classes.push(_this.options.state ? '' + _this.options.baseClass + '-on' : '' + _this.options.baseClass + '-off');
          if (_this.options.size != null) {
            classes.push('' + _this.options.baseClass + '-' + _this.options.size);
          }
          if (_this.options.disabled) {
            classes.push('' + _this.options.baseClass + '-disabled');
          }
          if (_this.options.readonly) {
            classes.push('' + _this.options.baseClass + '-readonly');
          }
          if (_this.options.indeterminate) {
            classes.push('' + _this.options.baseClass + '-indeterminate');
          }
          if (_this.options.inverse) {
            classes.push('' + _this.options.baseClass + '-inverse');
          }
          if (_this.$element.attr('id')) {
            classes.push('' + _this.options.baseClass + '-id-' + _this.$element.attr('id'));
          }
          return classes.join(' ');
        };
      }(this)()
    });
    this.$container = $('<div>', { 'class': '' + this.options.baseClass + '-container' });
    this.$on = $('<span>', {
      html: this.options.onText,
      'class': '' + this.options.baseClass + '-handle-on ' + this.options.baseClass + '-' + this.options.onColor
    });
    this.$off = $('<span>', {
      html: this.options.offText,
      'class': '' + this.options.baseClass + '-handle-off ' + this.options.baseClass + '-' + this.options.offColor
    });
    this.$label = $('<span>', {
      html: this.options.labelText,
      'class': '' + this.options.baseClass + '-label'
    });
    this.$element.on('init.fnswitch', function (_this) {
      return function () {
        return _this.options.onInit.apply(element, arguments);
      };
    }(this));
    this.$element.on('switchChange.fnswitch', function (_this) {
      return function () {
        return _this.options.onSwitchChange.apply(element, arguments);
      };
    }(this));
    this.$container = this.$element.wrap(this.$container).parent();
    this.$wrapper = this.$container.wrap(this.$wrapper).parent();
    this.$element.before(this.options.inverse ? this.$off : this.$on).before(this.$label).before(this.options.inverse ? this.$on : this.$off);
    if (this.options.indeterminate) {
      this.$element.prop('indeterminate', true);
    }
    this._init();
    this._elementHandlers();
    this._handleHandlers();
    this._labelHandlers();
    this._formHandler();
    this._externalLabelHandler();
    this.$element.trigger('init.fnswitch');
  };
  Switch.DEFAULTS = {
    state: true,
    size: null,
    animate: true,
    disabled: false,
    readonly: false,
    indeterminate: false,
    inverse: false,
    radioAllOff: false,
    onColor: 'primary',
    offColor: 'default',
    onText: 'ON',
    offText: 'OFF',
    labelText: '&nbsp;',
    handleWidth: 'auto',
    labelWidth: 'auto',
    baseClass: 'fn-switch',
    wrapperClass: 'wrapper',
    onInit: function () {
    },
    onSwitchChange: function () {
    }
  };
  Switch.prototype._constructor = Switch;
  Switch.prototype.state = function (value, skip) {
    if (typeof value === 'undefined') {
      return this.options.state;
    }
    if (this.options.disabled || this.options.readonly) {
      return this.$element;
    }
    if (this.options.state && !this.options.radioAllOff && this.$element.is(':radio')) {
      return this.$element;
    }
    if (this.options.indeterminate) {
      this.indeterminate(false);
    }
    value = !!value;
    this.$element.prop('checked', value).trigger('change.fnswitch', skip);
    return this.$element;
  };
  Switch.prototype.toggleState = function (skip) {
    if (this.options.disabled || this.options.readonly) {
      return this.$element;
    }
    if (this.options.indeterminate) {
      this.indeterminate(false);
      return this.state(true);
    } else {
      return this.$element.prop('checked', !this.options.state).trigger('change.fnswitch', skip);
    }
  };
  Switch.prototype.size = function (value) {
    if (typeof value === 'undefined') {
      return this.options.size;
    }
    if (this.options.size != null) {
      this.$wrapper.removeClass('' + this.options.baseClass + '-' + this.options.size);
    }
    if (value) {
      this.$wrapper.addClass('' + this.options.baseClass + '-' + value);
    }
    this._width();
    this._containerPosition();
    this.options.size = value;
    return this.$element;
  };
  Switch.prototype.animate = function (value) {
    if (typeof value === 'undefined') {
      return this.options.animate;
    }
    value = !!value;
    if (value === this.options.animate) {
      return this.$element;
    }
    return this.toggleAnimate();
  };
  Switch.prototype.toggleAnimate = function () {
    this.options.animate = !this.options.animate;
    this.$wrapper.toggleClass('' + this.options.baseClass + '-animate');
    return this.$element;
  };
  Switch.prototype.disabled = function (value) {
    if (typeof value === 'undefined') {
      return this.options.disabled;
    }
    value = !!value;
    if (value === this.options.disabled) {
      return this.$element;
    }
    return this.toggleDisabled();
  };
  Switch.prototype.toggleDisabled = function () {
    this.options.disabled = !this.options.disabled;
    this.$element.prop('disabled', this.options.disabled);
    this.$wrapper.toggleClass('' + this.options.baseClass + '-disabled');
    return this.$element;
  };
  Switch.prototype.readonly = function (value) {
    if (typeof value === 'undefined') {
      return this.options.readonly;
    }
    value = !!value;
    if (value === this.options.readonly) {
      return this.$element;
    }
    return this.toggleReadonly();
  };
  Switch.prototype.toggleReadonly = function () {
    this.options.readonly = !this.options.readonly;
    this.$element.prop('readonly', this.options.readonly);
    this.$wrapper.toggleClass('' + this.options.baseClass + '-readonly');
    return this.$element;
  };
  Switch.prototype.indeterminate = function (value) {
    if (typeof value === 'undefined') {
      return this.options.indeterminate;
    }
    value = !!value;
    if (value === this.options.indeterminate) {
      return this.$element;
    }
    return this.toggleIndeterminate();
  };
  Switch.prototype.toggleIndeterminate = function () {
    this.options.indeterminate = !this.options.indeterminate;
    this.$element.prop('indeterminate', this.options.indeterminate);
    this.$wrapper.toggleClass('' + this.options.baseClass + '-indeterminate');
    this._containerPosition();
    return this.$element;
  };
  Switch.prototype.inverse = function (value) {
    if (typeof value === 'undefined') {
      return this.options.inverse;
    }
    value = !!value;
    if (value === this.options.inverse) {
      return this.$element;
    }
    return this.toggleInverse();
  };
  Switch.prototype.toggleInverse = function () {
    var $off, $on;
    this.$wrapper.toggleClass('' + this.options.baseClass + '-inverse');
    $on = this.$on.clone(true);
    $off = this.$off.clone(true);
    this.$on.replaceWith($off);
    this.$off.replaceWith($on);
    this.$on = $off;
    this.$off = $on;
    this.options.inverse = !this.options.inverse;
    return this.$element;
  };
  Switch.prototype.onColor = function (value) {
    var color;
    color = this.options.onColor;
    if (typeof value === 'undefined') {
      return color;
    }
    if (color != null) {
      this.$on.removeClass('' + this.options.baseClass + '-' + color);
    }
    this.$on.addClass('' + this.options.baseClass + '-' + value);
    this.options.onColor = value;
    return this.$element;
  };
  Switch.prototype.offColor = function (value) {
    var color;
    color = this.options.offColor;
    if (typeof value === 'undefined') {
      return color;
    }
    if (color != null) {
      this.$off.removeClass('' + this.options.baseClass + '-' + color);
    }
    this.$off.addClass('' + this.options.baseClass + '-' + value);
    this.options.offColor = value;
    return this.$element;
  };
  Switch.prototype.onText = function (value) {
    if (typeof value === 'undefined') {
      return this.options.onText;
    }
    this.$on.html(value);
    this._width();
    this._containerPosition();
    this.options.onText = value;
    return this.$element;
  };
  Switch.prototype.offText = function (value) {
    if (typeof value === 'undefined') {
      return this.options.offText;
    }
    this.$off.html(value);
    this._width();
    this._containerPosition();
    this.options.offText = value;
    return this.$element;
  };
  Switch.prototype.labelText = function (value) {
    if (typeof value === 'undefined') {
      return this.options.labelText;
    }
    this.$label.html(value);
    this._width();
    this.options.labelText = value;
    return this.$element;
  };
  Switch.prototype.handleWidth = function (value) {
    if (typeof value === 'undefined') {
      return this.options.handleWidth;
    }
    this.options.handleWidth = value;
    this._width();
    this._containerPosition();
    return this.$element;
  };
  Switch.prototype.labelWidth = function (value) {
    if (typeof value === 'undefined') {
      return this.options.labelWidth;
    }
    this.options.labelWidth = value;
    this._width();
    this._containerPosition();
    return this.$element;
  };
  Switch.prototype.baseClass = function (value) {
    return this.options.baseClass;
  };
  Switch.prototype.wrapperClass = function (value) {
    if (typeof value === 'undefined') {
      return this.options.wrapperClass;
    }
    if (!value) {
      value = Switch.DEFAULTS.wrapperClass;
    }
    this.$wrapper.removeClass(this._getClasses(this.options.wrapperClass).join(' '));
    this.$wrapper.addClass(this._getClasses(value).join(' '));
    this.options.wrapperClass = value;
    return this.$element;
  };
  Switch.prototype.radioAllOff = function (value) {
    if (typeof value === 'undefined') {
      return this.options.radioAllOff;
    }
    value = !!value;
    if (value === this.options.radioAllOff) {
      return this.$element;
    }
    this.options.radioAllOff = value;
    return this.$element;
  };
  Switch.prototype.onInit = function (value) {
    if (typeof value === 'undefined') {
      return this.options.onInit;
    }
    if (!value) {
      value = Switch.DEFAULTS.onInit;
    }
    this.options.onInit = value;
    return this.$element;
  };
  Switch.prototype.onSwitchChange = function (value) {
    if (typeof value === 'undefined') {
      return this.options.onSwitchChange;
    }
    if (!value) {
      value = Switch.DEFAULTS.onSwitchChange;
    }
    this.options.onSwitchChange = value;
    return this.$element;
  };
  Switch.prototype.destroy = function () {
    var $form;
    $form = this.$element.closest('form');
    if ($form.length) {
      $form.off('reset.fnswitch').removeData('fnui.switch');
    }
    this.$container.children().not(this.$element).remove();
    this.$element.unwrap().unwrap().off('.fnswitch').removeData('fnui.switch');
    return this.$element;
  };
  Switch.prototype._width = function () {
    var $handles, handleWidth;
    $handles = this.$on.add(this.$off);
    $handles.add(this.$label).css('width', '');
    handleWidth = this.options.handleWidth === 'auto' ? Math.max(this.$on.width(), this.$off.width()) : this.options.handleWidth;
    $handles.width(handleWidth);
    this.$label.width(function (_this) {
      return function (index, width) {
        if (_this.options.labelWidth !== 'auto') {
          return _this.options.labelWidth;
        }
        if (width < handleWidth) {
          return handleWidth;
        } else {
          return width;
        }
      };
    }(this));
    this._handleWidth = this.$on.outerWidth();
    this._labelWidth = this.$label.outerWidth();
    this.$container.width(this._handleWidth * 2 + this._labelWidth);
    return this.$wrapper.width(this._handleWidth + this._labelWidth);
  };
  Switch.prototype._containerPosition = function (state, callback) {
    if (state == null) {
      state = this.options.state;
    }
    this.$container.css('margin-left', function (_this) {
      return function () {
        var values;
        values = [
          0,
          '-' + _this._handleWidth + 'px'
        ];
        if (_this.options.indeterminate) {
          return '-' + _this._handleWidth / 2 + 'px';
        }
        if (state) {
          if (_this.options.inverse) {
            return values[1];
          } else {
            return values[0];
          }
        } else {
          if (_this.options.inverse) {
            return values[0];
          } else {
            return values[1];
          }
        }
      };
    }(this));
    if (!callback) {
      return;
    }
    return setTimeout(function () {
      return callback();
    }, 50);
  };
  Switch.prototype._init = function () {
    var init, initInterval;
    init = function (_this) {
      return function () {
        _this._width();
        return _this._containerPosition(null, function () {
          if (_this.options.animate) {
            return _this.$wrapper.addClass('' + _this.options.baseClass + '-animate');
          }
        });
      };
    }(this);
    if (this.$wrapper.is(':visible')) {
      return init();
    }
    return initInterval = window.setInterval(function (_this) {
      return function () {
        if (_this.$wrapper.is(':visible')) {
          init();
          return window.clearInterval(initInterval);
        }
      };
    }(this), 50);
  };
  Switch.prototype._elementHandlers = function () {
    return this.$element.on({
      'change.fnswitch': function (_this) {
        return function (e, skip) {
          var state;
          e.preventDefault();
          e.stopImmediatePropagation();
          state = _this.$element.is(':checked');
          _this._containerPosition(state);
          if (state === _this.options.state) {
            return;
          }
          _this.options.state = state;
          _this.$wrapper.toggleClass('' + _this.options.baseClass + '-off').toggleClass('' + _this.options.baseClass + '-on');
          if (!skip) {
            if (_this.$element.is(':radio')) {
              $('[name=\'' + _this.$element.attr('name') + '\']').not(_this.$element).prop('checked', false).trigger('change.fnswitch', true);
            }
            return _this.$element.trigger('switchChange.fnswitch', [state]);
          }
        };
      }(this),
      'focus.fnswitch': function (_this) {
        return function (e) {
          e.preventDefault();
          return _this.$wrapper.addClass('' + _this.options.baseClass + '-focused');
        };
      }(this),
      'blur.fnswitch': function (_this) {
        return function (e) {
          e.preventDefault();
          return _this.$wrapper.removeClass('' + _this.options.baseClass + '-focused');
        };
      }(this),
      'keydown.fnswitch': function (_this) {
        return function (e) {
          if (!e.which || _this.options.disabled || _this.options.readonly) {
            return;
          }
          switch (e.which) {
          case 37:
            e.preventDefault();
            e.stopImmediatePropagation();
            return _this.state(false);
          case 39:
            e.preventDefault();
            e.stopImmediatePropagation();
            return _this.state(true);
          }
        };
      }(this)
    });
  };
  Switch.prototype._handleHandlers = function () {
    this.$on.on('click.fnswitch', function (_this) {
      return function (event) {
        event.preventDefault();
        event.stopPropagation();
        _this.state(false);
        return _this.$element.trigger('focus.fnswitch');
      };
    }(this));
    return this.$off.on('click.fnswitch', function (_this) {
      return function (event) {
        event.preventDefault();
        event.stopPropagation();
        _this.state(true);
        return _this.$element.trigger('focus.fnswitch');
      };
    }(this));
  };
  Switch.prototype._labelHandlers = function () {
    return this.$label.on({
      'mousedown.fnswitch touchstart.fnswitch': function (_this) {
        return function (e) {
          if (_this._dragStart || _this.options.disabled || _this.options.readonly) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          _this._dragStart = (e.pageX || e.originalEvent.touches[0].pageX) - parseInt(_this.$container.css('margin-left'), 10);
          if (_this.options.animate) {
            _this.$wrapper.removeClass('' + _this.options.baseClass + '-animate');
          }
          return _this.$element.trigger('focus.fnswitch');
        };
      }(this),
      'mousemove.fnswitch touchmove.fnswitch': function (_this) {
        return function (e) {
          var difference;
          if (_this._dragStart == null) {
            return;
          }
          e.preventDefault();
          difference = (e.pageX || e.originalEvent.touches[0].pageX) - _this._dragStart;
          if (difference < -_this._handleWidth || difference > 0) {
            return;
          }
          _this._dragEnd = difference;
          return _this.$container.css('margin-left', '' + _this._dragEnd + 'px');
        };
      }(this),
      'mouseup.fnswitch touchend.fnswitch': function (_this) {
        return function (e) {
          var state;
          if (!_this._dragStart) {
            return;
          }
          e.preventDefault();
          if (_this.options.animate) {
            _this.$wrapper.addClass('' + _this.options.baseClass + '-animate');
          }
          if (_this._dragEnd) {
            state = _this._dragEnd > -(_this._handleWidth / 2);
            _this._dragEnd = false;
            _this.state(_this.options.inverse ? !state : state);
          } else {
            _this.state(!_this.options.state);
          }
          return _this._dragStart = false;
        };
      }(this),
      'mouseleave.fnswitch': function (_this) {
        return function (e) {
          return _this.$label.trigger('mouseup.fnswitch');
        };
      }(this)
    });
  };
  Switch.prototype._externalLabelHandler = function () {
    var $externalLabel;
    $externalLabel = this.$element.closest('label');
    return $externalLabel.on('click', function (_this) {
      return function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.target === $externalLabel[0]) {
          return _this.toggleState();
        }
      };
    }(this));
  };
  Switch.prototype._formHandler = function () {
    var $form;
    $form = this.$element.closest('form');
    if ($form.data('fnui.switch')) {
      return;
    }
    return $form.on('reset.fnswitch', function () {
      return window.setTimeout(function () {
        return $form.find('input').filter(function () {
          return $(this).data('fnui.switch');
        }).each(function () {
          return $(this).fnswitch('state', this.checked);
        });
      }, 1);
    }).data('fnui.switch', true);
  };
  Switch.prototype._getClasses = function (classes) {
    var c, cls, _i, _len;
    if (!$.isArray(classes)) {
      return ['' + this.options.baseClass + '-' + classes];
    }
    cls = [];
    for (_i = 0, _len = classes.length; _i < _len; _i++) {
      c = classes[_i];
      cls.push('' + this.options.baseClass + '-' + c);
    }
    return cls;
  };
  $.fn.fnswitch = function () {
    var args, option, ret;
    option = arguments[0], args = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
    ret = this;
    this.each(function () {
      var $this, data;
      $this = $(this);
      data = $this.data('fnui.switch');
      if (!data) {
        $this.data('fnui.switch', data = new Switch(this, option));
      }
      if (typeof option === 'string') {
        return ret = data[option].apply(data, args);
      }
    });
    return ret;
  };
  $.fn.fnswitch.Constructor = Switch;
  $(function () {
    $('[data-fn-switch]').fnswitch();
  });
  UI.switcher = Switch;
  return Switch;
}(jQuery, fnui_fnuicore);
fnui_toast = function ($, UI) {
  var Toast = function () {
    this.$element = $(Toast.DEFAULT.tpl);
    this.inited = false;
  };
  Toast.DEFAULT = {
    tpl: '<!--BEGIN toast-->' + '<div id="toastInHtmlTemp" style="display:none">' + '<div class="fn-mask-transparent"></div>' + '<div class="fn-toast">' + '<i class="fn-icon-check fn-icon-lg"></i>' + '<p class="fn-toast-content">已完成</p>' + '</div>' + '</div>' + '<!--end toast-->' + '<!-- loading toast -->' + '<div id="loadingToast" class="fn-loading-toast" style="display:none">' + '<div class="fn-mask-transparent"></div>' + '<div class="fn-toast">' + '<div class="fn-loading">' + '<div class="fn-loading-leaf fn-loading-leaf_0"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_1"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_2"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_3"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_4"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_5"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_6"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_7"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_8"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_9"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_10"></div>' + '<div class="fn-loading-leaf fn-loading-leaf_11"></div>' + '</div>' + '<p class="fn-toast-content">数据加载中</p>' + '</div>' + '</div>',
    info: '已完成',
    warning: '出错了',
    loading: '数据加载中',
    content: ''
  };
  Toast.prototype.init = function () {
    if (!this.inited) {
      $(document.body).append(this.$element);
      this.inited = true;
    }
    return this;
  };
  Toast.prototype.content = function (content) {
    if (!this.inited) {
      this.init();
    }
    Toast.DEFAULT.content = content;
    return this;
  };
  Toast.prototype.clear = function (content) {
    if (!this.inited) {
      this.init();
    }
    Toast.DEFAULT.content = '';
    return this;
  };
  Toast.prototype.show = function (type, time) {
    if (!this.inited) {
      this.init();
    }
    if (type != undefined && type.indexOf('loading') != -1) {
      var $loadingToast = $('#loadingToast');
      this.$toast = $loadingToast;
      if ($loadingToast.css('display') != 'none') {
        return;
      }
      Toast.DEFAULT.content && $('#loadingToast .fn-toast-content').html(Toast.DEFAULT.content) || $('#loadingToast .fn-toast-content').html(Toast.DEFAULT.loading);
      $loadingToast.show();
      time && setTimeout(function () {
        $loadingToast.hide();
      }, time);
    } else if (type != undefined && type.indexOf('warning') != -1) {
      var $toast = $('#toastInHtmlTemp');
      this.$toast = $toast;
      $('#toastInHtmlTemp i').removeClass('fn-icon-check').addClass('fn-icon-exclamation');
      Toast.DEFAULT.content && $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.content) || $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.warning);
      $toast.show();
      time && setTimeout(function () {
        $toast.hide();
      }, time);
    } else {
      var $toast = $('#toastInHtmlTemp');
      this.$toast = $toast;
      $('#toastInHtmlTemp i').removeClass('fn-icon-exclamation').addClass('fn-icon-check');
      Toast.DEFAULT.content && $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.content) || $('#toastInHtmlTemp .fn-toast-content').html(Toast.DEFAULT.info);
      $toast.show();
      time && setTimeout(function () {
        $toast.hide();
      }, time);
    }
    return this;
  };
  Toast.prototype.close = function (type) {
    this.$toast.hide();
    return this;
  };
  UI.toast = new Toast();
  return $.toast = UI.toast;
}(jQuery, fnui_fnuicore);
fnui = function (FNUI) {
  return window.FNUI = FNUI;
}(fnui_fnuicore);
}());