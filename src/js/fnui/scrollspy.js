
/*=============
  FNUI 2.0 BUTTON
================*/


define(['jquery','./fnuicore'],function($,UI){
            
    'use strict';

var ScrollSpy = function(element, options) {
  if (!UI.support.animation) {
    return;
  }

  this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
  this.$element = $(element);

  var checkViewRAF = function() {
    UI.rAF.call(window, $.proxy(this.checkView, this));
  }.bind(this);

  this.$window = $(window).on('scroll.scrollspy', checkViewRAF)
    .on('resize.scrollspy orientationchange.scrollspy',
    UI.utils.debounce(checkViewRAF, 50));

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

ScrollSpy.prototype.checkView = function() {
  var $element = this.$element;
  var options = this.options;
  var inView = isInView($element, options);
  var animation = options.animation ?
  ' fn-animation-' + options.animation : '';

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

    this.timer = setTimeout(function() {
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

ScrollSpy.prototype.check = function() {
  UI.rAF.call(window, $.proxy(this.checkView, this));
};

function isInView(element, options) {
  var $element = $(element);
  var visible = !!($element.width() || $element.height()) &&
    $element.css('display') !== 'none';

  if (!visible) {
    return false;
  }
  var $win = $(window);
  var windowLeft = $win.scrollLeft();
  var windowTop = $win.scrollTop();
  var offset = $element.offset();
  var left = offset.left;
  var top = offset.top;

  options = $.extend({topOffset: 0, leftOffset: 0}, options);

  return (top + $element.height() >= windowTop &&
  top - options.topOffset <= windowTop + $win.height() &&
  left + $element.width() >= windowLeft &&
  left - options.leftOffset <= windowLeft + $win.width());
};

// Sticky Plugin
UI.plugin('scrollspy', ScrollSpy);

// Init code
UI.ready(function(context) {
  $('[data-fn-scrollspy]', context).scrollspy();
});

  return ScrollSpy;
})