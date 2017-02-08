/*=============
  FNUI 2.0 OFFCANVAS
================*/

define(['jquery','./fnuicore'],function($,UI){

  
  'use strict';

var supportTransition = UI.support.transition;
var animation = UI.support.animation;


/**
 * Tabs
 * @param {HTMLElement} element
 * @param {Object} options
 * @constructor
 */
var Tabs = function(element, options) {
  this.$element = $(element);
  this.options = $.extend({}, Tabs.DEFAULTS, options || {});
  this.transitioning = this.activeIndex = null;

  this.refresh();
  this.init();
};

Tabs.VERSION="2.0.0";

Tabs.DEFAULTS = {
  selector: {
    nav: '> .fn-tabs-nav',
    content: '> .fn-tabs-bd',
    panel: '> .fn-tab-panel'
  },
  activeClass: 'fn-active'
};

Tabs.prototype.refresh = function() {
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

Tabs.prototype.init = function() {
  var _this = this;
  var options = this.options;

  this.$element.on('click.tabs', options.selector.nav + ' a', function(e) {
    e.preventDefault();
    _this.open($(this));
  });
};

/**
 * Open $nav tab
 * @param {jQuery|HTMLElement|Number} $nav
 * @returns {Tabs}
 */
Tabs.prototype.open = function($nav) {
  var activeClass = this.options.activeClass;
  var activeIndex = typeof $nav === 'number' ? $nav : this.$navs.index($($nav));

  $nav = typeof $nav === 'number' ? this.$navs.eq(activeIndex) : $($nav);

  if (!$nav ||
    !$nav.length ||
    this.transitioning ||
    $nav.parent('li').hasClass(activeClass)) {
    return;
  }

  var $tabNav = this.$tabNav;
  var href = $nav.attr('href');
  var regexHash = /^#.+$/;
  var $target = regexHash.test(href) && this.$content.find(href) ||
    this.$tabPanels.eq(activeIndex);
  var previous = $tabNav.find('.' + activeClass + ' a')[0];
  var e = $.Event('open.tabs', {
    relatedTarget: previous
  });

  $nav.trigger(e);

  if (e.isDefaultPrevented()) {
    return;
  }

  // activate Tab nav
  this.activate($nav.closest('li'), $tabNav);

  // activate Tab content
  this.activate($target, this.$content, function() {
    $nav.trigger({
      type: 'opened.tabs',
      relatedTarget: previous
    });
  });

  this.activeIndex = activeIndex;
};

Tabs.prototype.activate = function($element, $container, callback) {
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
Tabs.prototype.goTo = function(direction) {
  var navIndex = this.activeIndex;
  var isNext = direction === 'next';
  var spring = isNext ? 'fn-animation-right-spring' :
    'fn-animation-left-spring';

  if ((isNext && navIndex + 1 >= this.$navs.length) || // last one
    (!isNext && navIndex === 0)) { // first one
    var $panel = this.$tabPanels.eq(navIndex);

    animation && $panel.addClass(spring).on('fnAnimationEnd', function() {
      $panel.removeClass(spring);
    }).emulateAnimationEnd(300);
  } else {
    this.open(isNext ? navIndex + 1 : navIndex - 1);
  }
};

Tabs.prototype.destroy = function() {
  this.$element.off('.tabs');
  $.removeData(this.$element, 'fnui.tabs');
};

// Plugin
function Plugin(option) {
  var args = Array.prototype.slice.call(arguments, 1);
  var methodReturn;

  this.each(function() {
    var $this = $(this);
    var $tabs = $this.is('.fn-tabs') && $this || $this.closest('.fn-tabs');
    var data = $tabs.data('fnui.tabs');
    var options = $.extend({}, $this.data('amTabs'),
      $.isPlainObject(option) && option);

    if (!data) {
      $tabs.data('fnui.tabs', (data = new Tabs($tabs[0], options)));
    }

    if (typeof option === 'string') {
      if (option === 'open' && $this.is('.fn-tabs-nav a')) {
        data.open($this);
      } else {
        methodReturn = typeof data[option] === 'function' ?
          data[option].apply(data, args) : data[option];
      }
    }
  });

  return methodReturn === undefined ? this : methodReturn;
}

$.fn.tabs = Plugin;

// Init code
UI.ready(function(context) {
  $('[data-fn-tabs]', context).tabs();
});

$(document).on('click.tabs.data-api', '[data-fn-tabs] .fn-tabs-nav a',
  function(e) {
  e.preventDefault();
  Plugin.call($(this), 'open');
});

  return Tabs;
});
